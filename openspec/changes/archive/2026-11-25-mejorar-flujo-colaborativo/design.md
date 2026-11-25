# Design

## Context

Ver `proposal.md` para la motivación. El estado actual tiene cuatro limitaciones que condicionan el diseño:

- `scripts/kan-sync.mjs` es un CLI ESM sin dependencias que ya sabe leer `kan.config.json`, resolver el `.env`, hablar con la API REST de Kan.bn y mover una tarjeta entre listas. Sus funciones puras se prueban con Vitest.
- `AGENTS.md` exige una rama `feat/<change-id>` por change y una PR por rama, pero el change se propone antes de tener tarjeta. No existe una cola ni una reserva atómica.
- Solo hay un checkout. Un worktree de OpenCode ya existe para `integrar-kanban-openspec`, pero no hay un flujo repetible que cree uno por tarea ni que impida abrir dos sesiones sobre el mismo.
- No hay `.github/`, así que la calidad de una PR depende de que el agente recuerde ejecutar las verificaciones. `playwright.config.ts` fija el puerto 3100, lo que impide ejecutar E2E en dos worktrees a la vez.

El repositorio exige Node ≥ 20.9, ESM y no tiene dependencias de utilidades. El tablero Kan.bn es autoalojado y accesible por Tailscale; GitHub Actions no puede asumir que lo alcanza.

## Goals / Non-Goals

**Goals:**

- Una cola única y visible en `TO DO`, con una reserva atómica que funcione entre clones y entre sesiones.
- Un worktree y una sesión por claim, con `main` siempre limpio y sin ramas compartidas.
- Agrupar varias tarjetas en un solo change sin perder trazabilidad ni dejar tarjetas fuera.
- Un ciclo `claim → propose → apply → archive → PR → done` reproducible, con CI y plantilla de PR.
- Compatibilidad con los changes y tarjetas existentes.
- Cero dependencias nuevas y errores legibles que nunca impriman secretos.

**Non-Goals:**

- Crear tarjetas desde la terminal. La captura de tareas sigue en la interfaz de Kan.bn.
- Sincronización bidireccional: mover una tarjeta en Kan no crea ni modifica un change.
- Que GitHub Actions escriba en Kan.bn ni que mergee PRs.
- Fusionar changes ya archivados o reescribir su historia.
- Resolver bloqueos de Git más allá de las etiquetas de claim; el equipo confía en quienes tienen permiso de push.
- Cambiar el diseño visual, el modelo de datos o la aplicación de producto.

## Decisions

### Kan `TO DO` es la cola y `claim` es la única entrada de trabajo nuevo

`queue` es una consulta de solo lectura que enumera tarjetas libres de `TO DO` y tarjetas ya reclamadas con su change, rama y persona. `claim` recibe una o varias tarjetas y un `--change` opcional; si hay más de una tarjeta, `--change` es obligatorio para que el id describa el grupo y no solo la primera tarjeta.

`start` se conserva como vía heredada para un change que ya existe sin tarjeta previa. Si el change tiene `workflow.json`, `start` sincroniza las tarjetas del manifiesto en lugar de crear una nueva. Así los changes antiguos y el flujo de `/opsx-propose` sin cola siguen funcionando.

Alternativas descartadas: GitHub Issues como cola (añade una tercera fuente de verdad y otra autenticación), OpenSpec-first (no hay cola para quien no conoce el repositorio) y asignar la tarjeta antes de crear la rama (no es atómico entre dos personas).

### Reserva atómica con push de rama y etiquetas por tarjeta

El claim se publica en un único `git push --atomic` con:

- la rama `feat/<change-id>`;
- una etiqueta anotada `refs/tags/claims/<card-public-id>/<change-id>` por cada tarjeta.

El servidor Git es el árbitro: si la rama o cualquiera de las etiquetas ya existe, el push completo falla y nadie mueve tarjetas. La etiqueta codifica el change en el nombre, así que el error puede decir quién posee la tarjeta sin guardar correos ni metadatos personales. La etiqueta se crea con un mensaje neutro (`change=<id> card=<id>`) y no contiene tokens.

Secuencia de `claim`:

