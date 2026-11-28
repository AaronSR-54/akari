import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  archivedManifest,
  branchName,
  createManifest,
  claimRef,
  claimRefsFor,
  claimTag,
  defaultWorktreeRoot,
  deriveChangeId,
  GIT_SUBPROCESS_TIMEOUT_MS,
  hotFilesChanged,
  isArchivedChange,
  isValidChangeId,
  parseClaimRef,
  pushAtomicClaim,
  readManifest,
  slugify,
  worktreePath,
  writeManifest,
} from './lib/workflow.mjs';

const tempDirs = [];
function tempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function git(cwd, args, options = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: GIT_SUBPROCESS_TIMEOUT_MS,
    ...options,
  }).trim();
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

describe('ids, manifiesto y rutas', () => {
  it('genera ids kebab-case cortos sin acentos ni signos', () => {
    expect(slugify('Mejorar el flujo: facturas y avisos')).toBe('mejorar-el-flujo-facturas-y-av');
    expect(deriveChangeId('[otro-id] Arreglar el login')).toBe('arreglar-el-login');
  });

  it('usa el id del change como nombre de rama y rechaza ids largos', () => {
    expect(branchName('sidebar-float')).toBe('sidebar-float');
    expect(isValidChangeId('sidebar-float')).toBe(true);
    expect(isValidChangeId('a'.repeat(31))).toBe(false);
    expect(isValidChangeId('Sidebar_Float')).toBe(false);
  });

  it('valida y escribe workflow.json', () => {
    const root = tempDir('akari-manifest-');
    const manifest = createManifest({
      changeId: 'flujo-prueba',
      cards: [{ publicId: 'card-1', title: 'Una' }, { publicId: 'card-2' }],
      claimedAt: '2026-11-25T10:00:00.000Z',
    });
    writeManifest(root, manifest);
    expect(readManifest(root, 'flujo-prueba')).toMatchObject({
      changeId: 'flujo-prueba',
      branch: 'flujo-prueba',
      cards: [{ publicId: 'card-1', title: 'Una' }, { publicId: 'card-2' }],
    });
    expect(readManifest(root, 'no-existe')).toBeNull();
  });

  it('rechaza manifiestos inválidos, duplicados y secretos', () => {
    const base = {
      changeId: 'flujo-prueba',
      branch: 'flujo-prueba',
      cards: [{ publicId: 'card-1' }],
      prUrl: null,
    };
    expect(() => writeManifest(tempDir('akari-manifest-'), { ...base, cards: [] })).toThrow(/al menos una/);
    expect(() =>
      writeManifest(tempDir('akari-manifest-'), { ...base, cards: [{ publicId: 'a' }, { publicId: 'a' }] })
    ).toThrow(/duplicada/);
    expect(() =>
      writeManifest(tempDir('akari-manifest-'), { ...base, kan_API_KEY: 'secreto' })
    ).toThrow(/token|apikey|api_key|secret|email|campo/i);
    expect(() =>
      writeManifest(tempDir('akari-manifest-'), { ...base, branch: 'otra' })
    ).toThrow(/rama/);
  });

  it('detecta changes archivados y lee su manifiesto', () => {
    const root = tempDir('akari-archive-');
    expect(isArchivedChange(root, 'flujo-prueba')).toBe(false);
    const folder = join(root, 'openspec/changes/archive/2026-11-25-flujo-prueba');
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      join(folder, 'workflow.json'),
      JSON.stringify(createManifest({ changeId: 'flujo-prueba', cards: [{ publicId: 'card-1' }] }))
    );
    expect(isArchivedChange(root, 'flujo-prueba')).toBe(true);
    expect(archivedManifest(root, 'flujo-prueba')).toMatchObject({
      changePath: 'openspec/changes/archive/2026-11-25-flujo-prueba',
      manifest: { changeId: 'flujo-prueba' },
    });
  });

  it('construye rutas y refs de claim', () => {
    expect(claimTag('card-1', 'flujo-prueba')).toBe('claims/card-1/flujo-prueba');
    expect(claimRef('card-1', 'flujo-prueba')).toBe('refs/tags/claims/card-1/flujo-prueba');
    expect(claimRefsFor([{ publicId: 'a' }, 'b'], 'x')).toEqual([
      'refs/tags/claims/a/x',
      'refs/tags/claims/b/x',
    ]);
    expect(parseClaimRef('refs/tags/claims/card-1/flujo-prueba')).toEqual({
      cardId: 'card-1',
      changeId: 'flujo-prueba',
    });
    expect(defaultWorktreeRoot('/tmp/akari')).toBe('/tmp/akari-worktrees');
    expect(defaultWorktreeRoot('/tmp/akari', { OPSX_WORKTREE_ROOT: '/tmp/wt' })).toBe('/tmp/wt');
    expect(worktreePath({ mainRoot: '/tmp/akari', changeId: 'x' })).toBe('/tmp/akari-worktrees/x');
  });

  it('detecta ficheros compartidos y genera el cuerpo de PR', () => {
    expect(hotFilesChanged(['src/a.ts', 'AGENTS.md', '.github/workflows/ci.yml', 'package.json'])).toEqual([
      'AGENTS.md',
      '.github/workflows/ci.yml',
      'package.json',
    ]);
  });
});

