# Design

## Context

Ver `proposal.md` para la motivación. `apps/web/app/globals.css` solo contiene la utilidad `no-scrollbar`; el resto de zonas desplazables muestran la barra nativa. El shell (`apps/web/src/components/shell/app-shell.tsx`) deja que el documento entero haga scroll, incluso en escritorio, donde el lienzo lleva 16 px de padding y la barra nativa queda fuera de él. `packages/ui/src/overlay-stack.ts` bloquea el scroll de `body` y `html` al abrir un overlay. Los tokens semánticos ya cubren el ámbar en ambos temas y el tema se aplica en `html` con `data-theme`. El diseño visual está congelado: no se tocan FigCraft, `design/` ni `docs/diseno/`.

## Goals / Non-Goals

**Goals:**

- Que la barra de escritorio viva dentro del lienzo, pegada al borde derecho de la ventana.
- Que use el ámbar de la app con opacidad y se oculte sola al dejar de desplazar.
- Que en móvil y tablet no interfiera con la cabecera, la navegación ni el flujo de la página.
- Mantener `no-scrollbar` y bloquear el scroll del contenido cuando hay un overlay.

**Non-Goals:**

- No dibujar una barra propia con JavaScript ni sustituir la interacción nativa.
- No crear tokens nuevos ni modificar `packages/tokens`.
- No cambiar el scroll de móvil y tablet.

## Decisions

1. **El scroll de escritorio pasa a `main` y llega al borde derecho.** El contenedor exterior usa `lg:h-screen lg:overflow-hidden lg:p-4 lg:pr-0` y el área de contenido `lg:min-h-0 lg:overflow-y-auto`; el contenido conserva su padding interno (`lg:px-8`) y la barra queda pegada al borde derecho de la ventana. Sidebar y cabeceras quedan fuera del área desplazable, así que siguen fijas. En móvil y tablet se conserva el scroll de página.
   - Alternativa descartada: mantener el padding derecho del lienzo; la barra quedaba separada del borde.

2. **Barra del motor con `scrollbar-width` y `scrollbar-color`.** Se abandona `::-webkit-scrollbar` en favor de las propiedades estándar: `scrollbar-width: thin` y `scrollbar-color: rgb(var(--color-accent-default-rgb) / 0.55) transparent`. Así el motor conserva su comportamiento de overlay (aparece al desplazar y se desvanece al parar), su forma redondeada y su arrastre nativo, sin huecos reservados ni pulgares que se corten en las esquinas.
   - Alternativa descartada: pseudoelementos `::-webkit-scrollbar` con una píldora propia; al estilizarlos, Chromium los convierte en barras permanentes y el pulgar se recortaba en los bordes redondeados.

3. **Estilos solo en escritorio.** Las reglas de barra viven dentro de `@media (min-width: 1024px)`. En móvil y tablet se usa la barra por defecto del motor: no se reserva carril, no se superpone a la cabecera ni a la navegación inferior y no aparecen huecos.
   - Alternativa descartada: aplicar el tinte en todos los tamaños; en móvil la barra del documento se dibujaba sobre los elementos fijos.

4. **Ámbar con opacidad desde el token.** El color sale de `--color-accent-default-rgb` al 55 %, así el tinte cambia con `[data-theme='dark']` sin duplicar reglas y no hace falta un color literal. El carril queda transparente.
   - Alternativa descartada: tinta cálida; la persona usuaria pidió expresamente el amarillo de la app.

5. **Bloqueo de scroll con un atributo en `html`.** `acquireScrollLock` sigue bloqueando `body` y `html` y añade `data-scroll-locked="true"`; una regla global oculta el desbordamiento de `[data-shell-scroll]` mientras el atributo esté presente. Al cerrar el último overlay se restaura el valor anterior.
   - Alternativa descartada: bloquear solo `main` con estilos desde React; el atributo centraliza el estado y lo pueden comprobar las pruebas.

6. **El scroll del modal vive en el cuerpo.** El panel pasa a `overflow-hidden` y reparte cabecera, cuerpo y pie: la cabecera queda fija y el cuerpo (`mr-1.5 overflow-y-auto`) es el único que se desplaza. El margen derecho separa la barra del borde redondeado.
   - Alternativa descartada: seguir desplazando el panel completo; la cabecera se iba con el contenido.

7. **`no-scrollbar` conserva la prioridad.** La regla de clase tiene más especificidad que los estilos globales y sigue ocultando la barra.
   - Alternativa descartada: añadir `:not(.no-scrollbar)` a las reglas globales; complica la especificidad sin cubrir descendientes.

8. **Verificación E2E de las propiedades y el contenedor.** La prueba lee `scrollbar-width` y `scrollbar-color` calculados, comprueba que `main` es el área desplazable en escritorio y que llega al borde derecho, y que en tablet vuelve a `auto`. Otra prueba verifica que un overlay congela `scrollTop` y que `no-scrollbar` no dibuja barra.

## Risks / Trade-offs

- [Safari puede no soportar `scrollbar-color`] → usa su barra nativa de overlay, que ya se oculta sola; se pierde el tinte ámbar pero no la posición ni el comportamiento.
- [El tinte al 55 % puede quedar tenue en algunas pantallas] → es el mismo ámbar de acento de la app; se ajusta el porcentaje si la persona usuaria lo pide.
- [En macOS el motor puede no desvanecer la barra si el sistema está configurado para mostrarla siempre] → es una preferencia del sistema operativo; la app no la fuerza.
- [El scroll del fondo con un overlay abierto] → `data-scroll-locked` bloquea `[data-shell-scroll]`, con prueba unitaria y E2E.
- [Cambiar el contenedor de scroll puede romper cabeceras fijas o pruebas que usan `window.scrollTo`] → sidebar y cabeceras quedan fuera de `main`; las pruebas de shell y overlays pasan a desplazar `main`.

## Migration Plan

Sin migración de datos ni cambios de API. Se aplica en el shell, el CSS global, el modal y el bloqueo de overlays; se actualizan pruebas de shell, overlays, accesibilidad y el registro de desviaciones. La reversión es revertir el commit del change.

## Open Questions

_Ninguna._