1. Leer el tablero y validar que todas las tarjetas están en `TO DO`, libres o asignadas a quien reclama, y sin marcador de otro change. Si Kan no responde, abortar antes de tocar Git.
2. Resolver el `change-id`, comprobar que no choca con un change archivado y que la rama y las etiquetas no pertenecen a otro claim.
3. Crear el worktree y la rama local desde `origin/main`; crear el scaffold del change con `openspec new change` si no existe; escribir `workflow.json`; commitear `chore(<id>): reclamar ...`.
4. Crear las etiquetas y publicar rama + etiquetas con `--atomic`. Si falla, borrar worktree, rama local y etiquetas locales; no tocar Kan.
5. Asignar y mover las tarjetas a In Progress, añadir el marcador del change a la descripción y dejar el estado visible.
6. Imprimir el change, las tarjetas, la ruta del worktree y el comando exacto para abrir la sesión.

Reintentar el mismo claim es idempotente: si la rama y todas las etiquetas existen para el mismo change, se conserva el worktree y se reintenta solo la parte de Kan. Si alguna etiqueta pertenece a otro change, se falla sin modificar nada.

Alternativas descartadas: asignar primero en Kan (dos personas pueden asignarse y no hay compare-and-swap), un fichero de lock en el repositorio (no es distribuido), una rama por tarjeta (no cubre grupos y multiplica ramas) y un servicio de locks (infraestructura nueva).

### Un worktree fuera del repositorio y una sesión de OpenCode por claim

La ruta por defecto es un directorio hermano del checkout principal:

```text
<mismo padre>/akari-worktrees/<change-id>
```

Así el worktree no queda dentro del repositorio: ESLint, Vitest, Next y `git status` no lo recorren, y no hace falta añadir más entradas a los ignores. La ruta se puede cambiar con `OPSX_WORKTREE_ROOT` o `--worktree-root`; `claim` imprime siempre la ruta final.

El checkout principal permanece en `main`. El worktree se crea con `git worktree add -b feat/<change-id> <ruta> origin/main`. Si `origin/main` no está actualizado, se hace `git fetch origin main` antes.

Para evitar una instalación completa por worktree, `claim` enlaza `node_modules` del checkout principal cuando existe. Un cambio de dependencias exige sustituir el enlace por una instalación aislada (`rm node_modules && npm ci`); se documenta en el flujo y la CI siempre instala desde cero.

Cada worktree se abre con `opencode <ruta>`. Desde una sesión existente se puede mover la sesión a esa ruta. La regla es una sesión por worktree: dos sesiones sobre el mismo worktree comparten índice y ficheros y vuelven a introducir el problema que este change elimina. `claim` no crea una segunda ruta para el mismo change; si el worktree ya existe y no es el mismo claim, se detiene.

Alternativas descartadas: usar un único checkout y cambiar de rama (dos sesiones se pisan), crear worktrees dentro del repositorio (los tooling los recorren) y depender solo del worktree integrado de OpenCode (su ruta y ciclo no están versionados y no cubren el claim desde terminal). Los worktrees integrados siguen siendo válidos para quien los prefiera, pero el flujo canónico usa la ruta que imprime `claim`.

### Manifiesto versionado en el change

`openspec/changes/<change-id>/workflow.json` es la fuente de verdad del claim:

```json
{
  "changeId": "mejorar-flujo-colaborativo",
  "branch": "feat/mejorar-flujo-colaborativo",
  "cards": [
    { "publicId": "card_abc", "title": "Mejorar el flujo" }
  ],
  "prUrl": null,
  "claimedAt": "2026-11-25T10:00:00.000Z"
}
```

No guarda el email de la persona, el token, la ruta absoluta del worktree ni el contenido de `.env`; la asignación vive en Kan y la ruta se deriva del id. El manifiesto se commitea con el claim y viaja con el change al archivo.

`review`, `done`, `release`, `check` y `pr-body` lo leen. Si falta, se usa la coincidencia histórica por título o el marcador de la descripción para no romper changes antiguos. `link` actualiza el manifiesto y lo commitea en la rama.

### Identificación por manifiesto, título y marcador

Las tarjetas nuevas reciben en la descripción un marcador invisible y una línea legible:

