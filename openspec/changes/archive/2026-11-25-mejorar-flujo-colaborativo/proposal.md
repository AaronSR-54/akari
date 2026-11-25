# Proposal

## Why

El flujo actual funciona para una sola persona: el change nace con `/opsx-propose`, la tarjeta se crea después y todo ocurre en el mismo checkout. No hay una cola real, ni una reserva atómica de la tarjeta, ni forma de agrupar varias tarjetas en un solo change, ni aislamiento para que dos personas —o dos sesiones de OpenCode— trabajen a la vez sin pisarse. Tampoco hay CI ni plantilla de PR que hagan explícitas las verificaciones.

Este change convierte Kan.bn en la cola de entrada, reserva cada tarjeta de forma atómica y da a cada claim su propia rama, worktree y sesión de OpenCode, manteniendo `main` limpio.

## What Changes

- **Cola y claim atómico.** Nuevo comando `node scripts/kan-sync.mjs claim` que toma una o varias tarjetas de `TO DO`, valida que estén libres, crea la rama `<change-id>` y una etiqueta Git por tarjeta (`claims/<card-id>/<change-id>`), y las publica en un único `git push --atomic`. La primera persona que publica gana; el resto recibe un error con el change que ya la tiene.
- **Consulta de la cola para agentes.** `node scripts/kan-sync.mjs queue --json` devuelve las tarjetas libres y reclamadas con `publicId`, título, lista, asignación, change, rama y si son reclamables. `AGENTS.md` reconoce frases como «revisa la cola», «qué tareas hay» o «busca trabajo», y el atajo `/kan-queue` de OpenCode ejecuta la misma consulta sin escribir en el tablero.
- **Agrupación de tarjetas.** `claim --cards a,b,c` permite unificar varias tarjetas en un solo change, rama, worktree y PR. `link <change-id> --cards ...` añade tarjetas a un claim existente antes de archivarlo. Todas las tarjetas del grupo comparten el mismo `workflow.json` y se mueven juntas.
- **Worktree y sesión por tarea.** Cada claim crea un worktree fuera del checkout principal (por defecto, un directorio hermano `akari-worktrees/<change-id>`) y deja `main` intacto. Cada worktree se abre con `opencode <ruta>` o moviendo la sesión actual; varias sesiones pueden trabajar en paralelo, cada una en su rama.
- **Limpieza tras merge validado.** Archivar un change NO borra su worktree: el agente espera a que una persona mergee la PR y después ejecuta `node scripts/kan-sync.mjs cleanup <change-id>`. El comando consulta `gh pr view --json state,mergedAt` y solo borra el worktree y la rama local cuando GitHub confirma el merge; si la PR sigue abierta o no se puede consultar, falla sin tocar nada. No elimina etiquetas de claim ni la rama remota.
- **Puertos automáticos por worktree.** `claim` asigna un puerto de desarrollo y otro de E2E a cada worktree, los guarda en `.opsx/ports.json` —ignorado por Git— y añade `npm run dev:worktree` y `npm run e2e:worktree` para arrancar el servidor y las pruebas en esos puertos, sin calcularlos a mano. Si un puerto está ocupado, el flujo reasigna o falla con un mensaje claro; `--dev-port` y `--e2e-port` permiten forzarlos.
- **Entorno sin copiar secretos.** `kan-sync` resuelve `.env` desde el checkout principal mediante el directorio común de Git, así que un worktree no necesita copiar el token. `kan.config.json` sigue versionado y sin secretos.
- **Ciclo de estados.** `TO DO → IN PROGRESS` al reclamar, `REVIEW` opcional al abrir una PR antes de archivar, y `DONE` al archivar el change, después de abrir su PR, moviendo todas las tarjetas del grupo y enlazando la PR. Nuevo comando `release` para devolver tarjetas y limpiar un claim abandonado.
- **Manifiesto por change.** `openspec/changes/<change-id>/workflow.json` registra el change, la rama, las tarjetas vinculadas y la PR. No contiene tokens, correos ni datos personales; es la fuente de verdad para `done`, `review`, `release` y la plantilla de PR.
- **CI y PR reproducibles.** `.github/workflows/ci.yml` ejecuta `typecheck`, `lint`, `test`, `build` y E2E en cada PR; `.github/pull_request_template.md` recoge change, tarjetas, deltas de specs y verificaciones. El puerto de E2E sigue siendo configurable con `E2E_PORT` para CI y para `e2e:worktree`. La protección de `main` y los checks obligatorios se documentan como pasos de administración de GitHub.
- **Documentación y reglas de convivencia.** `AGENTS.md`, `docs/desarrollo/kanban.md`, un nuevo `docs/desarrollo/flujo-colaborativo.md` y el `README.md` describen el flujo, la selección de tareas, la agrupación, la resolución de conflictos de archivado y la limpieza de worktrees.
- **Convención de nombres.** La rama SHALL llamarse exactamente como el id del change de OpenSpec, sin prefijo `feat/`. El id SHALL ser corto (≤30 caracteres), en inglés y con guiones; los mensajes de commit SHALL estar en inglés. Se actualizan la validación de ids, los mensajes que escribe `kan-sync` y la documentación.
- **Puerto por defecto compartido.** El primer change usa el puerto 3100 tanto para desarrollo como para E2E. Si otro worktree lo encuentra ocupado al arrancar, toma el siguiente puerto libre (3101, 3102…), sin hash previo ni rangos separados. `--dev-port` y `--e2e-port` siguen permitiendo forzar un valor.
- **Frontal de revisión automático.** Al aplicar un change, el agente arranca el frontal en segundo plano y deja la URL lista para revisar; al archivar, se detiene. Es un paso del agente, no una tarea manual de quien desarrolla: `npm run preview:worktree` gestiona el proceso y guarda la URL en `.opsx/preview.json`. E2E pausa y reanuda el frontal para no compartir `.next`.
- **Identidad explícita en Kan.** `kan-sync whoami` imprime el email y el miembro configurado sin secretos, y `kan-sync comment <change> <texto>` escribe comentarios identificados con ese email. Toda escritura en Kan usa `kan_CURRENT_USER` del `.env`; no hay correos fijos en código ni documentación y no se recurre al dueño del token como identidad por defecto.
- **Compatibilidad.** `start`, `done` y `discover` siguen funcionando; `start` queda como vía heredada para un change que ya existe sin tarjeta previa. No cambia el modelo de datos, la interfaz de producto ni el diseño congelado.

