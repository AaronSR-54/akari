# akari

Aplicación de finanzas personales y gastos compartidos, local-first, construida a partir de un diseño aprobado en Figma/FigCraft y especificada con [OpenSpec](https://github.com/Fission-AI/OpenSpec).

El repositorio reúne diseño, documentación, specs y código:

```
akari/
├── apps/web/                Next.js (App Router) + React + Tailwind
├── packages/
│   ├── tokens/              tokens de diseño → CSS, preset de Tailwind y tipos
│   ├── ui/                  componentes React del design system
│   ├── domain/              entidades, cálculos financieros, puertos y casos de uso
│   └── data/                IndexedDB (Dexie), migraciones, seed y copias
├── docs/
│   ├── diseno/              fuente de verdad visual (fundamentos, componentes, flujos)
│   └── desarrollo/          arquitectura, puesta en marcha, convenciones y mapa
├── design/                  archivos FigCraft/Figma
├── e2e/                     Playwright + axe
└── openspec/                specs principales y cambios
```

## Empezar

Requisitos: Node.js ≥ 20.9 y npm ≥ 10.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. La primera vez te llevará a `/onboarding`, donde puedes empezar vacío o cargar datos de ejemplo.

## Comandos

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Desarrollo web en el puerto 3000. |
| `npm run build` | Genera tokens y compila la app. |
| `npm run start -w @akari/web` | Sirve el build de producción. |
| `npm test` | Vitest: dominio, datos, componentes y paridad de tokens. |
| `npm run test:coverage` | Cobertura de dominio y datos. |
| `npm run typecheck` | TypeScript en todos los workspaces. |
| `npm run lint` | ESLint. |
| `npx playwright install chromium` | Instala el navegador de E2E (una vez). |
| `npm run e2e` | Flujos completos, responsive y accesibilidad. |
| `npm run build -w @akari/tokens` | Regenera CSS, preset y catálogo de tokens. |
| `node scripts/kan-sync.mjs queue --json` | Revisa la cola de Kan.bn sin escribir. |
| `node scripts/kan-sync.mjs claim <card...> --change <id>` | Reclama una o varias tarjetas y crea rama, worktree y change. |
| `node scripts/kan-sync.mjs done <change-id> --pr <url>` | Mueve las tarjetas a DONE al archivar y registra la PR. |
| `node scripts/kan-sync.mjs release <change-id>` | Devuelve tarjetas y limpia un claim abandonado. |
| `npm run dev:worktree` | Arranca Next en el puerto del worktree. |
| `npm run e2e:worktree` | Ejecuta E2E con el puerto del worktree. |

## Documentación

- [Arquitectura](docs/desarrollo/arquitectura.md)
- [Puesta en marcha](docs/desarrollo/puesta-en-marcha.md)
- [Convenciones](docs/desarrollo/convenciones.md)
- [Mapa diseño → código](docs/desarrollo/mapa-diseno-codigo.md)
- [Desviaciones y alcance diferido](docs/desarrollo/desviaciones.md)
- [Kan.bn: tarjetas por change](docs/desarrollo/kanban.md)
- [Flujo colaborativo: cola, worktrees, sesiones y PR](docs/desarrollo/flujo-colaborativo.md)
- [Estado del diseño](docs/diseno/estado.md) y [handoff](docs/diseno/handoff.md)

El diseño visual sigue viviendo en `docs/diseno/` y `design/`; no se reescribe desde el código. Las specs `openspec/specs/producto/*` describen el comportamiento implementado.

## Flujo de trabajo con OpenSpec

| Comando | Para qué |
| --- | --- |
| `/opsx-propose "idea"` | Propuesta completa: proposal + design + specs + tasks. |
| `/opsx-apply` | Implementar las tareas del cambio activo. |
| `/opsx-explore` | Explorar el problema antes de escribir nada. |
| `/opsx-update` | Revisar o reajustar un plan existente. |
| `/opsx-sync` | Pasar deltas de un cambio a las specs principales. |
| `/opsx-archive` | Cerrar un cambio completado. |
| `/kan-queue` | Revisar la cola de Kan.bn sin escribir. |

## Estado actual

- Implementación web local-first: cuentas, movimientos, dashboard, preguntas rápidas, gastos grupales, liquidación y ajustes.
- Sin backend, autenticación, sincronización ni cifrado. Ver [desviaciones](docs/desarrollo/desviaciones.md).
- La app móvil React Native queda para un cambio posterior reutilizando los paquetes compartidos.
