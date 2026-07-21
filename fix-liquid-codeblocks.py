#!/usr/bin/env python3
"""Wrap fenced code blocks that contain Liquid syntax ({{ or {%}) with
{% raw %}...{% endraw %} tags. Supports --check mode for CI.
"""
import re
import sys
from pathlib import Path

POSTS_DIR = Path(__file__).parent / "_posts"
LIQUID_RE = re.compile(r'\{\{|\{\%')
RAW_OPEN = re.compile(r'^\s*\{%\s*raw\s*%\}\s*$')
RAW_CLOSE = re.compile(r'^\s*\{%\s*endraw\s*%\}\s*$')
FENCE_OPEN = re.compile(r'^\s*```')
FENCE_CLOSE = re.compile(r'^\s*```\s*$')


def fix_content(text):
    """Wrap Liquid-looking fenced code blocks in {% raw %}. Returns fixed content."""
    lines = text.split('\n')
    out = []
    raw_depth = 0
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if RAW_OPEN.match(line):
            raw_depth += 1
            out.append(line)
            i += 1
            continue
        if RAW_CLOSE.match(line):
            raw_depth = max(0, raw_depth - 1)
            out.append(line)
            i += 1
            continue
        if FENCE_OPEN.match(line) and raw_depth == 0:
            j = i + 1
            block = []
            while j < n and not FENCE_CLOSE.match(lines[j]):
                block.append(lines[j])
                j += 1
            if j < n and LIQUID_RE.search('\n'.join(block)):
                out.append('{% raw %}')
                out.append(line)
                out.extend(block)
                out.append(lines[j])
                out.append('{% endraw %}')
                i = j + 1
                continue
            else:
                out.append(line)
                out.extend(block)
                if j < n:
                    out.append(lines[j])
                i = j + 1
                continue
        out.append(line)
        i += 1
    return '\n'.join(out)


def fix_file(path):
    original = path.read_text(encoding='utf-8')
    fixed = fix_content(original)
    if fixed != original:
        path.write_text(fixed, encoding='utf-8')
        return True
    return False


def main():
    check_mode = '--check' in sys.argv
    fixed = 0
    needs_fix = []
    for p in sorted(POSTS_DIR.glob('*.md')):
        if LIQUID_RE.search(p.read_text(encoding='utf-8')):
            if check_mode:
                content = p.read_text(encoding='utf-8')
                if fix_content(content) != content:
                    needs_fix.append(p.name)
            else:
                if fix_file(p):
                    fixed += 1
                    print(f"[FIXED] {p.name}")
    if check_mode:
        if needs_fix:
            print(f"[FAIL] {len(needs_fix)} files need Liquid wrapping:")
            for f in needs_fix:
                print(f"  - {f}")
            sys.exit(1)
        else:
            print("[OK] All files properly wrapped")
    else:
        print(f"\n[DONE] Wrapped {fixed} posts")


if __name__ == "__main__":
    main()