describe('publicación atómica del claim', () => {
  it('solo permite que un claim gane y no deja restos si el segundo falla', { timeout: 30_000 }, () => {
    const root = tempDir('akari-claim-');
    const remote = join(root, 'remote.git');
    const work = join(root, 'work');
    git(root, ['init', '--bare', '-q', remote]);
    git(root, ['init', '-q', work]);
    git(work, ['config', 'user.email', 'test@example.com']);
    git(work, ['config', 'user.name', 'Test']);
    writeFileSync(join(work, 'README.md'), '# test\n');
    git(work, ['add', 'README.md']);
    git(work, ['commit', '-q', '-m', 'init']);
    git(work, ['branch', '-M', 'main']);
    git(work, ['remote', 'add', 'origin', remote]);
    git(work, ['push', '-q', '-u', 'origin', 'main']);

    git(work, ['switch', '-c', 'feat/primera']);
    writeFileSync(join(work, 'primera.txt'), 'primera\n');
    git(work, ['add', 'primera.txt']);
    git(work, ['commit', '-q', '-m', 'primera']);
    git(work, ['tag', '-a', 'claims/card-1/primera', '-m', 'change=primera card=card-1']);
    pushAtomicClaim({ cwd: work, branch: 'feat/primera', tags: ['claims/card-1/primera'] });
    expect(git(work, ['ls-remote', '--heads', 'origin', 'refs/heads/feat/primera'])).not.toBe('');

    const second = join(root, 'second');
    git(root, ['clone', '--no-tags', '-q', remote, second]);
    git(second, ['config', 'user.email', 'test2@example.com']);
    git(second, ['config', 'user.name', 'Test 2']);
    git(second, ['switch', 'main']);
    git(second, ['switch', '-c', 'feat/segunda']);
    writeFileSync(join(second, 'segunda.txt'), 'segunda\n');
    git(second, ['add', 'segunda.txt']);
    git(second, ['commit', '-q', '-m', 'segunda']);
    git(second, ['tag', '-a', 'claims/card-1/primera', '-m', 'change=segunda card=card-1']);
    expect(() =>
      pushAtomicClaim({ cwd: second, branch: 'feat/segunda', tags: ['claims/card-1/primera'] })
    ).toThrow(/atomic|falló|rejected|already exists/i);

    const heads = git(second, ['ls-remote', '--heads', 'origin']);
    expect(heads).toContain('refs/heads/feat/primera');
    expect(heads).not.toContain('refs/heads/feat/segunda');
  });

  it('aplica un timeout por subprocesso al push atómico', () => {
    const calls = [];
    const runGit = (args, options) => {
      calls.push({ args, options });
      return { status: 0, stdout: '', stderr: '' };
    };

    pushAtomicClaim({ runGit, cwd: '/tmp', branch: 'un-change', tags: ['claims/card-1/un-change'] });

    expect(calls).toHaveLength(1);
    expect(calls[0].options.timeout).toBe(GIT_SUBPROCESS_TIMEOUT_MS);
    expect(calls[0].args).toEqual([
      'push',
      '--atomic',
      'origin',
      'HEAD:refs/heads/un-change',
      'refs/tags/claims/card-1/un-change',
    ]);
  });
});
