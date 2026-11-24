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

**Fuentes de verdad.** Diseño visual: `docs/diseno/` + `design/` (no se reescribe sin un cambio de diseño aprobado). Comportamiento: `openspec/specs/`. Arquitectura, convenciones, mapa diseño→código y desviaciones: `docs/desarrollo/`. Rutas y shell: `docs/desarrollo/arquitectura.md`.

**Verificación.** Antes de dar algo por terminado: `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`. Si cambia una pantalla o un flujo, añade o actualiza E2E (`npm run e2e`).

## FigCraft (MCP)

- **Espera siempre un código de sesión live antes de usar el MCP `figcraft`.** No abras, asumas ni reutilices una sesión por iniciativa propia.
- La sesión live va **vía online** (host remoto accesible por red/Tailscale), no en local.
- Si no has recibido el código, pide al usuario que te lo pase y detente. No llames a ninguna herramienta de `figcraft` (`inspect_ui`, `inspect_document`, `create_node`, `set_properties`, `screenshot`, etc.) hasta tenerlo.
- El código es de un solo uso por sesión: si la sesión cae o cambia el host, vuelve a pedir uno nuevo en lugar de reintentar con el anterior.
- Los detalles de la sesión vigente (host, archivo, enlace de invitación) se anotan en `docs/diseno/estado.md`, pero el agente no los usa como sustituto del código que le entregue el usuario.

## OpenSpec: rama por change y cierre

Cada change vive en su propia rama `feat/<change-id>` desde el momento en que se crea, y solo termina cuando sus cambios están commiteados en esa rama y con una PR abierta a `main`.

- **Al crear un change** (`openspec new`, `/opsx-propose`, skill `openspec-propose`): lo primero es actualizar `main` (`git fetch origin`, `git switch main`, `git pull --ff-only`) y crear `feat/<change-id>` desde ese HEAD. No escribas proposal, design, specs ni tasks en `main`; todo el ciclo (artefactos, código, specs y archivo) ocurre en esa rama.
- **Al aplicar o retomar** (skill `openspec-apply-change`, `/opsx-apply`): confirma que estás en `feat/<change-id>`. Si la rama no existe (change antiguo), créala desde `main` actualizado antes de seguir.
- **Al archivar** (`openspec archive`, skill `openspec-archive-change`): completa estos pasos.

1. **Rama.** Trabaja en la `feat/<change-id>` ya creada; si no existe, créala desde `main` actualizado antes de commitear. No la recrees si ya existe.
2. **Alcance del commit.** Incluye solo lo del change: `openspec/changes/archive/<fecha>-<change-id>/`, los specs principales que el archivado sincronice en `openspec/specs/` y el código y pruebas derivados de sus tareas. No mezcles cambios ajenos: si el working tree tiene trabajo no relacionado, déjalo fuera; si no puedes distinguir qué pertenece al change, párate y pregunta.
3. **Commit.** Conventional commits en español, p. ej. `feat(<change-id>): archivar el change y sincronizar specs`. No amendes commits ya publicados ni uses `--force`.
4. **Push.** `git push -u origin feat/<change-id>`.
5. **PR.** `gh pr create --base main --title "<tipo>(<change-id>): <resumen>"` con cuerpo en español: resumen del change, deltas de specs, tareas completadas y resultado de las verificaciones (lint/tests/build). Enlaza la carpeta archivada.
6. **Sin merge.** La PR queda abierta para revisión: no la mergees ni la cierres. Termina informando la URL de la PR y las verificaciones ejecutadas.

Guardas:

- Revisa `git status` antes de añadir: nunca subas `.env`, credenciales ni artefactos ignorados.
- Un change = una rama = una PR. No reutilices la rama de otro change.
- Ningún change se abre, implementa ni archiva en `main`: si detectas que estás en `main`, crea la rama antes de continuar.
- Si `gh` falla, deja la rama subida y reporta el error junto con el comando exacto para crear la PR a mano.
