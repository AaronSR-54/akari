# Proposal

## Why

El scrim de los overlays no se pinta: `bg-overlay-scrim/50` compila a un color transparente porque el token es un hexadecimal dentro de una variable CSS sin canales alfa. El resultado es que al abrir un modal el fondo no se atenúa ni se difumina, y la página sigue viéndose nítida detrás. Además, el bloqueo de scroll existe en el código pero no está cubierto por ninguna prueba.

## What Changes

- Los tokens de color semánticos exponen canales RGB además del hexadecimal, de modo que Tailwind puede aplicar opacidad (`/50`, `/60`…) sin perder el color.
- El scrim del `Modal`/`BottomSheet` pasa a atenuar de verdad el fondo con `overlay/scrim` al 50 % y añade desenfoque de fondo.
- El bloqueo de scroll al abrir un overlay se refuerza sobre `body` y `html`, guardando y restaurando el estado previo y la posición de la página, y se cubre con pruebas de componente y E2E.
- Se registra en `docs/desarrollo/desviaciones.md` que el desenfoque no está definido en el diseño congelado y que lo introduce esta tarjeta.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `producto/componentes`: se añade el comportamiento del fondo atenuado y difuminado y el bloqueo de scroll de los overlays.

## Impact

- `packages/tokens/src/tokens.ts`, `packages/tokens/scripts/generate.ts` y `packages/tokens/src/tokens.test.ts`: canales RGB y preset con soporte de alfa.
- `packages/ui/src/feedback.tsx`: scrim con desenfoque y bloqueo de scroll reforzado.
- `packages/ui/src/feedback.test.tsx`: cobertura del bloqueo y la restauración.
- `e2e/groups.spec.ts` (o un spec de overlays): comprobación del fondo atenuado y del scroll bloqueado.
- `docs/desarrollo/desviaciones.md`: nota de desenfoque no previsto en el diseño.
- Sin cambios en `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
