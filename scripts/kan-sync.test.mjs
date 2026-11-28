import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  addCardComment,
  buildCommentText,
  cleanupCommand,
  buildCreateCard,
  claimCommand,
  commentCommand,
  buildMoveCard,
  doneChange,
  queue,
  appendChangeMarker,
  removeChangeMarker,
  extractChangeId,
  linkNodeModules,
  loadEnvText,
  matchCards,
  parseConfig,
  readConfig,
  readEnv,
  resolveAssignee,
  resolveRunEnvFile,
  resolveList,
  reviewChange,
  run,
  startChange,
  validateClaimCards,
  whoamiCommand,
} from './kan-sync.mjs';

describe('loadEnvText', () => {
  it('lee pares clave=valor e ignora comentarios y líneas vacías', () => {
    const values = loadEnvText(`
# convención kan_
kan_API_KEY=kan_secreto
kan_CURRENT_USER="persona@example.com"

kan_EXTRA = 'valor con espacios'
`);
    expect(values).toEqual({
      kan_API_KEY: 'kan_secreto',
      kan_CURRENT_USER: 'persona@example.com',
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
        { publicId: 'm-aaron', email: 'persona@example.com', status: 'active', user: { name: 'Aaron' } },
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

const ENV = { kan_API_KEY: 'kan_prueba', kan_CURRENT_USER: 'persona@example.com' };

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
    expect(resolveAssignee(members, 'PERSONA@example.com').publicId).toBe('m-aaron');
  });

  it('ignora miembros no activos', () => {
    const paused = [
      { publicId: 'm-pausado', email: 'persona@example.com', status: 'paused', user: { name: null } },
    ];
    expect(() => resolveAssignee(paused, 'persona@example.com')).toThrow(/Miembros disponibles: \(ninguno\)/);
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
    ).rejects.toThrow(/nadie@example\.com.*persona@example\.com/s);
    expect(calls).toHaveLength(1);
  });

  it('falla antes de escribir si falta kan_CURRENT_USER', async () => {
    const board = emptyBoard();
    const { fetchImpl, calls } = makeFetch({
      'GET /boards/b12345678901': { body: board },
      'GET /users/me': { body: { id: 'u1', email: 'persona@example.com' } },
    });

    await expect(
      startChange({
        changeId: 'integrar-kanban-openspec',
        config: CONFIG,
        env: { kan_API_KEY: 'kan_prueba' },
        fetchImpl,
      })
    ).rejects.toThrow(/kan_CURRENT_USER/);
    expect(calls).toHaveLength(1);
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

describe('cola y marcadores', () => {
  it('devuelve la cola estructurada sin escribir', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card({ publicId: 'card-libre', title: 'Tarea libre', members: [] }));
    board.lists[1].cards.push(card({ publicId: 'card-claim', members: [{ publicId: 'm-aaron' }] }));
    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });
    let output = '';
    const payload = await queue({
      config: CONFIG,
      env: ENV,
      fetchImpl,
      json: true,
      log: (message) => {
        output += message;
      },
    });

    expect(payload.todo).toHaveLength(1);
    expect(payload.todo[0]).toMatchObject({
      publicId: 'card-libre',
      title: 'Tarea libre',
      list: 'To Do',
      changeId: null,
      branch: null,
      claimable: true,
    });
    expect(payload.claimed[0]).toMatchObject({
      publicId: 'card-claim',
      changeId: 'integrar-kanban-openspec',
      branch: 'integrar-kanban-openspec',
      claimable: false,
    });
    expect(JSON.parse(output).todo[0].publicId).toBe('card-libre');
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual(['GET /boards/b12345678901']);
  });

  it('añade y retira el marcador de forma idempotente', () => {
    const marked = appendChangeMarker('Descripción original', 'flujo-prueba');
    expect(marked).toContain('<!-- openspec-change: flujo-prueba -->');
    expect(marked).toContain('OpenSpec: `flujo-prueba`');
    expect(appendChangeMarker(marked, 'flujo-prueba')).toBe(marked);
    expect(() => appendChangeMarker(marked, 'otro-change')).toThrow(/ya está vinculada/);
    expect(removeChangeMarker(marked, 'flujo-prueba')).toBe('Descripción original');
    expect(extractChangeId({ title: 'Sin id', description: marked })).toBe('flujo-prueba');
    expect(extractChangeId({ title: '[flujo-prueba] Título', description: '' })).toBe('flujo-prueba');
    expect(matchCards([card({ title: 'Sin id', description: marked })], 'flujo-prueba')).toHaveLength(1);
  });
});

describe('preflight del claim', () => {
  const client = { request: async () => { throw new Error('no debería llamar a la API'); } };

  it('acepta una tarjeta libre de la cola', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card({ publicId: 'card-libre', title: 'Tarea libre', members: [] }));
    const result = await validateClaimCards({
      board,
      config: CONFIG,
      env: ENV,
      client,
      cardIds: ['card-libre'],
      changeId: 'flujo-prueba',
    });
    expect(result.cards.map((item) => item.publicId)).toEqual(['card-libre']);
  });

  it('rechaza una tarjeta asignada a otra persona', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card({ title: 'Tarea asignada', members: [board.workspace.members[1]] }));
    await expect(
      validateClaimCards({ board, config: CONFIG, env: ENV, client, cardIds: ['card-1'], changeId: 'x' })
    ).rejects.toThrow(/asignada a .*otro/i);
  });

  it('rechaza una tarjeta vinculada a otro change', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card({ description: '<!-- openspec-change: otro-change -->' }));
    await expect(
      validateClaimCards({ board, config: CONFIG, env: ENV, client, cardIds: ['card-1'], changeId: 'x' })
    ).rejects.toThrow(/otro-change/);
  });

  it('rechaza una tarjeta fuera de la cola y permite reanudar un claim', async () => {
    const board = emptyBoard();
    board.lists[1].cards.push(card({ title: 'Tarea en curso', members: [{ publicId: 'm-aaron' }] }));
    await expect(
      validateClaimCards({ board, config: CONFIG, env: ENV, client, cardIds: ['card-1'], changeId: 'x' })
    ).rejects.toThrow(/In Progress/);
    const resumed = await validateClaimCards({
      board,
      config: CONFIG,
      env: ENV,
      client,
      cardIds: ['card-1'],
      changeId: 'x',
      allowNonTodo: true,
    });
    expect(resumed.cards).toHaveLength(1);
  });
});

