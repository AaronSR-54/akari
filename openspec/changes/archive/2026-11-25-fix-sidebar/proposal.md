# Proposal

## Why

La sidebar compacta se expande con hover redimensionando el área de contenido, con lo que todo el layout se desplaza en lugar de mostrar un panel flotante sobre la página. Además, las dos variantes del shell de escritorio usan tamaños distintos de logo, de altura en los ítems de navegación y de avatar, así que cambiar entre sidebar y header produce una experiencia visual inconsistente.

## What Changes

- La sidebar compacta reserva 76 px en el flujo. Al expandirse por hover o foco despliega un panel flotante de 240 px con sombra y una atenuación ligera del contenido, sin redimensionarlo.
- Al fijar la sidebar abierta con el control, la reserva pasa a 240 px y el contenido se redimensiona para verse entero, sin atenuación.
- Se conservan las reglas actuales de expansión y colapso: hover, foco dentro y control de fijación, con salida y chevron para colapsar.
- Se unifican los tamaños de la navegación: logo M (32 px), ítems de navegación h-11 (44 px) y avatar md (40 px), aplicados a `Sidebar`, `HeaderNav`, `TabletHeader` y `MobileTopBar`.
- Se registra en `docs/desarrollo/desviaciones.md` la diferencia respecto al diseño congelado, sin modificar `docs/diseno/`.
- Se actualizan las pruebas unitarias del shell y la E2E `e2e/shell.spec.ts` para cubrir la superposición y los tamaños unificados.

## Capabilities

### New Capabilities

### Modified Capabilities

- `producto/shell-web`: la expansión de la sidebar pasa a superponerse al contenido sin desplazarlo, y se añade el requisito de tamaños unificados entre las variantes de navegación de escritorio, tablet y móvil.

## Impact

- `apps/web/src/components/shell/sidebar.tsx`: posicionamiento de la sidebar, tamaños de logo, ítems y avatar.
- `apps/web/src/components/shell/app-shell.tsx`: espacio reservado para la sidebar compacta.
- `apps/web/src/components/shell/sidebar.test.tsx` y `e2e/shell.spec.ts`: cobertura del nuevo comportamiento.
- `docs/desarrollo/desviaciones.md`: trazabilidad de la desviación visual.
- Sin cambios en dependencias, datos ni en las capas `domain`, `data`, `tokens` o `ui`.
