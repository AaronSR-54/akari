#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import {
  DEFAULT_CONFIG_FILE,
  readConfig,
  readEnv,
  resolveMainRoot,
} from './lib/config.mjs';
import { KanSyncError } from './lib/errors.mjs';
import {
  DEFAULT_TIMEOUT_MS,
  addCardComment,
  appendChangeMarker,
  assignCard,
  buildCommentText,
  createClient,
  discover,
  doneChange,
  extractChangeId,
  findCardByPublicId,
  memberName,
  moveCard,
  pickCard,
  queue,
  removeChangeMarker,
  removeCardMember,
  requireApiKey,
  resolveList,
  resolveTargetMember,
  reviewChange,
  setCardDescription,
  startChange,
} from './lib/kan.mjs';
import {
  addCardsToManifest,
  archivedManifest,
  branchName,
  buildPrBody,
  claimTag,
  createManifest,
  deriveChangeId,
  execGit,
  hotFilesChanged,
  isArchivedChange,
  isValidChangeId,
  parseClaimRef,
  pushAtomicClaim,
  pushAtomicTags,
  readManifest,
  writeManifestFile,
  worktreePath,
  writeManifest,
} from './lib/workflow.mjs';
import { describePorts, resolvePorts } from './lib/ports.mjs';

export {
  DEFAULT_CONFIG_FILE,
  DEFAULT_ENV_FILE,
  ROOT,
  loadEnvText,
  parseConfig,
  readConfig,
  readEnv,
  resolveMainRoot,
} from './lib/config.mjs';
export { KanSyncError } from './lib/errors.mjs';
export {
  DEFAULT_TIMEOUT_MS,
  addCardComment,
  appendChangeMarker,
  appendPrUrl,
  buildCommentText,
  buildCreateCard,
  buildMoveCard,
  changeLine,
  changeMarker,
  createClient,
  discover,
  doneChange,
  extractChangeId,
  findCardByPublicId,
  flattenCards,
  matchCards,
  memberName,
  pickCard,
  queue,
  queuePayload,
  removeChangeMarker,
  resolveAssignee,
  resolveList,
  reviewChange,
  startChange,
} from './lib/kan.mjs';

const USAGE = `Uso:
  node scripts/kan-sync.mjs queue [--json]
  node scripts/kan-sync.mjs claim <card-id...> [--change <id>] [--worktree-root <ruta>] [--dev-port <puerto>] [--e2e-port <puerto>] [--dry-run]
  node scripts/kan-sync.mjs link <change-id> --cards <card-id,...> [--dry-run]
  node scripts/kan-sync.mjs review <change-id> [--dry-run]
  node scripts/kan-sync.mjs done <change-id> [--pr <url>] [--card <publicId>] [--no-check] [--dry-run]
  node scripts/kan-sync.mjs release <change-id> [--force] [--dry-run]
  node scripts/kan-sync.mjs cleanup <change-id> [--pr <url>] [--force] [--dry-run]
  node scripts/kan-sync.mjs pr-body <change-id> [--archive]
  node scripts/kan-sync.mjs check <change-id>
  node scripts/kan-sync.mjs whoami
  node scripts/kan-sync.mjs comment <change-id> <texto> [--dry-run]
  node scripts/kan-sync.mjs start <change-id> [--title "texto"] [--card <publicId>] [--dry-run]
  node scripts/kan-sync.mjs discover [--base-url URL] [--board <publicId>] [--json]

Opciones:
  --config <ruta>        kan.config.json alternativo.
  --env <ruta>           fichero .env alternativo.
  --base-url <url>       URL de la API (por defecto, la de kan.config.json).
  --board <id>           tablero para discover.
  --card <id>            publicId de la tarjeta; evita la búsqueda por título.
  --cards <id,...>       tarjetas para link.
  --change <id>          change-id explícito para claim.
  --title <texto>        título legible al crear una tarjeta.
  --worktree-root <ruta> raíz de los worktrees (por defecto, hermana del repo).
  --dev-port <puerto>    fuerza el puerto de desarrollo.
  --e2e-port <puerto>    fuerza el puerto de E2E.
  --pr <url>             URL de la PR que se registra en las tarjetas.
  --force                permite limpiar un claim con trabajo pendiente.
  --no-check             omite el aviso de ficheros compartidos en done.
  --dry-run              resuelve y muestra la acción sin escribir.
  --json                 salida JSON para queue y discover.
  --timeout <ms>         timeout por petición (${DEFAULT_TIMEOUT_MS} por defecto).
  -h, --help             muestra esta ayuda.`;

function parseCardList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function gitTopLevel({ runGit = execGit, cwd = process.cwd() } = {}) {
  try {
    return runGit(['rev-parse', '--show-toplevel'], { cwd }).stdout.trim() || cwd;
  } catch {
    return cwd;
  }
}

function listRemoteTags({ runGit = execGit, cwd } = {}) {
  const output = runGit(['ls-remote', '--tags', 'origin', 'refs/tags/claims/*'], { cwd }).stdout;
  const tags = new Map();
  for (const line of output.split(/\r?\n/)) {
    const [, rawRef] = line.split(/\s+/);
    if (!rawRef) continue;
    const ref = rawRef.replace(/\^\{\}$/, '');
    const parsed = parseClaimRef(ref);
    if (!parsed) continue;
    if (!tags.has(parsed.cardId)) tags.set(parsed.cardId, []);
    tags.get(parsed.cardId).push(parsed.changeId);
  }
  return tags;
}

function remoteBranchExists({ runGit = execGit, cwd, branch }) {
  const output = runGit(['ls-remote', '--heads', 'origin', `refs/heads/${branch}`], { cwd }).stdout;
  return output.trim().length > 0;
}

function localTagExists({ runGit = execGit, cwd, tag }) {
  return runGit(['tag', '--list', tag], { cwd }).stdout.trim() === tag;
}

