import { readFileSync, writeFileSync } from 'node:fs';

export function releaseConfig({ repository, publicKey, version }) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository ?? '')) throw new Error('Informe GITHUB_REPOSITORY no formato dono/repositorio.');
  if (!publicKey?.trim()) throw new Error('Configure a variável TAURI_UPDATER_PUBLIC_KEY no GitHub.');
  if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) throw new Error('A versão deve usar o formato 0.2.1.');
  return { version, bundle: { createUpdaterArtifacts: true }, plugins: { updater: {
    pubkey: publicKey.trim(), endpoints: [`https://github.com/${repository}/releases/latest/download/latest.json`], windows: { installMode: 'passive' },
  } } };
}

if (process.argv[1]?.endsWith('prepare-release.mjs')) {
  const version = process.env.RELEASE_VERSION;
  const config = releaseConfig({ repository: process.env.GITHUB_REPOSITORY, publicKey: process.env.TAURI_UPDATER_PUBLIC_KEY, version });
  for (const path of ['package.json', 'src-tauri/tauri.conf.json']) {
    const json = JSON.parse(readFileSync(path, 'utf8')); json.version = version;
    writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
  }
  const cargo = readFileSync('src-tauri/Cargo.toml', 'utf8').replace(/version = "[^"]+"/, `version = "${version}"`);
  writeFileSync('src-tauri/Cargo.toml', cargo);
  writeFileSync('src-tauri/tauri.updater.conf.json', JSON.stringify(config, null, 2) + '\n');
  console.log(`Preparada versão ${version} para ${process.env.GITHUB_REPOSITORY}.`);
}
