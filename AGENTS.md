# AGENTS.md

Instrucciones para agentes que trabajen en este repositorio.

## Núcleo de la aplicación

**Qué es.** Akari es una app de finanzas personales y gastos compartidos, local-first y sin backend: los datos viven en IndexedDB del navegador. No hay autenticación, sincronización ni cifrado; no los añadas sin un change aprobado. La app móvil (React Native) reutilizará `domain`, `data` y `tokens` en un change posterior.

**Capas y dependencias.**

- `packages/tokens`: única fuente de tokens → CSS, preset de Tailwind y tipos. `generated/` no se edita a mano.
- `packages/domain`: entidades, cálculos puros, puertos y casos de uso. No importa React, Next ni Dexie.
- `packages/data`: adaptadores Dexie, migraciones, seed, copia/restauración y ciclo de vida. No contiene JSX ni importa React/Next/`ui`.
- `packages/ui`: componentes presentacionales. No importa `data` ni Next.
- `apps/web`: rutas, shell y hooks headless. Es la única capa que compone todo.

**Dinero y fechas.**

- Importes como enteros en la unidad menor de su divisa (`amountMinor`, `initialBalanceMinor`, `totalMinor`). Usa `money`, `add`, `subtract`, `multiply`, `formatMinor`, `parseAmountToMinor`; nunca sumes dinero con decimales o coma flotante.
- Multidivisa: se agrupa por divisa; el dashboard no convierte. Un `GroupExpense` solo convierte con `exchangeRate` explícito al registrarse.
- `Movement.amountMinor` siempre es positivo; el `type` (`expense`/`income`) decide el signo.
- Fechas de negocio en `YYYY-MM-DD`, técnicas en ISO 8601; al mostrar usa `date-fns` con locale `es`.

**Modelo.** Entidades en `packages/domain/src/types.ts`: `Account` (personal/joint/deposit, TAE en bps, `includeInTotal`), `Movement` (puede enlazar recurrencia, plan de cuotas o gasto grupal), `Recurrence`, `InstallmentPlan`, `Group`/`GroupExpense`/`Transfer` y `Settings`. Tablas y `SCHEMA_VERSION` en `packages/data/src/db.ts`; toda migración conserva los datos.

**Flujo de datos.** Pantalla → hook headless (`apps/web/src/components/hooks.ts`) → caso de uso (`packages/domain/src/services.ts`) → puerto (`packages/domain/src/ports.ts`) → repositorio Dexie. `useLiveQuery` refresca las vistas; no hay estado global: IndexedDB es la fuente de verdad. Los casos de uso lanzan `ValidationError`/`NotFoundError` y toda mutación nueva necesita prueba.

**Capacidades actuales.** Onboarding, cuentas (alta/edición/archivo), movimientos y recurrencias, planes de cuotas, resumen, preguntas rápidas, grupos con reparto (`equal`/`percentage`/`fixed`) y liquidación mínima, ajustes (tema y shell), seed, copia/restauración JSON sin cifrar y reset.

**Fuentes de verdad.** El diseño visual vive en `docs/diseno/` + `design/` y está **congelado**: ningún change de OpenSpec lo modifica (ver «Diseño congelado»). Comportamiento: `openspec/specs/producto/`. Arquitectura, convenciones, mapa diseño→código y desviaciones: `docs/desarrollo/`. Rutas y shell: `docs/desarrollo/arquitectura.md`.

**Verificación.** Antes de dar algo por terminado: `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`. Si cambia una pantalla o un flujo, añade o actualiza E2E (`npm run e2e`).

## FigCraft (MCP)

- **Espera siempre un código de sesión live antes de usar el MCP `figcraft`.** No abras, asumas ni reutilices una sesión por iniciativa propia.
- La sesión live va **vía online** (host remoto accesible por red/Tailscale), no en local.
- Si no has recibido el código, pide al usuario que te lo pase y detente. No llames a ninguna herramienta de `figcraft` (`inspect_ui`, `inspect_document`, `create_node`, `set_properties`, `screenshot`, etc.) hasta tenerlo.
- El código es de un solo uso por sesión: si la sesión cae o cambia el host, vuelve a pedir uno nuevo en lugar de reintentar con el anterior.
- Los detalles de la sesión vigente (host, archivo, enlace de invitación) se anotan en `docs/diseno/estado.md`, pero el agente no los usa como sustituto del código que le entregue el usuario.

## Diseño congelado: OpenSpec va directo a código

La fase de diseño está **parada**. Los changes de OpenSpec se dedican solo a comportamiento, código, pruebas y documentación técnica; no producen ni actualizan diseño.