describe('done con grupo y PR', () => {
  it('mueve todas las tarjetas y registra la URL en cada descripción', async () => {
    const board = emptyBoard();
    board.lists[1].cards.push(
      card({ publicId: 'card-1', members: [{ publicId: 'm-aaron' }] }),
      card({ publicId: 'card-2', members: [{ publicId: 'm-aaron' }] })
    );
    const { fetchImpl, calls } = makeFetch({
      'GET /boards/b12345678901': { body: board },
      'PUT /cards/card-1': { body: {} },
      'PUT /cards/card-2': { body: {} },
    });

    const result = await doneChange({
      changeId: 'flujo-prueba',
      config: CONFIG,
      env: ENV,
      fetchImpl,
      cards: [{ publicId: 'card-1' }, { publicId: 'card-2' }],
      prUrl: 'https://github.com/AaronSR-54/akari/pull/9',
    });

    expect(result.moved).toBe(true);
    expect(result.cards).toHaveLength(2);
    const descriptionUpdates = calls.filter((call) => call.body?.description);
    expect(descriptionUpdates).toHaveLength(2);
    expect(descriptionUpdates[0].body.description).toContain('https://github.com/AaronSR-54/akari/pull/9');
    const moves = calls.filter((call) => call.body?.listPublicId === 'lista-done');
    expect(moves).toHaveLength(2);
  });
});

