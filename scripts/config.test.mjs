import { execFileSync } from 'node:child_process';
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  parseConfig,
  readEnv,
  resolveEnvFile,
  resolveMainRoot,
} from './lib/config.mjs';

const tempDirs = [];
function tempDir(prefix) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  tempDirs.push(dir);
  return dir;
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function initRepo() {
  const repo = tempDir('akari-config-');
  git(repo, ['init', '-q']);
  git(repo, ['config', 'user.email', 'test@example.com']);
  git(repo, ['config', 'user.name', 'Test']);
  writeFileSync(join(repo, 'README.md'), '# test\n');
  git(repo, ['add', 'README.md']);
  git(repo, ['commit', '-q', '-m', 'init']);
  return repo;
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

describe('resolveMainRoot y readEnv', () => {
  it('lee el .env del checkout principal desde un worktree enlazado', () => {
    const repo = initRepo();
    writeFileSync(join(repo, '.env'), 'kan_API_KEY=desde-principal\nkan_CURRENT_USER=persona@example.com\n');
    const worktree = `${repo}-wt`;
    tempDirs.push(worktree);
    git(repo, ['worktree', 'add', '-q', '-b', 'prueba', worktree]);

    expect(resolveMainRoot({ cwd: worktree })).toBe(repo);
    expect(resolveEnvFile({ cwd: worktree })).toBe(join(repo, '.env'));
    expect(readEnv({ cwd: worktree, env: {} }).kan_API_KEY).toBe('desde-principal');
  });

  it('acepta un runner que devuelve { stdout } como execGit', () => {
    const repo = initRepo();
    writeFileSync(join(repo, '.env'), 'kan_API_KEY=desde-runner\n');
    const worktree = `${repo}-wt`;
    tempDirs.push(worktree);
    git(repo, ['worktree', 'add', '-q', '-b', 'runner', worktree]);

    const runGit = (args, { cwd } = {}) => ({
      status: 0,
      stdout: git(cwd, args),
      stderr: '',
    });
    expect(resolveMainRoot({ cwd: worktree, runGit })).toBe(repo);
    expect(readEnv({ cwd: worktree, env: {}, runGit }).kan_API_KEY).toBe('desde-runner');
  });

  it('lee el .env del propio checkout principal', () => {
    const repo = initRepo();
    writeFileSync(join(repo, '.env'), 'kan_API_KEY=principal\n');
    expect(readEnv({ cwd: repo, env: {} }).kan_API_KEY).toBe('principal');
  });

  it('no falla si el fichero indicado no existe y da prioridad al entorno', () => {
    const dir = tempDir('akari-env-');
    expect(readEnv({ envFile: join(dir, '.env'), env: {} })).toEqual({});
    expect(
      readEnv({ envFile: join(dir, '.env'), env: { kan_API_KEY: 'entorno' } }).kan_API_KEY
    ).toBe('entorno');
  });

  it('falla con mensaje accionable si git no resuelve el directorio común', () => {
    const runGit = () => {
      throw new Error('git roto');
    };
    expect(() => resolveMainRoot({ cwd: tmpdir(), runGit })).toThrow(/directorio común de Git/);
    expect(() => resolveMainRoot({ cwd: tmpdir(), runGit })).toThrow(/kan_API_KEY/);
    expect(() => resolveMainRoot({ cwd: tmpdir(), runGit: () => ({ status: 0, stderr: '' }) })).toThrow(
      /checkout principal/
    );
  });

  it('no filtra secretos del error de git en el mensaje', () => {
    const runGit = () => {
      throw new Error('kan_API_KEY=secreto-filtrado');
    };
    let message = '';
    try {
      resolveMainRoot({ cwd: tmpdir(), runGit });
    } catch (error) {
      message = error.message;
    }
    expect(message).not.toContain('secreto-filtrado');
    expect(typeof message).toBe('string');
  });
});

describe('parseConfig con revisión opcional', () => {
  const base = {
    baseUrl: 'https://kan.example.com/api/v1',
    boardPublicId: 'b123',
    lists: { todo: 'TO DO', inProgress: 'IN PROGRESS', done: 'DONE' },
  };

  it('acepta la lista review cuando existe', () => {
    const config = parseConfig(JSON.stringify({ ...base, lists: { ...base.lists, review: 'REVIEW' } }));
    expect(config.lists.review).toBe('REVIEW');
  });

  it('no exige la lista review', () => {
    const config = parseConfig(JSON.stringify(base));
    expect(config.lists).toEqual({ todo: 'TO DO', inProgress: 'IN PROGRESS', done: 'DONE' });
  });
});