```text
<!-- openspec-change: mejorar-flujo-colaborativo -->
OpenSpec: `mejorar-flujo-colaborativo` · rama `feat/mejorar-flujo-colaborativo`
```

El marcador permite encontrar tarjetas agrupadas aunque su título no contenga el id. La identificación prioriza el manifiesto; después acepta el id como token completo del título o el marcador de la descripción. Si hay más de una tarjeta candidata sin manifiesto, se aborta sin mover nada. `release` retira el marcador y la línea legible sin tocar el resto de la descripción.

### Estados y comandos

| Estado | Entrada | Salida |
| --- | --- | --- |
| `TO DO` | Tarjeta creada en Kan | `claim` |
| `IN PROGRESS` | `claim` o `link` | `review`, `done`, `release` |
| `REVIEW` | `review` (PR abierta antes de archivar) | `done`, `release` |
| `DONE` | `done` al archivar y abrir la PR | Limpieza tras merge |

- `queue [--json]`: consulta la cola y los claims.
- `claim <card...> [--change <id>] [--dry-run]`: reserva atómica, crea worktree y mueve tarjetas.
- `link <change-id> --cards <card...>`: agrupa tarjetas en un claim existente.
- `review <change-id>`: mueve todas las tarjetas a `REVIEW`; la lista es opcional.
- `done <change-id> [--pr <url>]`: mueve todas las tarjetas a `DONE`, registra la PR y actualiza el manifiesto.
- `release <change-id> [--force]`: devuelve tarjetas, borra etiquetas y limpia worktree/rama si es seguro.
- `pr-body <change-id>`: imprime un borrador de cuerpo de PR con el change y las tarjetas.
- `check <change-id>`: avisa si la rama toca ficheros compartidos.
- `start`, `done` y `discover` mantienen compatibilidad; `done` sin manifiesto conserva el comportamiento anterior.

`queue --json` es el contrato que usan los agentes; el modo texto es para personas. La salida agrupa `todo` y `claimed` y cada tarjeta incluye `publicId`, `title`, `list`, `members`, `changeId`, `branch` y `claimable`. `claimable` se calcula contra la identidad de `kan_CURRENT_USER` o la dueña del token, así que el agente no necesita comparar correos ni leer secretos. Un agente puede elegir la primera tarjeta con `claimable: true` y pasarla a `claim` sin inventar identificadores.

Los disparadores para el agente se documentan en `AGENTS.md`: «revisa la cola», «mira el Kan», «qué tareas hay», «qué puedo hacer», «busca trabajo», «tareas libres», «siguiente tarea», «estado del tablero» y `/kan-queue`. Ante cualquiera de ellos debe ejecutar `queue --json`, resumir las tarjetas libres y reclamadas, y no escribir en el tablero hasta que se pida un `claim` explícito. El comando de OpenCode `/kan-queue` envuelve esa consulta para que no dependa de que el agente recuerde la frase.

`done` se ejecuta después de abrir la PR de archivado. El tablero refleja el ciclo de OpenSpec, no el merge de GitHub: `DONE` significa «archivado y PR abierta». Es la decisión acordada; GitHub sigue siendo la fuente de verdad del merge y una PR rechazada se gestiona manualmente. `review` existe para quien abra una PR antes de archivar; el flujo estándar puede pasar de `IN PROGRESS` a `DONE`.

### Entorno y secretos

`kan-sync` resuelve el `.env` así:

1. Si se pasa `--env`, usa esa ruta.
2. Si no, obtiene el checkout principal con `git rev-parse --path-format=absolute --git-common-dir` y toma el directorio padre de `.git`.
3. Lee `.env` de ese directorio y da prioridad a las variables ya exportadas.

En un worktree, `.env` no se copia ni se enlaza; se lee del checkout principal. El token nunca se escribe en etiquetas, manifiesto, logs ni mensajes de error. `kan.config.json` sigue versionado y solo contiene URL, tablero y nombres de listas; `lists.review` es opcional.

### CI, PR y puertos

`.github/workflows/ci.yml` se ejecuta en `pull_request` hacia `main` y en `push` a `main`, con permisos de solo lectura y concurrencia cancelable:

