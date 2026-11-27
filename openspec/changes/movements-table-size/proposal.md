# Proposal

## Why

La tabla de movimientos de escritorio se lee pequeña: la cabecera está a 9 px y las celdas a 10–11 px, por debajo del tamaño cómodo de lectura en una pantalla de 1440 px. El resto de la interfaz (lista móvil, cabeceras, filtros) ya usa 11–14 px, así que la tabla es la superficie con la tipografía más comprimida. Además, el pie de la tabla tiene alto fijo de 40 px y sus botones miden 40 px, así que la paginación queda pegada al borde inferior de la tarjeta, sin aire. Se acordó subir un escalón tipográfico sin convertir la tabla en una lista ni perder filas visibles, y dar respiración al pie.

## What Changes

- La cabecera de la tabla sube de 9 a 11 px y su fila de 40 a 44 px.
- Fecha, categoría y cuenta suben de 10 a 13 px.
- Concepto e importe suben de 11 a 14 px, manteniendo la negrita y la jerarquía actual.
- Las filas pasan de 56 a 64 px y el pie (rango y paginación) de 10 a 11 px.
- El pie de la tabla deja de tener alto fijo (`h-10`) y pasa a `py-2`, de modo que los botones de paginación (40 px) y el rango no quedan pegados al borde inferior de la tarjeta: el pie crece a 56 px con 8 px de aire arriba y abajo.
- Se usan solo clases existentes de `@akari/tokens` (`text-ui-11-strong`, `text-ui-13`, `text-ui-14-strong`, `text-ui-11`, `h-11`, `h-16`); no se añaden tamaños nuevos ni se toca el preset.
- Sin cambios en la lista móvil (`MovementRow` ya usa concepto a 13 px e importe a 14 px), en las columnas, en la paginación ni en el comportamiento de la pantalla.
- El objetivo de densidad se mantiene: 10 filas de 64 px, cabecera de 44 px y pie de 40 px dejan la tarjeta en ~901 px de alto, de modo que en un portátil de 1440×900 el pie queda justo al borde y no obliga a hacer scroll.
- No se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`; la apariencia se decide en código.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

Ninguna: es un cambio exclusivamente visual, sin cambios de comportamiento, etiquetas, flujos ni datos. El change usa `skip_specs: true` y no modifica `openspec/specs/**`.

## Impact

- Código: `apps/web/src/components/pages/movements.tsx` (clases de la tabla de escritorio y de su pie).
- Pruebas: nueva comprobación E2E en `e2e/accounts-movements.spec.ts` que fija cabecera de 11 px, celdas secundarias de 13 px, concepto de 14 px y filas de 64 px en escritorio y tablet, y que en móvil no existe tabla.
- Sin cambios en `packages/domain`, `packages/data`, `packages/ui` ni `packages/tokens`.
- Sin migraciones, sin cambios en la persistencia ni en el modelo de dinero y fechas.
