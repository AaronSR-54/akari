# AGENTS.md

Instrucciones para agentes que trabajen en este repositorio.

## Núcleo de la aplicación

**Qué es.** Akari es una app de finanzas personales y gastos compartidos, local-first: los datos viven primero en IndexedDB del navegador y, de forma opcional, se sincronizan por usuario con Supabase (PostgreSQL + Auth). No hay cifrado de extremo a extremo ni backend propio; cualquier ampliación de auth, sync o cifrado necesita un change aprobado y, si toca la base remota, un archivo SQL nuevo en `supabase/migrations/`. La app móvil (React Native) reutilizará `domain`, `data` y `tokens` en un change posterior.

**Capas y dependencias.**

- `packages/tokens`: única fuente de tokens → CSS, preset de Tailwind y tipos. `generated/` no se edita a mano.
- `packages/domain`: entidades, cálculos puros, puertos y casos de uso. No importa React, Next ni Dexie.
- `packages/data`: adaptadores Dexie y Supabase, motor de sincronización, migraciones, seed, copia/restauración y ciclo de vida. No contiene JSX ni importa React/Next/`ui`.
- `packages/ui`: componentes presentacionales. No importa `data` ni Next.
- `apps/web`: rutas, shell y hooks headless. Es la única capa que compone todo.

**Dinero y fechas.**

- Importes como enteros en la unidad menor de su divisa (`amountMinor`, `initialBalanceMinor`, `totalMinor`). Usa `money`, `add`, `subtract`, `multiply`, `formatMinor`, `parseAmountToMinor`; nunca sumes dinero con decimales o coma flotante.
- Multidivisa: se agrupa por divisa; el dashboard no convierte. Un `GroupExpense` solo convierte con `exchangeRate` explícito al registrarse.
- `Movement.amountMinor` siempre es positivo; el `type` (`expense`/`income`) decide el signo.
- Fechas de negocio en `YYYY-MM-DD`, técnicas en ISO 8601; al mostrar usa `date-fns` con locale `es`.

**Modelo.** Entidades en `packages/domain/src/types.ts`: `Account` (personal/joint/deposit, TAE en bps, `includeInTotal`), `Movement` (puede enlazar recurrencia, plan de cuotas o gasto grupal), `Recurrence`, `InstallmentPlan`, `Group`/`GroupExpense`/`Transfer` y `Settings`. Tablas y `SCHEMA_VERSION` en `packages/data/src/db.ts`; toda migración conserva los datos.

**Flujo de datos.** Pantalla → hook headless (`apps/web/src/components/hooks.ts`) → caso de uso (`packages/domain/src/services.ts`) → puerto (`packages/domain/src/ports.ts`) → repositorio Dexie. `useLiveQuery` refresca las vistas; no hay estado global: IndexedDB es la fuente de verdad. Con una cuenta conectada, `createTrackedRepositories` marca los cambios en `syncState` y `CloudProvider` los empuja a Supabase. Los casos de uso lanzan `ValidationError`/`NotFoundError` y toda mutación nueva necesita prueba.

**Capacidades actuales.** Onboarding guiado (perfil con nombre, divisa y día de ingreso, primera cuenta, paso informativo de CSV, primer movimiento y nube opcional), cuentas (alta/edición/archivo), movimientos y recurrencias, planes de cuotas, resumen, preguntas rápidas, grupos con reparto (`equal`/`percentage`/`fixed`) y liquidación mínima, ajustes (tema y shell), seed, copia/restauración JSON sin cifrar, reset y cuenta opcional con Supabase (email/contraseña y sincronización local-first). Los grupos compartidos entre usuarios siguen fuera de alcance.

**Fuentes de verdad.** El **código es la fuente de verdad** tanto para el comportamiento como para lo visual; se puede mejorar la interfaz directamente en código. `docs/diseno/` y `design/` son referencia histórica, ya no son bloqueantes (ver «Código como fuente de verdad visual»). Comportamiento: `openspec/specs/producto/`. Arquitectura, convenciones, mapa diseño→código y desviaciones: `docs/desarrollo/`. Rutas y shell: `docs/desarrollo/arquitectura.md`.

**Verificación.** Antes de dar algo por terminado: `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`. Si cambia una pantalla o un flujo, añade o actualiza E2E (`npm run e2e`).

## FigCraft (MCP)

- **Espera siempre un código de sesión live antes de usar el MCP `figcraft`.** No abras, asumas ni reutilices una sesión por iniciativa propia.
- La sesión live va **vía online** (host remoto accesible por red/Tailscale), no en local.
- Si no has recibido el código, pide al usuario que te lo pase y detente. No llames a ninguna herramienta de `figcraft` (`inspect_ui`, `inspect_document`, `create_node`, `set_properties`, `screenshot`, etc.) hasta tenerlo.
- El código es de un solo uso por sesión: si la sesión cae o cambia el host, vuelve a pedir uno nuevo en lugar de reintentar con el anterior.
- Los detalles de la sesión vigente (host, archivo, enlace de invitación) se anotan en `docs/diseno/estado.md`, pero el agente no los usa como sustituto del código que le entregue el usuario.

