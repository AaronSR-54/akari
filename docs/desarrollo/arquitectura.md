# Arquitectura

Akari es un monorepo con una aplicación web local-first y paquetes reutilizables. El diseño visual vive en `design/` y `docs/diseno/`; el contrato de comportamiento vive en `openspec/specs/`; el código implementa ambos.

## Estructura

```
akari/
├── apps/
│   └── web/                 Next.js (App Router), rutas y composición
├── packages/
│   ├── tokens/              fuente única de tokens → CSS, preset de Tailwind y tipos
│   ├── ui/                  componentes React presentacionales
│   ├── domain/              entidades, cálculos puros, puertos y casos de uso
│   └── data/                adaptadores IndexedDB, migraciones, seed y copias
├── docs/
│   ├── diseno/              fuente de verdad visual (Figma/FigCraft)
│   └── desarrollo/          arquitectura, puesta en marcha y convenciones
├── design/                  archivos FigCraft/Figma
├── e2e/                     pruebas Playwright
└── openspec/                specs y cambios
```

## Reglas de dependencia

| Paquete | Puede importar | No puede importar |
| --- | --- | --- |
| `tokens` | nada de la app | React, Next, Dexie |
| `domain` | `date-fns` | React, Next, Dexie, `data` |
| `data` | `domain`, `dexie` | React, Next, `ui` |
| `ui` | `domain` (solo tipos y formato), React | `data`, Next |
| `web` | todos los paquetes | — |

`packages/domain` es puro: los cálculos financieros se prueban sin navegador. `packages/data` implementa los puertos del dominio sobre Dexie. `packages/ui` no accede a datos. `apps/web` conecta todo con hooks headless.

## Flujo de datos

```
Componente de pantalla
  → hook headless (useAccounts, useOverview, useGroupSummary…)
    → caso de uso (createAccount, recordMovement, addGroupExpense…)
      → puerto (AccountRepository, MovementRepository…)
        → adaptador Dexie (IndexedDB)
```

Las mutaciones escriben con los casos de uso; `useLiveQuery` vuelve a leer y actualiza la pantalla. No hay estado global adicional: la base local es la fuente de verdad.

## Tokens

`packages/tokens/src/tokens.ts` declara primitivos, semánticos claro/oscuro, escala de espaciado, radios, tamaños, bordes, movimiento, 49 estilos de texto, elevaciones y grids.

`npm run build -w @akari/tokens` genera:

- `packages/tokens/generated/tokens.css`: variables CSS y utilidades `.text-ui-*`, `.text-heading-*`, `.elevation-*`.
- `packages/tokens/generated/tailwind-preset.cjs`: colores semánticos, espaciado, radios, sombras y duraciones para Tailwind.
- `packages/tokens/generated/catalog.json`: catálogo para la prueba de paridad.

La app importa `@akari/tokens/css` y usa el preset en `apps/web/tailwind.config.mjs`. Una prueba compara el catálogo con `docs/diseno/fundamentos.md`.

## Modelo de datos

Los importes se guardan como enteros en la unidad menor de su divisa (`minor`). Nunca se usa coma flotante para dinero. Las entidades están en `packages/domain/src/types.ts`:

- `Account`: cuenta personal, conjunta o de depósito; saldo inicial, TAE e inclusión en el total.
- `Movement`: gasto o ingreso; puede enlazar una recurrencia, un plan de plazos o un gasto grupal.
- `Recurrence`: suscripción o ingreso periódico; próxima fecha y fin opcional.
- `InstallmentPlan`: plan de cuotas con progreso y estado.
- `Group`, `GroupExpense`, `Transfer`: grupos, repartos y liquidaciones.
- `Settings`: tema, shell, onboarding y datos de ejemplo.

El esquema Dexie está versionado en `packages/data/src/db.ts`; la versión 2 añade índices compuestos y normaliza ajustes. Las migraciones conservan los datos.

## Rutas

| Ruta | Pantalla | Flujo |
| --- | --- | --- |
| `/onboarding` | `M01`–`M04` adaptadas | 0 · Onboarding local |
| `/` | `W01` | E · Resumen |
| `/cuentas/nueva` | `M06` en shell web | A · Alta de cuenta |
| `/cuentas/[id]` | `W02` | E · Detalle |
| `/cuentas/[id]/editar` | `M06` edición | A · Edición |
| `/movimientos` | `W03` | B/E · Movimientos |
| `/movimientos/nuevo` | `M09` en shell web | B · Registro |
| `/grupos` | índice de grupos | C/F · Grupos |
| `/grupos/[id]` | `W04` + `M12` | C · Gasto y liquidación |
| `/preguntas` | `W05` | D · Preguntas |
| `/ajustes` | `W06` | F · Datos |

`W07` se verifica como comportamiento responsive y `W08` con el modo `header` del mismo shell.

## Shell y responsive

- `≥ 1024 px`: sidebar compacta (76 px) que se expande con hover, foco o click; o header superior si el modo es `header`.
- `768–1023 px`: barra superior de tablet.
- `< 768 px`: barra superior móvil y navegación inferior; una columna.
- El panel expandido de la sidebar flota sobre el contenido y no desplaza el layout.

## Pruebas

| Capa | Herramienta | Dónde |
| --- | --- | --- |
| Dominio, datos y componentes | Vitest + Testing Library + jest-axe | `packages/**/*.test.ts(x)` |
| Flujos completos, responsive y accesibilidad | Playwright + axe | `e2e/*.spec.ts` |
| Paridad de tokens | Vitest contra `docs/diseno/fundamentos.md` | `packages/tokens/src/tokens.test.ts` |

## Documentos relacionados

- [Puesta en marcha](./puesta-en-marcha.md)
- [Convenciones](./convenciones.md)
- [Mapa diseño → código](./mapa-diseno-codigo.md)
- [Desviaciones y alcance diferido](./desviaciones.md)
