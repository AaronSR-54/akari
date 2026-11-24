# Tasks

## 1. Base del script y configuración

- [x] 1.1 Crear `scripts/kan-sync.mjs` con el parser de argumentos (`start`, `done`, `discover`), la lectura de `kan.config.json` y la carga de `kan_API_KEY` y `kan_CURRENT_USER` con un lector mínimo de `.env`, más un cliente `fetch` con timeout y errores legibles; verificar con `node scripts/kan-sync.mjs --help` y con tests de `loadEnvText` y `readConfig`.
- [x] 1.2 Añadir `scripts/**/*.test.mjs` al `include` de `vitest.config.ts` y comprobar que `npm test` ejecuta los tests del script.
- [x] 1.3 Implementar `discover` (workspaces, tableros y, con `--board`, listas y miembros) con salida legible y `--json`; verificar contra la instancia real con `node scripts/kan-sync.mjs discover --board <boardPublicId>`.
- [x] 1.4 Crear `.env.example` con `kan_API_KEY=` y `kan_CURRENT_USER=` y `kan.config.json` con la URL base, el id del tablero y los nombres de lista reales obtenidos con `discover`; verificar que `discover --board <id>` muestra las tres listas y el miembro configurado, y que la configuración no contiene secretos.
- [x] 1.5 Documentar en `docs/desarrollo/kanban.md` el alta del token, `discover`, la configuración y la solución de problemas, y enlazarlo desde `README.md`; verificar que cada comando del documento funciona tal cual.

## 2. Identificación de la tarjeta y resolución de listas

- [x] 2.1 Implementar `matchCards` con coincidencia por token completo e insensible a mayúsculas y la opción `--card`; verificar con tests de coincidencia exacta, parcial (`integrar-kanban` frente a `integrar-kanban-openspec`), múltiple y sin coincidencia.
- [x] 2.2 Implementar `resolveList` por el nombre configurado; verificar con tests de lista presente, lista ausente con el listado de nombres disponibles y lista duplicada.
- [x] 2.3 Implementar `buildCreateCard` y `buildMoveCard`; verificar con tests que la creación incluye `labelPublicIds`, `memberPublicIds` y `position`, y que el movimiento envía `listPublicId` con `index: 0`.

## 3. Comandos `start` y `done` con asignación

- [x] 3.1 Implementar `resolveAssignee`: `kan_CURRENT_USER` contra `board.workspace.members` y, si falta, la dueña del token vía `GET /users/me`; verificar con tests de email con mayúsculas, persona que no es miembro y ausencia de `kan_CURRENT_USER`.
- [x] 3.2 Implementar `start`: crear en `todo` si la tarjeta no existe, asignar solo cuando la persona no está ya en `card.members` y mover a `inProgress`; verificar con tests con `fetch` simulado para los escenarios de la spec (existente, ausente, repetida, persona no encontrada).
- [x] 3.3 Implementar `done`: mover a `done`, no crear tarjetas y conservar título, descripción y asignación; verificar con tests de tarjeta presente y ausente.
- [x] 3.4 Verificar el modo `--dry-run` y la idempotencia ejecutando `start` dos veces contra el tablero real y comprobando que queda una sola tarjeta en In Progress, asignada a la persona esperada.

## 4. Integración en el flujo OpenSpec

- [x] 4.1 Añadir a `AGENTS.md` la sección «Kan.bn: tarjeta por change» con `start` tras crear la rama y los artefactos, `done` tras archivar y antes del commit, el tratamiento no bloqueante de errores y la prohibición de commitear `.env`; verificar que cubre los escenarios de `openspec/specs/desarrollo/kanban/spec.md`.
- [x] 4.2 Ejecutar `start` con el id de un change real y comprobar en el tablero la tarjeta única, la lista In Progress y la asignación; ejecutar `done --dry-run` para revisar el movimiento final sin aplicarlo.
- [x] 4.3 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` y registrar el resultado; no se añade E2E porque el cambio no toca la interfaz.

## Workflow follow-up

- Ejecutar `node scripts/kan-sync.mjs done integrar-kanban-openspec` al archivar el change y comprobar la tarjeta en Done.
- Si falta el token o la configuración en el worktree activo, copiar `.env` desde el checkout principal antes de sincronizar.
