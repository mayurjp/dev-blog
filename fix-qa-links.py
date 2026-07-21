#!/usr/bin/env python3
"""
Fix hardcoded /qa/... links in dev-blog to use Jekyll's relative_url filter,
so they correctly resolve under the site's baseurl (/dev-blog).

Without this, a markdown link like [text](/qa/) resolves in the browser to
https://mayurjp.github.io/qa/ (root domain) instead of
https://mayurjp.github.io/dev-blog/qa/ -- a 404.
"""

import re
from pathlib import Path

DEV_BLOG_DIR = Path(__file__).parent

# Any markdown link target starting with one of these internal site paths
# needs to be baseurl-aware.
INTERNAL_PATH_PREFIXES = (
    "/qa/", "/kubernetes/", "/docker/", "/microservices/", "/security/",
    "/system-design/", "/design-patterns/", "/gcp/", "/cicd/", "/ddd/",
    "/architecture/", "/databases/", "/observability/", "/mlops/",
    "/genai/", "/gitops/", "/angular/", "/multicloud/", "/dotnet/",
)

# Matches [label](/path/) -- captures label and path separately.
LINK_PATTERN = re.compile(r'\[([^\]]+)\]\((/[a-z0-9\-]+/(?:[a-z0-9\-]+/)?)\)')

def fix_content(content):
    def replace(match):
        label, path = match.group(1), match.group(2)
        if path.startswith(INTERNAL_PATH_PREFIXES):
            return f"[{label}]({{{{ '{path}' | relative_url }}}})"
        return match.group(0)
    return LINK_PATTERN.sub(replace, content)

def main():
    targets = list((DEV_BLOG_DIR / "qa").glob("*.md"))
    targets.append(DEV_BLOG_DIR / "index.md")
    targets.append(DEV_BLOG_DIR / "qa.md")

    changed = 0
    for path in targets:
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8")
        fixed = fix_content(original)
        if fixed != original:
            path.write_text(fixed, encoding="utf-8")
            n = len(LINK_PATTERN.findall(original))
            print(f"[FIXED] {path.relative_to(DEV_BLOG_DIR)}")
            changed += 1

    print(f"\n[DONE] Fixed links in {changed} files")

if __name__ == "__main__":
    main()