function createLocalTag({ runGit = execGit, cwd, tag, message }) {
  if (localTagExists({ runGit, cwd, tag })) return false;
  runGit(['tag', '-a', tag, '-m', message], { cwd });
  return true;
}

function deleteLocalTag({ runGit = execGit, cwd, tag }) {
  runGit(['tag', '-d', tag], { cwd, allowFailure: true });
}

function deleteRemoteTag({ runGit = execGit, cwd, tag }) {
  runGit(['push', 'origin', `:refs/tags/${tag}`], { cwd, allowFailure: true });
}

function createWorktree({ runGit = execGit, mainRoot, worktree, branch, base = 'origin/main' }) {
  mkdirSync(dirname(worktree), { recursive: true });
  runGit(['fetch', 'origin', base.replace(/^origin\//, '')], { cwd: mainRoot, allowFailure: true });
  const localBranch = runGit(['branch', '--list', branch], { cwd: mainRoot }).stdout.trim();
  if (localBranch) {
    runGit(['worktree', 'add', worktree, branch], { cwd: mainRoot });
  } else {
    runGit(['worktree', 'add', '-b', branch, worktree, base], { cwd: mainRoot });
  }
}

const WORKSPACE_PACKAGES = {
  domain: 'packages/domain',
  data: 'packages/data',
  tokens: 'packages/tokens',
  ui: 'packages/ui',
  web: 'apps/web',
};

function hasEntry(path) {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

export function linkNodeModules({ mainRoot, worktree }) {
  const source = join(mainRoot, 'node_modules');
  const target = join(worktree, 'node_modules');
  if (!existsSync(source) || !existsSync(worktree)) return;
  try {
    if (hasEntry(target) && lstatSync(target).isSymbolicLink()) {
      if (realpathSync(target) !== realpathSync(source)) return;
      rmSync(target);
    }
    if (!hasEntry(target)) {
      mkdirSync(target, { recursive: true });
      for (const entry of readdirSync(source, { withFileTypes: true })) {
        if (entry.name === '@akari') continue;
        const link = join(target, entry.name);
        if (!hasEntry(link)) {
          symlinkSync(join(source, entry.name), link, entry.isDirectory() ? 'dir' : 'file');
        }
      }
    }
    const scope = join(target, '@akari');
    if (!hasEntry(scope)) mkdirSync(scope, { recursive: true });
    for (const [name, relative] of Object.entries(WORKSPACE_PACKAGES)) {
      const packageRoot = join(worktree, relative);
      if (!existsSync(packageRoot)) continue;
      const link = join(scope, name);
      if (hasEntry(link)) {
        if (realpathSync(link) === realpathSync(packageRoot)) continue;
        rmSync(link, { recursive: true, force: true });
      }
      symlinkSync(packageRoot, link, 'dir');
    }
  } catch {
    // Sin enlace, el worktree puede instalar sus propias dependencias.
  }
}

function removeWorktree({ runGit = execGit, mainRoot, worktree, force = false }) {
  if (!existsSync(worktree)) return;
  runGit(['worktree', 'remove', ...(force ? ['--force'] : []), worktree], {
    cwd: mainRoot,
    allowFailure: true,
  });
}

function cleanupClaim({ runGit = execGit, mainRoot, worktree, branch, tags }) {
  removeWorktree({ runGit, mainRoot, worktree, force: true });
  runGit(['branch', '-D', branch], { cwd: mainRoot, allowFailure: true });
  for (const tag of tags) deleteLocalTag({ runGit, cwd: mainRoot, tag });
}

function ensureChangeScaffold({ worktree, changeId }) {
  const changeDir = join(worktree, 'openspec', 'changes', changeId);
  if (existsSync(join(changeDir, '.openspec.yaml'))) return changeDir;
  const result = spawnSync('openspec', ['new', 'change', changeId], {
    cwd: worktree,
    encoding: 'utf8',
  });
  if (result.error) {
    throw new KanSyncError(
      `No se pudo crear el change "${changeId}" en el worktree: ${result.error.message}`,
      'OPENSPEC_FAILED'
    );
  }
  if (result.status !== 0) {
    throw new KanSyncError(
      `openspec new change "${changeId}" falló: ${(result.stderr || result.stdout).trim()}`,
      'OPENSPEC_FAILED'
    );
  }
  return changeDir;
}

function commitClaim({ runGit = execGit, worktree, changeId, message, changePath }) {
  const changeDir = changePath ?? join('openspec', 'changes', changeId);
  runGit(['add', '--', changeDir], { cwd: worktree });
  const status = runGit(['diff', '--cached', '--quiet'], { cwd: worktree, allowFailure: true });
  if (status.status === 0) return false;
  runGit(['commit', '-m', message], { cwd: worktree });
  return true;
}

export async function validateClaimCards({ board, config, env, client, cardIds, changeId, allowNonTodo = false }) {
  const todoList = resolveList(board.lists, config.lists.todo);
  const allowedLists = new Set([todoList.name]);
  for (const name of [config.lists.inProgress, config.lists.review].filter(Boolean)) {
    const match = board.lists.find((list) => list.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (match) allowedLists.add(match.name);
  }
  const assignee = await resolveTargetMember({ board, env, client });
  const cards = [];
  for (const publicId of cardIds) {
    const card = findCardByPublicId(board, publicId);
    if (!card) {
      throw new KanSyncError(`No hay ninguna tarjeta con publicId "${publicId}" en el tablero.`, 'CARD_NOT_FOUND');
    }
    if (card.listPublicId !== todoList.publicId) {
      if (!allowNonTodo || !allowedLists.has(card.listName)) {
        throw new KanSyncError(
          `La tarjeta ${card.publicId} está en "${card.listName}", no en "${todoList.name}".`,
          'CARD_NOT_IN_QUEUE'
        );
      }
    }
    const members = card.members ?? [];
    if (members.some((member) => member.publicId !== assignee.publicId)) {
      const names = members.map((member) => memberName(member)).join(', ');
      throw new KanSyncError(
        `La tarjeta ${card.publicId} está asignada a ${names}; no se puede reclamar.`,
        'CARD_ASSIGNED'
      );
    }
    const linked = extractChangeId(card);
    if (linked && linked !== changeId) {
      throw new KanSyncError(
        `La tarjeta ${card.publicId} ya está vinculada al change "${linked}".`,
        'CARD_ALREADY_LINKED'
      );
    }
    cards.push(card);
  }
  return { cards, assignee, todoList };
}

export async function claimCommand({
  cardIds,
  changeId,
  config,
  env,
  fetchImpl,
  dryRun,
  worktreeRoot,
  devPort,
  e2ePort,
  log,
  cwd,
  runGit,
}) {
  if (cardIds.length === 0) {
    throw new KanSyncError('claim necesita al menos un publicId de tarjeta.', 'CARD_REQUIRED');
  }
  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });
  const board = await client.request(`/boards/${config.boardPublicId}`);
  const inProgressList = resolveList(board.lists, config.lists.inProgress);

  const firstCard = findCardByPublicId(board, cardIds[0]);
  if (!firstCard) {
    throw new KanSyncError(`No hay ninguna tarjeta con publicId "${cardIds[0]}" en el tablero.`, 'CARD_NOT_FOUND');
  }
  const resolvedChangeId = changeId || deriveChangeId(firstCard.title);
  if (!isValidChangeId(resolvedChangeId)) {
    throw new KanSyncError(`El change-id "${resolvedChangeId}" no es kebab-case válido.`, 'CHANGE_ID_INVALID');
  }
  if (cardIds.length > 1 && !changeId) {
    throw new KanSyncError('Para reclamar varias tarjetas, pasa --change con el id del grupo.', 'CHANGE_ID_REQUIRED');
  }
  if (isArchivedChange(gitTopLevel({ runGit, cwd }), resolvedChangeId)) {
    throw new KanSyncError(`El change "${resolvedChangeId}" ya está archivado; no se puede reclamar.`, 'CHANGE_ARCHIVED');
  }

  const mainRoot = resolveMainRoot({ cwd, runGit });
  const branch = branchName(resolvedChangeId);
  const worktree = worktreePath({ mainRoot, changeId: resolvedChangeId, worktreeRoot, env });
  const remoteTags = listRemoteTags({ runGit, cwd: mainRoot });
  for (const publicId of cardIds) {
    for (const owner of remoteTags.get(publicId) ?? []) {
      if (owner !== resolvedChangeId) {
        throw new KanSyncError(
          `La tarjeta ${publicId} ya está reclamada por el change "${owner}".`,
          'CARD_ALREADY_CLAIMED'
        );
      }
    }
  }
  const taggedCards = cardIds.filter((publicId) => (remoteTags.get(publicId) ?? []).includes(resolvedChangeId));
  const hasRemoteBranch = remoteBranchExists({ runGit, cwd: mainRoot, branch });
  const localBranch = runGit(['branch', '--list', branch], { cwd: mainRoot }).stdout.trim();
  const sameClaim = taggedCards.length === cardIds.length && hasRemoteBranch;
  if (taggedCards.length > 0 && !hasRemoteBranch) {
    throw new KanSyncError(
      `Existen etiquetas del claim "${resolvedChangeId}" pero falta la rama ${branch}; revisa el remoto.`,
      'CLAIM_INCONSISTENT'
    );
  }
  if ((hasRemoteBranch || localBranch) && !sameClaim) {
    throw new KanSyncError(
      `La rama ${branch} ya existe y no pertenece a este claim; elige otro --change o libera el claim anterior.`,
      'BRANCH_EXISTS'
    );
  }
  if (existsSync(worktree) && !sameClaim) {
    throw new KanSyncError(
      `La ruta del worktree ya existe: ${worktree}. No se sobrescribe; elige otro --change o libera el claim.`,
      'WORKTREE_EXISTS'
    );
  }

  const { cards, assignee } = await validateClaimCards({
    board,
    config,
    env,
    client,
    cardIds,
    changeId: resolvedChangeId,
    allowNonTodo: sameClaim,
  });

  if (dryRun) {
    const ports = await resolvePorts({
      root: worktree,
      changeId: resolvedChangeId,
      devPort,
      e2ePort,
      persist: false,
    });
    log(
      `[dry-run] ${sameClaim ? 'reanudar' : 'reclamar'} el change "${resolvedChangeId}" con ${cards.length} tarjeta(s).`
    );
    log(`  Rama: ${branch}`);
    log(`  Worktree: ${worktree}`);
    log(`  Puertos: ${describePorts(ports)}`);
    log(`  Tarjetas: ${cards.map((card) => card.publicId).join(', ')}`);
    return { dryRun: true, changeId: resolvedChangeId, branch, worktree, cards: cards.map((card) => card.publicId), ports, sameClaim };
  }

  let manifest;
  if (sameClaim) {
    if (existsSync(worktree)) {
      const currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: worktree }).stdout.trim();
      if (currentBranch !== branch) {
        throw new KanSyncError(
          `El worktree ${worktree} está en "${currentBranch}", no en "${branch}".`,
          'WORKTREE_BRANCH_MISMATCH'
        );
      }
      linkNodeModules({ mainRoot, worktree });
      manifest = readManifest(worktree, resolvedChangeId);
      if (!manifest) {
        throw new KanSyncError(
          `El worktree ${worktree} existe pero no contiene workflow.json para "${resolvedChangeId}".`,
          'MANIFEST_MISSING'
        );
      }
    } else {
      createWorktree({ runGit, mainRoot, worktree, branch, base: `origin/${branch}` });
      linkNodeModules({ mainRoot, worktree });
      manifest = readManifest(worktree, resolvedChangeId);
      if (!manifest) {
        throw new KanSyncError(
          `La rama ${branch} existe pero no contiene workflow.json para "${resolvedChangeId}".`,
          'MANIFEST_MISSING'
        );
      }
    }
    const manifestIds = new Set(manifest.cards.map((card) => card.publicId));
    const missing = cards.filter((card) => !manifestIds.has(card.publicId));
    if (missing.length > 0) {
      throw new KanSyncError(
        `El claim "${resolvedChangeId}" no incluye ${missing.map((card) => card.publicId).join(', ')}; usa link para añadirlas.`,
        'CLAIM_INCOMPLETE'
      );
    }
  } else {
    createWorktree({ runGit, mainRoot, worktree, branch });
    linkNodeModules({ mainRoot, worktree });
    try {
      ensureChangeScaffold({ worktree, changeId: resolvedChangeId });
      manifest = createManifest({ changeId: resolvedChangeId, cards });
      writeManifest(worktree, manifest);
      await resolvePorts({
        root: worktree,
        changeId: resolvedChangeId,
        devPort,
        e2ePort,
      });
      commitClaim({
        runGit,
        worktree,
        changeId: resolvedChangeId,
        message: `chore(${resolvedChangeId}): claim cards and create worktree`,
      });
      const tags = cards.map((card) => claimTag(card.publicId, resolvedChangeId));
      for (const card of cards) {
        createLocalTag({
          runGit,
          cwd: worktree,
          tag: claimTag(card.publicId, resolvedChangeId),
          message: `change=${resolvedChangeId} card=${card.publicId}`,
        });
      }
      pushAtomicClaim({ runGit, cwd: worktree, branch, tags });
    } catch (error) {
      cleanupClaim({ runGit, mainRoot, worktree, branch, tags: cards.map((card) => claimTag(card.publicId, resolvedChangeId)) });
      throw error;
    }
  }

  let kanError = null;
  try {
    await syncCardsToProgressWithList({
      client,
      board,
      cards,
      changeId: resolvedChangeId,
      assignee,
      inProgressList,
      log,
    });
  } catch (error) {
    kanError = error;
    log(`Aviso: el claim está publicado en Git, pero Kan.bn falló: ${error.message}`);
    log('Puedes reintentar `claim` para volver a sincronizar sin recrear la rama.');
  }

  const ports = await resolvePorts({
    root: worktree,
    changeId: resolvedChangeId,
    devPort,
    e2ePort,
  });

  log(`Change: ${resolvedChangeId}`);
  log(`Rama: ${branch}`);
  log(`Worktree: ${worktree}`);
  log(`Puertos: ${describePorts(ports)}`);
  log(`Tarjetas: ${cards.map((card) => card.publicId).join(', ')}`);
  log(`Abrir: opencode ${worktree}`);
  log(`Dev:   npm run dev:worktree`);
  log(`E2E:   npm run e2e:worktree`);
  if (kanError) log(`Kan pendiente: ${kanError.message}`);
  return { dryRun: false, changeId: resolvedChangeId, branch, worktree, cards: cards.map((card) => card.publicId), ports, kanError: kanError?.message ?? null, sameClaim };
}

async function syncCardsToProgressWithList({ client, board, cards, changeId, assignee, inProgressList, log }) {
  const results = [];
  for (const manifestCard of cards) {
    const card = findCardByPublicId(board, manifestCard.publicId);
    if (!card) {
      log(`Aviso: no se encontró la tarjeta ${manifestCard.publicId}; se omite.`);
      results.push({ publicId: manifestCard.publicId, found: false });
      continue;
    }
    const description = appendChangeMarker(card.description, changeId);
    if (description !== (card.description ?? '')) {
      await setCardDescription({ client, card, description });
    }
    const assignedNow = await assignCard({ client, card, assignee });
    const moved = await moveCard({ client, card, list: inProgressList });
    results.push({ publicId: card.publicId, found: true, assignedNow, moved });
    log(`Tarjeta ${card.publicId}: ${moved ? 'movida' : 'ya estaba'} y ${assignedNow ? 'asignada' : 'ya asignada'}.`);
  }
  return results;
}

async function linkCommand({ changeId, cardIds, config, env, fetchImpl, dryRun, log, cwd, runGit }) {
  if (!changeId) throw new KanSyncError('link necesita el id del change.', 'CHANGE_ID_REQUIRED');
  if (cardIds.length === 0) throw new KanSyncError('link necesita --cards con al menos una tarjeta.', 'CARD_REQUIRED');
  const root = gitTopLevel({ runGit, cwd });
  if (isArchivedChange(root, changeId)) {
    throw new KanSyncError(`El change "${changeId}" ya está archivado; no se pueden enlazar tarjetas.`, 'CHANGE_ARCHIVED');
  }
  const manifest = readManifest(root, changeId);
  if (!manifest) {
    throw new KanSyncError(
      `No existe workflow.json para "${changeId}" en ${root}. Ejecuta link desde el worktree del claim.`,
      'MANIFEST_MISSING'
    );
  }
  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });
  const board = await client.request(`/boards/${config.boardPublicId}`);
  const inProgressList = resolveList(board.lists, config.lists.inProgress);
  const assignee = await resolveTargetMember({ board, env, client });
  const existingIds = new Set(manifest.cards.map((card) => card.publicId));
  const newIds = cardIds.filter((id) => !existingIds.has(id));
  const { cards } = await validateClaimCards({ board, config, env, client, cardIds: newIds, changeId });

  const remoteTags = listRemoteTags({ runGit, cwd: root });
  for (const card of cards) {
    const owners = remoteTags.get(card.publicId) ?? [];
    for (const owner of owners) {
      if (owner !== changeId) {
        throw new KanSyncError(
          `La tarjeta ${card.publicId} ya está reclamada por el change "${owner}".`,
          'CARD_ALREADY_CLAIMED'
        );
      }
    }
  }

  if (dryRun) {
    log(`[dry-run] enlazar ${cards.map((card) => card.publicId).join(', ')} al change ${changeId}.`);
    return { dryRun: true, changeId, cards: cards.map((card) => card.publicId) };
  }

  const created = [];
  try {
    for (const card of cards) {
      if (createLocalTag({ runGit, cwd: root, tag: claimTag(card.publicId, changeId), message: `change=${changeId} card=${card.publicId}` })) {
        created.push(claimTag(card.publicId, changeId));
      }
    }
    if (created.length > 0) pushAtomicTags({ runGit, cwd: root, tags: created });
  } catch (error) {
    for (const tag of created) deleteLocalTag({ runGit, cwd: root, tag });
    throw error;
  }

  const next = addCardsToManifest(manifest, cards);
  writeManifest(root, next);
  commitClaim({
    runGit,
    worktree: root,
    changeId,
    message: `chore(${changeId}): link cards ${cards.map((card) => card.publicId).join(', ')}`,
  });
  runGit(['push', 'origin', `HEAD:refs/heads/${next.branch}`], { cwd: root });

  await syncCardsToProgressWithList({
    client,
    board,
    cards,
    changeId,
    assignee,
    inProgressList,
    log,
  });
  log(`Enlazadas ${cards.length} tarjeta(s) al change ${changeId}.`);
  return { dryRun: false, changeId, cards: next.cards.map((card) => card.publicId) };
}

