#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execGit } from './lib/workflow.mjs';
import { isPortFree, readPorts, resolvePorts } from './lib/ports.mjs';

function gitRoot(cwd) {
  try {
    return execGit(['rev-parse', '--show-toplevel'], { cwd }).stdout.trim() || cwd;
  } catch {
    return cwd;
  }
}

function parseArgs(argv) {
  const args = { command: null, devPort: undefined, e2ePort: undefined, noBuild: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--dev-port') args.devPort = argv[++index];
    else if (value === '--e2e-port') args.e2ePort = argv[++index];
    else if (value === '--no-build') args.noBuild = true;
    else if (!args.command) args.command = value;
    else throw new Error(`Argumento desconocido: ${value}`);
  }
  return args;
}

function runNpm(args, { cwd, env = process.env } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('npm', args, { cwd, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`npm ${args.join(' ')} terminó con código ${code}.`));
    });
  });
}

async function main(argv, { cwd = process.cwd(), log = console.log, logError = console.error } = {}) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (error) {
    logError(`Error: ${error.message}`);
    return 1;
  }
  if (!args.command || !['dev', 'e2e'].includes(args.command)) {
    logError('Uso: node scripts/worktree-ports.mjs <dev|e2e> [--dev-port <puerto>] [--e2e-port <puerto>] [--no-build]');
    return 1;
  }

  const root = gitRoot(cwd);
  const changeId = process.env.OPSX_CHANGE_ID?.trim() || basename(root);

  try {
    const previous = readPorts(root);
    if (args.command === 'e2e' && previous?.dev && !(await isPortFree(previous.dev))) {
      throw new Error(
        `El puerto de desarrollo ${previous.dev} sigue ocupado. Si es dev:worktree, páralo antes de ejecutar E2E: next dev y next build comparten .next.`
      );
    }
    const ports = await resolvePorts({
      root,
      changeId,
      devPort: args.devPort,
      e2ePort: args.e2ePort,
    });
    const saved = readPorts(root) ?? ports;

    if (args.command === 'dev') {
      if (!(await isPortFree(saved.dev))) {
        throw new Error(`El puerto de desarrollo ${saved.dev} está ocupado; cierra el proceso que lo usa o pasa --dev-port.`);
      }
      if (!args.noBuild) {
        log(`Preparando tokens en ${root}…`);
        await runNpm(['run', 'build', '-w', '@akari/tokens'], { cwd: root });
      }
      log(`Dev: http://localhost:${saved.dev}`);
      await runNpm(['run', 'dev', '-w', '@akari/web', '--', '-p', String(saved.dev)], { cwd: root });
      return 0;
    }

    if (!(await isPortFree(saved.dev))) {
      throw new Error(
        `El puerto de desarrollo ${saved.dev} sigue ocupado. Si es dev:worktree, páralo antes de ejecutar E2E: next dev y next build comparten .next.`
      );
    }
    log(`E2E: E2E_PORT=${saved.e2e}`);
    await runNpm(['run', 'e2e'], {
      cwd: root,
      env: { ...process.env, E2E_PORT: String(saved.e2e) },
    });
    return 0;
  } catch (error) {
    logError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

const isEntryPoint =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntryPoint) {
  process.exitCode = await main(process.argv.slice(2));
}

export { main };