## Código como fuente de verdad visual

El archivo de diseño (Figma/FigCraft) se ha quedado obsoleto y **no bloquea** la implementación. La apariencia de la app se decide y se mejora en el código; `docs/diseno/`, `design/` y `openspec/specs/diseno/*` son referencia histórica, no una puerta de aprobación.

- Un change se redacta e implementa con código, pruebas, specs de comportamiento (`openspec/specs/producto/*`) y documentación en `docs/desarrollo/`. Las mejoras visuales se hacen en el código sin esperar a actualizar Figma.
- **No se editan en el flujo de changes** `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`: no son entregables y no se reescriben «para alinear» con lo implementado.
- Si conviene dejar constancia de que el código se separó de la referencia histórica, se anota en `docs/desarrollo/desviaciones.md`; ya no es un requisito para seguir adelante.
- No abras ni consultes FigCraft para un change. Solo se usa si el usuario lo pide explícitamente y entrega un código de sesión live (ver «FigCraft (MCP)»).
- La rama y la PR de un change no incluyen cambios en esos directorios. Si aparecen en el working tree, déjalos fuera.
- El usuario puede pedir en cualquier momento que se vuelva a usar la fase de diseño; mientras no lo pida, manda el código.

## Flujo colaborativo: cola, claim y worktrees

Cada trabajo nuevo empieza en una tarjeta de `TO DO` del tablero autoalojado de Kan.bn (`akari/akari`). El flujo canónico es:

1. Revisar la cola.
2. Reclamar una o varias tarjetas con `claim`.
3. Trabajar en el worktree y la sesión que imprime el claim.
4. Proponer, aplicar y archivar el change.
5. Abrir la PR, mover las tarjetas a `DONE` y limpiar el claim.

Un change = una rama = un worktree = una sesión. La rama se llama **exactamente igual que el id del change**, sin prefijo `feat/`. No edites `main` ni abras dos sesiones sobre el mismo worktree.

### Convención de nombres

El id del change es corto (≤30 caracteres), en inglés, en minúsculas y con guiones (`sidebar-float`); no copies el título literal de la tarjeta. Pasa `--change <id>` al reclamar si el id derivado es largo. Todos los mensajes de commit —los que genera `kan-sync` y los que escribas a mano— van en inglés (`chore(<change-id>): claim cards and create worktree`).

### Revisar la cola

`node scripts/kan-sync.mjs queue --json` es una consulta de solo lectura. Devuelve `todo` (tarjetas libres y su `claimable`) y `claimed` (tarjetas con change, rama y persona). No mueve ni asigna nada.

Los disparadores son: «revisa la cola», «mira el Kan», «qué tareas hay», «qué puedo hacer», «busca trabajo», «tareas libres», «siguiente tarea», «estado del tablero» y `/kan-queue`. Ante cualquiera de ellos, ejecuta `queue --json`, resume las tarjetas libres y reclamadas, y espera a que se pida un `claim` explícito.

### Reclamar

```bash
# Una tarjeta. El id se deriva del título si no pasas --change.
node scripts/kan-sync.mjs claim <card-public-id>

# Varias tarjetas relacionadas en un solo change, rama, worktree y PR.
node scripts/kan-sync.mjs claim <id-a> <id-b> --change <change-id>

# Añadir una tarjeta libre a un claim existente, antes de archivar.
node scripts/kan-sync.mjs link <change-id> --cards <card-public-id>
```

`claim` valida que estén en `TO DO`, libres o asignadas a ti y sin otro change; crea rama, worktree y `workflow.json`; publica la rama y las etiquetas `claims/<card-id>/<change-id>` en un push atómico; y mueve las tarjetas a `IN PROGRESS`. Si dos personas reclaman la misma tarjeta, solo una gana.

El claim crea el scaffold del change. Si el change ya existe, `/opsx-propose` debe continuar ese change; no ejecutes `openspec new change` para duplicarlo y, si el comando avisa de que ya existe, sigue con el change existente.

### Worktree y sesión

El claim imprime la ruta, por ejemplo:

```text
Worktree: /ruta/a/akari-worktrees/<change-id>
Abrir: opencode /ruta/a/akari-worktrees/<change-id>
Dev:   npm run dev:worktree
E2E:   npm run e2e:worktree
```

- Abre una sesión por worktree. Desde OpenCode, usa la ruta con `opencode <ruta>` o mueve la sesión actual a esa ruta.
- No abras dos sesiones sobre el mismo worktree ni edites dos worktrees desde una sola sesión.
- El checkout principal permanece en `main`; no lo uses para editar una tarea.
- `.env` se lee del checkout principal mediante el directorio común de Git. No copies `.env` a los worktrees.
- Los puertos se guardan en `.opsx/ports.json` (ignorado por Git). El primer worktree usa el puerto 3100 para desarrollo y E2E; si está ocupado, toma el primer puerto libre (3101, 3102…). `dev:worktree` arranca Next en ese puerto y `e2e:worktree` ejecuta Playwright con su `E2E_PORT`. `e2e:worktree` detiene y reanuda el frontal automáticamente; no ejecutes `dev:worktree` a la vez: comparten `.next`.

