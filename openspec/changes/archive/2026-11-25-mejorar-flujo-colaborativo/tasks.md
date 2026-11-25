# Tasks

## 1. Base del workflow y resolución de entorno

- [x] 1.1 Extraer las funciones puras actuales de `scripts/kan-sync.mjs` a `scripts/lib/config.mjs`, `scripts/lib/kan.mjs` y `scripts/lib/workflow.mjs`, manteniendo el CLI y las exportaciones existentes como reexportaciones; verificar que `npm test -- scripts/kan-sync.test.mjs` sigue pasando sin cambios de comportamiento.
- [x] 1.2 Implementar `resolveMainRoot()` con `git rev-parse --path-format=absolute --git-common-dir` y hacer que `readEnv` lea `.env` del checkout principal, con `--env` como override y prioridad para las variables exportadas; verificar con tests de checkout principal, worktree, ausencia de `.env` y prioridad del entorno.
- [x] 1.3 Implementar en `scripts/lib/workflow.mjs` el slug de change id, la lectura/escritura/validación de `workflow.json`, los nombres de etiquetas `claims/<card-id>/<change-id>`, la ruta del worktree, la lista de ficheros compartidos y el borrador de cuerpo de PR; verificar con tests de ids con acentos, manifiestos válidos e inválidos, rutas y refs.
- [x] 1.4 Implementar un runner de Git inyectable y la publicación atómica de rama + etiquetas de claim; verificar con un test de integración sobre un remoto bare temporal que el primer claim gana, el segundo falla y el fallo deja el repositorio sin rama local ni etiquetas.

## 2. Cola, marcadores y preflight del claim

- [x] 2.1 Añadir `lists.review` opcional a `parseConfig` y `kan.config.json`, sin exigirla para `claim`, `done` ni `release`; verificar con tests de configuración con y sin la lista y con una operación `review` que falla con un mensaje claro cuando falta.
- [x] 2.2 Implementar `queue` en texto y `--json`, mostrando tarjetas libres de `TO DO` y tarjetas reclamadas con change, rama, persona y `claimable` calculado contra la identidad actual; verificar con un tablero simulado que el JSON incluye `publicId`, `title`, `list`, `members`, `changeId`, `branch` y `claimable`, y que no hace peticiones de escritura.
- [x] 2.3 Implementar el marcador `<!-- openspec-change: <id> -->` y la línea legible en la descripción, con alta y retirada idempotentes, y ampliar `matchCards` para buscar por título, marcador y manifiesto; verificar con tests de marcador duplicado, descripción existente y coincidencia por manifiesto.
- [x] 2.4 Implementar el preflight de `claim` que valida tarjetas en `TO DO`, libres o asignadas a quien reclama, sin vínculo a otro change y sin colisión de rama o etiqueta; verificar con tests de tarjeta libre, asignada a otra persona, ya vinculada, fuera de la cola y cola inaccesible.

## 3. Claim, worktree, agrupación y ciclo de estados

- [x] 3.1 Implementar `claim` con una o varias tarjetas, `--change` obligatorio para grupos, `--dry-run` y `--worktree-root`: crear worktree y rama desde `origin/main`, scaffold de OpenSpec si falta, `workflow.json`, commit de claim, etiquetas y push atómico, y después asignar/mover las tarjetas; verificar con tests de Git y Kan simulados y con una ejecución `--dry-run` que no escribe.
- [x] 3.2 Implementar el reintento idempotente del mismo claim y la limpieza ante fallo de publicación o de creación del worktree; verificar con tests de claim repetido, etiqueta de otro change, worktree existente y fallo de push.
- [x] 3.3 Implementar `link <change-id> --cards ...` para agrupar tarjetas en un claim existente, actualizar el manifiesto y commitear el cambio; verificar con tests de grupo, tarjeta ya usada por otro change, change archivado y actualización del marcador.
- [x] 3.4 Implementar `review`, `done` (con grupo, `--pr` y fallback sin manifiesto), `release` (retirada de la persona, etiquetas, worktree y rama con guardas) y `pr-body`; verificar con tests de cada escenario de las specs, incluido `done` repetido, `release` con cambios locales y `release` con PR abierta.
- [x] 3.5 Implementar `check` para avisar de cambios en ficheros compartidos y enlazarlo con `done` y `pr-body`; verificar que detecta `AGENTS.md`, `package-lock.json`, `.github/**` y `playwright.config.ts` y que no bloquea el flujo.
- [x] 3.6 Documentar y probar el bootstrap del worktree: ruta externa por defecto, `OPSX_WORKTREE_ROOT`, enlace de `node_modules`, ausencia de `.env` copiado y negativa a reutilizar una ruta existente; verificar con una creación y limpieza real de un worktree temporal.
- [x] 3.7 Implementar `scripts/lib/ports.mjs` y la asignación de puertos en `claim`: hash estable, rangos 3100–3999 para desarrollo y 4100–4999 para E2E, comprobación con `node:net`, `.opsx/ports.json` ignorado y overrides `--dev-port`/`--e2e-port`; verificar con tests de puerto libre, ocupado, hash repetido, fichero ausente y puerto forzado.

## 4. Documentación del flujo y de Kan

