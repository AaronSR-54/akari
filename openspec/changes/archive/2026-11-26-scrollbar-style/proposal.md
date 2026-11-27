# Proposal

## Why

La barra de desplazamiento nativa rompe la estética cálida de akari: en escritorio aparece con el gris y el azul del sistema, con un ancho que no sigue la paleta y, en el shell actual, pegada al borde de la ventana por fuera del lienzo. La tarjeta `kegfwn3u66zt` pide ajustarla para que encaje visualmente con la aplicación.

## What Changes

- Teñir la barra del motor con el ámbar de acento al 55 % de opacidad y ancho fino, con carril transparente, en tema claro y oscuro.
- Dejar que la barra se desvanezca al terminar de desplazar y vuelva a aparecer al retomar el scroll, usando el comportamiento nativo del motor.
- Mover el scroll de escritorio al área de contenido (`main`), pegada al borde derecho de la ventana, con sidebar y cabecera fijas.
- Limitar el tinte propio a escritorio; en móvil y tablet se conserva la barra del motor sin reservar carril ni tapar cabecera o navegación.
- Aislar el scroll de los modales en su cuerpo, con cabecera fija y la barra separada de las esquinas redondeadas.
- Bloquear también el scroll del área de contenido cuando hay un overlay abierto.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `producto/fundaciones-ui`: añade requisitos para la barra teñida que se oculta, el scroll de escritorio dentro del contenido y el scroll aislado de los modales.

## Impact

- `apps/web/app/globals.css`: propiedades `scrollbar-width`/`scrollbar-color` en escritorio y utilidad `no-scrollbar`.
- `apps/web/src/components/shell/app-shell.tsx`: scroll de escritorio en `main` y borde derecho sin padding.
- `packages/ui/src/feedback.tsx`: cuerpo desplazable del modal con cabecera fija.
- `packages/ui/src/overlay-stack.ts` y sus pruebas: bloqueo del área de contenido.
- `e2e/shell.spec.ts` y `e2e/overlays.spec.ts`: cobertura del contenedor, las propiedades y el bloqueo.
- `openspec/specs/producto/fundaciones-ui/spec.md` (sync al archivar).
- `docs/desarrollo/desviaciones.md`: registro de la decisión visual.
- Sin tokens nuevos, sin cambios de datos, dominio, puertos ni dependencias.
