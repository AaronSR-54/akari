import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCreateCard,
  buildMoveCard,
  doneChange,
  loadEnvText,
  matchCards,
  parseConfig,
  readConfig,
  readEnv,
  resolveAssignee,
  resolveList,
  startChange,
} from './kan-sync.mjs';

describe('loadEnvText', () => {
  it('lee pares clave=valor e ignora comentarios y líneas vacías', () => {
    const values = loadEnvText(`
# convención kan_
kan_API_KEY=kan_secreto
kan_CURRENT_USER="aaron@example.com"

kan_EXTRA = 'valor con espacios'
`);
    expect(values).toEqual({
      kan_API_KEY: 'kan_secreto',
      kan_CURRENT_USER: 'aaron@example.com',
      kan_EXTRA: 'valor con espacios',
    });
  });

  it('conserva los signos igual que aparecen en el valor', () => {
    expect(loadEnvText('kan_BASE_URL=https://kan.example.com/api/v1?x=1')).toEqual({
      kan_BASE_URL: 'https://kan.example.com/api/v1?x=1',
    });
  });
});

describe('readEnv', () => {
  it('da prioridad a las variables ya exportadas sobre el fichero', () => {
    const values = readEnv({
      envFile: '/ruta/que-no-existe/.env',
      env: { kan_API_KEY: 'desde-entorno' },
    });
    expect(values.kan_API_KEY).toBe('desde-entorno');
  });
});

describe('parseConfig', () => {
  const config = {
    baseUrl: 'https://kan.example.com/api/v1/',
    boardPublicId: 'b12345678901',
    lists: { todo: 'To Do', inProgress: 'In Progress', done: 'Done' },
  };

  it('normaliza la URL base y las listas', () => {
    expect(parseConfig(JSON.stringify(config), 'kan.config.json')).toEqual({
      baseUrl: 'https://kan.example.com/api/v1',
      boardPublicId: 'b12345678901',
      lists: { todo: 'To Do', inProgress: 'In Progress', done: 'Done' },
      source: 'kan.config.json',
    });
  });

  it('explica qué campo falta cuando la configuración está incompleta', () => {
    expect(() => parseConfig(JSON.stringify({ ...config, lists: { todo: 'To Do' } }))).toThrow(
      /lists\.inProgress/
    );
    expect(() => parseConfig(JSON.stringify({ ...config, boardPublicId: '' }))).toThrow(
      /boardPublicId/
    );
    expect(() => parseConfig('{ no es json', 'kan.config.json')).toThrow(/kan\.config\.json/);
  });

  it('rechaza una URL sin protocolo', () => {
    expect(() => parseConfig(JSON.stringify({ ...config, baseUrl: 'kan.example.com/api/v1' }))).toThrow(
      /http/
    );
  });
});

describe('readConfig', () => {
  it('lee la configuración de un fichero y falla con un mensaje claro si no existe', () => {
    const directory = mkdtempSync(join(tmpdir(), 'kan-sync-'));
    const configFile = join(directory, 'kan.config.json');
    writeFileSync(
      configFile,
      JSON.stringify({
        baseUrl: 'https://kan.example.com/api/v1',
        boardPublicId: 'b12345678901',
        lists: { todo: 'To Do', inProgress: 'In Progress', done: 'Done' },
      })
    );

    expect(readConfig({ configFile })).toMatchObject({ boardPublicId: 'b12345678901' });
    expect(() => readConfig({ configFile: join(directory, 'falta.json') })).toThrow(
      /No existe.*kan\.config\.json/s
    );
  });
});

const CONFIG = {
  baseUrl: 'https://kan.example.com/api/v1',
  boardPublicId: 'b12345678901',
  lists: { todo: 'To Do', inProgress: 'In Progress', done: 'Done' },
};

function emptyBoard() {
  return {
    publicId: 'b12345678901',
    name: 'Akari',
    workspace: {
      publicId: 'ws1234567890',
      members: [
        { publicId: 'm-aaron', email: 'aaron@example.com', status: 'active', user: { name: 'Aaron' } },
        { publicId: 'm-otro', email: 'otro@example.com', status: 'active', user: { name: 'Otro' } },
      ],
    },
    lists: [
      { publicId: 'lista-todo', name: 'To Do', cards: [] },
      { publicId: 'lista-progress', name: 'In Progress', cards: [] },
      { publicId: 'lista-done', name: 'Done', cards: [] },
    ],
  };
}

function card(overrides = {}) {
  return {
    publicId: 'card-1',
    title: '[integrar-kanban-openspec] Integrar Kan.bn',
    description: 'Change de OpenSpec',
    members: [],
    ...overrides,
  };
}

function makeFetch(routes) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const method = init.method ?? 'GET';
    const path = new URL(url).pathname.replace(/^\/api\/v1/, '');
    calls.push({ method, path, body: init.body ? JSON.parse(init.body) : undefined });
    const handler = routes[`${method} ${path}`];
    if (!handler) throw new Error(`Petición inesperada: ${method} ${path}`);
    const response = typeof handler === 'function' ? handler() : handler;
    const status = response.status ?? 200;
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => response.body,
    };
  };
  return { fetchImpl, calls };
}

