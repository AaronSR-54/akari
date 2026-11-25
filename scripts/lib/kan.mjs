import { KanSyncError } from './errors.mjs';
import { branchName } from './workflow.mjs';

export const DEFAULT_TIMEOUT_MS = 10_000;
const MARKER = /<!--\s*openspec-change:\s*([a-z0-9-]+)\s*-->/i;

export function changeMarker(changeId) {
  return `<!-- openspec-change: ${changeId} -->`;
}

export function changeLine(changeId) {
  return `OpenSpec: \`${changeId}\` · rama \`${branchName(changeId)}\``;
}

export function extractChangeId(card) {
  const marker = MARKER.exec(card?.description ?? '');
  if (marker) return marker[1];
  const titleMatch = /\[([a-z0-9]+(?:-[a-z0-9]+)*)\]/i.exec(card?.title ?? '');
  return titleMatch ? titleMatch[1].toLowerCase() : null;
}

export function appendChangeMarker(description, changeId) {
  const current = description ?? '';
  const existing = MARKER.exec(current);
  if (existing && existing[1] !== changeId) {
    throw new KanSyncError(
      `La tarjeta ya está vinculada al change "${existing[1]}"; no se puede añadir a "${changeId}".`,
      'CARD_ALREADY_LINKED'
    );
  }
  if (existing) return current;
  const suffix = `${changeMarker(changeId)}\n${changeLine(changeId)}`;
  return current.trim() ? `${current.trim()}\n\n${suffix}` : suffix;
}

