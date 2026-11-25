# Proposal

## Why

El resumen presentaba las cuentas como tres tarjetas independientes dentro de una sección con encabezado. Se unifican en una sola superficie que ocupa todo el ancho, con un bloque por cuenta, manteniendo el encabezado «Cuentas / Gestionar cuentas» para que la fila tenga título y acción como «Últimos movimientos».

## What Changes

- Unificar todas las cuentas en **un único panel** que ocupa todo el ancho del contenido, directamente debajo de los accesos rápidos. Sustituye la fila de tres `AccountCard` independientes por una sola superficie con un bloque por cuenta: bloques lado a lado en escritorio y apilados en móvil, sin tabla ni líneas divisorias. Cada bloque se distingue por un fondo `surface-sunken` con esquinas redondeadas dentro de la tarjeta, separado por espaciado. El ancho se justifica repartiendo los bloques y el panel se reajusta con una, ninguna o muchas cuentas.
- Mantener el encabezado de la sección con el mismo estilo que «Últimos movimientos»: título «Cuentas» y enlace «Gestionar cuentas» a `/cuentas/nueva`, **dentro de la tarjeta única**, sobre los bloques. El `section` conserva su nombre accesible mediante `aria-labelledby`.
- **No tocar nada de lo que hay encima de ese encabezado**: saldo, gráfica del mes, últimos movimientos, balance del mes, accesos rápidos, sus clases, el `useLayoutEffect`/`ResizeObserver` que ajusta la altura de la gráfica y la unión gráfica→balance quedan exactamente como están.
- Añadir/aserciones E2E del encabezado, del enlace a `/cuentas/nueva`, de un único panel responsive y del escalado del panel con una y varias cuentas.

## Capabilities

### New Capabilities

_(ninguna)_

### Modified Capabilities

- `producto/dashboard-hero`: la fila de cuentas del resumen pasa de tarjetas independientes a un único panel de bloques, conservando el encabezado «Cuentas» con su enlace «Gestionar cuentas».

## Impact

- `apps/web/src/components/pages/dashboard.tsx`: único cambio de código; dentro del `section aria-labelledby="cuentas"` se sustituye la `Grid` de `AccountCard` por un panel único de bloques con `aria-label` heredado del encabezado. El resto del archivo, en particular el bloque de la gráfica y el balance, no se modifica.
- `e2e/dashboard.spec.ts`: aserciones sobre el encabezado y su enlace, la presencia de un único panel responsive y el escalado del panel con una y varias cuentas.
- Sin cambios en `packages/*`, en datos, en dependencias, en rutas ni en `docs/diseno/`. La composición difiere del frame `W01` congelado; se registra en `docs/desarrollo/desviaciones.md` sin tocar el diseño.
