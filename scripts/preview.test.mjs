import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  main,
  previewPaths,
  previewStatus,
  readPreview,
  stopPreview,
  writePreview,
} from './worktree-preview.mjs';

const tempDirs = [];
function tempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

describe('frontal de revisión', () => {
  it('guarda y lee la URL del frontal', () => {
    const root = tempDir('akari-preview-');
    const preview = { url: 'http://localhost:3100', port: 3100, pid: 99999999, startedAt: '2026-11-25T10:00:00.000Z' };
    writePreview(root, preview);
    expect(readPreview(root)).toEqual(preview);
    expect(existsSync(previewPaths(root).log)).toBe(false);
  });

  it('status imprime la URL o avisa de que no hay frontal', () => {
    const root = tempDir('akari-preview-');
    const logs = [];
    expect(previewStatus({ cwd: root, log: (line) => logs.push(line) })).toBeNull();
    writePreview(root, { url: 'http://localhost:3100', port: 3100, pid: 99999999 });
    expect(previewStatus({ cwd: root, log: (line) => logs.push(line) }).url).toBe('http://localhost:3100');
    expect(logs.join('\n')).toContain('http://localhost:3100');
  });

  it('stop borra el fichero aunque el proceso ya haya terminado', () => {
    const root = tempDir('akari-preview-');
    writePreview(root, { url: 'http://localhost:3100', port: 3100, pid: 99999999 });
    expect(stopPreview({ cwd: root, log: () => {} })).toBe(true);
    expect(readPreview(root)).toBeNull();
    expect(existsSync(previewPaths(root).file)).toBe(false);
  });

  it('el CLI status termina sin error sin frontal activo', async () => {
    const root = tempDir('akari-preview-');
    const errors = [];
    const code = await main(['status'], { cwd: root, log: () => {}, logError: (line) => errors.push(line) });
    expect(code).toBe(0);
    expect(errors).toEqual([]);
  });

  it('el CLI rechaza comandos desconocidos', async () => {
    const root = tempDir('akari-preview-');
    const errors = [];
    const code = await main(['otro'], { cwd: root, log: () => {}, logError: (line) => errors.push(line) });
    expect(code).toBe(1);
    expect(errors.join('\n')).toContain('Uso');
  });
});
