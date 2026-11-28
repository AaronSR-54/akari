# Tasks

## 1. Barra inferior flotante

- [x] 1.1 Ejecutar `npm run preview:worktree` y verificar que imprime la URL del frontal para revisar el cambio en el puerto asignado.
- [x] 1.2 Convertir `MobileNav` en superficie flotante en `sidebar.tsx` (`inset-x-3 bottom-3`, radio, borde sutil, `bg-surface-raised/90`, `backdrop-blur-sm`, `elevation-3`), conservando `fixed`, `z-40`, `md:hidden`, `.safe-bottom`, los tres destinos, la acción «Añadir movimiento» y los objetivos de 44 px; verificar en el frontal que la barra no toca los bordes y que el botón central sigue visible.
- [x] 1.3 Añadir la utilidad `safe-bottom-content` en `globals.css` y aplicarla en `main` de `app-shell.tsx` junto a `pb-24` y `md:pb-8` para reservar 96 px más el área segura solo en móvil; verificar que el último bloque de una lista larga queda por encima de la barra a 390 px y que `npm test` no detecta valores de espaciado arbitrarios.
- [x] 1.4 Añadir en `sidebar.test.tsx` una prueba de `MobileNav` que compruebe los tres destinos más la acción central, el `aria-current` del destino activo, `min-h-11` y la ausencia de «Ajustes»; verificar que pasa con `npm test`.

## 2. Cabecera móvil transparente con acciones

- [x] 2.1 Añadir a `MobileTopBar` las props de avisos y el botón `NotificationsMenu` junto al buscador y el avatar; verificar con una prueba unitaria que los tres controles están presentes, que el avatar apunta a `/ajustes` y que la campana anuncia el contador de pendientes.
- [x] 2.2 Hacer la cabecera transparente (sin `bg-surface-default` ni `border-b`) y envolver las acciones en una píldora redondeada que muestre superficie solo cuando el contenido está desplazado, ocultando el logotipo en ese estado; verificar en el frontal a 390 px que en reposo se ve el logotipo y al scrollear aparece la píldora sin cambiar la altura de la cabecera.
- [x] 2.3 Levantar el estado `scrolled` en `AppShell` desde el `onScroll` de `main` con umbral de 8 px y reiniciarlo al cambiar de ruta; verificar en el frontal que al volver arriba o navegar se recupera el logotipo.

## 3. Panel de avisos modal en móvil

- [x] 3.1 Hacer que `NotificationsPanel` se posicione como modal centrado por debajo de `md` mediante clases responsive y elevar la cabecera móvil mientras está abierto; verificar en el frontal que la campana móvil abre el modal por encima de la barra flotante y que Escape y la ✕ lo cierran devolviendo el foco.
- [x] 3.2 Pasar la única instancia de `notificationsPanel` desde `AppShell` a `MobileTopBar` junto al contador; verificar que no se duplica el panel y que los avisos no vistos se marcan al abrirlo en móvil.

## 4. Scroll interno y máscaras del contenido

- [x] 4.1 Ajustar el contenedor raíz, la columna y `main` para que el contenido scrollee dentro del viewport en móvil, y añadir la utilidad `.content-fade-mask` en `globals.css`; verificar en el frontal que el contenido se desvanece bajo la cabecera y antes de la barra flotante, sin desbordamiento horizontal.
- [x] 4.2 Verificar en el frontal que la cabecera y la barra flotante permanecen fijas al scrollear y que abrir el panel de avisos no desplaza el contenido de fondo.

## 5. Cobertura E2E del shell

