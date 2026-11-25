#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execGit } from './lib/workflow.mjs';
import { resolvePorts } from './lib/ports.mjs';

function gitRoot(cwd) {
  try {
    return execGit(['rev-parse', '--show-toplevel'], { cwd }).stdout.trim() || cwd;
  } catch {
    return cwd;
  }
}

export function previewPaths(root) {
  const dir = join(root, '.opsx');
  return { file: join(dir, 'preview.json'), log: join(dir, 'preview.log'), dir };
}

export function readPreview(root) {
  const { file } = previewPaths(root);
  if (!existsSync(file)) return null;
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (!Number.isInteger(data?.pid) || !Number.isInteger(data?.port) || typeof data?.url !== 'string') {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function writePreview(root, preview) {
  const { file, dir } = previewPaths(root);
  mkdirSync(dir, { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(preview, null, 2)}\n`, 'utf8');
  renameSync(temp, file);
  return preview;
}

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function startPreview({ cwd = process.cwd(), log = () => {} } = {}) {
  const root = gitRoot(cwd);
  const running = readPreview(root);
  if (running && isRunning(running.pid)) {
    log(`Frontal: ${running.url}`);
    return running;
  }

  const changeId = process.env.OPSX_CHANGE_ID?.trim() || basename(root);
  const ports = await resolvePorts({ root, changeId });
  const { log: logFile } = previewPaths(root);
  mkdirSync(dirname(logFile), { recursive: true });
  const output = openSync(logFile, 'a');
  const child = spawn('npm', ['run', 'dev:worktree'], {
    cwd: root,
    detached: true,
    stdio: ['ignore', output, output],
  });
  closeSync(output);
  child.unref();
  if (!Number.isInteger(child.pid)) {
    throw new Error('No se pudo arrancar el frontal de revisión.');
  }
  const preview = writePreview(root, {
    url: `http://localhost:${ports.dev}`,
    port: ports.dev,
    pid: child.pid,
    startedAt: new Date().toISOString(),
  });
  log(`Frontal: ${preview.url}`);
  return preview;
}

export function stopPreview({ cwd = process.cwd(), log = () => {} } = {}) {
  const root = gitRoot(cwd);
  const preview = readPreview(root);
  const { file } = previewPaths(root);
  if (!preview) {
    if (existsSync(file)) unlinkSync(file);
    return false;
  }
  try {
    process.kill(-preview.pid, 'SIGTERM');
  } catch {
    try {
      process.kill(preview.pid, 'SIGTERM');
    } catch {
      // El proceso ya había terminado.
    }
  }
  unlinkSync(file);
  log('Frontal de revisión detenido.');
  return true;
}

export function previewStatus({ cwd = process.cwd(), log = () => {} } = {}) {
  const preview = readPreview(gitRoot(cwd));
  if (!preview) {
    log('No hay un frontal de revisión activo.');
    return null;
  }
  log(`Frontal: ${preview.url}`);
  return preview;
}

function parseArgs(argv) {
  const command = argv[0];
  if (!['start', 'status', 'stop'].includes(command)) {
    throw new Error('Uso: node scripts/worktree-preview.mjs <start|status|stop>');
  }
  return command;
}

async function main(argv, { cwd = process.cwd(), log = console.log, logError = console.error } = {}) {
  let command;
  try {
    command = parseArgs(argv);
  } catch (error) {
    logError(`Error: ${error.message}`);
    return 1;
  }
  try {
    if (command === 'start') await startPreview({ cwd, log });
    else if (command === 'status') previewStatus({ cwd, log });
    else stopPreview({ cwd, log });
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
