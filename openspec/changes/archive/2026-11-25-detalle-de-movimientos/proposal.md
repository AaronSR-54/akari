# Proposal

## Why

Hoy un movimiento solo se puede consultar y editar desde la tabla de `/movimientos` mediante un botón «Editar» en cada fila. Eso mezcla consulta y edición en el listado, no hay una vista con todos los datos de un movimiento y la acción de editar aparece en un contexto donde no debería vivir. El detalle de un movimiento da un lugar estable para consultarlo, editarlo o eliminarlo sin ensuciar las tablas.

## What Changes

- Nueva **modal de detalle de movimiento**, abierta al seleccionar una fila, que muestra concepto, tipo, importe con signo, divisa, fecha, categoría, cuenta asociada, nota, vínculos a recurrencia, plan de plazos o gasto grupal cuando existan, y fecha de creación.
- La modal ofrece las acciones «Editar» y «Eliminar», reutilizando el diálogo de edición y el borrado con deshacer que ya existen. Editar y confirmar el borrado se presentan en la misma superficie, sin apilar modales.
- Se **elimina el botón «Editar» de la tabla de escritorio y de las tarjetas móviles** de `/movimientos`; la columna «Acciones» desaparece.
- Toda la fila de las listas de movimientos abre el detalle: `/movimientos`, «Últimos movimientos» del resumen y de la cuenta.
- Si el movimiento deja de existir mientras el detalle está abierto, la modal se cierra y el listado refleja su ausencia.
- Se actualizan las pruebas E2E del flujo de edición, que hoy editan desde la tabla.

No hay ruta nueva de detalle. No cambia el modelo de datos, ni las migraciones, ni los casos de uso de dominio: `updateMovement` y `deleteMovement` se reutilizan tal cual.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `producto/finanzas-personales`: se añade el requisito de detalle de movimiento y se modifica el requisito de listado, búsqueda y filtros para que la edición deje de ocurrir en línea en la tabla y pase a ocurrir en el detalle.

## Impact

- **Rutas:** ninguna nueva; `/movimientos` deja de abrir el diálogo de edición y pasa a abrir la modal de detalle.
- **Componentes:** nueva `apps/web/src/components/movement-detail-dialog.tsx`; cambios en `movements.tsx`, `dashboard.tsx` y `account-detail.tsx` para abrirla desde las filas.
- **Hooks:** `useMovement(id)` y `useGroupExpense(id)` en `apps/web/src/components/hooks.ts`.
- **UI:** sin cambios; se reutiliza `MovementRow` con `onClick` y `Modal`.
- **Pruebas:** E2E de movimientos (detalle, edición, borrado y accesibilidad de la modal).
- **Documentación:** nueva desviación en `docs/desarrollo/desviaciones.md`, porque el diseño está congelado y no incluye esta modal.
- **Sin cambios** en `packages/domain`, `packages/data`, `packages/ui`, `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