- [x] 5.1 Añadir en `e2e/shell.spec.ts` una prueba a 390 px que mida la separación lateral e inferior de `nav.fixed`, el radio, la sombra y el `backdrop-filter` del `<ul>`, la altura de los enlaces (≥44 px), la ausencia de desbordamiento horizontal y la inmovilidad de la barra al hacer scroll; verificar que pasa con `npm run e2e:worktree`.
- [x] 5.2 Verificar que la barra flotante desaparece en tablet y que las pruebas E2E existentes de navegación, avatar→ajustes y overscroll siguen pasando con `npm run e2e:worktree`.
- [x] 5.3 Añadir en `e2e/shell.spec.ts` una prueba móvil de cabecera transparente, píldora y logotipo según el scroll, máscara del contenido y apertura del panel de avisos en modal; verificar que pasa con `npm run e2e:worktree`.

## 6. Documentación y verificación de integración

- [x] 6.1 Registrar las desviaciones visuales de la barra y de la cabecera en `docs/desarrollo/desviaciones.md` y verificar con `git status` que no se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/`.
- [x] 6.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`, y verificar que todos pasan sin errores.
- [x] 6.3 Ejecutar la suite completa de `npm run e2e:worktree` y verificar que pasa; con 14 workers aparecen fallos intermitentes de timing en pruebas de título y contadores, así que se confirma en verde con `E2E_PORT=3100 npx playwright test --workers=4` (227 passed, 13 skipped).

## 7. Ajustes de alineación y máscara

- [x] 7.1 Alinear la barra inferior con el ancho del contenido en móvil (`inset-x-5`, sin `max-w-md`) y actualizar la E2E para comparar sus bordes con el `main` más su padding; verificar en el frontal a 390 px que ambos bordes coinciden.
- [x] 7.2 Hacer que la píldora de acciones sea `fixed right-5 top-3`, alineada con el borde derecho del contenido, dejando el logotipo en la cabecera; verificar en el frontal que la píldora no se desplaza con el contenido y que el logotipo sigue ocultándose al scrollear.
- [x] 7.3 Llevar la máscara superior al borde del viewport: `main` empieza en y=0 bajo la cabecera con `pt-20`, el degradado superior va de 0 a 56 px solo en móvil y se mantiene de 0 a 24 px en tablet y escritorio; verificar en el frontal que el contenido se desvanece suavemente hasta el borde superior sin corte bajo la cabecera.
- [x] 7.4 Actualizar las pruebas unitarias y E2E afectadas y repetir `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y la suite E2E con `--workers=4`; verificar que todo pasa (227 passed, 13 skipped).

## 8. Ajustes finales de la navegación móvil

- [x] 8.1 Cambiar el radio de la superficie flotante a `rounded-full` y actualizar la prueba unitaria, la E2E y la documentación; verificar en el frontal a 390 px que la barra tiene forma de píldora, que las etiquetas siguen legibles y que las verificaciones pasan.
- [x] 8.2 Subir los botones de búsqueda y avisos de la píldora a 48 px con iconos de 24 px, manteniendo el avatar de 40 px; verificar en el frontal que los tres controles quedan alineados dentro de la píldora.
- [x] 8.3 Convertir el panel de avisos móvil de modal centrado a modal inferior (bottom sheet) conservando contenido, cierre y foco; verificar en el frontal que se ancla al borde inferior con esquinas superiores redondeadas y que la E2E de avisos pasa.
- [x] 8.4 Ampliar el desvanecimiento inferior del contenido de 88 px a 144 px para que el contenido se apague antes de llegar a la barra flotante; verificar en el frontal y en la E2E que la máscara usa el nuevo valor.
- [x] 8.5 Repetir `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y la suite E2E con `--workers=4`; verificar que todo pasa (227 passed, 13 skipped).

## 9. Más desvanecimiento hacia la barra

- [x] 9.1 Ampliar el desvanecimiento inferior del contenido de 144 px a 200 px y actualizar la E2E y la documentación; verificar en el frontal y con la suite E2E que la máscara usa el nuevo valor y que todo pasa.

- [x] 9.2 Rellenar por completo el ítem activo de la barra flotante (fondo en icono y texto) y reducir la separación entre icono y etiqueta; verificar en el frontal y en las pruebas que el activo se distingue y mantiene 44 px de objetivo táctil.

## 10. Color y animación del destino activo