describe('review', () => {
  it('mueve todas las tarjetas del manifiesto a REVIEW', async () => {
    const board = emptyBoard();
    board.lists.push({ publicId: 'lista-review', name: 'Review', cards: [] });
    board.lists[1].cards.push(card({ publicId: 'card-1', members: [{ publicId: 'm-aaron' }] }));
    const config = { ...CONFIG, lists: { ...CONFIG.lists, review: 'Review' } };
    const { fetchImpl, calls } = makeFetch({
      'GET /boards/b12345678901': { body: board },
      'PUT /cards/card-1': { body: {} },
    });

    const result = await reviewChange({
      changeId: 'flujo-prueba',
      config,
      env: ENV,
      fetchImpl,
      cards: [{ publicId: 'card-1' }],
    });

    expect(result.moved).toBe(true);
    expect(calls.at(-1).body).toEqual({ listPublicId: 'lista-review', index: 0 });
  });

  it('falla si no hay lista de revisión configurada', async () => {
    await expect(
      reviewChange({ changeId: 'x', config: CONFIG, env: ENV, fetchImpl: async () => ({}) })
    ).rejects.toThrow(/lista de revisión/);
  });
});

describe('claim sin cola', () => {
  it('aborta antes de tocar Git si Kan no responde', async () => {
    const fetchImpl = async () => {
      throw new Error('offline');
    };
    const runGit = () => {
      throw new Error('git no debería ejecutarse');
    };
    await expect(
      claimCommand({
        cardIds: ['card-1'],
        changeId: 'x',
        config: CONFIG,
        env: ENV,
        fetchImpl,
        dryRun: false,
        log: () => {},
        cwd: process.cwd(),
        runGit,
      })
    ).rejects.toThrow(/No se pudo conectar/);
  });
});

describe('identidad y comentarios en Kan', () => {
  it('firma los comentarios con el email configurado', () => {
    expect(buildCommentText('persona@example.com', ' Listo para revisar ')).toBe(
      '[persona@example.com] Listo para revisar'
    );
    expect(() => buildCommentText('persona@example.com', '  ')).toThrow(/vacío/);
    expect(() => buildCommentText('', 'texto')).toThrow(/identidad/);
  });

  it('whoami imprime la identidad sin mostrar el token', async () => {
    const board = emptyBoard();
    const logs = [];
    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });
    const member = await whoamiCommand({
      config: CONFIG,
      env: ENV,
      fetchImpl,
      log: (line) => logs.push(line),
    });
    expect(member.publicId).toBe('m-aaron');
    expect(logs.join('\n')).toContain('persona@example.com');
    expect(logs.join('\n')).not.toContain(ENV.kan_API_KEY);
    expect(calls).toHaveLength(1);
  });

  it('comment publica el texto firmado en la tarjeta del change', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card());
    const { fetchImpl, calls } = makeFetch({
      'GET /boards/b12345678901': { body: board },
      'POST /cards/card-1/comments': { status: 201, body: { publicId: 'comment-1' } },
    });
    const result = await commentCommand({
      changeId: 'integrar-kanban-openspec',
      text: 'Listo para revisar',
      config: CONFIG,
      env: ENV,
      fetchImpl,
      dryRun: false,
      log: () => {},
    });
    expect(result.comment).toBe('[persona@example.com] Listo para revisar');
    expect(calls[1]).toMatchObject({
      method: 'POST',
      path: '/cards/card-1/comments',
      body: { comment: '[persona@example.com] Listo para revisar' },
    });
  });

  it('comment falla si no hay tarjeta para el change', async () => {
    const board = emptyBoard();
    const { fetchImpl } = makeFetch({ 'GET /boards/b12345678901': { body: board } });
    await expect(
      commentCommand({
        changeId: 'change-inexistente',
        text: 'Hola',
        config: CONFIG,
        env: ENV,
        fetchImpl,
        dryRun: false,
        log: () => {},
      })
    ).rejects.toThrow(/No hay ninguna tarjeta/);
  });

  it('comment en dry-run no escribe', async () => {
    const board = emptyBoard();
    board.lists[0].cards.push(card());
    const { fetchImpl, calls } = makeFetch({ 'GET /boards/b12345678901': { body: board } });
    await commentCommand({
      changeId: 'integrar-kanban-openspec',
      text: 'Hola',
      config: CONFIG,
      env: ENV,
      fetchImpl,
      dryRun: true,
      log: () => {},
    });
    expect(calls).toHaveLength(1);
  });

  it('addCardComment usa el endpoint de comentarios', async () => {
    const { fetchImpl, calls } = makeFetch({
      'POST /cards/card-1/comments': { status: 201, body: { publicId: 'comment-1' } },
    });
    const client = {
      request: (path, init = {}) =>
        fetchImpl(`https://kan.example.com/api/v1${path}`, {
          ...init,
          body: init.body ? JSON.stringify(init.body) : undefined,
        }),
    };
    await addCardComment({ client, card: { publicId: 'card-1' }, text: 'texto' });
    expect(calls[0].path).toBe('/cards/card-1/comments');
  });
});

