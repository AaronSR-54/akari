import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  DEFAULT_PORT,
  DEV_PORT_RANGE,
  E2E_PORT_RANGE,
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

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

describe('puertos por worktree', () => {
  it('empieza en 3100 para desarrollo y E2E', () => {
    expect(DEFAULT_PORT).toBe(3100);
    expect(DEV_PORT_RANGE.start).toBe(3100);
    expect(E2E_PORT_RANGE.start).toBe(3100);
  });

  it('asigna, persiste y reutiliza puertos libres', async () => {
    const root = tempDir('akari-ports-');
    const first = await resolvePorts({ root, changeId: 'flujo-prueba', isFree: async () => true });
    expect(first.dev).toBe(3100);
    expect(first.e2e).toBe(3100);
    expect(readPorts(root)).toMatchObject({ dev: 3100, e2e: 3100 });
    expect(describePorts(first)).toBe(`dev=${first.dev} e2e=${first.e2e}`);

    const second = await resolvePorts({ root, changeId: 'flujo-prueba', isFree: async () => true });
    expect(second.dev).toBe(first.dev);
    expect(second.e2e).toBe(first.e2e);
  });

  it('el segundo worktree toma el siguiente puerto libre', async () => {
    const root = tempDir('akari-ports-');
    const busy = new Set([3100]);
    const ports = await resolvePorts({
      root,
      changeId: 'otro-change',
      isFree: async (port) => !busy.has(port),
    });
    expect(ports.dev).toBe(3101);
    expect(ports.e2e).toBe(3101);
  });

  it('reasigna un puerto guardado que está ocupado', async () => {
    const root = tempDir('akari-ports-');
    writePorts(root, { dev: 3100, e2e: 3100 });
    const ports = await resolvePorts({
      root,
      changeId: 'flujo-prueba',
      isFree: async (port) => port !== 3100,
    });
    expect(ports.dev).toBe(3101);
    expect(ports.e2e).toBe(3101);
  });

  it('falla si se fuerza un puerto ocupado', async () => {
    const root = tempDir('akari-ports-');
    await expect(
      resolvePorts({
        root,
        changeId: 'flujo-prueba',
        devPort: 3100,
        isFree: async (port) => port !== 3100,
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
