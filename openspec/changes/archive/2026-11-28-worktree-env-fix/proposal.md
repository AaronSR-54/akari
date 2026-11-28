# Proposal

## Why

El flujo de worktrees no está realmente aislado: `node_modules` se enlaza completo al checkout principal, así que `@akari/*` se resuelve contra el código de `main` aunque la sesión trabaje en otro worktree. La lectura del `.env` depende de una resolución que puede caer silenciosamente en el worktree, y la prueba de publicación atómica del claim agota el timeout implícito de 5 s de Vitest cuando la máquina está cargada. Las tres tarjetas reclamadas describen síntomas de una misma causa: el entorno del worktree no se construye ni se valida de forma explícita.

## What Changes

- Sustituir el symlink de todo `node_modules` por un `node_modules` propio del worktree en el que `@akari/*` apunte a los paquetes (`packages/*`, `apps/web`) del propio worktree; el resto de dependencias seguirá enlazándose al checkout principal.
- Garantizar que la resolución de `@akari/*` en TypeScript, Next, Vitest y E2E apunte al código del worktree, sin depender de alias divergentes entre herramientas.
- Hacer que `kan-sync` falle con un mensaje accionable cuando no pueda resolver el directorio común de Git, en vez de reintentar en silencio con el `.env` del worktree; las rutas relativas de `--env` se resolverán contra el checkout principal.
- Añadir una prueba de integración que verifique desde un worktree real que la configuración se lee del checkout principal y que `@akari/*` resuelve dentro del worktree.
- Dar a la prueba de publicación atómica del claim un presupuesto explícito y límites por subprocesso, de modo que una CPU o E/S cargadas no la hagan fallar por el timeout global de 5 s.
- Actualizar la documentación del flujo colaborativo para reflejar el nuevo enlazado de dependencias. No se modifica la semántica de Kan ni del claim.

## Capabilities

### New Capabilities

Ninguna. El arreglo refuerza capacidades de desarrollo ya existentes.

### Modified Capabilities

- `desarrollo/flujo-colaborativo`: nuevo requisito de resolución de paquetes `@akari/*` dentro del worktree para desarrollo, build, tipos y E2E; el requisito de CI pasa a exigir presupuestos explícitos en pruebas de integración con muchos subprocessos.
- `desarrollo/kanban`: el requisito de configuración sin secretos pasa a exigir fallo explícito —sin fallback silencioso— cuando no se puede resolver el directorio común de Git.

## Impact

- `scripts/kan-sync.mjs` (`linkNodeModules`, `run`/`readEnv`) y `scripts/lib/config.mjs`.
- `scripts/workflow.test.mjs`, `scripts/lib/workflow.mjs`, `scripts/config.test.mjs` y `scripts/kan-sync.test.mjs`.
- Sin cambios previstos en `next.config.mjs`, `tsconfig*.json` ni `vitest.config.ts`: la resolución se corrige en el origen (`node_modules`).
- `docs/desarrollo/flujo-colaborativo.md` y los deltas de `openspec/specs/desarrollo/`.
- Ficheros compartidos detectados por `check`: `package.json`, `vitest.config.ts`, configuración y documentación de flujo. Se coordinan en una sola PR y se mergean en serie; no se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
