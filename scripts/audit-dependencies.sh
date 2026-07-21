#!/bin/bash
# Audit script for dev-blog dependencies
# Run from the dev-blog repo root

set -e

echo "=== Ruby/Gem versions ==="
ruby --version
bundler --version

echo ""
echo "=== Gemfile.lock github-pages version ==="
grep "github-pages (" Gemfile.lock | head -1

echo ""
echo "=== Installed gems with vulnerabilities (if gem-audit available) ==="
if command -v gem-audit &> /dev/null; then
  gem-audit -t
else
  echo "gem-audit not installed (optional: gem install gem-audit)"
fi

echo ""
echo "=== CDN dependencies (client-side, loaded on demand) ==="
echo "mermaid: loaded from cdn.jsdelivr.net (in head.html)"
echo "sql.js: loaded from cdnjs.cloudflare.com (in playground, on demand)"
echo "Pyodide: loaded from cdn.jsdelivr.net (in playground, on demand)"
echo "Giscus: loaded from giscus.app (in comments.html, on demand)"
echo "GA gtag: loaded from googletagmanager.com (in google-analytics.html, on demand)"

echo ""
echo "=== Plugins in _config.yml ==="
grep -A5 "^plugins:" _config.yml

echo ""
echo "=== Files excluded from build ==="
grep -A20 "^exclude:" _config.yml | head -25

echo ""
echo "Done. Review the above for any outdated or unexpected dependencies."
