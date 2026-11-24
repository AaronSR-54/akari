#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_CONFIG_FILE = resolve(ROOT, 'kan.config.json');
export const DEFAULT_ENV_FILE = resolve(ROOT, '.env');
export const DEFAULT_TIMEOUT_MS = 10_000;

const USAGE = `Uso:
  node scripts/kan-sync.mjs start <change-id> [--title "texto"] [--card <publicId>] [--dry-run]
  node scripts/kan-sync.mjs done <change-id> [--card <publicId>] [--dry-run]
  node scripts/kan-sync.mjs discover [--base-url URL] [--board <publicId>] [--json]

Opciones:
  --config <ruta>   kan.config.json alternativo.
  --env <ruta>      fichero .env alternativo.
  --base-url <url>  URL de la API (por defecto, la de kan.config.json).
  --board <id>      tablero para discover.
  --card <id>       publicId de la tarjeta; evita la búsqueda por título.
  --title <texto>   título legible al crear una tarjeta.
  --dry-run         resuelve y muestra la acción sin escribir en el tablero.
  --json            salida JSON para discover.
  --timeout <ms>    timeout por petición (${DEFAULT_TIMEOUT_MS} por defecto).
  -h, --help        muestra esta ayuda.`;

export class KanSyncError extends Error {
  constructor(message, code = 'ERROR') {
    super(message);
    this.name = 'KanSyncError';
    this.code = code;
  }
}

export function loadEnvText(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    if (!key) continue;
    let value = line.slice(separator + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

export function readEnv({ envFile = DEFAULT_ENV_FILE, env = process.env } = {}) {
  const fromFile = existsSync(envFile) ? loadEnvText(readFileSync(envFile, 'utf8')) : {};
  const merged = { ...fromFile };
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') merged[key] = value;
  }
  return merged;
}

export function parseConfig(text, source = DEFAULT_CONFIG_FILE) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new KanSyncError(`No se pudo leer ${source}: ${error.message}`, 'CONFIG_INVALID');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new KanSyncError(`${source} debe contener un objeto JSON.`, 'CONFIG_INVALID');
  }

  const baseUrl = typeof data.baseUrl === 'string' ? data.baseUrl.trim().replace(/\/+$/, '') : '';
  if (!baseUrl) {
    throw new KanSyncError(`Falta "baseUrl" en ${source}, por ejemplo "https://kan.example.com/api/v1".`, 'CONFIG_INVALID');
  }
  if (!/^https?:\/\//.test(baseUrl)) {
    throw new KanSyncError(`"baseUrl" en ${source} debe empezar por http:// o https://.`, 'CONFIG_INVALID');
  }

  const boardPublicId = typeof data.boardPublicId === 'string' ? data.boardPublicId.trim() : '';
  if (!boardPublicId) {
    throw new KanSyncError(`Falta "boardPublicId" en ${source}; obtenlo con "npm exec -- node scripts/kan-sync.mjs discover".`, 'CONFIG_INVALID');
  }

  const lists = data.lists;
  const normalizedLists = {};
  for (const key of ['todo', 'inProgress', 'done']) {
    const value = typeof lists?.[key] === 'string' ? lists[key].trim() : '';
    if (!value) {
      throw new KanSyncError(`Falta "lists.${key}" en ${source}.`, 'CONFIG_INVALID');
    }
    normalizedLists[key] = value;
  }

  return { baseUrl, boardPublicId, lists: normalizedLists, source };
}

export function readConfig({ configFile = DEFAULT_CONFIG_FILE } = {}) {
  if (!existsSync(configFile)) {
    throw new KanSyncError(
      `No existe ${configFile}. Crea kan.config.json con "baseUrl", "boardPublicId" y "lists". Consulta docs/desarrollo/kanban.md.`,
      'CONFIG_MISSING'
    );
  }
  return parseConfig(readFileSync(configFile, 'utf8'), configFile);
}export function resolveList(boardLists, name) {
  const wanted = name.trim().toLowerCase();
  const matches = boardLists.filter((list) => list.name.trim().toLowerCase() === wanted);
  if (matches.length === 0) {
    const available = boardLists.map((list) => `"${list.name}"`).join(', ') || '(ninguna)';
    throw new KanSyncError(`No existe la lista "${name}". Listas disponibles: ${available}.`, 'LIST_NOT_FOUND');
  }
  if (matches.length > 1) {
    throw new KanSyncError(`La lista "${name}" aparece ${matches.length} veces en el tablero; renómbralas para que sea única.`, 'LIST_AMBIGUOUS');
  }
  return matches[0];
}

