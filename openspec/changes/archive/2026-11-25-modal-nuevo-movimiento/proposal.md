# Proposal

## Why

Crear o editar un movimiento desde `/movimientos` obliga a salir del listado: el alta navega a `/movimientos/nuevo` y la edición abre un diálogo reducido que solo deja cambiar concepto, importe, fecha y categoría. La cuenta, el tipo y la nota no se pueden editar, así que hay dos superficies para la misma tarea y una de ellas es incompleta.

## What Changes

- Un único modal de movimiento, con el formulario completo de `/movimientos/nuevo`, para crear y editar.
- El alta deja de navegar: se abre un modal sobre el listado y, al guardar, el listado se refresca sin cambiar de URL.
- La edición usa el mismo modal y permite cambiar tipo, cuenta, importe, concepto, fecha, categoría y nota; conserva el borrado con opción de deshacer.
- La ruta `/movimientos/nuevo` se mantiene para enlaces directos y para los accesos de resumen, detalle de cuenta y preguntas rápidas, que quedan fuera de este change.
- Sin cambios de modelo, migraciones, casos de uso ni dependencias.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `producto/finanzas-personales`: el alta y la edición de un movimiento comparten un modal con el formulario completo y el listado conserva su contexto.

## Impact

- `apps/web/src/components/forms/movement-form.tsx`: props para reutilizarlo igual en la página y en el modal.
- `apps/web/src/components/movement-dialog.tsx` (nuevo) y `movement-edit-dialog.tsx` (pasa a envolver el diálogo).
- `apps/web/src/components/pages/movements.tsx`: «Añadir movimiento» y «Editar» abren el diálogo.
- Pruebas E2E del modal, documentación de rutas y nota de desviación de diseño.
- No cambia `packages/domain`, `packages/data`, `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