function readManifestForCommand({ changeId, cwd, runGit }) {
  const root = gitTopLevel({ runGit, cwd });
  const manifest = readManifest(root, changeId);
  if (manifest) return { root, manifest, changePath: join('openspec', 'changes', changeId) };
  const archived = archivedManifest(root, changeId);
  if (archived) return { root, manifest: archived.manifest, changePath: archived.changePath };
  return { root, manifest: null, changePath: null };
}

async function reviewCommand({ changeId, config, env, fetchImpl, dryRun, log, cwd, runGit }) {
  const { root, manifest } = readManifestForCommand({ changeId, cwd, runGit });
  if (isArchivedChange(root, changeId)) {
    throw new KanSyncError(`El change "${changeId}" está archivado; no se puede revisar.`, 'CHANGE_ARCHIVED');
  }
  await reviewChange({
    changeId,
    config,
    env,
    fetchImpl,
    dryRun,
    cards: manifest?.cards,
    log,
  });
}

async function doneCommand({ changeId, config, env, fetchImpl, dryRun, cardPublicId, prUrl, noCheck, log, cwd, runGit }) {
  if (prUrl && !/^https?:\/\//.test(prUrl)) {
    throw new KanSyncError('--pr debe ser una URL http(s).', 'PR_URL_INVALID');
  }
  const { root, manifest, changePath } = readManifestForCommand({ changeId, cwd, runGit });
  if (!noCheck) {
    try {
      const changed = checkCommand({ changeId, cwd: root, runGit, log });
      if (changed.length > 0) {
        log('Aviso: la rama toca ficheros compartidos; coordina el merge antes de abrir la PR.');
      }
    } catch {
      // check es advisory: no bloquea done.
    }
  }
  const result = await doneChange({
    changeId,
    config,
    env,
    fetchImpl,
    dryRun,
    cardPublicId,
    cards: manifest?.cards,
    prUrl,
    log,
  });
  if (manifest && prUrl && !dryRun) {
    const next = { ...manifest, prUrl };
    writeManifestFile(join(root, changePath, 'workflow.json'), next);
    commitClaim({
      runGit,
      worktree: root,
      changeId,
      changePath,
      message: `chore(${changeId}): record PR`,
    });
    runGit(['push', 'origin', `HEAD:refs/heads/${next.branch}`], { cwd: root });
  }
  if (!prUrl) log('Aviso: no se registró ninguna PR; pasa --pr <url> cuando la abras.');
  if (!dryRun) stopPreview({ cwd: root, log });
  return result;
}

