#!/usr/bin/env python3
"""Wrap only the fenced code blocks that contain Liquid syntax ({{ or {%) AND are
not already inside a {% raw %}...{% endraw %} block. Idempotent and safe against
files that already wrap some blocks manually.

Inserts `{% raw %}` before the opening fence and `{% endraw %}` after the closing
fence (outside the code block, so the tags are never displayed), so Liquid ignores
template syntax inside code samples and the build stops failing.
"""
import re
from pathlib import Path

POSTS_DIR = Path(__file__).parent / "_posts"
LIQUID_RE = re.compile(r'\{\{|\{\%')
RAW_OPEN = re.compile(r'^\s*\{%\s*raw\s*%\}\s*$')
RAW_CLOSE = re.compile(r'^\s*\{%\s*endraw\s*%\}\s*$')
FENCE_OPEN = re.compile(r'^\s*```')
FENCE_CLOSE = re.compile(r'^\s*```\s*$')

def fix_file(path):
    lines = path.read_text(encoding='utf-8').split('\n')
    out = []
    raw_depth = 0
    i = 0
    n = len(lines)
    changed = False
    while i < n:
        line = lines[i]
        if RAW_OPEN.match(line):
            raw_depth += 1
            out.append(line); i += 1; continue
        if RAW_CLOSE.match(line):
            raw_depth = max(0, raw_depth - 1)
            out.append(line); i += 1; continue

        if FENCE_OPEN.match(line) and raw_depth == 0:
            # collect block
            j = i + 1
            block = []
            while j < n and not FENCE_CLOSE.match(lines[j]):
                block.append(lines[j]); j += 1
            if j < n and LIQUID_RE.search('\n'.join(block)):
                out.append('{% raw %}')
                out.append(line)
                out.extend(block)
                out.append(lines[j])   # closing fence
                out.append('{% endraw %}')
                changed = True
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

    if changed:
        path.write_text('\n'.join(out), encoding='utf-8')
    return changed

def main():
    fixed = 0
    for p in sorted(POSTS_DIR.glob('*.md')):
        if LIQUID_RE.search(p.read_text(encoding='utf-8')):
            if fix_file(p):
                fixed += 1
                print(f"[FIXED] {p.name}")
    print(f"\n[DONE] Wrapped {fixed} posts")

if __name__ == "__main__":
    main()
