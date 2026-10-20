#!/bin/sh
set -eu
npm run tauri build -- --bundles app
APP_PATH="src-tauri/target/release/bundle/macos/David Hub.app"
VERSION=$(node -p 'JSON.parse(require("fs").readFileSync("src-tauri/tauri.conf.json", "utf8")).version')
OUTPUT="releases/David-Hub-$VERSION-macOS-arm64.zip"
codesign --force --deep --sign - "$APP_PATH"
codesign --verify --deep --strict "$APP_PATH"
mkdir -p releases
python3 -c 'import sys; from pathlib import Path; p=Path(sys.argv[1]); p.unlink() if p.exists() else None' "$OUTPUT"
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$OUTPUT"
echo "Pacote criado em $OUTPUT"