- [x] 10.1 Sustituir el relleno del activo por `bg-surface-sunken text-text-primary`, como las tarjetas de cuentas del dashboard, y animar el cambio de estado con una transición de color de 180 ms con `ease-out` fuerte y variante reducida; verificar en el frontal y en unitarias/E2E que el activo es sutil y la transición existe.

## 11. Indicador deslizante del activo

- [x] 11.1 Sustituir el fondo del enlace activo por una píldora indicadora que se desplace con `transform` entre pestañas (150–250 ms, `ease-in-out`, sin mover texto ni layout), ocultándose en la acción central y con variante sin movimiento en `prefers-reduced-motion`; verificar en unitarias, E2E y frontal que el indicador se desplaza al cambiar de destino.

## 12. Preparación para un cuarto destino

- [x] 12.1 Calcular los huecos de la barra desde el número de destinos (más la acción central), mostrar solo la etiqueta del activo en posición absoluta para centrar verticalmente los iconos, y usar un fondo `rounded-lg` que contenga el texto completo; verificar en unitarias, E2E y frontal que el indicador se alinea, que los iconos conservan su posición y que «Movimientos» no se corta.

## 13. Iconos centrados y etiqueta completa

- [x] 13.1 Centrar verticalmente el icono de cada pestaña (`flex items-center`) con la etiqueta en posición absoluta; verificar en el frontal, unitarias y E2E que el icono está centrado.
- [x] 13.2 Sustituir el fondo rectangular del activo por una píldora `rounded-full` 12 px más ancha que el hueco (`shrink-0`) que crece de `scale-90` a `scale-100`, conservando el desplazamiento; verificar en el frontal y en E2E que es redonda, más ancha que el hueco y que sigue moviéndose al cambiar de destino.

## 14. Tres columnas, activo expandido y separado del botón central

- [x] 14.1 Reinterpretar la barra como tres columnas (destinos izquierdos, añadir, destinos derechos), repartir cada columna lateral 1:2 para que el activo se expanda, calcular la píldora con `calc` CSS sobre el ancho del `<ul>`, dejar 8 px con el botón central y aumentar la separación icono–etiqueta a 7 px con pestañas de 56 px; verificar en frontal, unitarias y E2E que el activo es más ancho, no toca el FAB y el indicador se desplaza al cambiar de destino.

## 15. Elevación animada del icono activo

- [x] 15.1 Elevar 6 px el icono del destino activo con `-translate-y-1.5` y `transition-transform duration-base`, subir la etiqueta a `bottom-1.5` para acortar el hueco a 1 px (7 px en el activo) y verificar en el frontal, unitarias y E2E que el icono activo queda por encima del inactivo, que la etiqueta no se mueve y que la subida está animada.

## 16. Agrupación visual de la cabecera móvil

- [x] 16.1 Compactar la píldora con `gap-0` y `ml-2` en el enlace del avatar, dejando las tres separaciones equilibradas en 24 px y la píldora 8 px más estrecha, sin reducir los botones de 48 px; verificar en el frontal, unitarias y E2E que el avatar ya no parece pegado a los avisos.

## 17. Retirada del destino de prueba

- [x] 17.1 Quitar el botón temporal `/cuentas` de `MobileNav` y sus aserciones en `sidebar.test.tsx` y `e2e/shell.spec.ts`; el recuento de enlaces de la barra vuelve de 5 a 4 y se repiten todas las verificaciones antes de archivar. El cuarto destino real será cuentas en un change posterior.

## Workflow follow-up

- Detener el frontal con `npm run preview:worktree:stop`, archivar el change en la rama `floating-mobile-nav` y abrir la PR contra `main` siguiendo `AGENTS.md`.
- Mover la tarjeta `otzs8noyp5hq` a `DONE` con `node scripts/kan-sync.mjs done floating-mobile-nav --pr <url>`.
- No hacer merge ni limpiar el worktree hasta que una persona confirme el merge de la PR.
