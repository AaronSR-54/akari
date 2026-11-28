# Design

## Context

`/cuentas/[id]` ya carga la cuenta, sus movimientos, planes y recurrencias con `useAccountSummary` y `useRecurrences`. El resumen ya sabe calcular el saldo real, el balance diario del mes (`currentMonthMovements` + `MonthBalance`), la proyección a fin de mes y la comparación de gasto mensual. Las altas de movimiento ya usan `MovementDialog` con `formId` y `showActions={false}`, patrón que reaprovechamos. No existe alta de planes de plazos ni de recurrencias, y el alta de cuenta sigue siendo la ruta `/cuentas/nueva`. `packages/ui` no debe importar Next; `apps/web` compone modales, rutas y hooks.

## Goals / Non-Goals

**Goals:**

- Convertir el detalle en un panel navegable entre cuentas sin volver al resumen.
- Reducir el detalle a la información y acciones que no duplican el resumen.
- Unificar todas las altas de cuenta en un modal y eliminar la ruta de alta.
- Añadir altas reales de planes de plazos y recurrencias con validación y pruebas.
- Mantener los cálculos de saldo y balance en el dominio y reutilizar `MonthBalance`.

**Non-Goals:**

- No se editan ni eliminan planes o recurrencias existentes en este change.
- No se convierte entre divisas ni se agregan totales multi-divisa.
- No se cambia el modelo de datos ni se añaden migraciones.
- No se toca la navegación principal ni se añade una ruta índice `/cuentas`.

## Decisions

### Ruta y modal de alta de cuenta

- Se elimina `apps/web/app/(app)/cuentas/nueva/page.tsx`. El alta vive en `AccountDialog`, un `Modal` que monta `AccountForm` con `formId`, `showActions={false}` y `framed={false}`; el pie del modal envía el formulario.
- `AccountForm` gana `formId`, `showActions`, `framed` y `onCancel`, siguiendo la API que ya usa `MovementForm`, para no duplicar formularios.
- Al guardar, el diálogo cierra y navega a `/cuentas/<id>`; así el alta desde el resumen termina en el panel de la cuenta recién creada y el alta desde el selector no deja al usuario en una pantalla vacía.
- Alternativa considerada: mantener la ruta y añadir el modal solo en algunos accesos. Se descarta porque el usuario pidió una única forma de alta y eliminar la ruta.

### Selector de cuentas

- `AccountMenu` vive en `apps/web/src/components/account-menu.tsx` y recibe `accounts`, `balances`, `currentId` y `onCreateAccount`.
- El disparador es un chevron junto al nombre de la cuenta en la cabecera (`aria-label="Cambiar de cuenta"`, `aria-haspopup="listbox"`). El nombre no se duplica: lo pinta la cabecera de página o la cabecera del shell y el chevron viaja como `titleAction` por el contexto de `PageTitle`.
- En escritorio se despliega un panel en una sola columna con la versión reducida de `AccountCard` (banco y nombre, importe y tipo en la esquina superior derecha, donde el resumen pinta el estado; sin actualización ni «Saldo disponible»), reutilizada del resumen; la cuenta actual queda marcada con un anillo interior. Se cierra con Escape, con clic fuera o al elegir.
- En móvil el chevron abre un `Modal` «Cambiar de cuenta» con las mismas tarjetas reducidas y una acción «Nueva cuenta» que cierra el modal y abre `AccountDialog`.
- La navegación entre cuentas usa `router.push('/cuentas/<id>')`, de modo que el enlace es compartible y el historial funciona.
- Se elimina el breadcrumb «Resumen / Cuentas / nombre» y la barra de tipo, divisa y actualización: la información vive en «Detalles de la cuenta».

### Composición del panel

- Cabecera: `PageHeaderResponsive` con el nombre de la cuenta y el chevron del selector. Sin breadcrumb, sin tipo, sin divisa y sin «actualizado»; sin acciones. En el shell lateral el nombre y el chevron pasan a la cabecera superior mediante `titleAction`.
- Cifra única: héroe con el importe y «Saldo actual · fecha» debajo, sin tarjeta. Se reducen los huecos con la cabecera. Se eliminan las tarjetas de estimado y de movimientos del mes.
- Panel a pantalla completa bajo la cabecera, sin padding superior y con el scroll en la raíz de la aplicación (`main`), no en la columna derecha. El saldo y la columna izquierda (gráfica, balance y detalles) quedan siempre fijos con `position: sticky` y su `top` natural; la derecha (movimientos, próximas cuotas y recurrentes) empieza debajo del saldo y es la única que avanza. La cabecera de escritorio es fija, translúcida y con desenfoque de fondo: el contenido se desplaza por detrás de ella y se ve difuminado, así la columna sube hasta el borde superior de la raíz sin cortarse a la altura del saldo. Solo la salida inferior se funde con la máscara de degradado de 20 px del panel de avisos. La gráfica se ajusta al alto disponible con un máximo de 356 px para conservar su tamaño acordado y no crecer al liberar espacio, y reserva un margen superior de 10 px para que el punto de hover del valor máximo no quede oculto bajo el saldo. Al final del scroll, el último panel de la derecha (recurrentes) termina a la misma altura que el último de la izquierda (detalles): el espacio inferior que sobra se añade como relleno del final de la columna derecha, no como padding de la raíz.
- Balance: gráfica `MonthBalance` sin tarjeta con la tarjeta «Balance del mes» debajo (`hero-card-shadow`, `border-t-0`) y los mismos cálculos del dashboard, pero con los movimientos y la base de la cuenta:
  - `openingBalanceMinor = calculateAccountBalance(account, movements, cierre del mes anterior)`.
  - `month = currentMonthMovements(accountMovements, currency, hoy, openingBalanceMinor)`.
  - Se muestran el neto del mes con signo y color y el estimado a fin de mes de `projected` (ya calculado por `useAccountSummary`).