## Capabilities

### New Capabilities

- `desarrollo/flujo-colaborativo`: ciclo de trabajo paralelo entre la cola de Kan.bn, OpenSpec, los worktrees de Git, las sesiones de OpenCode y las PR de GitHub, incluidos el aislamiento, la CI, la plantilla de PR, la agrupación de tareas y la resolución de conflictos.

### Modified Capabilities

- `desarrollo/kanban`: la cola de tarjetas, la reclamación atómica, la agrupación, el manifiesto, los estados `REVIEW`/`DONE`, la liberación de claims, la identidad configurada en el `.env`, `whoami` y `comment` cambian el comportamiento exigido a la herramienta de sincronización.

## Impact

- **Scripts y pruebas**: `scripts/kan-sync.mjs` gana comandos y orquestación de Git; se separan funciones puras en `scripts/lib/`; se añaden `scripts/worktree-ports.mjs` y las scripts `dev:worktree`/`e2e:worktree`; se amplían `scripts/kan-sync.test.mjs` y las pruebas de workflow y puertos.
- **Configuración**: `kan.config.json` admite una lista `review` opcional; `.env.example` documenta que el `.env` se lee del checkout principal; `.gitignore` ignora `.opsx/` para no versionar los puertos de la máquina. No se commitean secretos.
- **Git y GitHub**: nueva rama por claim, etiquetas `claims/*`, `.github/workflows/ci.yml`, `.github/pull_request_template.md`, `playwright.config.ts` con `E2E_PORT`, y pasos documentados de protección de rama.
- **Documentación y atajos**: `AGENTS.md`, `README.md`, `docs/desarrollo/kanban.md`, nuevo `docs/desarrollo/flujo-colaborativo.md` y `.opencode/commands/kan-queue.md`.
- **Sistemas externos**: API REST de Kan.bn, Git remoto y GitHub Actions. No se añaden dependencias de runtime ni se toca `packages/*` o `apps/web`.
- **Riesgos**: las etiquetas de claim pueden quedar obsoletas si alguien abandona una tarea; `release` y la documentación lo cubren. Las PR de archivado pueden competir por los mismos ficheros de specs; se serializa el aterrizaje y se rebasa antes de abrir la PR. El frontal en segundo plano consume un puerto mientras el change está en curso; `preview:worktree stop` y el archivado lo liberan, y E2E lo pausa para no compartir `.next`.

## Supuestos

- Las tarjetas se crean en la interfaz de Kan.bn; este change no añade captura de tareas desde la terminal.
- Cada persona tiene permiso de push al repositorio y su propio `.env`; varias sesiones en la misma máquina comparten identidad de Kan.
- El tablero puede añadir la lista `REVIEW`; si no existe, `review` falla con un mensaje claro y el flujo principal sigue funcionando sin ella.
- `DONE` significa «change archivado y PR abierta», no «PR mergeada»: GitHub sigue siendo la fuente de verdad del merge.
- La agrupación se decide al reclamar o enlazar tarjetas; no se fusionan changes ya archivados.
- Los worktrees viven fuera del repositorio para no interferir con lint, tests ni builds; `node_modules` se comparte por enlace simbólico y un cambio de dependencias exige instalación aislada.
- Los puertos son específicos de cada máquina: se guardan en `.opsx/ports.json` dentro del worktree y nunca se commitean ni se mezclan con `workflow.json`.
- Cada worktree usa su propio puerto de desarrollo y de E2E; si un puerto está ocupado al arrancar, el helper reasigna o falla sin reutilizar el servidor de otro worktree.
- El agente no mergea PRs; la revisión y el merge quedan en manos de las personas.
