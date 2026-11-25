# Tasks

## 1. Contención del overscroll

- [x] 1.1 Añadir en `apps/web/app/globals.css` una regla `overscroll-behavior-y: none` para la raíz limitada a `min-width: 768px`, y verificar en Chrome que el scroll normal del contenido sigue funcionando y que el valor calculado es `none` en escritorio y `auto` por debajo de 768 px.
- [x] 1.2 Añadir en `e2e/shell.spec.ts` una comprobación de `overscrollBehaviorY` para escritorio y móvil, y verificar que pasa con `npm run e2e`.

## 2. Cabecera y barras fijas

- [x] 2.1 Convertir `DesktopHeader` en `sticky` con fondo opaco `bg-surface-canvas` y `z-20`, con offset `top-4` en la variante sidebar y `top-[72px]` en la variante header; verificar a 1440 px que la cabecera permanece visible y alineada con la sidebar.
- [x] 2.2 Sustituir las clases de opacidad no soportadas (`bg-surface-canvas/90`, `bg-surface-default/95`) de `HeaderNav` y `MobileNav` por superficies opacas basadas en tokens, y verificar con `getComputedStyle` que su `backgroundColor` ya no es transparente.
- [x] 2.3 Añadir en `e2e/shell.spec.ts` una prueba con viewport de escritorio bajo que haga scroll y verifique que la `boundingBox().y` de la sidebar y de la cabecera no cambia, y que la cabecera sigue visible.
- [x] 2.4 Verificar en E2E el modo header: cambiar el shell desde `/ajustes`, hacer scroll y comprobar que `HeaderNav` y la cabecera permanecen fijos sin solaparse.

## 3. Retirar el degradado de la cabecera

- [x] 3.1 Retirar la utilidad `.shell-header-fade` de `apps/web/app/globals.css` y la clase `shell-header-fade` de `DesktopHeader`, y verificar que la cabecera no tiene `::after` ni un borde inferior nuevo.
- [x] 3.2 Eliminar de `e2e/shell.spec.ts` la comprobación del degradado y verificar que las pruebas de shell siguen pasando.
- [x] 3.3 Revisar visualmente en Chrome que la cabecera vuelve a su borde original en las variantes sidebar y header, en tema claro y oscuro.

## 4. Identidad única en el shell

- [x] 4.1 Quitar el avatar del bloque de acciones de `DesktopHeader` y verificar a 1440 px que en la variante sidebar solo queda el avatar de la sidebar y que el buscador y el botón de avisos siguen visibles.
- [x] 4.2 Añadir en `e2e/shell.spec.ts` una comprobación de un único avatar visible en la variante sidebar (en la sidebar) y en la variante header (en `HeaderNav`), y verificar que pasa con `npm run e2e`.

## 5. Documentación y verificación

- [x] 5.1 Actualizar la sección «Shell y responsive» de `docs/desarrollo/arquitectura.md` con la navegación fija, la contención del overscroll, las superficies opacas y la identidad única; retirar la mención al degradado y verificar que el documento coincide con el comportamiento implementado.
- [x] 5.2 Revisar la nota de iteración de `docs/diseno/estado.md` para que describa la navegación fija y el avatar único sin el degradado, y verificar el texto.
- [x] 5.3 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e`, y confirmar que todos terminan sin errores.

## 6. Cabecera sin título y pegada arriba

- [x] 6.1 Quitar el título y la lógica de título de `DesktopHeader` (`titleForPath`, `useAccount`, `useGroup` y sus imports) y alinear el buscador y el botón de avisos a la derecha; verificar que la cabecera no renderiza ningún texto de sección.
- [x] 6.2 Renderizar `DesktopHeader` solo en la variante sidebar, con `sticky top-0` y sin las props `showActions`/`belowHeader`; en la variante header dejar solo `HeaderNav` y verificar que no queda una barra secundaria.
- [x] 6.3 Actualizar `e2e/shell.spec.ts`: cabecera sin título, `y = 0` tras scroll en sidebar, ausencia de segunda barra en header y conteo de avatares; verificar que la suite pasa.
- [x] 6.4 Revisar visualmente en Chrome a 1440 px y con scroll que no hay título duplicado, que la cabecera toca el borde superior y que no asoma contenido por encima, en claro y oscuro.
- [x] 6.5 Actualizar `docs/desarrollo/arquitectura.md` y `docs/diseno/estado.md` con la cabecera sin título, pegada arriba al hacer scroll y sin barra secundaria; verificar que el texto coincide con el comportamiento.
- [x] 6.6 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e`, y confirmar que todo pasa.

## 7. Cabecera pegada arriba en reposo

- [x] 7.1 Compensar el inset superior del shell con `lg:-mt-4` en `DesktopHeader` y `HeaderNav`, y verificar a 1440 px que ambas barras están en `y = 0` en reposo y tras hacer scroll, sin salto.
- [x] 7.2 Actualizar `e2e/shell.spec.ts` para comprobar `y = 0` en reposo y tras scroll en sidebar, y `HeaderNav` en `y = 0` en reposo en la variante header; verificar que pasa.
- [x] 7.3 Revisar visualmente en Chrome a 1440 px, en claro y oscuro y en ambas variantes, que no hay hueco superior ni salto al empezar el scroll.
- [x] 7.4 Actualizar `docs/desarrollo/arquitectura.md` y `docs/diseno/estado.md`: cabecera pegada arriba también en reposo y sidebar con inset.

## 8. Separación entre cabecera y contenido

- [x] 8.1 Añadir `lg:pt-6` al `main` del shell y verificar a 1440 px que el primer título del contenido empieza al menos 24 px por debajo de la cabecera.
- [x] 8.2 Añadir en `e2e/shell.spec.ts` una comprobación de la separación entre cabecera y primer título, y verificar que pasa.
- [x] 8.3 Revisar visualmente en Chrome, en claro y oscuro y en ambas variantes, que el título respira bajo la cabecera sin romper el scroll.
- [x] 8.4 Actualizar `docs/desarrollo/arquitectura.md` y `docs/diseno/estado.md` con la separación de 24 px en escritorio.
- [x] 8.5 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e`, y confirmar que todo pasa.

## 9. Separación en móvil y tablet

- [x] 9.1 Cambiar `lg:pt-6` por `pt-6` en el `main` del shell y verificar a 390, 768 y 1440 px que el primer título queda al menos 24 px por debajo de la cabecera.
- [x] 9.2 Añadir en `e2e/shell.spec.ts` una comprobación de la separación en móvil y verificar que pasa.
- [x] 9.3 Revisar visualmente en móvil, tablet y escritorio, en claro y oscuro, que el título no queda pegado a la barra.
- [x] 9.4 Actualizar `docs/desarrollo/arquitectura.md` y `docs/diseno/estado.md`: la separación de 24 px aplica en todos los breakpoints.
- [x] 9.5 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e`, y confirmar que todo pasa.

## Workflow follow-up

- Archivar el change y sincronizar la spec `producto/shell-web` cuando la revisión esté aprobada.
- Commit en la rama `feat/fijar-navegacion-scroll`, push y PR abierta a `main` según `AGENTS.md`.