function stopPreview({ cwd, log }) {
  try {
    const result = spawnSync('npm', ['run', 'preview:worktree:stop'], {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    if (result.status === 0) return true;
    const detail = (result.stderr || result.stdout || '').trim();
    log(`Aviso: no se pudo detener el frontal de revisión${detail ? `: ${detail}` : '.'}`);
    return false;
  } catch (error) {
    log(`Aviso: no se pudo detener el frontal de revisión: ${error.message}`);
    return false;
  }
}

export async function whoamiCommand({ config, env, fetchImpl, log }) {
  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });
  const board = await client.request(`/boards/${config.boardPublicId}`);
  const member = await resolveTargetMember({ board, env, client });
  log(`email: ${member.email}`);
  log(`memberPublicId: ${member.publicId}`);
  log(`name: ${memberName(member)}`);
  return member;
}

export async function commentCommand({ changeId, text, config, env, fetchImpl, dryRun, log, cardPublicId }) {
  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });
  const board = await client.request(`/boards/${config.boardPublicId}`);
  const member = await resolveTargetMember({ board, env, client });
  const card = pickCard(board, { changeId, cardPublicId });
  if (!card) {
    throw new KanSyncError(`No hay ninguna tarjeta para el change "${changeId}".`, 'CARD_NOT_FOUND');
  }
  const comment = buildCommentText(member.email, text);
  if (dryRun) {
    log(`[dry-run] comentario en ${card.publicId}: ${comment}`);
    return { dryRun: true, card: card.publicId, comment };
  }
  await addCardComment({ client, card, text: comment });
  log(`Comentario publicado en ${card.publicId} como ${member.email}.`);
  return { dryRun: false, card: card.publicId, comment };
}