- [x] 4.1 Actualizar `AGENTS.md` con el flujo `claim → propose sobre el change existente → apply → archive → PR → done`, una sesión por worktree, prohibición de editar `main`, agrupación de tarjetas, estados, etiquetas, `.env` del checkout principal, limpieza y los disparadores de consulta de cola («revisa la cola», «mira el Kan», «qué tareas hay», «qué puedo hacer», «busca trabajo», «tareas libres», «siguiente tarea», «estado del tablero» y `/kan-queue`), indicando que deben ejecutar `queue --json` sin escribir en el tablero; verificar que cubre todos los escenarios de `openspec/specs/desarrollo/kanban/spec.md` y `openspec/changes/mejorar-flujo-colaborativo/specs/desarrollo/flujo-colaborativo/spec.md`.
- [x] 4.2 Crear `docs/desarrollo/flujo-colaborativo.md` con la cola, el claim, los worktrees, las sesiones de OpenCode, la agrupación, el ciclo de estados, los conflictos de archivado, la limpieza y la configuración de GitHub; verificar que cada comando del documento se ejecuta tal cual en un checkout de prueba.
- [x] 4.3 Actualizar `docs/desarrollo/kanban.md` con `queue`, `claim`, `link`, `review`, `done`, `release`, `pr-body`, `workflow.json`, la lista `REVIEW` opcional y la resolución de `.env` en worktrees; actualizar `README.md` y `.env.example`; verificar que no aparece ningún secreto ni correo real.
- [x] 4.4 Documentar en `docs/desarrollo/flujo-colaborativo.md` los pasos de administración de GitHub (protección de `main`, checks obligatorios, revisión, rama actualizada, merge queue opcional) y los comandos `gh api` equivalentes; verificar los comandos contra el repositorio sin aplicarlos si no se tienen permisos de administrador.
- [x] 4.5 Crear `.opencode/commands/kan-queue.md` para que `/kan-queue` ejecute `node scripts/kan-sync.mjs queue --json`, resuma tarjetas libres y reclamadas y no escriba en el tablero; verificar que el atajo devuelve los `publicId` y que no mueve ni asigna tarjetas.

## 5. CI, plantilla de PR y puertos paralelos

- [x] 5.1 Crear `.github/workflows/ci.yml` con los jobs `verify` y `e2e`, Node 24, `npm ci`, permisos de solo lectura, concurrencia cancelable y artefactos de E2E en fallo; verificar la sintaxis y, tras publicar una rama, que ambos checks aparecen en la PR.
- [x] 5.2 Crear `.github/pull_request_template.md` con change id, tarjetas, resumen, deltas de specs, verificaciones, diseño congelado, alcance del commit y agrupación; verificar que `pr-body` genera un borrador compatible con la plantilla.
- [x] 5.3 Hacer configurable el puerto de E2E con `E2E_PORT` en `playwright.config.ts`, manteniendo 3100 por defecto; verificar una ejecución con el valor por defecto y otra con un puerto alternativo sin colisión.
- [x] 5.4 Implementar `scripts/worktree-ports.mjs` y los scripts `dev:worktree` y `e2e:worktree`: leer o crear `.opsx/ports.json`, comprobar el puerto, regenerar tokens en desarrollo, lanzar Next o Playwright con el puerto correcto y negarse a lanzar E2E si el servidor de desarrollo sigue activo en el mismo worktree; verificar que `dev:worktree` imprime la URL y que `e2e:worktree` usa el `E2E_PORT` asignado.
- [x] 5.5 Añadir `.opsx/` a `.gitignore` y documentar en `docs/desarrollo/flujo-colaborativo.md` los puertos, los overrides, el reparto entre worktrees y la regla de no ejecutar `dev:worktree` y `e2e:worktree` a la vez en el mismo worktree; verificar que `.opsx/ports.json` no aparece en `git status`.

## 6. Verificación integral

- [x] 6.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`; registrar el resultado y corregir cualquier regresión.
- [x] 6.2 Ejecutar `npm run e2e` en el puerto por defecto y en un puerto alternativo, y `npm run dev:worktree` en dos worktrees; verificar que los tres proyectos pasan, que cada dev usa su puerto y que no se reutiliza un servidor ajeno.
- [x] 6.3 Probar el flujo real de cola con una tarjeta desechable en `TO DO`: `queue`, `claim --dry-run`, `claim`, comprobar worktree/rama/etiqueta/asignación, intentar un segundo claim de la misma tarjeta y comprobar que falla, y ejecutar `release` para dejarla como estaba.
- [x] 6.4 Abrir dos sesiones de OpenCode en dos worktrees de claims distintos, arrancar `dev:worktree` en cada una, comprobar que cada sesión ve su rama y su URL, que los cambios de una no aparecen en la otra y que los puertos son distintos, y limpiar ambos claims al terminar.
- [x] 6.5 Verificar `pr-body` y `check` sobre este change, comprobar que el cuerpo enumera las tarjetas y que el aviso de ficheros compartidos incluye los que toca este change; ejecutar `/kan-queue` y comprobar que resume la cola sin escribir en Kan.

## Workflow follow-up

- Archivar este change, ejecutar `done` con la URL de la PR, commitear y publicar la rama, y abrir la PR con la plantilla.
- Configurar la lista `REVIEW` en Kan.bn y la protección de `main` si el administrador del repositorio lo autoriza.
- Tras el merge, limpiar el worktree y la rama, y borrar las etiquetas de claim de las tarjetas de este change.
