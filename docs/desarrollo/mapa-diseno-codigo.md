# Mapa diseño → código

Este documento relaciona el diseño aprobado, las specs `producto/*` y la implementación web. Es la referencia para saber qué está construido, qué es una adaptación y qué queda para fases posteriores.

## 1. Pantallas

| Código | Pantalla de diseño | Ruta / implementación | Estado |
| --- | --- | --- | --- |
| `M01` | Bienvenida | `/onboarding` | Implementada (sin contraseña) |
| `M02` | Protección / contraseña | — | Diferida: cifrado y contraseña local |
| `M03` | Desbloqueo | — | Diferida con el cifrado |
| `M04` | Sincronización | `/onboarding` (nota informativa) | Diferida: sin nube |
| `M05` | Resumen | `/` (`DashboardScreen`) | Implementada |
| `M06` | Alta de cuenta | Modal `AccountDialog` desde el resumen y el selector; edición en `/cuentas/[id]/editar` | Implementada (alta en modal) |
| `M07` | Detalle de cuenta | `/cuentas/[id]` | Implementada (panel con selector de cuentas) |
| `M08` | Movimientos | `/movimientos` con alta en modal y detalle/edición del movimiento | Implementada |
| `M09` | Nuevo movimiento | `/movimientos/nuevo` | Implementada en shell web |
| `M10` | Plazos | Sección «Próximas cuotas» en `/cuentas/[id]` | Implementada (consulta y enlace al detalle del plan) |
| `M11` | Gasto grupal | Formulario en `/grupos/[id]` | Implementada |
| `M12` | Liquidación | Sección «Liquidación» en `/grupos/[id]` | Implementada |
| `M13` | Pregunta rápida | Tarjetas de `/preguntas` | Implementada |
| `M14` | Cuenta conjunta / miembros | Miembros y roles locales en `/grupos/[id]` | Parcial: sin invitaciones remotas |
| `M15` | Avisos | Banner de próximo pago en `/` | Parcial: sin notificaciones del sistema |
| `M16` | Widget nativo | — | Diferida a la app móvil |
| `M17` | Ajustes | `/ajustes` | Implementada (sin sync) |
| `M18` | Movimientos vacío | `StatePage` en `/movimientos` | Implementada |
| `M19` | Sin conexión | Local-first; estado disponible en `StatePage` | Parcial: sin cola de sincronización |
| `W01` | Resumen multi-cuenta | `/` | Implementada (saldo y evolución del saldo del mes sin caja, tarjeta de balance con signo, color y saldo total estimado bajo la gráfica, próximo pago, cuentas y movimientos; sin gráfico semanal) |
| `W02` | Detalle de cuenta | `/cuentas/[id]` | Implementada (panel con selector, balance del mes y altas de plazos y recurrentes) |
| `W03` | Movimientos (tabla) | `/movimientos` | Implementada (chips, tabla y paginación) |
| `W04` | Gasto grupal (web) | `/grupos/[id]` | Implementada (compositor de 3 columnas + liquidación) |
| `W05` | Preguntas rápidas | `/preguntas` | Implementada |
| `W06` | Datos y sincronización | `/ajustes` | Parcial: datos, copia y almacenamiento; sync diferida |
| `W07` | Tablet 768 | Shell responsive | Verificada en E2E a 900 y 768 |
| `W08` | Resumen con header | Modo `header` del shell | Implementada |

## 2. Requisitos de specs → implementación

### `producto/fundaciones-ui`

| Requisito | Implementación | Verificación |
| --- | --- | --- |
| Tokens de diseño como fuente única | `packages/tokens/src/tokens.ts`, `generated/*` | `packages/tokens/src/tokens.test.ts` |
| Temas claro y oscuro | `theme.tsx`, `themeScript`, variables CSS | E2E `questions-settings` (tema persiste), axe oscuro |
| Tipografía Inter y escalas | `@fontsource-variable/inter`, utilidades generadas | `tokens.test.ts`, pruebas de componentes |
| Espaciado, radios, elevación y layout | preset de Tailwind y CSS generado | E2E `shell` (responsive sin desbordamiento) |
| Movimiento y reducción | tokens `motion/*`, bloque `prefers-reduced-motion` | `tokens.test.ts` (CSS generado) |
| Iconografía y visualización | `icons.tsx`, `ChartArea`, `ChartBars`, `ChartSparkline` | `logo.test.tsx`, `data-display.test.tsx`, axe |

