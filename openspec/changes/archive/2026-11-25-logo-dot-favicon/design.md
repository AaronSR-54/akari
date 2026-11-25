# Design

## Context

`packages/ui/src/logo.tsx` dibuja el círculo de la marca con `items-end` en el contenedor y `mb-[0.12em]` en el círculo, de modo que flota por encima de la línea base en lugar de apoyarse en ella como punto final. El formato `initial` (la «ı» de la sidebar colapsada) y el `expanded` comparten esa técnica. El favicon actual (`apps/web/app/icon.svg`) es un cuadrado redondeado ámbar con la «a» del monograma reducido. El diseño está congelado: `docs/diseno/`, `design/` y FigCraft no se tocan.

## Goals / Non-Goals

**Goals:**

- Apoyar el círculo en la línea base como punto final manteniendo su posición a la derecha y sin alterar el alto del logotipo.
- Que la nueva posición funcione en XL, M y S sin ajustes por tamaño.
- Hacer que el favicon muestre el mismo icono compacto con los colores del tema claro y contraste garantizado en cualquier pestaña.

**Non-Goals:**

- Cambiar la composición del wordmark, el monograma reducido ni los tokens de color.
- Modificar la sidebar, el shell, el comportamiento de expansión ni otros componentes.
- Reabrir la fase de diseño ni actualizar archivos de diseño congelados.

## Decisions

1. **Punto final con `items-baseline` y ajuste visual de 1 px en el círculo.** Con `items-end` la base del círculo caía sobre el fondo de la caja de línea (que incluye el descendente) y el punto se veía hundido; con `items-baseline` la base del círculo vacío coincide exactamente con la línea base del texto en XL, M y S sin tablas por tamaño. Se añade `translate-y-[1px]` como ajuste óptico porque en tamaños pequeños el punto se percibe más alto de lo que está; al ser un `transform` no altera el layout ni el alto del logotipo.
   - Alternativa descartada: mantener `mb-[0.12em]`, que deja el círculo flotando por encima de la línea base.
   - Alternativa descartada: posicionamiento absoluto del círculo, que rompería el flujo `inline-flex` y podría solaparlo con el texto al cambiar de fuente.

2. **Favicon SVG dibujado con formas, no con `<text>`.** Un `<text>` dependería de que Inter esté instalada en el sistema y su métrica variaría entre plataformas. Se dibuja el trazo de la «ı» como un rectángulo redondeado y el punto como un `<circle>`, con `viewBox="0 0 96 96"` para conservar el lienzo del icono actual.
   - El favicon va sin fondo (transparente) por petición explícita: el trazo usa la clase `stem` con tinta (`#1F1B16`) en claro y papel (`#FFFDF8`) en oscuro mediante `@media (prefers-color-scheme: dark)`, y el punto conserva su ámbar (`#E8A33D`, `accent/default`). En navegadores sin soporte de media queries en favicons se usa el trazo en tinta. El trazo (`x="24"`, `y="16"`, `w="20"`, `h="64"`) y el círculo (`cx="60"`, `cy="70"`, `r="11"`) llenan el lienzo de 96 con el contenido centrado (x 24–71); el círculo replica el ajuste visual del logo (1 unidad bajo la base del trazo, `y="16"` + `height="64"` = `80`, base del círculo `81`).
   - Alternativa descartada: fondo transparente con una regla `@media (prefers-color-scheme: dark)`; la compatibilidad de las media queries en favicons SVG no es uniforme y en tema oscuro podría quedar un trazo oscuro sobre fondo oscuro.
   - Alternativa descartada: fondo ámbar; el punto dejaría de distinguirse del fondo y rompería la regla de que el círculo es siempre `accent/default`.

3. **Registrar la desviación en `docs/desarrollo/desviaciones.md`.** `docs/diseno/componentes.md` describe el círculo como «punto final» tras la marca pero no fija su altura; apoyarlo exactamente en la línea base precisa la interpretación visual respecto al diseño aprobado. Se documenta la nueva posición y el motivo sin editar ningún archivo de diseño.

## Risks / Trade-offs

- [La línea base depende de la métrica de Inter] → `items-baseline` la resuelve con la fuente real sin valores manuales; si la fuente se sustituye, la comprobación E2E detecta el desplazamiento.
- [El favicon deja de ser el monograma «a» aprobado para app icon] → el alcance son solo las dos tarjetas del Kan; el formato reducido sigue intacto en `Logo` y se registra la desviación.
- [El fondo claro del favicon puede destacar en pestañas oscuras] → es una superficie cálida deliberada que garantiza el contraste del trazo y el punto; se prefiere a depender de media queries no uniformes.

## Migration Plan

No hay migración de datos ni de API: el cambio se sirve con el siguiente despliegue estático. Para revertir, basta con restaurar las dos clases del círculo en `logo.tsx` y el SVG anterior; no hay estado persistido que convertir.

## Open Questions

_Ninguna._ La posición a la derecha y apoyada en la línea base, y el uso del icono compacto como favicon, fueron confirmados por el usuario.
