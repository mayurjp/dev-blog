#!/usr/bin/env python3
"""Wrap Liquid-looking syntax ({{ ... }} / {% ... %}) that appears inside
INLINE BACKTICK CODE SPANS in prose (not fenced ``` blocks, not real Jekyll
site links) with {% raw %}...{% endraw %} so Jekyll/Liquid treats it as
literal text instead of trying to evaluate it.

Scope is deliberately narrow: only text between single backticks. Real
in-body Jekyll Liquid (e.g. `{{ '/topic/slug/' | relative_url }}` used for
glossary/"next in series" links) is never inside backticks, so it is never
touched. Only external template syntax quoted as code (Go templates, Helm,
GitHub Actions expressions, Angular interpolation, PromQL label matchers,
etc.) shown inside `` `...` `` spans is affected.

Fenced code blocks are left to the existing fix-liquid-codeblocks.py logic
(whole-fence raw wrap); this script only targets inline spans outside fences.
Skips anything already inside a {% raw %}...{% endraw %} region (line-level
raw_depth tracking, matching fix-liquid-codeblocks.py's approach).

Idempotent: a backtick span already containing {% raw %}/{% endraw %} is left
alone.
"""
import re
import sys
from pathlib import Path

# Single-backtick inline code span, non-greedy, no backtick or newline inside.
BACKTICK_SPAN_RE = re.compile(r'`([^`\n]*)`')
RAW_OPEN = re.compile(r'^\s*\{%\s*raw\s*%\}\s*$')
RAW_CLOSE = re.compile(r'^\s*\{%\s*endraw\s*%\}\s*$')
FENCE_RE = re.compile(r'^\s*```')

PREFIX = '{% raw %}'
SUFFIX = '{% endraw %}'


def wrap_prose_line(line):
    if '{{' not in line and '{%' not in line:
        return line, False

    def repl(m):
        inner = m.group(1)
        if ('{{' not in inner and '{%' not in inner) or PREFIX in inner:
            return m.group(0)
        return '`' + PREFIX + inner + SUFFIX + '`'

    new_line = BACKTICK_SPAN_RE.sub(repl, line)
    return new_line, new_line != line


def fix_content(text):
    """Fix inline Liquid spans. Returns fixed content string."""
    lines = text.split('\n')
    out = []
    raw_depth = 0
    in_fence = False
    for line in lines:
        if RAW_OPEN.match(line):
            raw_depth += 1
            out.append(line)
            continue
        if RAW_CLOSE.match(line):
            raw_depth = max(0, raw_depth - 1)
            out.append(line)
            continue
        if FENCE_RE.match(line):
            in_fence = not in_fence
            out.append(line)
            continue
        if raw_depth > 0 or in_fence:
            out.append(line)
            continue
        new_line, _ = wrap_prose_line(line)
        out.append(new_line)
    return '\n'.join(out)


def fix_file(path):
    original = path.read_text(encoding='utf-8')
    fixed = fix_content(original)
    if fixed != original:
        path.write_text(fixed, encoding='utf-8')
        return True
    return False


def main():
    root = Path(__file__).parent
    targets = list((root / '_posts').glob('*.md')) + list((root / 'qa').glob('*.md'))
    for extra in ['challenges/index.md', 'roadmap/index.md', 'learn/index.md', 'faq/index.md', 'about.md']:
        p = root / extra
        if p.exists():
            targets.append(p)

    check_mode = '--check' in sys.argv
    fixed = 0
    needs_fix = []
    for p in sorted(set(targets)):
        text = p.read_text(encoding='utf-8')
        if '{{' in text or '{%' in text:
            if check_mode:
                if fix_content(text) != text:
                    needs_fix.append(str(p.relative_to(root)))
            else:
                if fix_file(p):
                    fixed += 1
                    print(f"[FIXED] {p.relative_to(root)}")
    if check_mode:
        if needs_fix:
            print(f"[FAIL] {len(needs_fix)} files need inline Liquid wrapping:")
            for f in needs_fix:
                print(f"  - {f}")
            sys.exit(1)
        else:
            print("[OK] All inline Liquid spans properly wrapped")
    else:
        print(f"\n[DONE] Wrapped inline Liquid spans in {fixed} files")


if __name__ == '__main__':
    main()