const ENV = { kan_API_KEY: 'kan_prueba', kan_CURRENT_USER: 'aaron@example.com' };

describe('resolveList', () => {
  const lists = [
    { publicId: 'a', name: 'To Do' },
    { publicId: 'b', name: 'In Progress' },
    { publicId: 'c', name: 'Done' },
  ];

  it('resuelve el nombre sin distinguir mayúsculas', () => {
    expect(resolveList(lists, 'in progress').publicId).toBe('b');
  });

  it('enumera las listas disponibles cuando falta la configurada', () => {
    expect(() => resolveList(lists, 'Review')).toThrow(/"Review".*"To Do", "In Progress", "Done"/);
  });

  it('falla si el nombre está duplicado', () => {
    expect(() => resolveList([...lists, { publicId: 'd', name: 'Done' }], 'Done')).toThrow(/2 veces/);
  });
});

describe('matchCards', () => {
  it('encuentra el id como token completo', () => {
    const found = matchCards(
      [
        card({ publicId: 'a' }),
        card({ publicId: 'b', title: 'Otra cosa [INTEGRAR-KANBAN-OPENSPEC]' }),
      ],
      'integrar-kanban-openspec'
    );
    expect(found.map((item) => item.publicId)).toEqual(['a', 'b']);
  });

  it('no confunde ids parciales', () => {
    expect(matchCards([card({ title: '[integrar-kanban] Kanban' })], 'integrar-kanban-openspec')).toEqual([]);
    expect(matchCards([card({ title: '[integrar-kanban-openspec-extra]' })], 'integrar-kanban-openspec')).toEqual([]);
  });
});

describe('payloads', () => {
  it('construye la creación con los campos obligatorios de Kan', () => {
    expect(
      buildCreateCard({
        changeId: 'integrar-kanban-openspec',
        title: 'Integrar Kan.bn',
        listPublicId: 'lista-todo',
        memberPublicId: 'm-aaron',
      })
    ).toEqual({
      title: '[integrar-kanban-openspec] Integrar Kan.bn',
      description: 'Change de OpenSpec: `openspec/changes/integrar-kanban-openspec/`.',
      listPublicId: 'lista-todo',
      labelPublicIds: [],
      memberPublicIds: ['m-aaron'],
      position: 'end',
    });
  });

  it('omite el miembro cuando no hay asignado', () => {
    expect(buildCreateCard({ changeId: 'x', listPublicId: 'l' }).memberPublicIds).toEqual([]);
  });

  it('mueve al principio de la lista de destino', () => {
    expect(buildMoveCard('lista-done')).toEqual({ listPublicId: 'lista-done', index: 0 });
  });
});

describe('resolveAssignee', () => {
  const members = emptyBoard().workspace.members;

  it('compara el email sin distinguir mayúsculas', () => {
    expect(resolveAssignee(members, 'AARON@example.com').publicId).toBe('m-aaron');
  });

  it('ignora miembros no activos', () => {
    const paused = [
      { publicId: 'm-pausado', email: 'aaron@example.com', status: 'paused', user: { name: null } },
    ];
    expect(() => resolveAssignee(paused, 'aaron@example.com')).toThrow(/Miembros disponibles: \(ninguno\)/);
  });

  it('no falla si no hay persona configurada', () => {
    expect(resolveAssignee(members, undefined)).toBeNull();
  });
});

