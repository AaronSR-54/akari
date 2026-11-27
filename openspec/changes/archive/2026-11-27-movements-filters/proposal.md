# Proposal

## Why

La fila de filtros de Movimientos mezcla patrones y ocupa demasiado espacio: cuatro botones segmentados para el tipo, una cápsula de mes que no filtra nada y selectores que en móvil se comportan distinto al calendario. Además, el panel abierto de un selector puede desplazarse o desanclarse al hacer scroll en escritorio.

## What Changes

- Sustituir el segmentado de tipo (Todos, Gastos, Ingresos, Suscripciones) por un único selector compacto «Tipo» dentro de una barra de filtros unificada y alineada a la derecha con Categoría, Cuenta y Orden.
- Eliminar la cápsula decorativa «noviembre de 2026» de la fila de filtros y el botón duplicado «Limpiar filtros».
- Mantener la cápsula de ordenación para fecha e importe, sin calendario ni periodo.
- Mover el calendario de periodo junto al resumen del listado, con atajos centrados y un rango personalizado que reutiliza el calendario de la aplicación. El rango se aplica por fecha de negocio, ambos extremos incluidos, y se dibuja como una banda continua: los rangos de más de dos semanas no cierran esquinas en los cortes semanales.
- En móvil, abrir cualquier selector (Tipo, Categoría, Cuenta y Orden) y el periodo en una hoja inferior modal, igual que el campo de fecha, en lugar del panel flotante.
- Mantener el panel abierto de un selector fijo en pantalla al hacer scroll en escritorio, sin acompañar al disparador ni desplazar la página.
- Ajustar el resumen del listado para reflejar el periodo activo.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `producto/finanzas-personales`: el listado de movimientos pasa a tener una barra de filtros unificada y un filtro de periodo con rango de fechas.
- `producto/componentes`: los selectores abren hoja inferior en móvil y mantienen su panel anclado al disparador en escritorio.

## Impact

- `apps/web/src/components/pages/movements.tsx`: estado y presentación de filtros, periodo y resumen.
- `apps/web/src/lib/format.ts`: etiqueta legible del periodo seleccionado.
- `packages/ui/src/fields.tsx`: selector con hoja inferior en móvil y anclaje estable del panel.
- `packages/ui/src/floating.ts`: sincronización del panel con el scroll sin desplazar la página.
- `packages/ui/src/calendar.tsx`: soporte de selección de rango si el rango personalizado se resuelve con un calendario de rango.
- Pruebas unitarias de `packages/ui` y E2E de movimientos y selector móvil.
