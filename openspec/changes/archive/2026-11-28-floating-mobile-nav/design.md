# Design

## Context

Ver `proposal.md` para la motivación. Toda la barra inferior vive en `MobileNav`, al final de `apps/web/src/components/shell/sidebar.tsx`: hoy es `fixed inset-x-0 bottom-0` con `border-t` y `bg-surface-default`, con un botón central «Añadir movimiento» dibujado a mano y elevado con `-translate-y-3`. El shell reserva `pb-24` en `main` (`app-shell.tsx`) y `.safe-bottom` en `globals.css` añade `env(safe-area-inset-bottom)`. El capability `producto/shell-web` ya exige destinos fijos, 44 px de objetivo táctil y sin desbordamiento; esta fase cambia solo la presentación de la barra y la reserva de espacio. Los worktrees resuelven `@akari/ui` y `@akari/tokens` contra el checkout principal, así que no se tocan esos paquetes.

## Goals / Non-Goals

**Goals:**

- Que la barra inferior se lea como una superficie flotante sobre el contenido, con separación de los bordes, radios, sombra y difuminado.
- Que conservar destinos, estado activo, accesibilidad y objetivos táctiles no obligue a cambiar rutas ni modelos de navegación.
- Que el contenido siga siendo alcanzable hasta el final en móvil, también con área segura.
- Cubrir la geometría y el comportamiento con pruebas unitarias y E2E.

**Non-Goals:**