### `producto/componentes`

| Requisito | Implementación | Verificación |
| --- | --- | --- |
| Componentes reutilizables | `packages/ui/src/*` | pruebas de componentes |
| Variantes y estados interactivos | `buttons.tsx` | `buttons.test.tsx` |
| Accesibilidad de componentes | foco, `aria-*`, 44 px en `ui` | `feedback.test.tsx`, `accessibility.test.tsx`, axe E2E |
| Formularios con validación visible | `fields.tsx` | `fields.test.tsx` |
| Selector de opción única con panel propio | `fields.tsx` (`SelectField`, `SelectPill`), `icons.tsx` | `fields.test.tsx`, `accessibility.test.tsx`, E2E |
| Presentación de importes | `data-display.tsx`, `money.ts` | `data-display.test.tsx`, `money.test.ts` |
| Feedback y overlays con salida | `feedback.tsx` | `feedback.test.tsx` |
| Sin estilos ni componentes duplicados | convención + revisión de librería | `docs/desarrollo/convenciones.md`, revisión de PR |

### `producto/shell-web`

| Requisito | Implementación | Verificación |
| --- | --- | --- |
| Navegación principal de escritorio | `Sidebar` | E2E `shell` |
| Header superior alternativo | `HeaderNav`, ajuste `shellMode` | E2E `questions-settings` |
| Comportamiento responsive | breakpoints 1024/768, `MobileNav` | E2E `shell` (1440/900/390) |
| Rutas, deep links y contexto | App Router, `PageTitle`, breadcrumbs | E2E `shell` (cuenta y grupo) |
| Atajos de teclado | `⌘K`/`Ctrl+K`, Escape | E2E `shell` |
| Estados de página del shell | `Skeleton`, `StatePage`, gates | pruebas de componentes y páginas |

### `producto/finanzas-personales`

| Requisito | Implementación | Verificación |
| --- | --- | --- |
| Alta y edición de cuentas | `AccountForm` | E2E `accounts-movements`, `services.test.ts` |
| Saldo agregado y estimado | `accounts.ts`, `getOverview` | `accounts.test.ts`, E2E resumen |
| Registro de movimientos | `MovementForm`, `recordMovement` | E2E `accounts-movements`, `services.test.ts` |
| Listado, búsqueda y filtros | `MovementsScreen` | E2E `accounts-movements` |
| Suscripciones e ingresos periódicos | `recurrence.ts`, detalle de cuenta | `recurrence.test.ts` |
| Próximas cuotas | `UpcomingInstallments`, `ProgressInstallments` | `recurrence.test.ts`, detalle de cuenta |
| Detalle de cuenta | `AccountDetailScreen`, `AccountMenu`, `AccountCard` | E2E `accounts-movements`, `account-detail-panel` |
| Alta de cuenta | `AccountForm`, `AccountDialog` | E2E `accounts-movements`, `account-detail-panel` |
| Dashboard y preguntas rápidas | `DashboardScreen`, `QuestionsScreen`, `getQuickAnswers` | E2E `questions-settings`, `services.test.ts` |

### `producto/dashboard-hero`

