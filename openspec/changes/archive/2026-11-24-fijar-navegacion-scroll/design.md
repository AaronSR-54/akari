# Design

## Context

- Ver `proposal.md` para la motivación.
- El scroll es de documento: el shell no tiene un contenedor de scroll propio. La sidebar usa `sticky top-4`, las barras de tablet y móvil usan `sticky top-0`, y `HeaderNav` también es `sticky top-0`.
- La cabecera de escritorio (`DesktopHeader`) ya es sticky y no muestra título, pero conserva el inset de 16 px del shell en reposo: al empezar a hacer scroll salta 16 px hasta pegarse al borde superior.
- En la variante header, `HeaderNav` es la única barra superior y tiene el mismo inset en reposo.
- El título de `DesktopHeader` se calcula con `titleForPath`, `useAccount` y `useGroup`, y no se usa en ningún otro componente.
- El contenedor del shell aplica `lg:p-4`; la sidebar y la cabecera comparten el inset de 16 px.
- El rebote elástico del trackpad desplaza los elementos sticky junto con el documento; el cambio lo contiene en la raíz.
- Las utilidades de opacidad sobre `var(--color-*)` no se aplican; las barras fijas usan superficies opacas de los tokens.
- En la variante sidebar, el avatar se renderiza en el pie de la sidebar; la cabecera ya no lo repite. En la variante header, la identidad vive en `HeaderNav`.
- Los tokens viven en `packages/tokens`; los colores se consumen como variables CSS (`--color-surface-canvas`, etc.). `design/` y `docs/diseno/` son la referencia visual.
- El borde de la cabecera se deja como estaba: no forma parte de este cambio.

## Goals / Non-Goals

**Goals:**

- Que sidebar, barra de acciones y navegación superior no se muevan con el scroll ni con el overscroll elástico.
- Que la barra de acciones permanezca pegada al borde superior en todo momento, también en reposo, sin el salto inicial de 16 px.
- Que la cabecera no repita el título de la sección y que exista una sola barra superior por variante.
- Que el primer título del contenido tenga separación suficiente respecto a la cabecera.
- Que las barras fijas tengan una superficie legible y consistente con los tokens.
- Que la identidad de la persona aparezca una sola vez por variante del shell.
- Cubrir la regresión con pruebas E2E.

**Non-Goals:**

- Cambiar la arquitectura de scroll a un contenedor interno con altura de viewport.
- Rediseñar la sidebar, las barras de tablet/móvil o la estructura de rutas.
- Cambiar el H1 del contenido ni la jerarquía de títulos de las páginas.
- Cambiar el inset flotante de la sidebar: sigue a 16 px.
- Introducir animaciones de ocultación/mostrado ligadas al scroll.
- Añadir tokens nuevos de superficie translúcida.
- Cambiar el borde, añadir degradados o modificar el tratamiento visual de la cabecera.

## Decisions

### 1. Suprimir el overscroll elástico en la raíz, solo desde tablet

Se aplica `overscroll-behavior-y: none` al elemento raíz dentro de `@media (min-width: 768px)`. El rebote elástico es un efecto del scroller raíz; contenerlo en la raíz impide que arrastre sidebar y cabecera sin tocar el scroll normal del contenido.

- **Alternativa descartada:** convertir el shell en un marco de altura fija con `main` como scroller interno. Resuelve el rebote de raíz, pero cambia la restauración de scroll de Next.js, el comportamiento de la barra de URL en móvil y varias pruebas; es desproporcionado para el síntoma.
- **Alternativa descartada:** cambiar la navegación a `position: fixed`. Exige reservar espacio en el layout y no evita por sí sola el desplazamiento visual del rebote.
- Se limita a `min-width: 768px` para conservar el pull-to-refresh nativo en móvil y porque el síntoma se da en escritorio/tablet con trackpad.

### 2. Cabecera de acciones solo en sidebar, sin título y pegada arriba en todo momento

`DesktopHeader` deja de mostrar el título de sección y se renderiza únicamente en la variante sidebar:

- Se eliminan el título y su lógica (`titleForPath`, `useAccount`, `useGroup`) junto con las props que solo servían para alternar variantes (`showActions`, `belowHeader`).
- La barra conserva el buscador y el botón de avisos, alineados a la derecha; no muestra avatar.
- Usa `sticky top-0` con fondo opaco (`bg-surface-canvas`) y `z-20`. Para que quede pegada también en reposo, se compensa el inset superior del shell con `lg:-mt-4` en `DesktopHeader` y en `HeaderNav`; la sidebar conserva su inset de 16 px. Así no hay salto de 16 px al empezar el scroll y el contenido no asoma por encima.
- En la variante header, `DesktopHeader` no se renderiza: `HeaderNav` es la única barra superior y ya incluye buscador, avisos y avatar.

