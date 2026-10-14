#!/bin/sh
# Print tools/resume.html to assets/jonah-cha-resume.pdf with headless Chrome.
# Usage: sh tools/print_resume.sh   (set CHROME if Chrome is elsewhere)
set -e
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$(pwd -W 2>/dev/null || pwd)/assets/jonah-cha-resume.pdf" \
  "file:///$(pwd -W 2>/dev/null || pwd)/tools/resume.html"
