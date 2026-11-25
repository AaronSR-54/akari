import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { KanSyncError } from './errors.mjs';

export const DEFAULT_PORT = 3100;
export const DEV_PORT_RANGE = { start: DEFAULT_PORT, end: 3999 };
export const E2E_PORT_RANGE = { start: DEFAULT_PORT, end: 3999 };

export function portsPath(root) {
  return join(root, '.opsx', 'ports.json');
}

export function hashString(value) {
  let hash = 0x811c9dc5;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function basePort(changeId, range) {
  const span = range.end - range.start + 1;
  return range.start + (hashString(changeId) % span);
}

export function isPortFree(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, host);
  });
}

export async function findFreePort({ start, end, isFree = isPortFree }) {
  for (let port = start; port <= end; port += 1) {
    if (await isFree(port)) return port;
  }
  throw new KanSyncError(`No hay ningún puerto libre en el rango ${start}-${end}.`, 'PORT_UNAVAILABLE');
}

function normalizePort(value, label) {
  if (value === undefined || value === null || value === '') return null;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new KanSyncError(`${label} debe ser un puerto entre 1 y 65535.`, 'PORT_INVALID');
  }
  return port;
}

function readPortsFile(root) {
  const file = portsPath(root);
  if (!existsSync(file)) return null;
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return {
      dev: normalizePort(data?.dev, 'dev'),
      e2e: normalizePort(data?.e2e, 'E2E'),
      ...(typeof data?.assignedAt === 'string' ? { assignedAt: data.assignedAt } : {}),
    };
  } catch (error) {
    if (error instanceof KanSyncError) throw error;
    throw new KanSyncError(`No se pudo leer ${file}: ${error.message}`, 'PORTS_INVALID');
  }
}

export function readPorts(root) {
  return readPortsFile(root);
}

export function writePorts(root, ports) {
  const file = portsPath(root);
  mkdirSync(dirname(file), { recursive: true });
  const payload = {
    dev: ports.dev,
    e2e: ports.e2e,
    assignedAt: ports.assignedAt ?? new Date().toISOString(),
  };
  const temp = `${file}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  renameSync(temp, file);
  return payload;
}

async function pickPort({ range, existing, forced, isFree }) {
  if (forced != null) {
    if (!(await isFree(forced))) {
      throw new KanSyncError(`El puerto ${forced} ya está ocupado; elige otro con --dev-port/--e2e-port.`, 'PORT_BUSY');
    }
    return forced;
  }
  if (existing != null && (await isFree(existing))) return existing;
  return findFreePort({ start: range.start, end: range.end, isFree });
}

export async function resolvePorts({
  root,
  devPort,
  e2ePort,
  isFree = isPortFree,
  persist = true,
}) {
  const existing = readPortsFile(root);
  const forcedDev = normalizePort(devPort, '--dev-port');
  const forcedE2e = normalizePort(e2ePort, '--e2e-port');
  const dev = await pickPort({
    range: DEV_PORT_RANGE,
    existing: existing?.dev,
    forced: forcedDev,
    isFree,
  });
  const e2e = await pickPort({
    range: E2E_PORT_RANGE,
    existing: existing?.e2e,
    forced: forcedE2e,
    isFree,
  });
  const ports = { dev, e2e, assignedAt: new Date().toISOString() };
  if (persist) writePorts(root, ports);
  return ports;
}

export async function ensurePort(root, kind, { forced, isFree = isPortFree } = {}) {
  if (kind !== 'dev' && kind !== 'e2e') {
    throw new KanSyncError(`Tipo de puerto desconocido "${kind}".`, 'PORT_INVALID');
  }
  const existing = readPortsFile(root);
  const range = kind === 'dev' ? DEV_PORT_RANGE : E2E_PORT_RANGE;
  const port = await pickPort({
    range,
    existing: existing?.[kind],
    forced: normalizePort(forced, kind === 'dev' ? '--dev-port' : '--e2e-port'),
    isFree,
  });
  const next = {
    dev: kind === 'dev' ? port : existing?.dev,
    e2e: kind === 'e2e' ? port : existing?.e2e,
    assignedAt: new Date().toISOString(),
  };
  if (next.dev == null) next.dev = existing?.dev ?? null;
  if (next.e2e == null) next.e2e = existing?.e2e ?? null;
  writePorts(root, next);
  return port;
}

export function describePorts(ports) {
  return `dev=${ports.dev} e2e=${ports.e2e}`;
}
