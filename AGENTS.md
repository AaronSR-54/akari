# AGENTS.md

Instrucciones para agentes que trabajen en este repositorio.

## FigCraft (MCP)

- **Espera siempre un código de sesión live antes de usar el MCP `figcraft`.** No abras, asumas ni reutilices una sesión por iniciativa propia.
- La sesión live va **vía online** (host remoto accesible por red/Tailscale), no en local.
- Si no has recibido el código, pide al usuario que te lo pase y detente. No llames a ninguna herramienta de `figcraft` (`inspect_ui`, `inspect_document`, `create_node`, `set_properties`, `screenshot`, etc.) hasta tenerlo.
- El código es de un solo uso por sesión: si la sesión cae o cambia el host, vuelve a pedir uno nuevo en lugar de reintentar con el anterior.
- Los detalles de la sesión vigente (host, archivo, enlace de invitación) se anotan en `docs/diseno/estado.md`, pero el agente no los usa como sustituto del código que le entregue el usuario.

## OpenSpec: cierre de changes

Archivar un change (`openspec archive`, skill `openspec-archive-change`) no termina hasta que sus cambios están commiteados en una rama y con una PR abierta a `main`.

1. **Rama.** Crea `feat/<change-id>` desde `main` actualizado (`git fetch origin`, `git switch main`, `git pull --ff-only`) y trabaja ahí. Si ya estás en la rama `feat/<change-id>` de ese change, reutilízala. Si la implementación aún no está commiteada, crea la rama **antes** de aplicar/archivar para que el código viaje en la misma PR.
2. **Alcance del commit.** Incluye solo lo del change: `openspec/changes/archive/<fecha>-<change-id>/`, los specs principales que el archivado sincronice en `openspec/specs/` y el código y pruebas derivados de sus tareas. No mezcles cambios ajenos: si el working tree tiene trabajo no relacionado, déjalo fuera; si no puedes distinguir qué pertenece al change, párate y pregunta.
3. **Commit.** Conventional commits en español, p. ej. `feat(<change-id>): archivar el change y sincronizar specs`. No amendes commits ya publicados ni uses `--force`.
4. **Push.** `git push -u origin feat/<change-id>`.
5. **PR.** `gh pr create --base main --title "<tipo>(<change-id>): <resumen>"` con cuerpo en español: resumen del change, deltas de specs, tareas completadas y resultado de las verificaciones (lint/tests/build). Enlaza la carpeta archivada.
6. **Sin merge.** La PR queda abierta para revisión: no la mergees ni la cierres. Termina informando la URL de la PR y las verificaciones ejecutadas.

Guardas:

- Revisa `git status` antes de añadir: nunca subas `.env`, credenciales ni artefactos ignorados.
- Un change = una rama = una PR. No reutilices la rama de otro change.
- Si `gh` falla, deja la rama subida y reporta el error junto con el comando exacto para crear la PR a mano.