describe('startChange', () => {
  it('crea la tarjeta en To Do, la asigna y la mueve a In Progress', async () => {
    const board = emptyBoard();
    const { fetchImpl, calls } = makeFetch({
      'GET /boards/b12345678901': { body: board },
      'POST /cards': { status: 201, body: { publicId: 'card-nueva' } },
      'PUT /cards/card-nueva': { body: { publicId: 'card-nueva' } },
    });

    const result = await startChange({
      changeId: 'integrar-kanban-openspec',
      config: CONFIG,
      env: ENV,
      fetchImpl,
    });

    expect(result).toMatchObject({ created: true, assignedNow: true, moved: true, cardPublicId: 'card-nueva' });
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([
      'GET /boards/b12345678901',
      'POST /cards',
      'PUT /cards/card-nueva',
    ]);
    expect(calls[1].body).toMatchObject({
      title: '[integrar-kanban-openspec]',
      listPublicId: 'lista-todo',
      memberPublicIds: ['m-aaron'],
      position: 'end',
    });
    expect(calls[2].body).toEqual({ listPublicId: 'lista-progress', index: 0 });
  });

  it('asigna y mueve una tarjeta existente', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card());

    const { fetchImpl, calls } = makeFetch({
      'GET /boards/b12345678901': { body: board },
      'PUT /cards/card-1/members/m-aaron': { body: { newMember: true } },
      'PUT /cards/card-1': { body: { publicId: 'card-1' } },
    });

    const result = await startChange({
      changeId: 'integrar-kanban-openspec',
      config: CONFIG,
      env: ENV,
      fetchImpl,
    });

    expect(result).toMatchObject({ created: false, assignedNow: true, moved: true });
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([
      'GET /boards/b12345678901',
      'PUT /cards/card-1/members/m-aaron',
      'PUT /cards/card-1',
    ]);
  });

  it('no escribe si la tarjeta ya está en In Progress y asignada', async () => {
    const board = emptyBoard();
    board.lists[1].cards.push(card({ members: [{ publicId: 'm-aaron' }] }));

    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });
    const result = await startChange({
      changeId: 'integrar-kanban-openspec',
      config: CONFIG,
      env: ENV,
      fetchImpl,
    });

    expect(result).toMatchObject({ assignedNow: false, moved: false });
    expect(calls).toHaveLength(1);
  });

  it('aborta sin escribir cuando hay varias tarjetas candidatas', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card({ publicId: 'card-1' }));
    board.lists[1].cards.push(card({ publicId: 'card-2', members: [{ publicId: 'm-aaron' }] }));

    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });
    await expect(
      startChange({ changeId: 'integrar-kanban-openspec', config: CONFIG, env: ENV, fetchImpl })
    ).rejects.toThrow(/2 tarjetas.*card-1.*card-2/s);
    expect(calls).toHaveLength(1);
  });

  it('falla antes de escribir si la persona no es miembro', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card());

    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });
    await expect(
      startChange({
        changeId: 'integrar-kanban-openspec',
        config: CONFIG,
        env: { ...ENV, kan_CURRENT_USER: 'nadie@example.com' },
        fetchImpl,
      })
    ).rejects.toThrow(/nadie@example\.com.*aaron@example\.com/s);
    expect(calls).toHaveLength(1);
  });

  it('usa la dueña del token cuando falta kan_CURRENT_USER', async () => {
    const board = emptyBoard();
    const { fetchImpl, calls } = makeFetch({
      'GET /boards/b12345678901': { body: board },
      'GET /users/me': { body: { id: 'u1', email: 'aaron@example.com' } },
      'POST /cards': { status: 201, body: { publicId: 'card-nueva' } },
      'PUT /cards/card-nueva': { body: {} },
    });

    await startChange({
      changeId: 'integrar-kanban-openspec',
      config: CONFIG,
      env: { kan_API_KEY: 'kan_prueba' },
      fetchImpl,
    });

    expect(calls[1]).toMatchObject({ method: 'GET', path: '/users/me' });
    expect(calls[2].body.memberPublicIds).toEqual(['m-aaron']);
  });

  it('no escribe nada con --dry-run', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card());
    const messages = [];
    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });

    const result = await startChange({
      changeId: 'integrar-kanban-openspec',
      config: CONFIG,
      env: ENV,
      fetchImpl,
      dryRun: true,
      log: (message) => messages.push(message),
    });

    expect(result).toMatchObject({ dryRun: true, assignedNow: true, moved: true });
    expect(calls).toHaveLength(1);
    expect(messages.join('\n')).toMatch(/\[dry-run\].*asignar.*mover/s);
  });
});

describe('doneChange', () => {
  it('mueve la tarjeta a Done sin tocar la asignación', async () => {
    const board = emptyBoard();
    board.lists[1].cards.push(card({ members: [{ publicId: 'm-aaron' }] }));

    const { fetchImpl, calls } = makeFetch({
      'GET /boards/b12345678901': { body: board },
      'PUT /cards/card-1': { body: { publicId: 'card-1' } },
    });

    const result = await doneChange({
      changeId: 'integrar-kanban-openspec',
      config: CONFIG,
      env: ENV,
      fetchImpl,
    });

    expect(result.moved).toBe(true);
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([
      'GET /boards/b12345678901',
      'PUT /cards/card-1',
    ]);
    expect(calls[1].body).toEqual({ listPublicId: 'lista-done', index: 0 });
    expect(calls.some((call) => call.path === '/users/me')).toBe(false);
  });

  it('no crea tarjetas cuando no encuentra la del change', async () => {
    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: emptyBoard() } });
    await expect(
      doneChange({ changeId: 'integrar-kanban-openspec', config: CONFIG, env: ENV, fetchImpl })
    ).rejects.toThrow(/No hay ninguna tarjeta.*archivado puede continuar/s);
    expect(calls).toHaveLength(1);
  });

  it('no vuelve a mover una tarjeta que ya está en Done', async () => {
    const board = emptyBoard();
    board.lists[2].cards.push(card());
    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });

    const result = await doneChange({
      changeId: 'integrar-kanban-openspec',
      config: CONFIG,
      env: ENV,
      fetchImpl,
    });

    expect(result.moved).toBe(false);
    expect(calls).toHaveLength(1);
  });

  it('no escribe con --dry-run', async () => {
    const board = emptyBoard();
    board.lists[1].cards.push(card());
    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });

    const result = await doneChange({
      changeId: 'integrar-kanban-openspec',
      config: CONFIG,
      env: ENV,
      fetchImpl,
      dryRun: true,
    });

    expect(result).toMatchObject({ dryRun: true, moved: true });
    expect(calls).toHaveLength(1);
  });
});
