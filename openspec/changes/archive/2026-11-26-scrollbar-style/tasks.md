# Tasks

## 1. Barra teñida y ocultación nativa

- [x] 1.1 Sustituir los pseudoelementos propios por `scrollbar-width: thin` y `scrollbar-color: rgb(var(--color-accent-default-rgb) / 0.55) transparent` en `apps/web/app/globals.css`, dentro de `@media (min-width: 1024px)`; verificado en Chromium con ancho fino, tinte ámbar y carril transparente en claro y oscuro.
- [x] 1.2 Confirmar que la barra usa el comportamiento de overlay del motor y se desvanece al dejar de desplazar, sin carril reservado ni pulgar persistente; verificado con `overflow-y: auto` y las propiedades estándar.
- [x] 1.3 Confirmar que `.no-scrollbar` conserva `scrollbar-width: none` y `::-webkit-scrollbar { display: none }` y que el carrusel segmentado de `packages/ui/src/segmented.tsx` sigue ocultando la barra en ambos temas.

## 2. Pruebas E2E

- [x] 2.1 Actualizar la prueba de `e2e/shell.spec.ts` para leer `scrollbar-width: thin` y `scrollbar-color` calculados, comprobar el cambio de tema y que en tablet vuelve a `auto`; verificada manualmente con Playwright.
- [x] 2.2 Comprobar que un contenedor con `no-scrollbar` no dibuja barra y que la página sigue sin desbordamiento horizontal en 1440, 900 y 390.

## 3. Scroll dentro del contenido

- [x] 3.1 Mover el scroll de escritorio a `main` en `apps/web/src/components/shell/app-shell.tsx` (`lg:h-screen`, `lg:overflow-hidden`, `lg:pr-0`, `lg:min-h-0`, `lg:overflow-y-auto`) y dejar el documento sin scroll en escritorio; verificado que sidebar y cabecera siguen fijas y que la barra queda pegada al borde derecho.
- [x] 3.2 Bloquear `[data-shell-scroll]` cuando hay un overlay con `data-scroll-locked` en `html` y actualizar `packages/ui/src/overlay-stack.ts` y sus pruebas; verificado que el fondo no se desplaza con la modal abierta y que `scrollTop` se conserva.
- [x] 3.3 Actualizar `e2e/shell.spec.ts` y `e2e/overlays.spec.ts` para desplazar `main` en escritorio; verificado manualmente con Playwright.
- [x] 3.4 Aislar el scroll del modal en su cuerpo (`packages/ui/src/feedback.tsx`), con cabecera fija y margen respecto al borde redondeado; verificado que la barra no toca las esquinas y que el pie sigue accesible.
- [x] 3.5 Limitar el tinte propio a `@media (min-width: 1024px)` y verificar en 390 y 900 que el documento conserva su flujo, la cabecera y la navegación siguen visibles y no aparecen huecos ni carriles reservados.

## 4. Documentación y verificación

- [x] 4.1 Actualizar `docs/desarrollo/desviaciones.md` con la barra teñida que se oculta, el scroll dentro de `main` y el aislamiento del modal, sin tocar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
- [x] 4.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`; el timeout conocido de `scripts/workflow.test.mjs` (tarjeta `l4sfpw3rv9df`) no cuenta como regresión de este change.

## Workflow follow-up

- Archivar el change, sincronizar `openspec/specs/producto/fundaciones-ui/spec.md` y abrir la PR con `node scripts/kan-sync.mjs pr-body scrollbar-style` como borrador.
- Mover la tarjeta a `DONE` con `node scripts/kan-sync.mjs done scrollbar-style --pr <url>` y limpiar el claim tras la revisión.