export function matchCards(cards, changeId) {
  const escaped = changeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?<![a-z0-9-])${escaped}(?![a-z0-9-])`, 'i');
  return cards.filter((card) => pattern.test(card.title));
}

export function flattenCards(board) {
  return board.lists.flatMap((list) =>
    list.cards.map((card) => ({ ...card, listName: list.name, listPublicId: list.publicId }))
  );
}

export function buildCreateCard({ changeId, title, listPublicId, memberPublicId, description }) {
  return {
    title: title ? `[${changeId}] ${title}` : `[${changeId}]`,
    description: description ?? `Change de OpenSpec: \`openspec/changes/${changeId}/\`.`,
    listPublicId,
    labelPublicIds: [],
    memberPublicIds: memberPublicId ? [memberPublicId] : [],
    position: 'end',
  };
}

export function buildMoveCard(listPublicId) {
  return { listPublicId, index: 0 };
}

export function resolveAssignee(members, email) {
  if (!email) return null;
  const active = members.filter((member) => member.status === 'active');
  const match = active.find(
    (member) => member.email.trim().toLowerCase() === email.trim().toLowerCase()
  );
  if (!match) {
    const available = active.map((member) => member.email).join(', ') || '(ninguno)';
    throw new KanSyncError(
      `No hay un miembro activo con el email "${email}". Miembros disponibles: ${available}.`,
      'ASSIGNEE_NOT_FOUND'
    );
  }
  return match;
}

export function memberName(member) {
  return member.user?.name || member.email;
}

function describeHttpError(status, detail) {
  const base =
    {
      401: 'kan_API_KEY no es válida o ha sido revocada',
      403: 'kan_API_KEY no tiene permisos para esta operación',
      404: 'el recurso no existe o el token no puede verlo',
      429: 'Kan.bn ha limitado las peticiones; espera un minuto',
    }[status] ??
    (status >= 500 ? 'Kan.bn ha devuelto un error interno' : `la API ha respondido con ${status}`);
  return detail ? `${base}: ${detail}` : `${base}.`;
}