- Modificar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`, ni usar FigCraft.
- Cambiar la navegación de tablet y escritorio, los destinos del shell ni el comportamiento del FAB en otras variantes.
- Añadir animaciones, gestos, persistencia ni estado nuevo al shell.
- Tocar `domain`, `data`, `tokens`, `ui`, dependencias ni datos.

## Decisions

### 1. Superficie flotante en el propio `MobileNav`

El `<nav>` conserva `fixed`, `z-40`, `md:hidden`, `aria-label="Navegación principal"` y `.safe-bottom`, pero sustituye `inset-x-0 bottom-0 border-t bg-surface-default` por `inset-x-5 bottom-3`: 20 px de separación lateral, los mismos que `px-5` de `main` en móvil, para que la barra tenga exactamente el ancho del contenido. La superficie, el radio, el borde sutil, la sombra y el difuminado se mueven al `<ul>` interior: `rounded-full`, `border border-border-subtle`, `bg-surface-raised/90`, `backdrop-blur-sm` y `elevation-3`. El radio completo convierte la barra en una píldora; se elimina `max-w-md`, que estrechaba la barra en pantallas de móvil anchas.

- **Alternativa descartada:** conservar `inset-x-3` con `max-w-md`. Deja la barra más ancha que el contenido en 390 px y más estrecha en móviles grandes, sin alineación con ningún borde del texto.

- **Alternativa descartada:** dejar la superficie en el `<nav>` y solo añadir el radio y la sombra. El padding de `.safe-bottom` quedaría dentro del área coloreada, así que en dispositivos con área segura aparecería una franja opaca vacía bajo los controles.
- **Alternativa descartada:** un contenedor `relative` con un hijo `absolute` para la barra. Añade anidamiento sin beneficio: `fixed` ya es independiente del contenedor y el shell no tiene scroll propio en móvil.
- **Alternativa descartada:** `bg-surface-default` opaco sin `backdrop-blur-sm`. La barra seguiría leyéndose como una franja del lienzo; el difuminado es el que la separa del contenido que pasa por debajo. El token `surface-raised` expone canales `-rgb`, así que el modificador de opacidad es válido.

La clase `fixed` se conserva deliberadamente: las E2E existentes localizan la barra con `nav.fixed a` y el requisito de navegación fija durante el scroll sigue aplicando.

### 2. Acción central y estados sin cambios funcionales

El enlace a `/movimientos/nuevo` mantiene `aria-label="Añadir movimiento"`, `aria-current` cuando corresponde, `h-14 w-14`, `rounded-full`, `elevation-2` y `-translate-y-3`. Al estar la barra separada del borde, el botón sobresale ligeramente por encima del `<ul>`; como este no tiene `overflow-hidden`, el botón y su anillo de foco siguen visibles. No se usa `Fab` de `@akari/ui` porque es un `<button>` y aquí hace falta un `Link` de Next, y porque el paquete se resuelve desde `main` en los worktrees.

Los destinos conservan `min-h-11`. El indicador de activo usa `bg-surface-sunken text-text-primary`, el mismo par de superficie y texto que usan las tarjetas de cuentas del dashboard, junto con `aria-current="page"`. El icono se centra verticalmente en el enlace (`flex items-center`) y la etiqueta va en un `<span absolute inset-x-0 bottom-0 text-center>`: así el icono no se desplaza hacia arriba cuando aparece la etiqueta. El `<span>` del icono no tiene fondo propio para que el relleno sea un único conjunto.

El cambio de destino es una transición de estado poco frecuente (decenas al día), así que se resuelve con CSS y sin librería. El relleno no vive en cada enlace, sino en una píldora indicadora `absolute` dentro del `<ul>`: su contenedor aplica `transform: translateX()` según el hueco activo (0, 1 o 3 con tres destinos, porque la acción central ocupa el hueco 2) con `transition-transform duration-base` (180 ms) y `ease-[cubic-bezier(0.77,0,0.175,1)]`, mientras la píldora interior escala de `scale-90` a `scale-100`. Solo se animan `transform` y `opacity`: ni el texto ni el layout se mueven. El indicador se oculta con `opacity: 0` cuando el destino activo es «Añadir movimiento», que ya tiene su propio botón elevado. Con `motion-reduce:transition-none` el indicador salta al destino sin desplazamiento, mientras el color del texto conserva una transición corta (`motion-reduce:duration-fast`).

### 2b. Preparación para un cuarto destino

La barra se interpreta como **tres columnas**: los dos destinos de la izquierda, el botón central de «Añadir movimiento» y los dos destinos de la derecha. Cada columna lateral reparte su ancho entre sus dos elementos en proporción **1:2** (`grow` / `grow-[2]`, ambos con `basis-0`), de modo que el destino activo se expande al doble que su vecino y el botón central conserva siempre sus 56 px. Las columnas laterales llevan `flex-1` y el botón central `mx-2`, con 8 px de separación a cada lado para que el fondo activo no se pegue a él.

Para que añadir más destinos no desplace los iconos, **solo se ve la etiqueta del destino activo**. Todas las pestañas renderizan siempre icono y etiqueta; la etiqueta es `absolute inset-x-0 bottom-0`, con `opacity-0` o `opacity-100` según el estado y `transition-opacity duration-base`. Al ser absoluta no empuja al icono: este queda centrado en su enlace (`h-14`, `items-center`) y mantiene la misma posición horizontal al cambiar de pestaña. En el activo, el icono se eleva 6 px con `-translate-y-1.5` y `transition-transform duration-base ease-[cubic-bezier(0.23,1,0.32,1)]`, mientras la etiqueta no se mueve; así el hueco entre icono y texto pasa de 1 px a 7 px, con la etiqueta subida a `bottom-1.5`. La subida y la vuelta a la posición se animan juntas con el cambio de fondo, para que el estado activo no aparezca como un salto.

El fondo del activo es una píldora `rounded-full` que ocupa los dos tercios de su columna (≈87 px a 390 px, frente a los 66 px de un hueco fijo). Su posición y ancho se expresan con `calc` puro sobre el ancho del `<ul>`: el ancho útil es `100% - 5.5rem` (padding 16 px + botón 56 px + márgenes 16 px), cada columna es su mitad y el activo los dos tercios de la columna. Así no hay medición en JS ni `ResizeObserver`, y el cálculo es correcto desde el primer render aunque el viewport cambie. Se anima con `transition-[left,width,opacity]` de 180 ms y `ease-[cubic-bezier(0.77,0,0.175,1)]`, conservando el desplazamiento al cambiar de destino y la expansión de la columna. Ocupa `top-1.5 bottom-1.5` (≈7 px de margen dentro de la barra) para que no se vea demasiado alta; con la etiqueta subida a `bottom-1.5`, el texto sigue entrando dentro del radio. La etiqueta usa `truncate` como red de seguridad en pantallas estrechas y el nombre accesible de los destinos sigue presente para lectores de pantalla.

La geometría se validó con un cuarto destino temporal (`/cuentas`, etiqueta «Cartera») dentro de `MobileNav`, sin tocar `navItems` para no afectar al sidebar ni a la cabecera. El botón de prueba y sus aserciones se retiraron antes de archivar: la barra sigue con tres destinos y la acción central, preparada para añadir cuentas como cuarto destino en un change posterior.

### 3. Reserva de espacio del contenido

`main` conserva `pb-24`, que pertenece a la escala de espaciado, y añade la utilidad `safe-bottom-content`, definida en `globals.css` solo por debajo de 768 px, que fija `padding-bottom: calc(6rem + env(safe-area-inset-bottom, 0px))`. En tablet y escritorio sigue rigiendo `md:pb-8`. La altura de la barra es de unos 70 px (tabs de 56 px + `py-1.5`); con 12 px de separación al borde y el margen de área segura, 96 px más el safe area dejan aire por encima de la barra incluso al llegar al final de una lista.

- **Alternativa descartada:** ampliar `pb-24` a `pb-28` sin el safe area. En dispositivos con muesca la barra sube con el entorno y vuelve a tapar el último bloque.
- **Alternativa descartada:** aplicar `.safe-bottom` a `main`. La utilidad es incondicional y añadiría padding también en tablet y escritorio, donde ya existe `md:pb-8`.
- **Alternativa descartada:** un valor arbitrario `pb-[calc(...)]` de Tailwind. `apps/web/src/design-system.test.ts` prohíbe los valores de espaciado arbitrarios, así que la reserva se expresa como utilidad nombrada en `globals.css`.

### 4. Verificación

- Unitaria nueva en `sidebar.test.tsx`: `MobileNav` con `usePathname` simulado renderiza tres pestañas más la acción central, marca el destino activo con `aria-current`, mantiene `min-h-11` y no incluye «Ajustes».
- E2E en `e2e/shell.spec.ts`: a 390 px medir el `nav.fixed` con `boundingBox()` (separación lateral e inferior de 12 px, sin areassegura en el navegador de prueba), comprobar radio, sombra y `backdrop-filter` en el `<ul>`, ausencia de desbordamiento horizontal, altura de los enlaces ≥44 px y que la posición no cambia al hacer scroll; verificar que desaparece en tablet.
- Se conservan las E2E existentes de navegación, ajustes desde el avatar y overscroll.

### 5. Cabecera móvil transparente con estados de scroll

`MobileTopBar` pierde `border-b` y `bg-surface-default` y pasa a cuatro props más (`onToggleNotifications`, `notificationCount`, `notificationsOpen`, `notificationsPanel`) para reutilizar `NotificationsMenu` e `IconSearch` con el avatar. El logotipo sigue dentro del `<header>` y se oculta al desplazarse con `opacity-0`, `pointer-events-none` y `tabIndex=-1`. Los tres botones salen del flujo de la cabecera y se envuelven en un contenedor `fixed right-5 top-3 z-30 md:hidden`: 20 px desde el borde derecho, alineado con el contenido, y 12 px desde arriba. Solo muestra superficie (`bg-surface-raised/90`, `backdrop-blur-sm`, `elevation-2`) cuando el contenido está desplazado, así que no se mueve con el scroll.

Buscador y avisos usan botones de 48 × 48 px con iconos de 24 px (`!h-12 !w-12` sobre el tamaño `md` del componente compartido, que no se puede modificar desde el worktree); el avatar conserva sus 40 px dentro de un enlace con `p-1`, que suma 48 px y mantiene alineados los tres controles.

El conjunto se compacta y el espaciado se reparte para corregir la percepción: con `gap-0` entre los tres controles y `ml-2` (8 px) en el enlace del avatar, los glifos de búsqueda y avisos quedan a 24 px y el borde del avatar sólido a 24 px del glifo de avisos. Antes eran 32 px y 24 px, así que el avatar parecía pegado a los avisos; ahora las tres separaciones están equilibradas y la píldora es 8 px más estrecha (160 px), sin reducir los botones de 48 px ni los objetivos táctiles.

- **Alternativa descartada:** mantener la píldora dentro del flex de la cabecera. Su posición dependía del ancho del logotipo y del `justify-between`, y al ocultarse el logotipo los botones podían desplazarse.
- **Alternativa descartada:** ampliar el avatar a 48 px. El usuario pidió mantener su tamaño; el padding del enlace ya iguala la altura total de los botones.

El estado `scrolled` se levanta a `AppShell`: `main` dispara `onScroll` y se marca cuando `scrollTop > 8`, con reset al cambiar `pathname`. Como el scroll pasa a ser interno, escuchar `window` no detectaría el gesto.

- **Alternativa descartada:** un `IntersectionObserver` sobre un centinela al inicio de `main`. Añade un nodo y observadores para el mismo umbral que un `onScroll` resuelve con una comparación.
- **Alternativa descartada:** ocultar el logotipo con `display: none`. Cambia el layout y desplaza los botones al aparecer; se prefiere `opacity` para conservar la posición.

### 6. Panel de avisos en modo modal en móvil

`NotificationsPanel` mantiene el anclaje `absolute right-0 top-[calc(100%+8px)]` para escritorio y, por debajo de `md`, se convierte en un modal inferior: `max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto`, ancho completo, `max-h-[85dvh]` y esquinas superiores redondeadas. No hace falta una segunda instancia ni detección de viewport en JS. El resto del contenido, el `data-notifications-fade`, el bloqueo de scroll y las vías de cierre (Escape, ✕, clic fuera) se comparten. La cabecera y la píldora elevan su `z-index` a `z-50` mientras el panel está abierto para que el modal y su velo queden por encima de la barra flotante (`z-40`). `AppShell` decide con `matchMedia('(max-width: 767px)')` qué cabecera recibe `notificationsPanel`: solo `MobileTopBar` en móvil y solo `DesktopHeader`/`HeaderNav` en el resto, de modo que el panel, el contador de no vistos y el foco al cerrar tengan una sola instancia en el DOM. La máscara de `main` crea un contexto de apilamiento, así que mientras hay un overlay abierto (`html[data-scroll-locked]`) la barra flotante baja a `z-index: -1` para que los modales renderizados dentro de `main` puedan recibir clics.

- **Alternativa descartada:** duplicar un panel móvil. Obligaría a replicar pagos, estados vacíos y marcado de avisos vistos.
- **Alternativa descartada:** reutilizar `Modal` de `@akari/ui`. El panel ya gestiona su propio scroll con máscara y foco; envolverlo añadiría dos capas de cierre.

### 7. Scroll interno y máscaras del contenido

El contenedor raíz pasa a `h-screen overflow-clip` también en móvil; la columna del shell usa `min-h-0` y `main` usa `min-h-0 overflow-y-auto overscroll-contain`. Para que la máscara superior llegue al borde del viewport, `main` empieza en y=0: el `<header>` móvil conserva `sticky top-0` pero compensa su altura con `-mb-14`, y `main` reserva `pt-20` (56 px de cabecera más 24 px de aire) solo en móvil, recuperando `md:pt-6` en el resto. La utilidad `.content-fade-mask` de `globals.css` aplica `mask-image` / `-webkit-mask-image` con un degradado que transparenta desde 0 hasta 56 px en móvil —hasta el final de la cabecera, sin franja vacía— y hasta 24 px en tablet y escritorio; el extremo inferior desvanece los últimos 200 px: además de cubrir la altura de la barra flotante (≈70 px) y su separación (12 px), deja un tramo amplio de apagado progresivo antes de llegar a ella. `html` conserva `overscroll-behavior-y: auto` en móvil; `overscroll-contain` en `main` evita que el rebote se propague sin cambiar el estilo global que ya comprueba la E2E.

- **Alternativa descartada:** dejar `main` debajo del header en el flujo y aplicar la máscara solo a partir de y=56. Deja una franja sin contenido entre la cabecera y el degradado, que es justo el corte que se quiere evitar.

- **Alternativa descartada:** mantener el scroll del documento y superponer degradados fijos. No es `mask-image` y el degradado no sigue al contenido real del contenedor.
- **Alternativa descartada:** calcular la máscara con porcentajes sobre el documento. Con scroll de página el degradado viaja con el contenido; con contenedor propio queda anclado al viewport.

## Risks / Trade-offs

- **[El botón central sobresale de la barra]** → es el efecto buscado; se comprueba que el anillo de foco no queda cortado y que no aparece scroll horizontal.
- **[El difuminado puede encarecer el pintado en móviles antiguos]** → es una única superficie pequeña y fija, sin animación; se usa `backdrop-blur-sm`, el mismo patrón ya presente en paneles y modales.
- **[Los valores de inset y radio son decisiones visuales nuevas]** → quedan registradas en `docs/desarrollo/desviaciones.md`; no se reabre la fase de diseño ni se editan los documentos históricos.
- **[La reserva inferior depende de `env()`]** → en el navegador de E2E el valor es 0, así que la prueba cubre solo el caso sin área segura; la fórmula incorpora la variable para el dispositivo real.
- **[Cambio en el espacio reservado del contenido]** → puede desplazar ligeramente el final de listas largas en móvil; se verifica con la suite completa de E2E.
- **[La cabecera transparente puede reducir contraste]** → las acciones usan los tokens de texto existentes y la píldora aparece solo al scrollear; se revisa en el frontal con tema claro y oscuro.
- **[`mask-image` puede recortar anillos de foco y sombras]** → los márgenes de 24 y 88 px se aplican al contenedor, no a los controles; se comprueba que el foco sigue visible en la barra y en la cabecera.
- **[Scroll interno cambia el modelo del documento en móvil]** → los selectores y esperas de E2E que asumen scroll de ventana se revisan en la suite completa; `html` mantiene su valor de overscroll para no romper la prueba existente.
- **[El panel modal comparte foco y cierre con el desplegable]** → se conserva la búsqueda del botón disparador en el árbol del panel; se verifica que Escape devuelve el foco a la campana móvil.

## Migration Plan

No hay migración de datos ni de esquema. El despliegue es el habitual de la app web y la reversión consiste en revertir el commit del change. El claim, el archivado y la PR se gestionan con el flujo de `AGENTS.md`.

## Open Questions

Ninguna.