- `verify`: Node 20, `npm ci`, `typecheck`, `lint`, `test`, `build`.
- `e2e`: Node 20, `npm ci`, Chromium de Playwright, `npm run e2e`, artefactos de traza e informe si falla.

La protección de `main` (checks obligatorios, revisión, rama actualizada, sin force push, sin push directo) no se puede versionar como código; se documenta con los comandos de `gh api` y se configura una vez por el administrador. La plantilla de PR recuerda el alcance, las tarjetas, los deltas de specs, las verificaciones, el diseño congelado y la regla «un change = una rama = una PR».

`playwright.config.ts` pasa a leer `E2E_PORT` (por defecto 3100) y lo usa en `baseURL` y en el comando del servidor. En CI se mantiene el valor por defecto.

Para el trabajo local, cada claim asigna dos puertos al worktree:

- desarrollo, en el rango 3100–3999;
- E2E, en el rango 4100–4999.

La asignación parte de un hash estable del change id y comprueba que el puerto esté libre con `node:net`; si está ocupado, avanza al siguiente. El resultado se guarda en `.opsx/ports.json` dentro del worktree:

```json
{
  "dev": 3102,
  "e2e": 4102,
  "assignedAt": "2026-11-25T10:05:00.000Z"
}
```

El fichero es específico de la máquina y está ignorado por Git (`/.opsx/`), igual que `.env`. No viaja en `workflow.json`, que sigue siendo portable. `--dev-port` y `--e2e-port` permiten forzar valores; si el valor forzado está ocupado, el flujo falla con un mensaje claro.

Dos scripts de raíz hacen el arranque en un paso:

```bash
npm run dev:worktree   # Next en el puerto de desarrollo, imprime la URL
npm run e2e:worktree   # Playwright con E2E_PORT del worktree
```

`dev:worktree` lee o crea `.opsx/ports.json`, comprueba que el puerto siga libre, regenera los tokens y ejecuta `npm run dev -w @akari/web -- -p <puerto>`; el `--` es obligatorio para que npm pase `-p` a `next dev`. `e2e:worktree` lee el mismo fichero, exporta `E2E_PORT` y ejecuta `npm run e2e`. `claim` escribe el fichero desde el principio y muestra la URL y los comandos, para que la sesión no tenga que calcular nada.

Si el puerto de desarrollo está ocupado al arrancar `e2e:worktree` en el mismo worktree, el helper avisa de que hay que parar el servidor de desarrollo: `next dev` y `next build` comparten `.next` y no deben escribir a la vez. Los dos worktrees pueden tener servidores a la vez porque cada uno usa su propio puerto y su propio `.next`. `npm run dev` sigue funcionando en el checkout principal con el puerto 3000 por defecto.

### Conflictos y ficheros compartidos

El aislamiento por rama evita la mayoría de conflictos, pero los archivados compiten por `openspec/specs/**`. La regla es: solo una PR de archivado se marca como lista a la vez, o cada una se rebasa sobre `main` actualizado y vuelve a ejecutar la CI antes de revisarse. La protección de rama con «require branches to be up to date» refuerza la regla; una merge queue es opcional.

`check` compara `git diff --name-only origin/main...HEAD` con una lista conservadora de ficheros compartidos (`AGENTS.md`, `README.md`, `package.json`, `package-lock.json`, `kan.config.json`, `.github/**`, configuración de lint/test/Playwright y documentación de flujo). No bloquea, pero avisa antes de abrir la PR. Los changes que toquen esos ficheros se coordinan y se mergean en serie.

### Organización del código

Se mantiene un único CLI, `scripts/kan-sync.mjs`, para no duplicar puntos de entrada. Las funciones puras y la orquestación se separan en módulos importables:

- `scripts/lib/config.mjs`: lectura de `.env`, configuración, resolución del checkout principal.
- `scripts/lib/kan.mjs`: cliente HTTP, listas, tarjetas, asignación, marcadores y payloads.
- `scripts/lib/workflow.mjs`: slug, manifiesto, refs de claim, rutas de worktree, ficheros compartidos y cuerpo de PR.
- `scripts/lib/ports.mjs`: hash de puertos, comprobación de disponibilidad, lectura/escritura atómica de `.opsx/ports.json` y overrides.
- `scripts/worktree-ports.mjs`: CLI de `dev:worktree` y `e2e:worktree`; resuelve la raíz del worktree, prepara los tokens y lanza Next o Playwright con el puerto correcto.

