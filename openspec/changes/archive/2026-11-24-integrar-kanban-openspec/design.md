# Design

## Context

Ver `proposal.md` para la motivación. El repositorio ya exige Node ≥ 20.9, usa ESM (`"type": "module"`) y no tiene scripts de utilidades: todo se ejecuta con npm o con herramientas del propio ecosistema. La API de Kan.bn es REST v1 con autenticación Bearer, y el token actúa con los permisos del usuario que lo creó.

El `.env` del checkout principal ya usa la convención `kan_`: `kan_API_KEY` para el secreto y `kan_CURRENT_USER` para el email de la persona que ejecuta el flujo. Está ignorado por git. Un worktree no hereda ficheros sin seguimiento, así que el script no puede asumir que `.env` está junto al repositorio.

## Goals / Non-Goals

**Goals:**

- Un único punto de entrada determinista para las dos transiciones (`start`, `done`) y la configuración (`discover`).
- Cero dependencias nuevas y compatible con el mínimo de Node del proyecto.
- Fallos legibles y accionables, sin filtrar el token ni bloquear el flujo de OpenSpec.
- Funciones puras separadas de la red para poder probarlas con Vitest.

**Non-Goals:**

- Sincronización bidireccional: los cambios hechos en Kan.bn no alteran el change de OpenSpec.
- Webhooks, MCP de Kan o demonios en segundo plano.
- Crear o reordenar listas del tablero, o gestionar etiquetas, miembros, checklists y comentarios.
- Sincronizar el estado `apply` o las tareas individuales del change.

## Decisions

### Un script ESM sin dependencias frente a curl o un MCP

Se implementa `scripts/kan-sync.mjs` con `node:util` y `fetch` global. Un MCP de Kan obligaría a configurar cada cliente y no queda versionado; un conjunto de llamadas `curl` en `AGENTS.md` no es testeable ni centraliza el manejo de errores. El script se puede invocar a mano y desde el agente, y sus funciones puras se importan en los tests.

### Configuración en `kan.config.json`, secreto en el entorno

El fichero versionado contiene `baseUrl`, `boardPublicId` y los nombres de lista:

```json
{
  "baseUrl": "https://kan.example.com/api/v1",
  "boardPublicId": "xxxxxxxxxxxx",
  "lists": { "todo": "To Do", "inProgress": "In Progress", "done": "Done" }
}
```

Se guardan nombres, no ids, para que recrear una lista no rompa la configuración; el script la resuelve contra `GET /boards/{id}`. El token se lee de `kan_API_KEY` y la identidad de `kan_CURRENT_USER` (email), ambos en `.env`; la configuración versionada no contiene secretos ni datos personales. El script carga `.env` de la raíz del repositorio con un lector mínimo (el mínimo soportado, Node 20.9, no tiene `process.loadEnvFile`) y da prioridad a las variables ya exportadas. Nunca escribe el token en logs, errores ni en `kan.config.json`.

### Resolución del tablero en una sola lectura

Cada ejecución hace `GET /boards/{boardPublicId}` (vista completa, que ya incluye listas y tarjetas), localiza la tarjeta y resuelve los ids de lista. Si falta la tarjeta de `start`, hace `POST /cards`; después, `PUT /cards/{cardPublicId}` con `{ "listPublicId", "index": 0 }` para moverla. Son una o tres peticiones por ejecución, muy por debajo del límite de 600/min, y evita depender de la búsqueda del workspace, que no devuelve el id de la lista.

### Coincidencia por token completo e insensible a mayúsculas

El id se busca con los límites `(?<![a-z0-9-])` y `(?![a-z0-9-])`, escapando el id, con la opción `i`. Así `integrar-kanban` no coincide con `integrar-kanban-openspec`, pero un título con mayúsculas sí. Con cero coincidencias, `start` crea la tarjeta y `done` avisa y termina con error. Con más de una, el script aborta sin tocar nada y enumera `título`, `lista` y `publicId`; para desbloquear el caso se admite `--card <publicId>`, que se salta la búsqueda.

### Asignación idempotente por miembro del workspace