function checkCommand({ changeId, cwd, runGit = execGit, log = () => {} }) {
  const root = gitTopLevel({ runGit, cwd });
  runGit(['fetch', 'origin', 'main'], { cwd: root, allowFailure: true });
  const base = runGit(['rev-parse', '--verify', 'origin/main'], { cwd: root, allowFailure: true }).status === 0
    ? 'origin/main'
    : 'main';
  const outputs = [
    runGit(['diff', '--name-only', `${base}...HEAD`], { cwd: root }).stdout,
    runGit(['diff', '--name-only'], { cwd: root, allowFailure: true }).stdout,
    runGit(['diff', '--name-only', '--cached'], { cwd: root, allowFailure: true }).stdout,
    runGit(['ls-files', '--others', '--exclude-standard'], { cwd: root, allowFailure: true }).stdout,
  ];
  const files = [...new Set(outputs.flatMap((output) => output.split(/\r?\n/).filter(Boolean)))];
  const hot = hotFilesChanged(files);
  if (hot.length > 0) {
    log(`Ficheros compartidos tocados por ${changeId}:`);
    for (const file of hot) log(`  - ${file}`);
  } else {
    log(`Sin ficheros compartidos en ${changeId}.`);
  }
  return hot;
}

async function releaseCommand({ changeId, config, env, fetchImpl, dryRun, force, log, cwd, runGit }) {
  const root = gitTopLevel({ runGit, cwd });
  if (isArchivedChange(root, changeId)) {
    throw new KanSyncError(`El change "${changeId}" está archivado; no se puede liberar.`, 'CHANGE_ARCHIVED');
  }
  const manifest = readManifest(root, changeId);
  if (!manifest) {
    log(`No hay workflow.json para "${changeId}"; el claim ya no existe o no se creó con este flujo.`);
    return { released: false, reason: 'manifest-missing' };
  }
  if (isArchivedChange(root, changeId)) {
    throw new KanSyncError(`El change "${changeId}" está archivado; no se puede liberar.`, 'CHANGE_ARCHIVED');
  }
  const statusLines = runGit(['status', '--porcelain'], { cwd: root }).stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => {
      const path = line.slice(3).trim();
      return path !== 'node_modules' && !path.startsWith('node_modules/') &&
        path !== '.opsx' && !path.startsWith('.opsx/') &&
        path !== '.env' && !path.startsWith('.env.');
    });
  const status = statusLines.join('\n');
  if (status && !force) {
    throw new KanSyncError(`El worktree tiene cambios sin commitear:\n${status}\nUsa --force para descartarlos.`, 'WORKTREE_DIRTY');
  }
  const base = runGit(['rev-parse', '--verify', 'origin/main'], { cwd: root, allowFailure: true }).status === 0
    ? 'origin/main'
    : 'main';
  const commits = runGit(['log', '--oneline', `${base}..HEAD`], { cwd: root, allowFailure: true }).stdout
    .split(/\r?\n/)
    .filter(Boolean);
  const claimCommitPrefixes = [
    `chore(${changeId}): claim`,
    `chore(${changeId}): link`,
    `chore(${changeId}): record PR`,
  ];
  const workCommits = commits.filter(
    (line) => !claimCommitPrefixes.some((prefix) => line.includes(prefix))
  );
  if (workCommits.length > 0 && !force) {
    throw new KanSyncError(
      `La rama tiene ${workCommits.length} commit(s) además del claim; usa --force si de verdad quieres descartarlos.`,
      'COMMITS_PENDING'
    );
  }
  const gh = spawnSync('gh', ['pr', 'list', '--head', manifest.branch, '--state', 'open', '--json', 'number'], {
    cwd: root,
    encoding: 'utf8',
  });
  let openPr = false;
  if (gh.error) {
    log('Aviso: gh no está disponible; comprueba a mano si la rama tiene una PR abierta.');
  } else if (gh.status === 0) {
    try {
      openPr = JSON.parse(gh.stdout || '[]').length > 0;
    } catch {
      openPr = false;
    }
  } else {
    log('Aviso: no se pudo comprobar con gh si la rama tiene una PR abierta; revísalo a mano.');
  }
  if (openPr && !force) {
    throw new KanSyncError(`La rama ${manifest.branch} tiene una PR abierta; ciérrala o usa --force.`, 'PR_OPEN');
  }

  if (dryRun) {
    log(`[dry-run] liberar ${changeId}: ${manifest.cards.length} tarjeta(s), worktree ${root}, rama ${manifest.branch}.`);
    return { dryRun: true, released: true, changeId };
  }

  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });
  const board = await client.request(`/boards/${config.boardPublicId}`);
  const todoList = resolveList(board.lists, config.lists.todo);
  const assignee = await resolveTargetMember({ board, env, client });

  for (const manifestCard of manifest.cards) {
    const card = findCardByPublicId(board, manifestCard.publicId);
    if (!card) {
      log(`Aviso: no se encontró la tarjeta ${manifestCard.publicId}; se omite.`);
      continue;
    }
    const removed = await removeCardMember({ client, card, member: assignee });
    const remaining = (card.members ?? []).filter((member) => member.publicId !== assignee.publicId);
    const description = removeChangeMarker(card.description, changeId);
    if (description !== (card.description ?? '')) {
      await setCardDescription({ client, card, description });
    }
    const escaped = changeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const title = (card.title ?? '').replace(new RegExp(`^\\[${escaped}\\]\\s*`, 'i'), '');
    if (title !== card.title) {
      await client.request(`/cards/${card.publicId}`, { method: 'PUT', body: { title } });
    }
    if (remaining.length === 0) {
      await moveCard({ client, card, list: todoList });
    } else if (removed) {
      log(`La tarjeta ${card.publicId} sigue asignada a ${remaining.map((member) => memberName(member)).join(', ')}; no se mueve.`);
    }
  }

  for (const card of manifest.cards) {
    const tag = claimTag(card.publicId, changeId);
    deleteRemoteTag({ runGit, cwd: root, tag });
    deleteLocalTag({ runGit, cwd: root, tag });
  }

  const mainRoot = resolveMainRoot({ cwd: root, runGit });
  if (root !== mainRoot) {
    process.chdir(mainRoot);
    removeWorktree({ runGit, mainRoot, worktree: root, force: true });
    if (existsSync(root)) {
      throw new KanSyncError(`No se pudo eliminar el worktree ${root}; revísalo a mano.`, 'WORKTREE_REMOVE_FAILED');
    }
    runGit(['branch', '-D', manifest.branch], { cwd: mainRoot, allowFailure: true });
    runGit(['push', 'origin', '--delete', manifest.branch], { cwd: mainRoot, allowFailure: true });
  }
  log(`Claim ${changeId} liberado: tarjetas devueltas, etiquetas y worktree limpiados.`);
  return { released: true, changeId };
}

