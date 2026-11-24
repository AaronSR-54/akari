# Proposal

## Why

El ciclo de vida de un change (propose → apply → archive) vive en el repositorio, pero su seguimiento visual está en un tablero Kan.bn autoalojado. Hoy las tarjetas se mueven a mano en cada transición, así que el tablero se desincroniza del estado real del change y el trabajo en curso no se ve sin abrir la terminal.

## What Changes

- Nuevo comando `node scripts/kan-sync.mjs start <change-id>`: localiza la tarjeta del change en el tablero, la crea en la lista de entrada si no existe, la asigna a la persona del `.env` y la mueve a In Progress.
- Nuevo comando `node scripts/kan-sync.mjs done <change-id>`: mueve la tarjeta del change a Done al archivarlo, conservando su asignación.
- Nuevo comando `node scripts/kan-sync.mjs discover`: lista workspaces, tableros, listas y miembros para rellenar la configuración sin adivinar ids.
- Configuración versionada `kan.config.json` con URL base, id del tablero y nombres de las listas (`todo`, `inProgress`, `done`). El secreto y la identidad se leen del `.env` local con la convención ya existente: `kan_API_KEY` y `kan_CURRENT_USER`; nunca se commitean.
- `AGENTS.md` indica cuándo ejecutar cada comando (al crear el change y al archivarlo), cómo identificar la tarjeta y cómo continuar si la API falla o falta configuración.
- Documentación operativa en `docs/desarrollo/kanban.md`, plantilla `.env.example` y pruebas unitarias de las funciones puras (identificación de tarjeta, resolución de listas y construcción de peticiones).
- Sin dependencias nuevas y sin cambios en el runtime de la aplicación.

## Capabilities

### New Capabilities

- `desarrollo/kanban`: sincronización del estado de un change de OpenSpec con un tablero Kan.bn autoalojado, incluida la identificación de la tarjeta por id, la creación cuando falta, la asignación a una persona, el movimiento entre listas, la configuración sin secretos y el comportamiento ante fallos.

### Modified Capabilities

<!-- Ninguna: no cambia el comportamiento de la app ni de las specs existentes. -->

## Impact

- Documentación y configuración del repositorio: `AGENTS.md`, `README.md`, `docs/desarrollo/kanban.md`, `.env.example`, `kan.config.json`.
- Nuevos ficheros: `scripts/kan-sync.mjs` y `scripts/kan-sync.test.mjs`; `vitest.config.ts` amplía su patrón de tests para incluirlos.
- API externa consumida: Kan.bn REST v1 (`GET /boards/{boardPublicId}`, `POST /cards`, `PUT /cards/{cardPublicId}`, `PUT /cards/{cardPublicId}/members/{workspaceMemberPublicId}`, `GET /users/me`, `GET /workspaces`).
- No toca `packages/*` ni `apps/web`, no añade dependencias ni modifica el esquema de datos.

## Supuestos

- El título de la tarjeta contiene el id del change como token completo (por ejemplo `[integrar-kanban-openspec] Integrar Kan.bn`). Si hay más de una coincidencia, el script no mueve nada y muestra los candidatos.
- Si la tarjeta no existe, `start` la crea en la lista `todo`; `done` solo mueve tarjetas existentes.
- La asignación usa `kan_CURRENT_USER` del `.env`; si no se define, se asigna a la persona dueña del token. Asignar es idempotente: si la tarjeta ya tiene a esa persona, no se hace ninguna petición.
- Un fallo de red, credenciales o configuración se reporta con un mensaje claro y no bloquea el flujo de OpenSpec (el agente lo informa y continúa).