export function removeChangeMarker(description, changeId) {
  const current = description ?? '';
  if (!MARKER.test(current)) return current;
  const escaped = changeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return current
    .replace(new RegExp(`\\n*<!--\\s*openspec-change:\\s*${escaped}\\s*-->\\s*`, 'gi'), '\n')
    .replace(new RegExp(`\\n*OpenSpec:\\s*\`${escaped}\`[^\\n]*`, 'gi'), '\n')
    .replace(/\n*PR:\s*https?:\/\/[^\n]*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function appendPrUrl(description, prUrl) {
  const current = description ?? '';
  if (!prUrl || current.includes(prUrl)) return current;
  const line = `PR: ${prUrl}`;
  return current.trim() ? `${current.trim()}\n${line}` : line;
}

export function resolveList(boardLists, name) {
  const wanted = String(name ?? '').trim().toLowerCase();
  const matches = boardLists.filter((list) => list.name.trim().toLowerCase() === wanted);
  if (matches.length === 0) {
    const available = boardLists.map((list) => `"${list.name}"`).join(', ') || '(ninguna)';
    throw new KanSyncError(`No existe la lista "${name}". Listas disponibles: ${available}.`, 'LIST_NOT_FOUND');
  }
  if (matches.length > 1) {
    throw new KanSyncError(
      `La lista "${name}" aparece ${matches.length} veces en el tablero; renómbralas para que sea única.`,
      'LIST_AMBIGUOUS'
    );
  }
  return matches[0];
}

export function matchCards(cards, changeId) {
  const escaped = changeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?<![a-z0-9-])${escaped}(?![a-z0-9-])`, 'i');
  return cards.filter(
    (card) =>
      pattern.test(card.title ?? '') ||
      MARKER.exec(card.description ?? '')?.[1] === changeId
  );
}

export function flattenCards(board) {
  return board.lists.flatMap((list) =>
    list.cards.map((card) => ({
      ...card,
      listName: list.name,
      listPublicId: list.publicId,
    }))
  );
}

export function findCardByPublicId(board, publicId) {
  return flattenCards(board).find((card) => card.publicId === publicId) ?? null;
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

export function requireApiKey(env) {
  const apiKey = env.kan_API_KEY?.trim();
  if (!apiKey) {
    throw new KanSyncError(
      'Falta kan_API_KEY. Añádela a .env (kan_API_KEY=kan_...) o expórtala en el entorno.',
      'MISSING_API_KEY'
    );
  }
  return apiKey;
}

export function pickCard(board, { changeId, cardPublicId }) {
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

export async function resolveTargetMember({ board, env }) {
  const members = board.workspace?.members ?? [];
  const email = typeof env.kan_CURRENT_USER === 'string' ? env.kan_CURRENT_USER.trim() : '';
  if (!email) {
    throw new KanSyncError(
      'Falta kan_CURRENT_USER en el .env del checkout principal; define el email del miembro de Kan que ejecuta el flujo.',
      'KAN_IDENTITY_MISSING'
    );
  }
  return resolveAssignee(members, email);
}

export function buildCommentText(email, text) {
  const body = String(text ?? '').trim();
  if (!body) {
    throw new KanSyncError('El comentario no puede estar vacío.', 'COMMENT_INVALID');
  }
  const identity = String(email ?? '').trim();
  if (!identity) {
    throw new KanSyncError('Falta la identidad para firmar el comentario.', 'KAN_IDENTITY_MISSING');
  }
  return `[${identity}] ${body}`;
}

export async function addCardComment({ client, card, text }) {
  return client.request(`/cards/${card.publicId}/comments`, {
    method: 'POST',
    body: { comment: text },
  });
}

export function queuePayload(board, { config, assignee }) {
  const todoName = config.lists.todo;
  const claimedNames = new Set([config.lists.inProgress, config.lists.review].filter(Boolean));
  const todo = [];
  const claimed = [];

  for (const card of flattenCards(board)) {
    const changeId = extractChangeId(card);
    const members = (card.members ?? []).map((member) => ({
      publicId: member.publicId,
      name: memberName(member),
    }));
    const assignedToMe = assignee ? members.some((member) => member.publicId === assignee.publicId) : false;
    const item = {
      publicId: card.publicId,
      title: card.title,
      list: card.listName,
      members,
      changeId,
      branch: changeId ? branchName(changeId) : null,
      claimable: card.listName === todoName && !changeId && (members.length === 0 || assignedToMe),
    };
    if (card.listName === todoName) todo.push(item);
    else if (claimedNames.has(card.listName)) claimed.push(item);
  }

  return { todo, claimed };
}

export async function queue({ config, env, fetchImpl, json = false, log = () => {} }) {
  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });
  const board = await client.request(`/boards/${config.boardPublicId}`);
  const assignee = await resolveTargetMember({ board, env, client });
  const payload = queuePayload(board, { config, assignee });

  if (json) {
    log(JSON.stringify(payload, null, 2));
    return payload;
  }

  log('TO DO');
  if (payload.todo.length === 0) log('  (vacío)');
  for (const card of payload.todo) {
    const state = card.claimable ? 'libre' : card.members.length ? `asignada a ${card.members.map((m) => m.name).join(', ')}` : 'no reclamable';
    log(`  ${card.publicId}  ${card.title}  [${state}]`);
  }
  log('Reclamadas');
  if (payload.claimed.length === 0) log('  (vacío)');
  for (const card of payload.claimed) {
    const owner = card.members.map((member) => member.name).join(', ') || 'sin asignar';
    log(`  ${card.publicId}  ${card.title}  [${card.list}]  ${card.changeId ?? '(sin change)'}  ${owner}`);
  }
  return payload;
}

export async function setCardDescription({ client, card, description }) {
  if (description === (card.description ?? '')) return;
  await client.request(`/cards/${card.publicId}`, {
    method: 'PUT',
    body: { description },
  });
}

export async function assignCard({ client, card, assignee }) {
  const assigned = Boolean(card.members?.some((member) => member.publicId === assignee.publicId));
  if (!assigned) {
    await client.request(`/cards/${card.publicId}/members/${assignee.publicId}`, { method: 'PUT' });
  }
  return !assigned;
}

export async function removeCardMember({ client, card, member }) {
  const present = Boolean(card.members?.some((candidate) => candidate.publicId === member.publicId));
  if (present) {
    await client.request(`/cards/${card.publicId}/members/${member.publicId}`, { method: 'PUT' });
  }
  return present;
}

export async function moveCard({ client, card, list }) {
  if (card.listPublicId === list.publicId) return false;
  await client.request(`/cards/${card.publicId}`, {
    method: 'PUT',
    body: buildMoveCard(list.publicId),
  });
  return true;
}

export async function startChange({
  changeId,
  config,
  env,
  fetchImpl,
  dryRun = false,
  cardPublicId,
  title,
  cards,
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
  const prefix = dryRun ? '[dry-run] ' : '';

  if (Array.isArray(cards) && cards.length > 0) {
    const results = [];
    for (const manifestCard of cards) {
      const card = findCardByPublicId(board, manifestCard.publicId);
      if (!card) {
        log(`${prefix}no se encontró la tarjeta ${manifestCard.publicId}; se omite.`);
        results.push({ publicId: manifestCard.publicId, found: false });
        continue;
      }
      if (dryRun) {
        log(`${prefix}sincronizar la tarjeta ${card.publicId} hacia "${inProgressList.name}".`);
        results.push({ publicId: card.publicId, found: true, dryRun: true });
        continue;
      }
      const assignedNow = await assignCard({ client, card, assignee });
      const moved = await moveCard({ client, card, list: inProgressList });
      results.push({ publicId: card.publicId, found: true, assignedNow, moved });
      log(`Tarjeta ${card.publicId} sincronizada: ${moved ? 'movida' : 'ya estaba'} y ${assignedNow ? 'asignada' : 'ya asignada'}.`);
    }
    return { dryRun, cards: results };
  }

  const card = pickCard(board, { changeId, cardPublicId });

  if (!card) {
    const payload = buildCreateCard({
      changeId,
      title,
      listPublicId: todoList.publicId,
      memberPublicId: assignee.publicId,
      description: appendChangeMarker(`Change de OpenSpec: \`openspec/changes/${changeId}/\`.`, changeId),
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

  const alreadyInProgress = card.listPublicId === inProgressList.publicId;
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

async function moveCardsTo({
  changeId,
  cards,
  config,
  env,
  fetchImpl,
  dryRun,
  cardPublicId,
  targetListName,
  prUrl,
  log,
}) {
  const client = createClient({
    baseUrl: config.baseUrl,
    apiKey: requireApiKey(env),
    fetchImpl,
    timeoutMs: config.timeoutMs,
  });
  const board = await client.request(`/boards/${config.boardPublicId}`);
  const targetList = resolveList(board.lists, targetListName);
  let selected;
  if (Array.isArray(cards) && cards.length > 0) {
    selected = [];
    for (const manifestCard of cards) {
      const card = findCardByPublicId(board, manifestCard.publicId);
      if (card) selected.push(card);
      else log(`Aviso: no se encontró la tarjeta ${manifestCard.publicId}; se omite.`);
    }
  } else {
    selected = [pickCard(board, { changeId, cardPublicId })].filter(Boolean);
  }

  if (selected.length === 0) {
    throw new KanSyncError(
      `No hay ninguna tarjeta para el change "${changeId}". No se ha creado ninguna; el archivado puede continuar.`,
      'CARD_NOT_FOUND'
    );
  }

  const prefix = dryRun ? '[dry-run] ' : '';
  const results = [];
  for (const card of selected) {
    const nextDescription = prUrl ? appendPrUrl(card.description, prUrl) : card.description;
    if (dryRun) {
      log(`${prefix}mover la tarjeta ${card.publicId} de "${card.listName}" a "${targetList.name}".`);
      results.push({ publicId: card.publicId, moved: card.listPublicId !== targetList.publicId, dryRun: true });
      continue;
    }
    if (nextDescription !== card.description) {
      await setCardDescription({ client, card, description: nextDescription });
    }
    const moved = await moveCard({ client, card, list: targetList });
    log(
      moved
        ? `Tarjeta ${card.publicId} movida a "${targetList.name}".`
        : `${prefix}la tarjeta ${card.publicId} ya está en "${targetList.name}".`
    );
    results.push({ publicId: card.publicId, moved });
  }
  return { dryRun, moved: results.some((item) => item.moved), cards: results };
}

export async function doneChange({
  changeId,
  config,
  env,
  fetchImpl,
  dryRun = false,
  cardPublicId,
  cards,
  prUrl,
  log = () => {},
}) {
  return moveCardsTo({
    changeId,
    cards,
    config,
    env,
    fetchImpl,
    dryRun,
    cardPublicId,
    targetListName: config.lists.done,
    prUrl,
    log,
  });
}

export async function reviewChange({
  changeId,
  config,
  env,
  fetchImpl,
  dryRun = false,
  cardPublicId,
  cards,
  log = () => {},
}) {
  if (!config.lists.review) {
    throw new KanSyncError(
      'No hay lista de revisión configurada. Añade "lists.review" a kan.config.json o crea la lista REVIEW. Consulta docs/desarrollo/kanban.md.',
      'REVIEW_LIST_MISSING'
    );
  }
  return moveCardsTo({
    changeId,
    cards,
    config,
    env,
    fetchImpl,
    dryRun,
    cardPublicId,
    targetListName: config.lists.review,
    log,
  });
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
