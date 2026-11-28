# Arquitectura

Akari es un monorepo con una aplicación web local-first, con sincronización opcional a Supabase, y paquetes reutilizables. El código es la fuente de verdad para el comportamiento y para lo visual: la interfaz se mejora directamente en código. `design/` y `docs/diseno/` son referencia histórica y no bloquean los cambios; el contrato de comportamiento viviente está en `openspec/specs/producto/`.

## Estructura

```
akari/
├── apps/
│   └── web/                 Next.js (App Router), rutas y composición
├── packages/
│   ├── tokens/              fuente única de tokens → CSS, preset de Tailwind y tipos
│   ├── ui/                  componentes React presentacionales
│   ├── domain/              entidades, cálculos puros, puertos y casos de uso
│   └── data/                adaptadores IndexedDB y Supabase, sync, migraciones y copias
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
| `data` | `domain`, `dexie`, `@supabase/supabase-js` | React, Next, `ui` |
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

Con una cuenta conectada, los repositorios de `Providers` registran cada cambio en `syncState` y el `CloudProvider` empuja los pendientes a Supabase y descarga los remotos. La nube es una copia de continuidad: la lectura y la escritura siguen siendo locales. El detalle está en [Nube y sincronización](./nube-supabase.md).

## Tokens

`packages/tokens/src/tokens.ts` declara primitivos, semánticos claro/oscuro, escala de espaciado, radios, tamaños, bordes, movimiento, 49 estilos de texto, elevaciones y grids.

`npm run build -w @akari/tokens` genera:

- `packages/tokens/generated/tokens.css`: variables CSS y utilidades `.text-ui-*`, `.text-heading-*`, `.elevation-*`.
- `packages/tokens/generated/tailwind-preset.cjs`: colores semánticos, espaciado, radios, sombras y duraciones para Tailwind.
- `packages/tokens/generated/catalog.json`: catálogo para la prueba de paridad.

La app importa `@akari/tokens/css` y usa el preset en `apps/web/tailwind.config.mjs`. Una prueba compara el catálogo con `docs/diseno/fundamentos.md`.

## Modelo de datos

Los importes se guardan como enteros en la unidad menor de su divisa (`minor`). Nunca se usa coma flotante para dinero. Las entidades están en `packages/domain/src/types.ts`:

- `Account`: cuenta personal, conjunta o de depósito; saldo inicial, TAE e inclusión en el total. Su `bankId` es opcional y apunta al catálogo `bankCatalog` de `packages/domain/src/banks.ts`; los iconos se sirven desde `apps/web/public/banks/`.
- `Movement`: gasto o ingreso; puede enlazar una recurrencia, un plan de plazos o un gasto grupal, y guarda el miembro autor cuando la cuenta es conjunta.
- `Recurrence`: suscripción o ingreso periódico; próxima fecha y fin opcional.
- `InstallmentPlan`: plan de cuotas con progreso y estado.
- `Group`, `GroupExpense`, `Transfer`: grupos, repartos y liquidaciones.
- `Settings`: tema, shell, onboarding y datos de ejemplo.

El esquema Dexie está versionado en `packages/data/src/db.ts`; la versión 2 añade índices compuestos y normaliza ajustes, la versión 3 incorpora `bankId` en el índice de cuentas y el autor del movimiento, y la versión 4 añade `syncState` y `syncMeta` para la nube. Las migraciones conservan los datos.

Supabase replica las entidades en tablas PostgreSQL con `user_id`, `updated_at` y `deleted_at`, protegidas con RLS. Cada cambio del esquema remoto vive en `supabase/migrations/` como un archivo SQL aplicable por separado.

## Rutas

| Ruta | Pantalla | Flujo |
| --- | --- | --- |
| `/onboarding` | `M01`–`M04` adaptadas | 0 · Asistente de nombre, divisa, ingreso, bancos y nube |
| `/entrar` | formulario de acceso | 0/F · Cuenta en la nube (acceso y alta) |
| `/` | `W01` | E · Resumen |
| `/cuentas/nueva` | `M06` en shell web | A · Alta de cuenta |
| `/cuentas/[id]` | `W02` | E · Detalle |
| `/cuentas/[id]/editar` | `M06` edición | A · Edición |
| `/cuotas/[id]` | Detalle de pago a plazos | E · Progreso y registro |
| `/movimientos` | `W03` + modal de alta y edición | B/E · Movimientos |
| `/grupos` | índice de grupos | C/F · Grupos |
| `/grupos/[id]` | `W04` + `M12` | C · Gasto y liquidación |
| `/preguntas` | `W05` | D · Preguntas |
| `/ajustes` | `W06` | F · Datos |

El alta de movimientos vive en un compositor global montado en el shell: el resumen, la barra móvil, el detalle de cuenta, las preguntas rápidas y el listado abren el mismo modal sobre la pantalla actual, con la cuenta preseleccionada cuando el acceso lo permite. Al guardar no se cambia de URL. El detalle de un movimiento reutiliza el formulario en modo lectura y ofrece «Editar» para activarlo; la edición conserva el borrado con deshacer. El detalle de `/cuotas/[id]` y el bloque de plazos del detalle de cuenta comparten los cálculos de `installmentProgress`, `installmentStatus` y `nextInstallment`, y registran con `registerInstallment`.

`W07` se verifica como comportamiento responsive y `W08` con el modo `header` del mismo shell.

## Shell y responsive

- `≥ 1024 px`: sidebar compacta (76 px) que se expande con hover, foco o click; o header superior si el modo es `header`.
- `768–1023 px`: barra superior de tablet.
- `< 768 px`: barra superior móvil y navegación inferior; una columna.
- El panel expandido de la sidebar flota sobre el contenido y no desplaza el layout.
- La navegación principal permanece fija al hacer scroll. En la variante sidebar, la sidebar se pega a 16 px y la barra de acciones (buscador y avisos) usa `sticky top-0` con una compensación del inset del shell: permanece pegada al borde superior también en reposo. En la variante `header`, `HeaderNav` es la única barra superior y también ocupa el borde superior desde el reposo.
- No hay animaciones de ocultación o aparición ligadas al scroll. El overscroll elástico del documento se contiene desde 768 px (`overscroll-behavior-y: none` en la raíz); en móvil se conserva el comportamiento nativo.
- Las barras fijas usan superficies opacas de los tokens (`surface/canvas` en escritorio y `surface/default` en la navegación inferior móvil). No se usan modificadores de opacidad sobre los tokens de color.
- La cabecera de la variante sidebar muestra el título de la sección como único H1 visible en escritorio y, debajo, su subtítulo (`meta`/`description`); el encabezado del contenido no repite ninguno en `lg`. `actions` y `breadcrumbs` siguen en el contenido. La identidad de la persona se muestra una sola vez, en el pie de la sidebar o en `HeaderNav`; la cabecera no repite el avatar y conserva el buscador y el botón de avisos.
- El `main` añade 24 px de padding superior (`pt-6`) en todos los breakpoints para separar el primer bloque del contenido del borde inferior de la cabecera.
- La campana del shell despliega un panel de avisos alimentado por `useNotifications`, que llama al selector puro `buildNotifications` y se refresca con `useLiveQuery`. Al abrirse, el panel difumina el fondo de la página con el mismo desenfoque ligero que las modales y usa una superficie translúcida; muestra en una única lista ordenada por fecha los pagos próximos (con saldo de la cuenta y cobertura), la actividad de cuentas conjuntas (con el autor del movimiento) y las liquidaciones pendientes o recibidas del perfil «Marta». Los movimientos de cuentas conjuntas guardan `memberId`; al abrir el panel se marcan los avisos como vistos en `Settings.seenNotificationIds` y la campana solo cuenta los no vistos. Pulsar un pago registra el movimiento o la cuota; pulsar una cuenta o liquidación navega a su detalle.

## Pruebas

| Capa | Herramienta | Dónde |
| --- | --- | --- |
| Dominio, datos y componentes | Vitest + Testing Library + jest-axe | `packages/**/*.test.ts(x)` |
| Flujos completos, responsive y accesibilidad | Playwright + axe | `e2e/*.spec.ts` |
| Paridad de tokens | Vitest contra `docs/diseno/fundamentos.md` | `packages/tokens/src/tokens.test.ts` |

## Documentos relacionados

- [Nube y sincronización](./nube-supabase.md)
- [Iconos de bancos](./iconos-bancos.md)
- [Puesta en marcha](./puesta-en-marcha.md)
- [Convenciones](./convenciones.md)
- [Mapa diseño → código](./mapa-diseno-codigo.md)
- [Desviaciones y alcance diferido](./desviaciones.md)
