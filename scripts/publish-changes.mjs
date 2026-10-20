import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(command, args, capture = false) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.status !== 0) throw new Error(`${command} não foi concluído. Nenhuma nova publicação foi iniciada.`);
  return result.stdout?.trim() ?? '';
}
try {
  if (run('git', ['branch', '--show-current'], true) !== 'main') throw new Error('Publique a partir da branch main.');
  const remote = run('git', ['remote', 'get-url', 'origin'], true);
  if (!['https://github.com/davidgabrielsb/david-hub.git','git@github.com:davidgabrielsb/david-hub.git'].includes(remote)) throw new Error('O destino Git não corresponde ao repositório do Hub.');
  if (run('git', ['diff', '--cached', '--name-only'], true)) throw new Error('Existem arquivos já preparados no Git. Revise-os antes de publicar.');
  run(npm, ['test']);
  run(npm, ['run', 'build']);
  run('git', ['add', '--', 'work/organization-tests.mjs', 'work/ui-smoke-tests.mjs']);
  run('git', ['add', '--', 'src', 'public', 'scripts', '.github', 'supabase', 'work/run-tests.mjs', 'work/store-tests.ts', 'package.json', 'package-lock.json', 'index.html', 'tsconfig.json', 'tsconfig.node.json', 'vite.config.ts', '.gitignore', '.env.example', 'README.md', 'ATUALIZACOES.md', 'SUPABASE_SETUP.md', 'src-tauri/Cargo.toml', 'src-tauri/Cargo.lock', 'src-tauri/tauri.conf.json', 'src-tauri/build.rs', 'src-tauri/src', 'src-tauri/icons', 'src-tauri/capabilities', 'src-tauri/.gitignore']);
  if (run('git', ['diff', '--cached', '--name-only'], true)) run('git', ['commit', '-m', process.argv.slice(2).join(' ') || 'Atualiza David Hub']);
  run('git', ['push', 'origin', 'main']);
  console.log('Mudanças enviadas. Acompanhe a geração do Windows em https://github.com/davidgabrielsb/david-hub/actions');
} catch (error) { console.error(error.message); process.exitCode = 1; }