`kan_CURRENT_USER` se resuelve contra `board.workspace.members` comparando el email sin distinguir mayúsculas. Si no se define, se obtiene la persona dueña del token con `GET /users/me` y se busca su email en esa misma lista. La tarjeta nueva se crea con `memberPublicIds: [<workspaceMemberPublicId>]`; en una tarjeta existente solo se llama a `PUT /cards/{cardPublicId}/members/{workspaceMemberPublicId}` cuando ese id no figura ya en `card.members`, porque el endpoint alterna (añade si falta y quita si está). Nunca se envían ids de usuario a la API de tarjetas: exige el id de miembro del workspace. `done` no modifica la asignación.

### Creación con los campos obligatorios de la API

`POST /cards` exige `title`, `description`, `listPublicId`, `labelPublicIds`, `memberPublicIds` y `position`. El script envía `labelPublicIds: []`, `memberPublicIds: []`, `position: "end"` y un título `[<change-id>]` ampliable con `--title "<texto>"`. La descripción enlaza la carpeta del change (`openspec/changes/<id>/`) para que la tarjeta sea rastreable.

### Salida y código de salida

Éxito: mensaje de una línea por stdout (`tarjeta <publicId> movida a In Progress`) y código 0. Fallo: mensaje en stderr y código 1, con distinción entre configuración incompleta, 401/403, lista inexistente, tarjeta ambigua y error de red. Un `--dry-run` resuelve todo y muestra la acción sin escribir. `discover` imprime workspaces y tableros (`GET /workspaces`) y, con `--board`, las listas del tablero.

### Pruebas con Vitest, no con `node:test`

Las funciones puras (`matchCards`, `resolveList`, `buildCreateCard`, `buildMoveCard`, `loadEnvText`) se exportan y se prueban en `scripts/kan-sync.test.mjs` con un `fetch` simulado. Se añade `scripts/**/*.test.mjs` al `include` de `vitest.config.ts` para no introducir un segundo runner. El test de integración real no se automatiza: depende del tablero y del token.

### Documentación y disparadores

`AGENTS.md` gana una sección «Kan.bn: tarjeta por change» con el momento exacto de cada llamada: `start` justo después de crear la rama y los artefactos del propose, `done` tras archivar y antes del commit. Indica que un fallo se reporta y no detiene el flujo. `docs/desarrollo/kanban.md` concentra el alta del token, `discover`, la configuración y la solución de problemas; `.env.example` documenta `kan_API_KEY=` y `kan_CURRENT_USER=`.

## Risks / Trade-offs

- **El worktree no tiene `.env`** → el script busca solo en su propia raíz; se documenta copiar `.env` al worktree activo y el error lo dice explícitamente.
- **El token actúa como el usuario y no admite scopes** → se guarda solo en `.env` ignorado, nunca en la config; se documenta revocarlo desde Settings → API si se filtra.
- **El título de la tarjeta puede cambiar** → `--card <publicId>` permite fijar la tarjeta y `done` no crea duplicados.
- **La persona asignada deja el workspace** → `kan_CURRENT_USER` deja de resolverse y el script falla antes de mover; se corrige actualizando el `.env`.
- **El endpoint de miembros alterna en vez de añadir** → se consulta `card.members` antes de llamar y nunca se envía un id que ya esté asignado.
- **Deriva si el agente omite la llamada** → `AGENTS.md` la marca como paso del flujo y `discover`/`start` son idempotentes, así que repetir es seguro.
- **URL base mal escrita** (self-hosted sin `/api/v1`) → `discover` falla con el código HTTP y la URL usada; la documentación muestra el sufijo correcto.
- **Dos personas mueven la misma tarjeta** → la API no ofrece control de versión; la escritura es la última en llegar y el script no intenta resolver conflictos.

## Migration Plan

No hay migración de datos ni cambios de runtime. El cambio es opt-in: si no existe `kan.config.json`, el script falla con un mensaje claro y el flujo de OpenSpec sigue igual. Para revertir basta con eliminar el script, la configuración y la sección de `AGENTS.md`; el tablero queda como esté.
