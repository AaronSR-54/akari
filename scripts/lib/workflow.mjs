import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { KanSyncError } from './errors.mjs';

const CHANGE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_CHANGE_ID_LENGTH = 30;

export const HOT_FILES = [
  'AGENTS.md',
  'README.md',
  'package.json',
  'package-lock.json',
  'kan.config.json',
  'playwright.config.ts',
  'vitest.config.ts',
  'eslint.config.mjs',
  'docs/desarrollo/kanban.md',
  'docs/desarrollo/flujo-colaborativo.md',
];

export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_CHANGE_ID_LENGTH)
    .replace(/-+$/g, '');
}

export function isValidChangeId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_CHANGE_ID_LENGTH && CHANGE_ID.test(value);
}

export function deriveChangeId(title) {
  const withoutPrefix = String(title ?? '').replace(/^\s*\[[^\]]+\]\s*/, '');
  const id = slugify(withoutPrefix);
  if (!id) {
    throw new KanSyncError('No se pudo derivar un change-id del título de la tarjeta; pasa --change.', 'CHANGE_ID_REQUIRED');
  }
  return id;
}

export function branchName(changeId) {
  return changeId;
}

export function manifestPath(root, changeId) {
  return join(root, 'openspec', 'changes', changeId, 'workflow.json');
}

export function archivePath(root, changeId) {
  const archive = join(root, 'openspec', 'changes', 'archive');
  if (!existsSync(archive)) return null;
  const match = readdirSync(archive).find(
    (entry) => entry === changeId || entry.endsWith(`-${changeId}`)
  );
  return match ? join(archive, match) : null;
}

export function isArchivedChange(root, changeId) {
  return Boolean(archivePath(root, changeId));
}

function assertNoSecrets(value, path = 'workflow.json') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSecrets(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase();
    if (
      normalized.includes('token') ||
      normalized.includes('apikey') ||
      normalized.includes('api_key') ||
      normalized.includes('secret') ||
      normalized === 'email'
    ) {
      throw new KanSyncError(`${path} no puede contener el campo "${key}".`, 'MANIFEST_SECRET');
    }
    assertNoSecrets(child, `${path}.${key}`);
  }
}

export function validateManifest(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new KanSyncError('workflow.json debe contener un objeto JSON.', 'MANIFEST_INVALID');
  }
  assertNoSecrets(data);
  if (!isValidChangeId(data.changeId)) {
    throw new KanSyncError('workflow.json tiene un "changeId" inválido: inglés, minúsculas, guiones y 30 caracteres como máximo.', 'MANIFEST_INVALID');
  }
  if (data.branch !== branchName(data.changeId)) {
    throw new KanSyncError(`workflow.json debe usar la rama "${branchName(data.changeId)}".`, 'MANIFEST_INVALID');
  }
  if (!Array.isArray(data.cards) || data.cards.length === 0) {
    throw new KanSyncError('workflow.json debe incluir al menos una tarjeta.', 'MANIFEST_INVALID');
  }
  const seen = new Set();
  const cards = data.cards.map((card) => {
    if (!card || typeof card !== 'object' || typeof card.publicId !== 'string' || !card.publicId.trim()) {
      throw new KanSyncError('Cada tarjeta del manifiesto necesita un "publicId" no vacío.', 'MANIFEST_INVALID');
    }
    if (seen.has(card.publicId)) {
      throw new KanSyncError(`La tarjeta "${card.publicId}" aparece duplicada en workflow.json.`, 'MANIFEST_INVALID');
    }
    seen.add(card.publicId);
    return {
      publicId: card.publicId.trim(),
      ...(typeof card.title === 'string' && card.title.trim() ? { title: card.title.trim() } : {}),
    };
  });
  const prUrl = data.prUrl == null ? null : String(data.prUrl).trim();
  if (prUrl && !/^https?:\/\//.test(prUrl)) {
    throw new KanSyncError('workflow.json tiene una "prUrl" que no es http(s).', 'MANIFEST_INVALID');
  }
  return {
    changeId: data.changeId,
    branch: data.branch,
    cards,
    prUrl: prUrl || null,
    ...(typeof data.claimedAt === 'string' ? { claimedAt: data.claimedAt } : {}),
  };
}

export function createManifest({ changeId, cards, claimedAt = new Date().toISOString() }) {
  return validateManifest({
    changeId,
    branch: branchName(changeId),
    cards,
    prUrl: null,
    claimedAt,
  });
}

export function readManifestFile(file) {
  if (!existsSync(file)) return null;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new KanSyncError(`No se pudo leer ${file}: ${error.message}`, 'MANIFEST_INVALID');
  }
  return validateManifest(parsed);
}

export function readManifest(root, changeId) {
  return readManifestFile(manifestPath(root, changeId));
}

export function archivedManifest(root, changeId) {
  const folder = archivePath(root, changeId);
  if (!folder) return null;
  const manifest = readManifestFile(join(folder, 'workflow.json'));
  if (!manifest) return null;
  return { manifest, changePath: folder.slice(root.length + 1), folder };
}