- Detalles: se mantiene la tarjeta con `InfoRow`, se mejora el espaciado y se añade «Editar» en su cabecera. El borrado sale del detalle y pasa a la edición.
- Últimos movimientos: `SectionHeader` con «Ver todos» y «Añadir movimiento» en escritorio; subtítulo con `N movimientos este mes · ±X % frente al anterior` (o «sin comparación»); en móvil el botón de añadir va al pie. El alta abre `MovementDialog` con `defaultAccountId` y sin cambiar de ruta.
- Plazos: reutiliza el mismo componente `UpcomingInstallments` del resumen, con su título «Próximas cuotas» y sus filas con progreso, próxima cuota y enlace a `/cuotas/[id]`, donde se registra la cuota; añade la acción «Añadir plazo» en la cabecera y un estado vacío con la misma acción de alta.
- Recurrentes: lista de concepto e importe con «Añadir recurrente» y estado vacío equivalente.

### Altas de plazos y recurrencias

- `InstallmentPlanDialog` monta `InstallmentPlanForm`: concepto, importe total, número de cuotas, primera fecha y frecuencia; la divisa se toma de la cuenta y se muestra en solo lectura. Al guardar llama a `createInstallmentPlan` y el panel se refresca por `useLiveQuery`.
- `RecurrenceDialog` monta `RecurrenceForm`: tipo, importe, concepto, categoría, frecuencia, próxima fecha y fin opcional. Al guardar llama a `createRecurrence`.
- Ambos formularios usan el patrón `formId`/`showActions={false}`/`framed={false}` y comparten el pie de modal con «Cancelar» y guardar.
- `createInstallmentPlan(repositories, input)` y `createRecurrence(repositories, input)` viven en `packages/domain/src/services.ts`, validan cuenta, importes, fechas y frecuencia, fijan la divisa de la cuenta y generan ids `plan_`/`rec_` con `createId`. Ninguno crea movimientos.
- Alternativa considerada: crear la recurrencia desde `MovementDialog` con repetición. Se descarta porque eso registra un movimiento en el acto y el panel de recurrentes debe poder crecer sin pagar.

### Entradas al alta de cuenta

- `DashboardScreen` mantiene el estado del diálogo y lo pasa a los accesos: píldora «Nueva cuenta», estado vacío, primeros pasos y acciones del panel. La píldora pasa de `Link` a `Button` con el mismo estilo.
- `MovementDialog` y `NewMovementScreen` muestran «Crear cuenta» como botón que abre `AccountDialog` apilado cuando no hay cuentas.
- `AccountMenu` ofrece la misma acción en su panel de escritorio y en su modal móvil.
- El enlace «Gestionar cuentas» del panel del resumen se elimina: los bloques ya abren el detalle y el selector vive allí. Esto evita un destino sin ruta índice.

### Borrado en la edición

- `AccountEditScreen` incorpora el botón «Eliminar» y el `Modal` de confirmación que hoy vive en el detalle, reutilizando `deleteAccount` y el mensaje que distingue cuentas con y sin movimientos.
- El detalle deja de montar ese modal y de importar `deleteAccount`.

## Risks / Trade-offs

- [El worktree comparte `node_modules` con el checkout principal y `@akari/*` resuelve a `main`, así que los cambios de `domain` no se ven] → Durante el apply se recrea un `node_modules` local con enlaces a los paquetes del worktree, sin tocar el checkout principal ni commitear nada; cuando `worktree-env-fix` esté mergeado, el shim deja de ser necesario.
- [El selector duplica la navegación que ya ofrecen los bloques del resumen] → El resumen sigue siendo el punto de entrada; el selector solo evita volver atrás para cambiar de cuenta.
- [Añadir un modal de alta de cuenta desde otro modal (movimiento) apila overlays] → `overlay-stack` ya soporta modales apilados con Escape y bloqueo de scroll; se prueba en E2E.
- [El balance del mes necesita la base del cierre anterior y puede quedar plano sin movimientos] → Se reutiliza el cálculo del dashboard y se muestra el estado vacío existente para cuentas sin movimientos.
- [Plazos y recurrentes sin edición pueden quedar obsoletos] → Fuera de alcance declarado; se podrá añadir en un change posterior.
- [La eliminación de la ruta rompe deep links antiguos] → Se actualizan enlaces, documentación y E2E; una URL antigua cae en el estado de página no encontrada.

## Migration Plan

- Sin migraciones de datos ni cambios en Supabase. Se elimina una ruta aditiva y se sustituyen enlaces internos; el rollback consiste en restaurar la página de alta y los enlaces.