export function createClient({ baseUrl, apiKey, fetchImpl = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  async function request(path, { method = 'GET', body } = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { Authorization: `Bearer ${apiKey}` };
    if (body !== undefined) headers['content-type'] = 'application/json';

    let response;
    try {
      response = await fetchImpl(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw new KanSyncError(`No se pudo conectar con ${url}: ${error.message}`, 'NETWORK');
    }

    if (!response.ok) {
      let detail = '';
      try {
        const payload = await response.json();
        if (typeof payload?.message === 'string') detail = payload.message;
      } catch {
        detail = '';
      }
      throw new KanSyncError(describeHttpError(response.status, detail), `HTTP_${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  return { request };
}

function requireApiKey(env) {
  const apiKey = env.kan_API_KEY?.trim();
  if (!apiKey) {
    throw new KanSyncError(
      'Falta kan_API_KEY. Añádela a .env (kan_API_KEY=kan_...) o expórtala en el entorno.',
      'MISSING_API_KEY'
    );
  }
  return apiKey;
}

function pickCard(board, { changeId, cardPublicId }) {
  const cards = flattenCards(board);
  if (cardPublicId) {
    const card = cards.find((candidate) => candidate.publicId === cardPublicId);
    if (!card) {
      throw new KanSyncError(`No hay ninguna tarjeta con publicId "${cardPublicId}" en el tablero.`, 'CARD_NOT_FOUND');
    }
    return card;
  }

  const matches = matchCards(cards, changeId);
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    const candidates = matches
      .map((card) => `  - "${card.title}" en "${card.listName}" (${card.publicId})`)
      .join('\n');
    throw new KanSyncError(
      `Hay ${matches.length} tarjetas que coinciden con "${changeId}":\n${candidates}\nUsa --card <publicId> para elegir una.`,
      'CARD_AMBIGUOUS'
    );
  }
  return matches[0];
}

async function resolveTargetMember({ board, env, client }) {
  const members = board.workspace?.members ?? [];
  const configured = resolveAssignee(members, env.kan_CURRENT_USER);
  if (configured) return configured;

  const me = await client.request('/users/me');
  return resolveAssignee(members, me.email);
}

export async function startChange({
  changeId,
  config,
  env,
  fetchImpl,
  dryRun = false,
  cardPublicId,
  title,
  log = () => {},
}) {
  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });

  const board = await client.request(`/boards/${config.boardPublicId}`);
  const todoList = resolveList(board.lists, config.lists.todo);
  const inProgressList = resolveList(board.lists, config.lists.inProgress);
  const assignee = await resolveTargetMember({ board, env, client });
  const card = pickCard(board, { changeId, cardPublicId });
  const prefix = dryRun ? '[dry-run] ' : '';

  if (!card) {
    const payload = buildCreateCard({
      changeId,
      title,
      listPublicId: todoList.publicId,
      memberPublicId: assignee.publicId,
    });
    if (dryRun) {
      log(
        `${prefix}crear tarjeta "${payload.title}" en "${todoList.name}", asignarla a ${memberName(assignee)} y moverla a "${inProgressList.name}".`
      );
      return { dryRun: true, created: true, assigned: true, moved: true };
    }
    const created = await client.request('/cards', { method: 'POST', body: payload });
    await client.request(`/cards/${created.publicId}`, {
      method: 'PUT',
      body: buildMoveCard(inProgressList.publicId),
    });
    log(
      `Tarjeta ${created.publicId} creada en "${todoList.name}", asignada a ${memberName(assignee)} y movida a "${inProgressList.name}".`
    );
    return { dryRun: false, created: true, assignedNow: true, moved: true, cardPublicId: created.publicId };
  }

  const assigned = Boolean(card.members?.some((member) => member.publicId === assignee.publicId));
  if (!assigned) {
    if (dryRun) {
      log(`${prefix}asignar la tarjeta ${card.publicId} a ${memberName(assignee)}.`);
    } else {
      await client.request(`/cards/${card.publicId}/members/${assignee.publicId}`, { method: 'PUT' });
    }
  }

  const list = board.lists.find((candidate) => candidate.publicId === card.listPublicId);
  const alreadyInProgress = list?.publicId === inProgressList.publicId;
  if (!alreadyInProgress) {
    if (dryRun) {
      log(`${prefix}mover la tarjeta ${card.publicId} de "${card.listName}" a "${inProgressList.name}".`);
    } else {
      await client.request(`/cards/${card.publicId}`, {
        method: 'PUT',
        body: buildMoveCard(inProgressList.publicId),
      });
    }
  }

  if (!dryRun) {
    const assignedText = assigned ? 'ya estaba asignada' : `asignada a ${memberName(assignee)}`;
    const movedText = alreadyInProgress
      ? `ya estaba en "${inProgressList.name}"`
      : `movida a "${inProgressList.name}"`;
    log(`Tarjeta ${card.publicId} ${movedText} y ${assignedText}.`);
  } else if (alreadyInProgress && assigned) {
    log(`${prefix}la tarjeta ${card.publicId} ya está en "${inProgressList.name}" y asignada a ${memberName(assignee)}.`);
  }

  return {
    dryRun,
    created: false,
    assignedNow: !assigned,
    moved: !alreadyInProgress,
    cardPublicId: card.publicId,
  };
}

export async function doneChange({
  changeId,
  config,
  env,
  fetchImpl,
  dryRun = false,
  cardPublicId,
  log = () => {},
}) {
  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });

  const board = await client.request(`/boards/${config.boardPublicId}`);
  const doneList = resolveList(board.lists, config.lists.done);
  const card = pickCard(board, { changeId, cardPublicId });
  if (!card) {
    throw new KanSyncError(
      `No hay ninguna tarjeta para el change "${changeId}". No se ha creado ninguna; el archivado puede continuar.`,
      'CARD_NOT_FOUND'
    );
  }

  const prefix = dryRun ? '[dry-run] ' : '';
  if (card.listPublicId === doneList.publicId) {
    log(`${prefix}la tarjeta ${card.publicId} ya está en "${doneList.name}".`);
    return { dryRun, moved: false, cardPublicId: card.publicId };
  }

  if (dryRun) {
    log(`${prefix}mover la tarjeta ${card.publicId} de "${card.listName}" a "${doneList.name}".`);
    return { dryRun: true, moved: true, cardPublicId: card.publicId };
  }

  await client.request(`/cards/${card.publicId}`, {
    method: 'PUT',
    body: buildMoveCard(doneList.publicId),
  });
  log(`Tarjeta ${card.publicId} movida a "${doneList.name}".`);
  return { dryRun: false, moved: true, cardPublicId: card.publicId };
}

export async function discover({
  baseUrl,
  apiKey,
  boardPublicId,
  fetchImpl,
  timeoutMs,
  json = false,
  log = () => {},
}) {
  const client = createClient({ baseUrl, apiKey, fetchImpl, timeoutMs });

  const workspaces = await client.request('/workspaces');
  const summaries = [];
  for (const item of workspaces) {
    const boards = await client.request(`/workspaces/${item.workspace.publicId}/boards`);
    summaries.push({
      publicId: item.workspace.publicId,
      name: item.workspace.name,
      role: item.role,
      boards,
    });
  }

  const board = boardPublicId ? await client.request(`/boards/${boardPublicId}`) : null;

  if (json) {
    const payload = {
      workspaces: summaries.map((workspace) => ({
        publicId: workspace.publicId,
        name: workspace.name,
        role: workspace.role,
        boards: workspace.boards.map((item) => ({
          publicId: item.publicId,
          name: item.name,
          lists: item.lists.map((list) => ({ publicId: list.publicId, name: list.name })),
        })),
      })),
      board: board
        ? {
            publicId: board.publicId,
            name: board.name,
            lists: board.lists.map((list) => ({ publicId: list.publicId, name: list.name })),
            members: (board.workspace?.members ?? []).map((member) => ({
              publicId: member.publicId,
              email: member.email,
              name: member.user?.name ?? null,
              status: member.status,
            })),
          }
        : null,
    };
    log(JSON.stringify(payload, null, 2));
    return payload;
  }

  for (const workspace of summaries) {
    log(`Workspace ${workspace.name} (${workspace.publicId}) [${workspace.role}]`);
    for (const item of workspace.boards) {
      log(`  Tablero ${item.name} (${item.publicId})`);
      if (!boardPublicId) {
        for (const list of item.lists) log(`    Lista "${list.name}" (${list.publicId})`);
      }
    }
  }

  if (board) {
    log(`Tablero ${board.name} (${board.publicId})`);
    for (const list of board.lists) log(`  Lista "${list.name}" (${list.publicId})`);
    for (const member of board.workspace?.members ?? []) {
      log(`  Miembro ${memberName(member)} <${member.email}> (${member.publicId}) [${member.status}]`);
    }
  }

  return { workspaces: summaries, board };
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

export async function run(argv, { env = process.env, log = console.log, logError = console.error } = {}) {
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
        title: { type: 'string' },
        'dry-run': { type: 'boolean' },
        json: { type: 'boolean' },
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

  const envFile = values.env ? resolve(values.env) : DEFAULT_ENV_FILE;
  const configFile = values.config ? resolve(values.config) : DEFAULT_CONFIG_FILE;
  const mergedEnv = readEnv({ envFile, env });

  try {
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

    if (command !== 'start' && command !== 'done') {
      logError(`Error: comando desconocido "${command}".`);
      logError(USAGE);
      return 1;
    }

    if (!changeId) {
      logError(`Error: ${command} necesita el id del change.`);
      logError(USAGE);
      return 1;
    }

    const config = { ...readConfig({ configFile }), timeoutMs };
    const options = {
      changeId,
      config,
      env: mergedEnv,
      fetchImpl: globalThis.fetch,
      dryRun: Boolean(values['dry-run']),
      cardPublicId: values.card,
      log,
    };

    if (command === 'start') {
      await startChange({ ...options, title: values.title });
    } else {
      await doneChange(options);
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