export function writeManifestFile(file, manifest) {
  const valid = validateManifest(manifest);
  mkdirSync(dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(valid, null, 2)}\n`, 'utf8');
  renameSync(temp, file);
  return valid;
}

export function writeManifest(root, manifest) {
  const valid = validateManifest(manifest);
  return writeManifestFile(manifestPath(root, valid.changeId), valid);
}

export function addCardsToManifest(manifest, cards) {
  const byId = new Map(manifest.cards.map((card) => [card.publicId, card]));
  for (const card of cards) {
    if (card?.publicId && !byId.has(card.publicId)) {
      byId.set(card.publicId, {
        publicId: card.publicId,
        ...(card.title ? { title: card.title } : {}),
      });
    }
  }
  return { ...manifest, cards: [...byId.values()] };
}

function safeRefPart(value) {
  return String(value).replace(/[^A-Za-z0-9._-]/g, '-');
}

export function claimTag(cardPublicId, changeId) {
  return `claims/${safeRefPart(cardPublicId)}/${safeRefPart(changeId)}`;
}

export function claimRef(cardPublicId, changeId) {
  return `refs/tags/${claimTag(cardPublicId, changeId)}`;
}

export function claimRefsFor(cards, changeId) {
  return cards.map((card) => claimRef(typeof card === 'string' ? card : card.publicId, changeId));
}

export function parseClaimRef(ref) {
  const clean = String(ref).replace(/^refs\/tags\//, '');
  const match = /^claims\/([^/]+)\/([^/]+)$/.exec(clean);
  if (!match) return null;
  return { cardId: match[1], changeId: match[2] };
}

export function defaultWorktreeRoot(mainRoot, env = process.env) {
  const configured = env.OPSX_WORKTREE_ROOT?.trim();
  if (configured) return resolve(configured);
  return join(dirname(mainRoot), `${basename(mainRoot)}-worktrees`);
}

export function worktreePath({ mainRoot, changeId, worktreeRoot, env = process.env }) {
  return resolve(worktreeRoot || defaultWorktreeRoot(mainRoot, env), changeId);
}

export function hotFilesChanged(files) {
  return files.filter(
    (file) =>
      HOT_FILES.includes(file) ||
      file.startsWith('.github/') ||
      file === 'docs/desarrollo/flujo-colaborativo.md'
  );
}

export function buildPrBody(manifest, { archive = false } = {}) {
  const cards = manifest.cards
    .map((card) => `- ${card.publicId}${card.title ? ` — ${card.title}` : ''}`)
    .join('\n');
  const folder = archive
    ? `openspec/changes/archive/<fecha>-${manifest.changeId}/`
    : `openspec/changes/${manifest.changeId}/`;
  return `## Change

- **Id:** \`${manifest.changeId}\`
- **Rama:** \`${manifest.branch}\`
- **Carpeta:** \`${folder}\`
- **Tarjetas Kan:**
${cards}

## Resumen

<!-- Qué cambia y por qué. Si agrupa tarjetas, justifica por qué forman un solo change. -->

## Deltas de specs

<!-- Capacidades nuevas o modificadas y enlaces a openspec/changes/<id>/specs/. -->

## Verificaciones

- [ ] \`npm run typecheck\`
- [ ] \`npm run lint\`
- [ ] \`npm test\`
- [ ] \`npm run build\`
- [ ] \`npm run e2e\` (o motivo por el que no aplica)

## Lista de comprobación

- [ ] Un change = una rama = una PR.
- [ ] El commit incluye solo el alcance del change y no mezcla trabajo ajeno.
- [ ] No se toca \`docs/diseno/\`, \`design/\` ni \`openspec/specs/diseno/*\`.
- [ ] No se commitean \`.env\`, tokens, credenciales ni datos personales.
- [ ] Todas las tarjetas del manifiesto están enlazadas en esta PR.
- [ ] Los ficheros compartidos (\`AGENTS.md\`, \`package.json\`, CI, configuración) están coordinados.
`;
}

export const GIT_SUBPROCESS_TIMEOUT_MS = 15_000;

export function execGit(args, { cwd, input, allowFailure = false, env = process.env, timeout = GIT_SUBPROCESS_TIMEOUT_MS } = {}) {
  const result = spawnSync('git', args, {
    cwd,
    input,
    encoding: 'utf8',
    env,
    timeout,
  });
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  if (result.error) {
    throw new KanSyncError(`No se pudo ejecutar git ${args.join(' ')}: ${result.error.message}`, 'GIT_FAILED');
  }
  if (result.status !== 0 && !allowFailure) {
    throw new KanSyncError(
      `git ${args.join(' ')} falló: ${(stderr || stdout).trim() || `código ${result.status}`}`,
      'GIT_FAILED'
    );
  }
  return { status: result.status ?? 1, stdout, stderr };
}

export function commitPaths({ runGit = execGit, cwd, paths, message }) {
  runGit(['add', '--', ...paths], { cwd });
  runGit(['commit', '-m', message], { cwd });
}

export function pushAtomicClaim({ runGit = execGit, cwd, branch, tags, remote = 'origin', timeout = GIT_SUBPROCESS_TIMEOUT_MS }) {
  const refs = [`HEAD:refs/heads/${branch}`, ...tags.map((tag) => `refs/tags/${tag}`)];
  return runGit(['push', '--atomic', remote, ...refs], { cwd, timeout });
}

export function pushAtomicTags({ runGit = execGit, cwd, tags, remote = 'origin' }) {
  return runGit(['push', '--atomic', remote, ...tags.map((tag) => `refs/tags/${tag}`)], { cwd });
}
