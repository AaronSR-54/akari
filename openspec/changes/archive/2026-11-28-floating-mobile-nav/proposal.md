# Proposal

## Why

La navegación inferior en móvil es hoy una franja pegada a los bordes del viewport, con borde superior y fondo opuesto a todo lo ancho. Eso la hace leer como parte del lienzo y no como una superficie de navegación, y deja poco aire entre la barra y el contenido en pantallas con área segura. El shell ya usa superficies elevadas y difuminadas en sidebar y paneles; la barra móvil debe seguir ese mismo lenguaje visual sin perder su función.

## What Changes

- Convertir `MobileNav` en una barra flotante: separada de los bordes inferior y laterales, con esquinas redondeadas, sombra `elevation-3` y superficie translúcida con `backdrop-blur-sm`, sin el borde superior que la cruza de lado a lado.
- Conservar los tres destinos existentes (Resumen, Movimientos, Grupos), la acción central «Añadir movimiento», el destino activo con `aria-current`, los objetivos táctiles de al menos 44 px y el nombre accesible `Navegación principal`.
- Mantener la barra fija durante el scroll y el overscroll, visible solo por debajo del breakpoint `md`, por encima del contenido (`z-40`) y respetando `env(safe-area-inset-bottom)`.
- Ajustar la separación inferior del contenido en `app-shell.tsx` para que la barra flotante no tape la última parte de las pantallas.
- Rediseñar la cabecera superior móvil como una barra transparente con el logotipo a la izquierda y buscador, avisos y avatar (ajustes) a la derecha. Al desplazarse el contenido, el logotipo desaparece y una píldora redondeada aparece detrás de los tres botones; al volver arriba se recupera el estado inicial.
- Abrir el panel de avisos existente en modo modal cuando se pulsa la campana en móvil, conservando el mismo contenido, el contador y las vías de cierre.
- Hacer que el contenido tenga scroll propio en móvil y aplicar `mask-image` para que se desvanezca bajo la cabecera y justo antes de la barra flotante.
- Actualizar las specs `producto/shell-web` y `producto/avisos`, las pruebas E2E del shell y el registro de desviaciones visuales en `docs/desarrollo/desviaciones.md`.
- Fuera de alcance: cambiar destinos, rutas, iconos ni etiquetas; modificar la navegación de tablet o escritorio; tocar las capas `domain`, `data`, `tokens` ni `ui`; abrir la fase de diseño ni editar `docs/diseno/`, `design/` u `openspec/specs/diseno/*`.

## Capabilities

### New Capabilities

### Modified Capabilities

- `producto/shell-web`: la barra inferior móvil pasa a ser una superficie flotante y elevada; la cabecera móvil pasa a ser transparente con estados de scroll (logotipo y píldora de acciones) y el contenido scrollea dentro del viewport con máscaras en sus bordes. Se conservan destinos, estado activo, accesibilidad y objetivos táctiles.
- `producto/avisos`: el panel de avisos se abre en modo modal en móvil, además de desplegarse anclado a la campana en escritorio y tablet.

## Impact

- `apps/web/src/components/shell/sidebar.tsx`: barra inferior flotante y cabecera superior móvil con sus estados de scroll.
- `apps/web/src/components/shell/app-shell.tsx`: espacio reservado al final del `main`, scroll interno en móvil y estado de scroll compartido con la cabecera.
- `apps/web/src/components/shell/notifications-panel.tsx`: variante modal del panel de avisos.
- `apps/web/app/globals.css`: utilidades de área segura y de máscara de contenido.
- `apps/web/src/components/shell/sidebar.test.tsx` y `e2e/shell.spec.ts`: cobertura de la barra, la cabecera, el panel modal y la ausencia de desbordamiento.
- `openspec/specs/producto/shell-web/spec.md` y `openspec/specs/producto/avisos/spec.md` vía deltas: comportamiento móvil nuevo.
- `docs/desarrollo/desviaciones.md`: trazabilidad del cambio visual respecto a la referencia histórica.
- Sin cambios en dependencias, datos ni en las capas `domain`, `data`, `tokens` o `ui`.