function defaultRunGh(args, { cwd } = {}) {
  return spawnSync('gh', args, { cwd, encoding: 'utf8' });
}

function parseMergeState(result) {
  if (result?.error) {
    throw new KanSyncError(`No se pudo ejecutar gh: ${result.error.message}`, 'GH_UNAVAILABLE');
  }
  if (result?.status !== 0) {
    const detail = (result?.stderr || result?.stdout || '').trim();
    throw new KanSyncError(`No se pudo consultar la PR con gh${detail ? `: ${detail}` : '.'}`, 'GH_PR_FAILED');
  }
  try {
    return JSON.parse(result.stdout || '{}');
  } catch {
    throw new KanSyncError('gh devolvió una respuesta que no es JSON válido.', 'GH_PR_INVALID');
  }
}

/**
 * Borra el worktree y la rama local de un change solo después de que GitHub
 * confirme que su PR está mergeada. No toca etiquetas ni la rama remota.
 */
export async function cleanupCommand({
  changeId,
  prUrl,
  runGit = execGit,
  runGh = defaultRunGh,
  dryRun = false,
  force = false,
  log = () => {},
  cwd = process.cwd(),
} = {}) {
  const { root, manifest } = readManifestForCommand({ changeId, cwd, runGit });
  if (!manifest) throw new KanSyncError(`No existe workflow.json para "${changeId}".`, 'MANIFEST_MISSING');
  const url = prUrl?.trim() || manifest.prUrl;
  if (!url) throw new KanSyncError(`El change "${changeId}" no tiene PR registrada; pasa --pr <url>.`, 'PR_URL_MISSING');
  if (!/^https?:\/\//.test(url)) throw new KanSyncError('--pr debe ser una URL http(s).', 'PR_URL_INVALID');

  const pr = parseMergeState(
    runGh(['pr', 'view', url, '--json', 'number,state,mergedAt,headRefName'], { cwd: root })
  );
  if (pr.state !== 'MERGED' || !pr.mergedAt) {
    throw new KanSyncError(
      `La PR ${url} no está mergeada (estado: ${pr.state ?? 'desconocido'}); no se borra el worktree de "${changeId}".`,
      'PR_NOT_MERGED'
    );
  }

  const mainRoot = resolveMainRoot({ cwd: root, runGit });
  if (resolve(root) === resolve(mainRoot)) {
    throw new KanSyncError('El change no tiene un worktree propio; no se borra el checkout principal.', 'MAIN_CHECKOUT_PROTECTED');
  }

  if (dryRun) {
    log(`[dry-run] limpiar ${changeId}: worktree ${root} y rama local ${manifest.branch} (PR #${pr.number ?? '?'} mergeada).`);
    return { cleaned: true, dryRun: true, changeId, worktree: root, branch: manifest.branch, prUrl: url };
  }

  const status = runGit(['status', '--porcelain'], { cwd: root }).stdout
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .filter((line) => {
      const path = line.slice(3).trim();
      return path !== 'node_modules' && !path.startsWith('node_modules/') &&
        path !== '.opsx' && !path.startsWith('.opsx/') &&
        path !== '.env' && !path.startsWith('.env.');
    })
    .join('\n');
  if (status && !force) {
    throw new KanSyncError(`El worktree tiene cambios sin commitear:\n${status}\nUsa --force para descartarlos.`, 'WORKTREE_DIRTY');
  }

  const current = process.cwd();
  if (resolve(current) === resolve(root) || current.startsWith(`${resolve(root)}${sep}`)) {
    process.chdir(mainRoot);
  }
  removeWorktree({ runGit, mainRoot, worktree: root, force: Boolean(force) });
  if (existsSync(root)) {
    throw new KanSyncError(`No se pudo eliminar el worktree ${root}; revísalo a mano.`, 'WORKTREE_REMOVE_FAILED');
  }

  const soft = runGit(['branch', '-d', manifest.branch], { cwd: mainRoot, allowFailure: true });
  let branchDeleted = soft.status === 0;
  if (!branchDeleted) {
    branchDeleted = runGit(['branch', '-D', manifest.branch], { cwd: mainRoot, allowFailure: true }).status === 0;
  }
  if (!branchDeleted && runGit(['branch', '--list', manifest.branch], { cwd: mainRoot, allowFailure: true }).stdout.trim()) {
    throw new KanSyncError(`No se pudo borrar la rama local ${manifest.branch}; revísalo a mano.`, 'BRANCH_DELETE_FAILED');
  }

  log(`Worktree y rama local ${manifest.branch} eliminados tras verificar el merge de ${url}. Etiquetas y rama remota conservadas.`);
  return { cleaned: true, dryRun: false, changeId, worktree: root, branch: manifest.branch, prUrl: url };
}

function resolveBaseUrl({ configFile, baseUrl, env }) {
  if (baseUrl) return baseUrl.trim().replace(/\/+$/, '');

  if (configFile && existsSync(configFile)) {
    try {
      const data = JSON.parse(readFileSync(configFile, 'utf8'));
      if (typeof data?.baseUrl === 'string' && data.baseUrl.trim()) {
        return data.baseUrl.trim().replace(/\/+$/, '');
      }
    } catch {
      // discover puede funcionar sin kan.config.json; se informa más abajo si no hay URL.
    }
  }

  if (env.kan_BASE_URL?.trim()) return env.kan_BASE_URL.trim().replace(/\/+$/, '');
  throw new KanSyncError(
    'Falta la URL base. Pásala con --base-url (por ejemplo https://kan.example.com/api/v1), define kan_BASE_URL o crea kan.config.json.',
    'MISSING_BASE_URL'
  );
}

export function resolveRunEnvFile({ envPath, cwd = process.cwd(), runGit = execGit }) {
  if (!envPath) return undefined;
  return resolve(resolveMainRoot({ cwd, runGit }), envPath);
}

export async function run(argv, { env = process.env, log = console.log, logError = console.error, cwd = process.cwd(), runGit = execGit } = {}) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        help: { type: 'boolean', short: 'h' },
        config: { type: 'string' },
        env: { type: 'string' },
        'base-url': { type: 'string' },
        board: { type: 'string' },
        card: { type: 'string' },
        cards: { type: 'string' },
        change: { type: 'string' },
        title: { type: 'string' },
        'worktree-root': { type: 'string' },
        'dev-port': { type: 'string' },
        'e2e-port': { type: 'string' },
        pr: { type: 'string' },
        force: { type: 'boolean' },
        'no-check': { type: 'boolean' },
        'dry-run': { type: 'boolean' },
        json: { type: 'boolean' },
        archive: { type: 'boolean' },
        timeout: { type: 'string' },
      },
    });
  } catch (error) {
    logError(`Error: ${error.message}`);
    logError(USAGE);
    return 1;
  }

  const { values, positionals } = parsed;
  if (values.help) {
    log(USAGE);
    return 0;
  }

  const [command, changeId] = positionals;
  if (!command) {
    logError(USAGE);
    return 1;
  }

  const timeoutMs = values.timeout ? Number(values.timeout) : DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    logError('Error: --timeout debe ser un número de milisegundos mayor que cero.');
    return 1;
  }

  const configFile = values.config ? resolve(values.config) : DEFAULT_CONFIG_FILE;
  let mergedEnv;

  try {
    const envFile = resolveRunEnvFile({ envPath: values.env, cwd, runGit });
    mergedEnv = readEnv({ envFile, env, cwd, runGit });

    if (command === 'discover') {
      await discover({
        baseUrl: resolveBaseUrl({ configFile, baseUrl: values['base-url'], env: mergedEnv }),
        apiKey: requireApiKey(mergedEnv),
        boardPublicId: values.board,
        fetchImpl: globalThis.fetch,
        timeoutMs,
        json: values.json,
        log,
      });
      return 0;
    }

    if (command === 'pr-body' || command === 'check') {
      if (!changeId) {
        logError(`Error: ${command} necesita el id del change.`);
        logError(USAGE);
        return 1;
      }
      if (command === 'pr-body') {
        const { root, manifest } = readManifestForCommand({ changeId, cwd, runGit });
        if (!manifest) throw new KanSyncError(`No existe workflow.json para "${changeId}".`, 'MANIFEST_MISSING');
        checkCommand({ changeId, cwd: root, runGit, log });
        log(buildPrBody(manifest, { archive: Boolean(values.archive) }));
      } else {
        checkCommand({ changeId, cwd, runGit, log });
      }
      return 0;
    }

    const config = { ...readConfig({ configFile }), timeoutMs };

    if (command === 'whoami') {
      await whoamiCommand({ config, env: mergedEnv, fetchImpl: globalThis.fetch, log });
      return 0;
    }

    if (command === 'queue') {
      await queue({ config, env: mergedEnv, fetchImpl: globalThis.fetch, json: values.json, log });
      return 0;
    }

    if (command === 'claim') {
      const cardIds = [...positionals.slice(1), ...parseCardList(values.cards)];
      await claimCommand({
        cardIds,
        changeId: values.change,
        config,
        env: mergedEnv,
        fetchImpl: globalThis.fetch,
        dryRun: Boolean(values['dry-run']),
        worktreeRoot: values['worktree-root'],
        devPort: values['dev-port'],
        e2ePort: values['e2e-port'],
        log,
        cwd,
        runGit,
      });
      return 0;
    }

    if (command === 'link') {
      const cardIds = [...positionals.slice(2), ...parseCardList(values.cards)];
      await linkCommand({
        changeId,
        cardIds,
        config,
        env: mergedEnv,
        fetchImpl: globalThis.fetch,
        dryRun: Boolean(values['dry-run']),
        log,
        cwd,
        runGit,
      });
      return 0;
    }

    if (!changeId) {
      logError(`Error: ${command} necesita el id del change.`);
      logError(USAGE);
      return 1;
    }

    const options = {
      changeId,
      config,
      env: mergedEnv,
      fetchImpl: globalThis.fetch,
      dryRun: Boolean(values['dry-run']),
      log,
      cwd,
      runGit,
    };

    if (command === 'start') {
      const { manifest } = readManifestForCommand({ changeId, cwd, runGit });
      await startChange({ ...options, title: values.title, cardPublicId: values.card, cards: manifest?.cards });
    } else if (command === 'done') {
      await doneCommand({ ...options, cardPublicId: values.card, prUrl: values.pr, noCheck: Boolean(values['no-check']) });
    } else if (command === 'comment') {
      await commentCommand({
        ...options,
        text: positionals.slice(2).join(' '),
        cardPublicId: values.card,
      });
    } else if (command === 'review') {
      await reviewCommand(options);
    } else if (command === 'release') {
      await releaseCommand({ ...options, force: Boolean(values.force) });
    } else if (command === 'cleanup') {
      await cleanupCommand({ changeId, prUrl: values.pr, runGit, dryRun: Boolean(values['dry-run']), force: Boolean(values.force), log });
    } else {
      logError(`Error: comando desconocido "${command}".`);
      logError(USAGE);
      return 1;
    }
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError(`Error: ${message}`);
    return 1;
  }
}

const isEntryPoint = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isEntryPoint) {
  const exitCode = await run(process.argv.slice(2));
  process.exitCode = exitCode;
}