- **Alternativa descartada:** mantener el título en la cabecera. Duplica el H1 y deja dos títulos de sección en pantalla.
- **Alternativa descartada:** mantener `DesktopHeader` en la variante header sin título. Quedaría una barra vacía o duplicaría buscador y avisos de `HeaderNav`.
- **Alternativa descartada:** conservar el inset de 16 px en reposo y dejar que la cabecera se pegue al hacer scroll. Provoca el pequeño salto inicial que se quiere eliminar.
- **Alternativa descartada:** sacar las barras del contenedor con padding. Reestructura el shell y afecta a tablet y móvil; la compensación con margen negativo es local y reversible.

### 3. Superficies opacas en las barras fijas

Se sustituyen las clases de opacidad no soportadas por superficies sólidas basadas en tokens: `bg-surface-canvas` para las barras de escritorio y `bg-surface-default` para la navegación inferior móvil. Esto corrige la transparencia accidental y hace legible cualquier barra fija.

### 4. Una sola identidad por variante del shell

La identidad de la persona pertenece a la navegación principal:

- En la variante sidebar, el avatar se queda en el pie de la sidebar. `DesktopHeader` conserva el buscador y el botón de avisos, pero no repite el avatar.
- En la variante header solo existe `HeaderNav`, que ya incluye el avatar; no hay barra secundaria donde duplicarlo.

Se elimina el avatar del bloque de acciones de `DesktopHeader` en lugar de ocultarlo condicionalmente: la sidebar y `HeaderNav` son los dueños de la identidad y no necesitan sincronizar dos fuentes.

- **Alternativa descartada:** quitar el avatar del pie de la sidebar y dejar el de la cabecera. El pie de la sidebar forma parte de la estructura aprobada y la cabecera no siempre está presente.
- **Alternativa descartada:** renderizar el avatar del header solo cuando la sidebar no está visible. Añade un condicional para un elemento que ya tiene un dueño claro en cada variante.
- El avatar es presentacional y no interactivo, por lo que retirar la copia del header no elimina ninguna acción.

### 5. Separación entre la cabecera y el contenido

Se añade `pt-6` (24 px) al `main` del shell. La separación vive en el contenido, no en la cabecera: la cabecera mantiene su altura y el padding superior del `main` crea el aire bajo ella. Aplica en todos los breakpoints, porque la cabecera fija existe también en tablet y móvil.

- **Alternativa descartada:** margen inferior en la cabecera. El margen se solapa con el flujo y una cabecera sticky no lo conserva igual al hacer scroll.
- **Alternativa descartada:** padding en cada `PageHeader`. Duplica el valor en todas las páginas y se olvida al añadir una nueva.
- **Alternativa descartada:** limitarlo a escritorio. En móvil el título quedaba pegado a la barra superior.

### 6. Verificación E2E estructural

Playwright no reproduce el rebote elástico real del trackpad. La regresión se cubre comprobando:

- La sidebar mantiene su `boundingBox().y` y la barra de acciones está en `y = 0` en reposo y tras hacer scroll en una ventana de escritorio baja (por ejemplo 1280×600). `HeaderNav` también está en `y = 0` en reposo.
- `overscrollBehaviorY` de la raíz es `none` en escritorio/tablet y `auto` en móvil.
- Las barras fijas tienen un `backgroundColor` no transparente.
- La cabecera de sidebar no contiene el título de la sección y no existe una segunda barra en la variante header.
- El primer título del contenido está al menos 24 px por debajo del borde inferior de la cabecera.
- Hay exactamente un avatar visible en cada variante: en la sidebar o en `HeaderNav`.

La identidad única y la ausencia de duplicados se validan contando los avatares visibles y comprobando su ubicación.

## Risks / Trade-offs

- **Se pierde el rebote elástico en escritorio/tablet** → Es el comportamiento buscado y queda acotado por breakpoint; el scroll normal no cambia.
- **Navegadores sin soporte de `overscroll-behavior`** → El síntoma podría persistir en versiones antiguas de Safari; la cabecera sigue siendo sticky y el objetivo declarado es Chrome de escritorio.
- **El título de sección deja de estar en el shell** → Se depende del H1 del contenido, que ya existe en todas las páginas; no se modifica su jerarquía.
- **La cabecera queda a 0 y la sidebar a 16 px en reposo** → Se acepta para eliminar el salto; la sidebar conserva el marco flotante y la cabecera ocupa el ancho de su columna. El margen negativo solo se aplica en escritorio.
- **Colisiones de z-index con overlays** → La cabecera se mantiene en `z-20`, por debajo de `HeaderNav` (`z-30`), del salto al contenido (`z-70`) y de los diálogos.

## Migration Plan

- Cambio solo de CSS y marcado del shell; sin migración de datos ni de esquema.
- Rollback: revertir las clases, restaurar el título y el renderizado de `DesktopHeader` en la variante header. Los datos locales no se ven afectados.
