# Proposal

## Why

El círculo ámbar que cierra la marca flota hoy por encima de la línea base del logotipo en lugar de apoyarse en ella como punto final de frase, y el favicon sigue siendo un monograma «a» sobre cuadrado redondeado que no representa el icono compacto que ya se usa en la sidebar colapsada. Las dos tarjetas del Kan piden corregir esa alineación y llevar el mismo icono compacto al favicon.

## What Changes

- Apoyar el círculo ámbar del logotipo compacto (`Logo` con `format="initial"`) en la línea base a la derecha de la «ı», como punto final de frase.
- Aplicar la misma regla de alineación al círculo del logotipo expandido, que continúa colocándose tras el wordmark «akarı».
- Sustituir `apps/web/app/icon.svg` por el icono compacto sin fondo: trazo de la «ı» con color adaptativo a claro/oscuro y círculo ámbar a su derecha, legible en ambos temas.
- Añadir pruebas unitarias del componente `Logo` y del SVG del favicon, y una comprobación E2E de la posición del punto en la sidebar colapsada.
- Registrar en `docs/desarrollo/desviaciones.md` la nueva altura del círculo respecto al diseño aprobado, sin modificar ningún archivo de diseño congelado.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `producto/componentes`: se añaden requisitos sobre la posición del círculo de la marca y sobre el favicon como icono compacto.

## Impact

- `packages/ui/src/logo.tsx` y `packages/ui/src/logo.test.tsx`.
- `apps/web/app/icon.svg` y una nueva prueba que verifique su composición.
- `e2e/shell.spec.ts` (posición del punto en la sidebar colapsada).
- `docs/desarrollo/desviaciones.md`.
- Sin cambios en `docs/diseno/`, `design/`, `openspec/specs/diseno/*`, tokens ni dependencias.