### Aplicar y archivar

- **Al aplicar o retomar** (`/opsx-apply`): confirma que estás en el worktree del change y en la rama `<change-id>`. Ejecuta `npm run preview:worktree` justo antes de empezar la implementación: deja el frontal abierto en segundo plano con la URL impresa para que se pueda revisar. No muevas la tarjeta; sigue en `IN PROGRESS` o `REVIEW`.
- **Revisión del frontal.** `npm run preview:worktree:status` imprime la URL. `npm run e2e:worktree` detiene y reanuda el frontal automáticamente, así que no hace falta cerrarlo antes de las pruebas.
- **Al archivar** (`openspec archive`, skill `openspec-archive-change`): ejecuta `npm run preview:worktree:stop` antes de mover el change al archivo, para cerrar el frontal. Trabaja en la rama del change, archiva, commitea solo el alcance del change, publica la rama y abre la PR. `kan-sync done` también intenta detenerlo como red de seguridad.
- **PR.** Usa `node scripts/kan-sync.mjs pr-body <change-id>` como borrador, `gh pr create --base main` con la plantilla y no mergees ni cierres la PR.
- **DONE.** Después de abrir la PR, ejecuta `node scripts/kan-sync.mjs done <change-id> --pr <url>`. Mueve todas las tarjetas del manifiesto a `DONE`, registra la URL y commitea el manifiesto. La PR sigue abierta: `DONE` significa «archivado y PR abierta», no «mergeado».
- **Sin merge.** La revisión y el merge quedan en manos de una persona. Al terminar, informa la URL de la PR y las verificaciones.
- **Espera al merge para limpiar.** Archivar NO borra el worktree: el agente lo conserva y solo ejecuta `node scripts/kan-sync.mjs cleanup <change-id>` cuando una persona confirma que la PR está mergeada. El comando consulta `gh pr view` y falla sin borrar nada si la PR sigue abierta o no se puede comprobar; borra el worktree y la rama local, sin tocar etiquetas ni la rama remota. `--dry-run` muestra la acción y `--force` permite retirar un worktree con cambios sin commitear.

### Revisión y liberación

```bash
# PR abierta antes de archivar.
node scripts/kan-sync.mjs review <change-id>

# Abandonar un claim: devuelve tarjetas, borra etiquetas y limpia worktree/rama.
node scripts/kan-sync.mjs release <change-id> [--force]

# Tras confirmar el merge: borra solo el worktree y la rama local.
node scripts/kan-sync.mjs cleanup <change-id> [--pr <url>] [--dry-run] [--force]
```

`review` requiere que exista `lists.review` en `kan.config.json` y la lista `REVIEW` en el tablero. `release` se niega si el change está archivado, hay una PR abierta o el worktree tiene cambios sin commitear, salvo `--force`.

### Identidad en Kan

Antes de escribir en Kan, ejecuta `node scripts/kan-sync.mjs whoami`: imprime el email y el miembro configurados en `kan_CURRENT_USER` del `.env` del checkout principal. Usa **siempre** ese correo para identificar tus cambios; no lo hardcodees ni asumas el dueño del token. Para comentar una tarjeta, usa `node scripts/kan-sync.mjs comment <change-id> "<texto>"`: el texto queda firmado como `[<email>] <texto>`. Ningún correo real se escribe en código, docs, manifiestos ni commits.

### Conflictos y limpieza

- Los archivados compiten por `openspec/specs/**`. Deja solo una PR de archivado lista a la vez o rebasa sobre `main` actualizado antes de pedir revisión; vuelve a ejecutar la CI.
- `check <change-id>` avisa si la rama toca ficheros compartidos (`AGENTS.md`, `package.json`, CI, configuración, documentación de flujo). Coordina esos cambios y mergea en serie.
- Tras el merge confirmado, ejecuta `node scripts/kan-sync.mjs cleanup <change-id>`: borra el worktree y la rama local, sin tocar etiquetas ni la rama remota. Un claim abandonado se libera con `release`.
- Si Kan falla antes de reclamar, `claim` aborta sin tocar Git. Si falla después de publicar el claim, conserva rama y worktree, informa y permite reintentar; no bloquees OpenSpec.
- `start` sigue existiendo para changes antiguos sin claim previo.

### Guardas

- Revisa `git status` antes de añadir: nunca subas `.env`, credenciales ni artefactos ignorados.
- Un change = una rama = una PR. No reutilices la rama de otro change.
- Ningún change se abre, implementa ni archiva en `main`: usa el worktree del claim.
- No incluyas `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`: son referencia histórica y no se tocan en el flujo de changes.
- Si `gh` falla, deja la rama subida y reporta el error junto con el comando exacto para crear la PR a mano.
- Nunca commitees `.env`, el token, correos ni datos personales. `workflow.json` y `kan.config.json` no contienen secretos.
