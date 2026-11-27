# Proposal

## Why

La tabla de movimientos de escritorio se lee pequeña: la cabecera está a 9 px y las celdas a 10–11 px, por debajo del tamaño cómodo de lectura en una pantalla de 1440 px. El resto de la interfaz (lista móvil, cabeceras, filtros) ya usa 11–14 px, así que la tabla es la superficie con la tipografía más comprimida. Además, el pie de la tabla tiene alto fijo de 40 px y sus botones miden 40 px, así que la paginación queda pegada al borde inferior de la tarjeta, sin aire. Se acordó subir un escalón tipográfico sin convertir la tabla en una lista ni perder filas visibles, y dar respiración al pie. En la misma pasada se corrige el panel de avisos: se presenta como un diálogo con fondo difuminado a pantalla completa, pero deja desplazar la página por detrás, algo que no ocurre en las modales.

## What Changes

- La cabecera de la tabla sube de 9 a 11 px y su fila de 40 a 44 px.
- Fecha, categoría y cuenta suben de 10 a 13 px.
- Concepto e importe suben de 11 a 14 px, manteniendo la negrita y la jerarquía actual.
- Las filas pasan de 56 a 64 px y el pie (rango y paginación) de 10 a 11 px.
- El pie de la tabla deja de tener alto fijo (`h-10`) y pasa a `py-2`, de modo que los botones de paginación (40 px) y el rango no quedan pegados al borde inferior de la tarjeta: el pie crece a 56 px con 8 px de aire arriba y abajo.
- Se usan solo clases existentes de `@akari/tokens` (`text-ui-11-strong`, `text-ui-13`, `text-ui-14-strong`, `text-ui-11`, `h-11`, `h-16`); no se añaden tamaños nuevos ni se toca el preset.
- Sin cambios en la lista móvil (`MovementRow` ya usa concepto a 13 px e importe a 14 px), en las columnas, en la paginación ni en el comportamiento de la pantalla.
- El objetivo de densidad se mantiene: 10 filas de 64 px, cabecera de 44 px y pie de 56 px dejan la tarjeta en ~742 px de alto, de modo que en un portátil de 1440×900 el pie queda al borde y no obliga a hacer scroll.
- El panel de avisos adquiere el mismo bloqueo de scroll que las modales: con el panel abierto la página de fondo no se desplaza y, al cerrarlo por botón, Escape o clic fuera, el scroll se restaura. Reutiliza `acquireScrollLock` de `@akari/ui`, que ya usan los diálogos, en lugar de duplicar la lógica.
- La lista del panel desplaza su barra de scroll 8 px hacia el borde del panel (`-mr-2` con `pr-3`) y el panel crece 8 px, de modo que las tarjetas conservan su ancho, la barra queda con 4 px de aire a cada lado y el contenido no pasa por debajo.
- La lista difumina su propio contenido con una máscara de 20 px en el borde superior e inferior cuando hay contenido desplazado en esa dirección: las tarjetas se funden con el fondo del panel en lugar de cortarse en seco contra la cabecera.
- No se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`; la apariencia se decide en código.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `producto/avisos`: el panel bloquea el scroll del documento mientras está abierto y lo restaura al cerrarse, con un escenario nuevo en el requisito de apertura y cierre.

## Impact

- Código: `apps/web/src/components/pages/movements.tsx` (clases de la tabla de escritorio y de su pie); `apps/web/src/components/shell/notifications-panel.tsx` y el reexport de `acquireScrollLock` en `packages/ui/src/index.ts`.
- Pruebas: comprobación E2E en `e2e/accounts-movements.spec.ts` (tipografía y filas) y en `e2e/overlays.spec.ts` (scroll bloqueado con el panel abierto), más una prueba unitaria en `notifications-panel.test.tsx`.
- Specs: delta en `producto/avisos`.
- Sin cambios en `packages/domain`, `packages/data` ni `packages/tokens`.
- Sin migraciones, sin cambios en la persistencia ni en el modelo de dinero y fechas.
