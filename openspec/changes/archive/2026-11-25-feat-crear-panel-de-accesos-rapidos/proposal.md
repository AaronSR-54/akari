# Proposal

## Why

El resumen obliga a navegar o a rebuscar enlaces a pie de panel para las acciones más frecuentes (registrar un movimiento, consultar las preguntas rápidas). Un panel de accesos rápidos junto al saldo acorta ese camino sin añadir navegación nueva.

## What Changes

- Nueva sección «Accesos rápidos» en el dashboard, justo debajo del bloque de saldo (misma columna en desktop; tras el saldo en móvil).
- El panel ofrece atajos de acción (nuevo movimiento, nueva cuenta) y el acceso a preguntas rápidas.
- El enlace «Preguntas rápidas →» sale del panel de Últimos movimientos para no duplicarlo; «Ver todos» se conserva.
- Sin rutas nuevas ni cambios de modelo: solo composición con enlaces y acciones existentes.

## Capabilities

### New Capabilities

- `producto/accesos-rapidos`: panel de atajos del resumen (acciones frecuentes y acceso a preguntas rápidas).

### Modified Capabilities

- `producto/dashboard-hero`: el hero suma el panel bajo el saldo en la columna izquierda y el enlace de preguntas rápidas se mueve del panel de Últimos al nuevo panel.

## Impact

- `apps/web/src/components/pages/dashboard.tsx` (composición del hero).
- `packages/ui` solo si falta alguna pieza presentacional (reutilizar `Card`, `SectionHeader`, `ActionLink` existentes).
- `e2e/dashboard.spec.ts` (nuevo bloque y orden en el hero).