`kan-sync.mjs` conserva las exportaciones actuales como reexportaciones para no romper los tests existentes. Las operaciones de Git se inyectan en `claim`/`release` mediante un runner (`runGit`) para poder probarlas sin tocar el repositorio real. Las pruebas nuevas cubren las funciones puras, la secuencia de claim con Kan simulado, la asignación de puertos con colisiones y un test de integración con un remoto bare local que demuestra que dos claims de la misma tarjeta no pueden ganar los dos.

## Risks / Trade-offs

- **Etiquetas obsoletas** → `release` las borra y `queue` muestra los claims; un claim abandonado no bloquea nuevas tarjetas del mismo change, solo la misma tarjeta.
- **Cualquiera con push puede borrar etiquetas** → el equipo confía en sus miembros; se documenta que no se borran claims ajenos sin coordinación.
- **Ruido de etiquetas en GitHub** → se limitan al namespace `claims/` y se limpian tras el merge; no afectan a releases.
- **`DONE` antes del merge** → decisión explícita; GitHub es la fuente de verdad del merge y una PR rechazada se reabre manualmente.
- **`node_modules` compartido** → acelera el arranque, pero un cambio de dependencias exige instalación aislada; la CI nunca comparte.
- **Colisión de puertos** → `claim` asigna un puerto de desarrollo y otro de E2E por worktree; los helpers reasignan si están ocupados al arrancar y nunca reutilizan el servidor de otro worktree. En el mismo worktree, `dev:worktree` y `e2e:worktree` no se ejecutan a la vez porque comparten `.next`.
- **Puertos versionados por error** → `.opsx/` está en `.gitignore` y `workflow.json` no los contiene; la CI no depende de ellos.
- **Reparto de puertos entre claims concurrentes** → el hash puede coincidir; el helper de arranque vuelve a comprobar y reasigna antes de lanzar el servidor, así que el conflicto se resuelve en el momento de uso.
- **Conflictos de archivado** → rebase obligatorio y una PR de archivado lista a la vez; la protección de rama lo refuerza.
- **Kan inalcanzable** → el preflight de `claim` aborta antes de tocar Git; un fallo posterior conserva rama y worktree y permite reintentar.
- **`gh` no disponible en `release`** → la comprobación de PR abierta se degrada a un aviso y pide comprobarla a mano; no se borra nada sin confirmación.
- **Cambio de título de tarjeta** → el manifiesto y el marcador evitan depender del título.
- **Espacio en disco** → los worktrees y `node_modules` enlazados se limpian tras el merge; `release` y la documentación lo recuerdan.
- **Doble commit al registrar la PR** → `done` actualiza el manifiesto y lo publica después de abrir la PR; la CI vuelve a ejecutarse. Es el precio de dejar la URL versionada.

## Migration Plan

No hay migración de datos ni cambios de runtime.

1. Los changes y tarjetas existentes siguen funcionando: sin `workflow.json`, `done` usa la coincidencia por título o marcador; `start` sigue creando la tarjeta si falta.
2. `kan.config.json` puede añadir `lists.review` cuando el tablero tenga la lista; sin ella, `claim`, `done` y `release` funcionan y solo `review` falla con un mensaje claro.
3. El `.env` existente en el checkout principal se sigue usando; los worktrees dejan de necesitar una copia.
4. Los worktrees antiguos no se tocan; se limpian con `git worktree remove` cuando su rama se mergee. La primera vez que ejecutan `dev:worktree` o `e2e:worktree` reciben su `.opsx/ports.json`; los claims nuevos lo crean al reclamar.
5. `.opsx/` se añade a `.gitignore`; si un worktree antiguo ya tenía un puerto manual, se puede forzar con `--dev-port`/`--e2e-port` o borrar el fichero para que se reasigne.
6. Para revertir, basta con retirar los comandos nuevos, la CI, la plantilla y la documentación; las etiquetas `claims/*` se pueden borrar y el tablero queda como esté.