const cleanupTemps = [];
afterEach(() => {
  for (const dir of cleanupTemps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function writeCleanupManifest(root, changeId) {
  const changeDir = join(root, 'openspec', 'changes', changeId);
  mkdirSync(changeDir, { recursive: true });
  writeFileSync(
    join(changeDir, 'workflow.json'),
    JSON.stringify({
      changeId,
      branch: changeId,
      cards: [{ publicId: 'card-1', title: 'Tarjeta' }],
      prUrl: 'https://github.com/org/repo/pull/42',
    })
  );
}

function cleanupFixture({ dirty = false, atMain = false } = {}) {
  const base = mkdtempSync(join(tmpdir(), 'akari-cleanup-'));
  cleanupTemps.push(base);
  const mainRoot = join(base, 'main');
  const worktree = join(base, 'worktree');
  const changeId = 'cleanup-change';
  mkdirSync(mainRoot, { recursive: true });
  writeCleanupManifest(worktree, changeId);
  if (atMain) writeCleanupManifest(mainRoot, changeId);

  const calls = [];
  const runGit = (args, { cwd } = {}) => {
    calls.push({ args, cwd });
    const [sub, ...rest] = args;
    if (sub === 'rev-parse' && args.includes('--show-toplevel')) {
      return { status: 0, stdout: `${cwd ?? worktree}\n`, stderr: '' };
    }
    if (sub === 'rev-parse' && args.includes('--git-common-dir')) {
      return { status: 0, stdout: join(mainRoot, '.git'), stderr: '' };
    }
    if (sub === 'status' && rest[0] === '--porcelain') {
      return { status: 0, stdout: dirty ? 'M  fichero.ts\n?? .opsx/\n' : '', stderr: '' };
    }
    if (sub === 'worktree' && rest[0] === 'remove') {
      rmSync(worktree, { recursive: true, force: true });
      return { status: 0, stdout: '', stderr: '' };
    }
    if (sub === 'branch' && (rest[0] === '-d' || rest[0] === '-D')) {
      return { status: 0, stdout: '', stderr: '' };
    }
    if (sub === 'branch' && rest[0] === '--list') {
      return { status: 0, stdout: '', stderr: '' };
    }
    return { status: 0, stdout: '', stderr: '' };
  };
  return { mainRoot, worktree, changeId, runGit, calls };
}

function ghMerged(calls = []) {
  return (args) => {
    calls.push(args);
    return {
      status: 0,
      stdout: JSON.stringify({
        number: 42,
        state: 'MERGED',
        mergedAt: '2026-11-25T18:00:25Z',
        headRefName: 'cleanup-change',
      }),
      stderr: '',
    };
  };
}

describe('cleanupCommand', () => {
  it('no borra nada si la PR sigue abierta', async () => {
    const fixture = cleanupFixture();
    const gh = () => ({
      status: 0,
      stdout: JSON.stringify({ number: 42, state: 'OPEN', mergedAt: null }),
      stderr: '',
    });
    await expect(
      cleanupCommand({ changeId: fixture.changeId, cwd: fixture.worktree, runGit: fixture.runGit, runGh: gh })
    ).rejects.toMatchObject({ code: 'PR_NOT_MERGED' });
    expect(existsSync(fixture.worktree)).toBe(true);
    expect(fixture.calls.some(({ args }) => args[0] === 'worktree' || args[0] === 'branch')).toBe(false);
  });

  it('falla sin borrar si gh no está disponible', async () => {
    const fixture = cleanupFixture();
    const gh = () => ({ status: null, stdout: '', stderr: '', error: new Error('ENOENT') });
    await expect(
      cleanupCommand({ changeId: fixture.changeId, cwd: fixture.worktree, runGit: fixture.runGit, runGh: gh })
    ).rejects.toMatchObject({ code: 'GH_UNAVAILABLE' });
    expect(existsSync(fixture.worktree)).toBe(true);
  });

  it('falla sin borrar si gh no puede consultar la PR', async () => {
    const fixture = cleanupFixture();
    const gh = () => ({ status: 1, stdout: '', stderr: 'auth required' });
    await expect(
      cleanupCommand({ changeId: fixture.changeId, cwd: fixture.worktree, runGit: fixture.runGit, runGh: gh })
    ).rejects.toMatchObject({ code: 'GH_PR_FAILED' });
    expect(existsSync(fixture.worktree)).toBe(true);
  });

  it('con --dry-run imprime la acción y no modifica Git', async () => {
    const fixture = cleanupFixture();
    const logs = [];
    const result = await cleanupCommand({
      changeId: fixture.changeId,
      cwd: fixture.worktree,
      runGit: fixture.runGit,
      runGh: ghMerged(),
      dryRun: true,
      log: (line) => logs.push(line),
    });
    expect(result).toMatchObject({ cleaned: true, dryRun: true, branch: fixture.changeId });
    expect(logs.join('\n')).toContain('dry-run');
    expect(existsSync(fixture.worktree)).toBe(true);
    expect(fixture.calls.some(({ args }) => args[0] === 'worktree')).toBe(false);
  });

  it('borra el worktree y la rama local tras el merge sin tocar etiquetas ni el remoto', async () => {
    const fixture = cleanupFixture();
    const logs = [];
    const result = await cleanupCommand({
      changeId: fixture.changeId,
      cwd: fixture.worktree,
      runGit: fixture.runGit,
      runGh: ghMerged(),
      log: (line) => logs.push(line),
    });
    expect(result).toMatchObject({ cleaned: true, dryRun: false, prUrl: 'https://github.com/org/repo/pull/42' });
    expect(existsSync(fixture.worktree)).toBe(false);
    expect(fixture.calls.filter(({ args }) => args[0] === 'branch' && (args[1] === '-d' || args[1] === '-D')).map(({ args }) => args[1])).toEqual(['-d']);
    expect(fixture.calls.some(({ args }) => args[0] === 'tag' || (args[0] === 'push' && args[1] === 'origin'))).toBe(false);
    expect(logs.join('\n')).toContain('Etiquetas y rama remota conservadas');
  });

  it('se niega con cambios sin commitear salvo con --force', async () => {
    const fixture = cleanupFixture({ dirty: true });
    await expect(
      cleanupCommand({ changeId: fixture.changeId, cwd: fixture.worktree, runGit: fixture.runGit, runGh: ghMerged() })
    ).rejects.toMatchObject({ code: 'WORKTREE_DIRTY' });
    expect(existsSync(fixture.worktree)).toBe(true);
  });

  it('no borra el checkout principal', async () => {
    const fixture = cleanupFixture({ atMain: true });
    await expect(
      cleanupCommand({ changeId: fixture.changeId, cwd: fixture.mainRoot, runGit: fixture.runGit, runGh: ghMerged() })
    ).rejects.toMatchObject({ code: 'MAIN_CHECKOUT_PROTECTED' });
    expect(existsSync(fixture.mainRoot)).toBe(true);
  });
});

describe('linkNodeModules', () => {
  const moduleTemps = [];
  afterEach(() => {
    for (const dir of moduleTemps.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  function fixture() {
    const base = realpathSync(mkdtempSync(join(tmpdir(), 'akari-modules-')));
    moduleTemps.push(base);
    const mainRoot = join(base, 'main');
    const worktree = join(base, 'worktree');
    mkdirSync(join(mainRoot, 'node_modules', 'react'), { recursive: true });
    writeFileSync(join(mainRoot, 'node_modules', 'package.json'), '{}');
    mkdirSync(join(mainRoot, 'node_modules', '@akari'), { recursive: true });
    symlinkSync('../../packages/domain', join(mainRoot, 'node_modules', '@akari', 'domain'), 'dir');
    for (const pkg of ['domain', 'data', 'tokens', 'ui']) {
      mkdirSync(join(worktree, 'packages', pkg), { recursive: true });
    }
    mkdirSync(join(worktree, 'apps', 'web'), { recursive: true });
    return { mainRoot, worktree };
  }

  it('crea un node_modules propio con externos del principal y @akari del worktree', () => {
    const { mainRoot, worktree } = fixture();
    linkNodeModules({ mainRoot, worktree });

    expect(lstatSync(join(worktree, 'node_modules')).isSymbolicLink()).toBe(false);
    expect(realpathSync(join(worktree, 'node_modules', 'react'))).toBe(
      join(mainRoot, 'node_modules', 'react')
    );
    expect(realpathSync(join(worktree, 'node_modules', 'package.json'))).toBe(
      join(mainRoot, 'node_modules', 'package.json')
    );
    for (const pkg of ['domain', 'data', 'tokens', 'ui']) {
      expect(realpathSync(join(worktree, 'node_modules', '@akari', pkg))).toBe(
        join(worktree, 'packages', pkg)
      );
    }
    expect(realpathSync(join(worktree, 'node_modules', '@akari', 'web'))).toBe(
      join(worktree, 'apps', 'web')
    );
  });

  it('sustituye un node_modules heredado que apuntaba al checkout principal', () => {
    const { mainRoot, worktree } = fixture();
    symlinkSync(join(mainRoot, 'node_modules'), join(worktree, 'node_modules'), 'dir');

    linkNodeModules({ mainRoot, worktree });

    expect(lstatSync(join(worktree, 'node_modules')).isSymbolicLink()).toBe(false);
    expect(realpathSync(join(worktree, 'node_modules', '@akari', 'domain'))).toBe(
      join(worktree, 'packages', 'domain')
    );
  });

  it('es idempotente sobre un worktree ya enlazado', () => {
    const { mainRoot, worktree } = fixture();
    linkNodeModules({ mainRoot, worktree });
    const scope = join(worktree, 'node_modules', '@akari');
    const before = readdirSync(scope).sort();
    const targets = before.map((name) => realpathSync(join(scope, name)));

    linkNodeModules({ mainRoot, worktree });

    expect(readdirSync(scope).sort()).toEqual(before);
    expect(before.map((name) => realpathSync(join(scope, name)))).toEqual(targets);
    expect(lstatSync(join(worktree, 'node_modules')).isSymbolicLink()).toBe(false);
  });
});

describe('entorno del checkout principal', () => {
  const envTemps = [];
  afterEach(() => {
    for (const dir of envTemps.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('resuelve --env relativo contra el checkout principal y no contra el worktree', () => {
    const base = realpathSync(mkdtempSync(join(tmpdir(), 'akari-envpath-')));
    envTemps.push(base);
    const mainRoot = join(base, 'main');
    const worktree = join(base, 'worktree');
    mkdirSync(join(mainRoot, 'config'), { recursive: true });
    mkdirSync(join(worktree, 'config'), { recursive: true });
    writeFileSync(join(mainRoot, 'config', 'dev.env'), 'kan_API_KEY=del-principal\n');
    writeFileSync(join(worktree, 'config', 'dev.env'), 'kan_API_KEY=del-worktree\n');
    const runGit = () => ({ status: 0, stdout: `${join(mainRoot, '.git')}\n`, stderr: '' });

    const envFile = resolveRunEnvFile({ envPath: 'config/dev.env', cwd: worktree, runGit });

    expect(envFile).toBe(join(mainRoot, 'config', 'dev.env'));
    expect(readEnv({ envFile, env: {} }).kan_API_KEY).toBe('del-principal');
  });

  it('run falla sin filtrar secretos si no puede resolver el checkout principal', async () => {
    const errors = [];
    const code = await run(['whoami'], {
      env: {},
      cwd: tmpdir(),
      log: () => {},
      logError: (line) => errors.push(line),
      runGit: () => {
        throw new Error('kan_API_KEY=secreto-filtrado');
      },
    });
    expect(code).toBe(1);
    expect(errors.join('\n')).toMatch(/directorio común de Git/);
    expect(errors.join('\n')).not.toContain('secreto-filtrado');
  });
});
