$ErrorActionPreference = "Stop"
$version = (Get-Content "src-tauri/tauri.conf.json" -Raw | ConvertFrom-Json).version

npm ci
npm run build
npm run tauri build -- --bundles nsis

$installer = Get-ChildItem "src-tauri/target/release/bundle/nsis/*-setup.exe" | Select-Object -First 1
if (-not $installer) { throw "O instalador do Windows não foi encontrado." }

New-Item -ItemType Directory -Force -Path "releases" | Out-Null
Copy-Item $installer.FullName "releases/David-Hub-$version-Windows-x64-Setup.exe" -Force
Write-Host "Instalador criado em releases/David-Hub-$version-Windows-x64-Setup.exe"