- **No se tocan** `docs/diseno/`, `design/`, FigCraft ni `openspec/specs/diseno/*`. No son entregables de ningún change y no se reescriben «para alinear» con lo implementado.
- Un change se redacta e implementa con código, pruebas, specs de comportamiento (`openspec/specs/producto/*`) y documentación en `docs/desarrollo/`.
- Si el código se separa del diseño aprobado, no se corrige el diseño: se registra la desviación en `docs/desarrollo/desviaciones.md` y se continúa con el código.
- No abras ni consultes FigCraft para un change. Solo se usa si el usuario lo pide explícitamente y entrega un código de sesión live (ver «FigCraft (MCP)»).
- La rama y la PR de un change no incluyen cambios en `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`. Si aparecen en el working tree, déjalos fuera.
- Solo el usuario puede reabrir la fase de diseño; hasta entonces, cualquier propuesta visual se limita a una nota en `docs/desarrollo/desviaciones.md`.

## Flujo colaborativo: cola, claim y worktrees

Cada trabajo nuevo empieza en una tarjeta de `TO DO` del tablero autoalojado de Kan.bn (`akari/akari`). El flujo canónico es:

1. Revisar la cola.
2. Reclamar una o varias tarjetas con `claim`.
3. Trabajar en el worktree y la sesión que imprime el claim.
4. Proponer, aplicar y archivar el change.
5. Abrir la PR, mover las tarjetas a `DONE` y limpiar el claim.

Un change = una rama `feat/<change-id>` = un worktree = una sesión. No edites `main` ni abras dos sesiones sobre el mismo worktree.

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
- Los puertos se guardan en `.opsx/ports.json` (ignorado por Git). `dev:worktree` arranca Next en el puerto del worktree y `e2e:worktree` ejecuta Playwright con su `E2E_PORT`. No ejecutes los dos a la vez en el mismo worktree: comparten `.next`.

### Aplicar y archivar

- **Al aplicar o retomar** (`/opsx-apply`): confirma que estás en el worktree del change y en `feat/<change-id>`. No muevas la tarjeta; sigue en `IN PROGRESS` o `REVIEW`.
- **Al archivar** (`openspec archive`, skill `openspec-archive-change`): trabaja en la rama del change, archiva, commitear solo el alcance del change, publica la rama y abre la PR.
- **PR.** Usa `node scripts/kan-sync.mjs pr-body <change-id>` como borrador, `gh pr create --base main` con la plantilla y no mergees ni cierres la PR.
- **DONE.** Después de abrir la PR, ejecuta `node scripts/kan-sync.mjs done <change-id> --pr <url>`. Mueve todas las tarjetas del manifiesto a `DONE`, registra la URL y commitea el manifiesto. La PR sigue abierta: `DONE` significa «archivado y PR abierta», no «mergeado».
- **Sin merge.** La revisión y el merge quedan en manos de una persona. Al terminar, informa la URL de la PR y las verificaciones.

### Revisión y liberación

```bash
# PR abierta antes de archivar.
node scripts/kan-sync.mjs review <change-id>

# Abandonar un claim: devuelve tarjetas, borra etiquetas y limpia worktree/rama.
node scripts/kan-sync.mjs release <change-id> [--force]
```

`review` requiere que exista `lists.review` en `kan.config.json` y la lista `REVIEW` en el tablero. `release` se niega si el change está archivado, hay una PR abierta o el worktree tiene cambios sin commitear, salvo `--force`.

### Conflictos y limpieza

- Los archivados compiten por `openspec/specs/**`. Deja solo una PR de archivado lista a la vez o rebasa sobre `main` actualizado antes de pedir revisión; vuelve a ejecutar la CI.
- `check <change-id>` avisa si la rama toca ficheros compartidos (`AGENTS.md`, `package.json`, CI, configuración, documentación de flujo). Coordina esos cambios y mergea en serie.
- Tras el merge, limpia el worktree, la rama y las etiquetas del claim. Un claim abandonado se libera con `release`.
- Si Kan falla antes de reclamar, `claim` aborta sin tocar Git. Si falla después de publicar el claim, conserva rama y worktree, informa y permite reintentar; no bloquees OpenSpec.
- `start` sigue existiendo para changes antiguos sin claim previo.

### Guardas

- Revisa `git status` antes de añadir: nunca subas `.env`, credenciales ni artefactos ignorados.
- Un change = una rama = una PR. No reutilices la rama de otro change.
- Ningún change se abre, implementa ni archiva en `main`: usa el worktree del claim.
- No incluyas `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`: el diseño está congelado.
- Si `gh` falla, deja la rama subida y reporta el error junto con el comando exacto para crear la PR a mano.
- Nunca commitees `.env`, el token, correos ni datos personales. `workflow.json` y `kan.config.json` no contienen secretos.
