import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  DEV_PORT_RANGE,
  E2E_PORT_RANGE,
  basePort,
  describePorts,
  findFreePort,
  readPorts,
  resolvePorts,
  writePorts,
} from './lib/ports.mjs';

const tempDirs = [];
function tempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterEachCleanup();
function afterEachCleanup() {
  afterAll(() => {
    for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  });
}

describe('puertos por worktree', () => {
  it('usa un hash estable dentro de cada rango', () => {
    expect(basePort('flujo-prueba', DEV_PORT_RANGE)).toBe(basePort('flujo-prueba', DEV_PORT_RANGE));
    expect(basePort('flujo-prueba', DEV_PORT_RANGE)).toBeGreaterThanOrEqual(DEV_PORT_RANGE.start);
    expect(basePort('flujo-prueba', DEV_PORT_RANGE)).toBeLessThanOrEqual(DEV_PORT_RANGE.end);
    expect(basePort('flujo-prueba', E2E_PORT_RANGE)).toBeGreaterThanOrEqual(E2E_PORT_RANGE.start);
  });

  it('asigna, persiste y reutiliza puertos libres', async () => {
    const root = tempDir('akari-ports-');
    const first = await resolvePorts({ root, changeId: 'flujo-prueba', isFree: async () => true });
    expect(first.dev).toBeGreaterThanOrEqual(DEV_PORT_RANGE.start);
    expect(first.e2e).toBeGreaterThanOrEqual(E2E_PORT_RANGE.start);
    expect(readPorts(root)).toMatchObject({ dev: first.dev, e2e: first.e2e });
    expect(describePorts(first)).toBe(`dev=${first.dev} e2e=${first.e2e}`);

    const second = await resolvePorts({ root, changeId: 'flujo-prueba', isFree: async () => true });
    expect(second.dev).toBe(first.dev);
    expect(second.e2e).toBe(first.e2e);
  });

  it('reasigna un puerto guardado que está ocupado', async () => {
    const root = tempDir('akari-ports-');
    const busy = basePort('flujo-prueba', DEV_PORT_RANGE);
    writePorts(root, { dev: busy, e2e: 4100 });
    const ports = await resolvePorts({
      root,
      changeId: 'flujo-prueba',
      isFree: async (port) => port !== busy,
    });
    expect(ports.dev).not.toBe(busy);
  });

  it('falla si se fuerza un puerto ocupado', async () => {
    const root = tempDir('akari-ports-');
    const busy = basePort('flujo-prueba', DEV_PORT_RANGE);
    await expect(
      resolvePorts({
        root,
        changeId: 'flujo-prueba',
        devPort: busy,
        isFree: async (port) => port !== busy,
      })
    ).rejects.toThrow(/ocupado/);
  });

  it('encuentra el siguiente puerto libre', async () => {
    const busy = new Set([3100, 3101, 3102]);
    const port = await findFreePort({
      start: 3100,
      end: 3105,
      isFree: async (candidate) => !busy.has(candidate),
    });
    expect(port).toBe(3103);
  });
});