| Requisito | Implementación | Verificación |
| --- | --- | --- |
| Hero sin contenedor | `DashboardScreen` (bloques `data-hero`) | E2E `dashboard.spec.ts` |
| Saldo diario del mes y base a día 1 | `currentMonthMovements`, `getOverview.month`, apertura en `getOverview` | `accounts.test.ts`, `services.test.ts`, E2E `dashboard.spec.ts` |
| Gráfica de saldo con detalle diario | `MonthBalance` | `month-balance.test.tsx`, `accessibility.test.tsx`, axe, E2E `dashboard.spec.ts` |
| Tarjeta de balance con saldo total estimado | `StatCard` en `data-hero="month-summary"`, `overview.projections` | `services.test.ts`, E2E `dashboard.spec.ts` |
| Entrada animada | `@keyframes hero-chart-emerge`, `globals.css` | E2E `dashboard.spec.ts` (movimiento reducido) |
| Retirada del gráfico semanal | eliminación de `ChartArea` del dashboard | E2E `dashboard.spec.ts` |

### `producto/gastos-grupales`

| Requisito | Implementación | Verificación |
| --- | --- | --- |
| Grupos y miembros | `GroupForm`, `GroupDetailScreen` | E2E `groups` |
| Reparto editable | `GroupExpenseForm`, `group.ts` | `group.test.ts`, E2E porcentaje |
| Gasto sin cuenta asociada | opción «Sin cuenta» en formulario | `group.test.ts`, E2E grupo |
| Liquidación entre participantes | panel de liquidación, `computeSettlement` | `group.test.ts`, E2E liquidación |
| Cuenta de cobro y divisas | selector de cuenta, tipo de cambio en formulario | `group.test.ts` (`convertMinor`) |
| Historial y estado del gasto | historial en `/grupos/[id]` | E2E `groups` |

### `producto/datos-locales`

| Requisito | Implementación | Verificación |
| --- | --- | --- |
| Inicialización del espacio | `/onboarding`, `Dexie` | E2E `onboarding` |
| Persistencia local-first | adaptadores Dexie | E2E recarga y `repositories.test.ts` |
| Integridad del modelo | validaciones de casos de uso y repositorios | `services.test.ts`, `repositories.test.ts` |
| Migraciones y versionado | versión 1 → 2 en `db.ts` | `migration.test.ts` |
| Datos de ejemplo y reinicio | `seed.ts`, `lifecycle.ts` | `lifecycle.test.ts`, E2E ajustes |
| Copia local exportable | `backup.ts`, ajustes | `backup.test.ts`, E2E ajustes |
| Errores de almacenamiento | `toStorageError`, `wrapRepository` | `lifecycle.test.ts` |

## 3. Flujos E2E

| Flujo | Recorrido | Prueba |
| --- | --- | --- |
| 0 · Onboarding local | `/onboarding → /` | `e2e/onboarding.spec.ts` |
| A · Alta de cuenta | `/ → modal «Nueva cuenta» → /cuentas/[id]` | `e2e/accounts-movements.spec.ts` |
| B · Registro de movimiento | `/cuentas/[id] → /movimientos/nuevo → /movimientos` y alta/edición en modal desde `/movimientos` | `e2e/accounts-movements.spec.ts`, `e2e/movement-dialog.spec.ts` |
| C · Gasto grupal y liquidación | `/grupos → /grupos/[id]` | `e2e/groups.spec.ts` |
| D · Preguntas y detalle | `/ → /preguntas`, `/cuentas/[id]` | `e2e/questions-settings.spec.ts`, `e2e/shell.spec.ts` |
| E · Resumen y cuentas | `/ → /cuentas/[id] → /movimientos` | `e2e/dashboard.spec.ts`, `e2e/shell.spec.ts`, `e2e/accounts-movements.spec.ts` |
| F · Grupos y ajustes | `/grupos/[id] → /ajustes` | `e2e/groups.spec.ts`, `e2e/questions-settings.spec.ts` |

## 4. Cómo mantener el mapa

1. Una pantalla nueva se añade a la tabla con su código de diseño, ruta, componente y prueba.
2. Un requisito nuevo en `openspec/specs/producto/*` se añade a la tabla de su capacidad.
3. Una pantalla diferida se mueve de «Diferida» a «Implementada» solo cuando tiene prueba y estado vacío/error.
4. Si el diseño cambia, actualiza primero `docs/diseno/` y el archivo; después este mapa y las specs.
