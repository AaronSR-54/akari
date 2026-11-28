# Producto · Shell Web Specification

## Purpose

Define la estructura de navegación y el comportamiento responsive de la aplicación web de akari para que todas las pantallas compartan shell, contexto de ubicación y patrones de interacción consistentes. Incluye la fijación de la navegación, la cabecera de acciones, la identidad de la persona y la separación con el contenido.

## Requirements

### Requirement: Navegación principal de escritorio

La aplicación web SHALL ofrecer una navegación principal persistente en escritorio con los destinos Resumen, Movimientos y Grupos, y SHALL indicar el destino activo. MUST NOT incluir «Ajustes» como destino de la navegación principal. La expansión transitoria por hover o foco SHALL superponerse al contenido con sombra y atenuación sin alterar el ancho del área principal; la expansión fijada SHALL reservar el ancho completo y redimensionar el contenido.

#### Scenario: Destino activo

- **WHEN** la persona navega a cualquier sección principal
- **THEN** el shell marca esa sección como activa de forma textual y visual, no solo por color

#### Scenario: Sidebar compacta y expandida

- **WHEN** la ventana está en escritorio
- **THEN** la sidebar arranca compacta, se expande con hover o con el control dedicado y se colapsa al salir o al usar el control

#### Scenario: Expansión de la sidebar sin desplazar el contenido

- **WHEN** la persona hace hover sobre la sidebar compacta y esta pasa a la vista expandida sin fijarla
- **THEN** el panel se dibuja sobre el contenido con sombra pronunciada y una atenuación ligera, y el área principal conserva el mismo ancho y posición que en estado compacto

#### Scenario: Sidebar fijada abierta

- **WHEN** la persona usa el control para fijar la sidebar en la vista expandida
- **THEN** el shell reserva 240 px para la navegación, el contenido se redimensiona para verse entero y no aparece la atenuación

#### Scenario: Colapso tras la expansión superpuesta

- **WHEN** la persona retira el puntero de la sidebar expandida sin haber fijado el panel
- **THEN** la sidebar vuelve a la vista compacta, desaparecen la sombra pronunciada y la atenuación, y el contenido recupera su ancho sin desplazarse

#### Scenario: Navegación exclusiva

- **WHEN** se muestra la sidebar
- **THEN** no se muestra simultáneamente el header superior alternativo como segunda navegación principal

#### Scenario: Sin acceso duplicado a ajustes

- **WHEN** se muestra cualquiera de las variantes de la navegación principal
- **THEN** no aparece «Ajustes» como destino de esa navegación

### Requirement: Header superior alternativo

La aplicación web SHALL ofrecer una variante de shell con header superior transparente y navegación centrada, utilizable como alternativa a la sidebar sin duplicar pantallas.

#### Scenario: Cambio de shell

- **WHEN** se activa el shell con header superior
- **THEN** las mismas pantallas y rutas siguen funcionando y solo el destino activo aparece resaltado

### Requirement: Comportamiento responsive

La aplicación web SHALL reorganizar navegación y contenido según breakpoints de escritorio, tablet y móvil sin perder funcionalidad ni contenido.

#### Scenario: Tablet

- **WHEN** el ancho de la ventana está entre los breakpoints de tablet
- **THEN** la navegación lateral se sustituye por la barra superior y el contenido pasa a dos columnas o tabla con desplazamiento

#### Scenario: Móvil web

- **WHEN** el ancho es menor que el breakpoint móvil
- **THEN** la navegación pasa a una barra inferior flotante, separada de los bordes del viewport, el contenido a una columna y los controles mantienen objetivos táctiles de 44 px

#### Scenario: Sin desbordamiento

- **WHEN** se reduce el ancho de la ventana hasta el mínimo soportado
- **THEN** no aparece desplazamiento horizontal de página y el contenido sigue siendo legible

### Requirement: Rutas, deep links y contexto

Cada pantalla principal SHALL tener una ruta estable y un título de página único, y SHALL conservar el contexto de navegación al abrir enlaces directos.

#### Scenario: Enlace directo a una cuenta

- **WHEN** se abre la URL de una cuenta o un gasto grupal
- **THEN** la aplicación carga ese recurso, marca la sección correspondiente y permite volver a su listado

#### Scenario: Ruta inexistente

- **WHEN** se abre una ruta que no existe
- **THEN** se muestra un estado de página no encontrada con una acción para volver al resumen

### Requirement: Atajos de teclado

La aplicación web SHALL soportar atajos para buscar, cerrar overlays y navegar con foco visible, documentados en la propia interfaz.

#### Scenario: Búsqueda rápida

- **WHEN** la persona pulsa el atajo de búsqueda
- **THEN** el foco pasa al buscador global y el resto de la pantalla conserva su estado

#### Scenario: Cierre con Escape

- **WHEN** hay un overlay abierto y se pulsa Escape
- **THEN** el overlay se cierra y el foco vuelve al control de origen

### Requirement: Estados de página del shell

El shell SHALL mostrar estados de carga, vacío, error y datos insuficientes sin romper la navegación disponible.

#### Scenario: Error de una sección

- **WHEN** una sección no puede cargar sus datos
- **THEN** muestra un mensaje comprensible, una acción de reintento y mantiene la navegación principal operativa

#### Scenario: Carga inicial

- **WHEN** una vista está cargando
- **THEN** muestra un esqueleto con la forma del contenido final y no un indicador genérico de pantalla completa

### Requirement: Navegación fija durante el scroll y el overscroll

La navegación principal SHALL permanecer en una posición fija mientras se desplaza el contenido, sin animaciones inducidas por el scroll o el rebote elástico. La barra superior de acciones de la variante sidebar SHALL permanecer pegada al borde superior del viewport tanto en reposo como al hacer scroll.

#### Scenario: Scroll con trackpad

- **WHEN** la persona desplaza el contenido con el trackpad, incluido el rebote elástico al llegar al inicio o al final
- **THEN** la sidebar conserva su posición vertical y la barra de acciones permanece en el borde superior, sin ninguna animación de subida o bajada

#### Scenario: Sin salto al empezar el scroll

- **WHEN** la página está en el inicio y la persona empieza a desplazarla
- **THEN** la barra de acciones ya está pegada al borde superior, no cambia de posición y el contenido no asoma por encima

#### Scenario: Cabecera superior siempre visible

- **WHEN** se recorre una página larga hasta el final y se vuelve al inicio
- **THEN** la barra superior de la variante sidebar con el título de la sección, el buscador y el botón de avisos sigue visible y pegada al borde superior

#### Scenario: Rebote elástico contenido

- **WHEN** el documento recibe un gesto de overscroll en el borde superior o inferior
- **THEN** el rebote no arrastra la navegación y el desplazamiento normal del contenido sigue funcionando

#### Scenario: Ambas variantes del shell

- **WHEN** el shell usa sidebar o cabecera superior como navegación principal
- **THEN** la navegación principal permanece fija en ambos casos, `HeaderNav` ocupa el borde superior desde el reposo y no aparece una segunda navegación duplicada

### Requirement: Cabecera con título y subtítulo en sidebar

La variante sidebar SHALL mostrar en la cabecera fija `DesktopHeader`, como único encabezado visible en escritorio, el título de la sección (`h1`) y, cuando la pantalla lo defina, su subtítulo (`meta`/`description`). Una pantalla MAY omitir el subtítulo para dejar el `h1` centrado verticalmente en la cabecera. El contenido MUST NOT repetir ninguno de los dos en escritorio; `actions` y `breadcrumbs` permanecen en el contenido. Una pantalla MAY ocultar su bloque de título/subtítulo en móvil cuando esa información ya esté presente en el cuerpo; en tablet el título SHALL seguir mostrándose en el contenido. La variante header MUST NOT mostrar una barra secundaria de título; `HeaderNav` SHALL seguir siendo la única barra superior.

#### Scenario: Sidebar con título y subtítulo en la cabecera

- **WHEN** se abre una página como Movimientos o Ajustes con la navegación lateral en escritorio
- **THEN** la cabecera muestra a la izquierda el título y debajo el subtítulo, a la derecha el buscador y el botón de avisos, y existe un único `h1` visible en la página

#### Scenario: Cabecera con el título solo

- **WHEN** se abre el resumen con la navegación lateral en escritorio
- **THEN** la cabecera muestra únicamente el saludo como `h1`, centrado verticalmente y sin subtítulo debajo
- **AND** el buscador y el botón de avisos siguen a la derecha y el `h1` sigue siendo el único visible en la página

#### Scenario: Sin encabezado duplicado en el contenido

- **WHEN** el shell está en modo sidebar y la ventana está en breakpoint de escritorio
- **THEN** el encabezado del contenido no repite el título ni el subtítulo y conserva `actions` y `breadcrumbs`

#### Scenario: Título y subtítulo dinámicos en la cabecera

- **WHEN** se abre una cuenta, un grupo o una pantalla con título y subtítulo dinámicos en vista sidebar
- **THEN** la cabecera muestra los mismos valores que antes mostraba el contenido y el `document.title` no cambia

#### Scenario: Tablet y móvil sin cambios

- **WHEN** la ventana está en tablet o móvil con la navegación lateral configurada
- **THEN** en tablet el título sigue mostrándose solo en el contenido y ninguna cabecera secundaria duplica el `h1`
- **AND** en móvil el resumen no renderiza el bloque con el saludo ni su subtítulo porque la fecha y el número de cuentas ya están en el cuerpo

#### Scenario: Páginas de navegación sin título en móvil

- **WHEN** la ventana está en móvil y se abre Movimientos o Grupos
- **THEN** el título de la sección no se renderiza en el contenido porque la navegación ya nombra el destino
- **AND** las acciones de la pantalla siguen visibles en móvil

#### Scenario: Páginas fuera de la navegación conservan el título

- **WHEN** se abre una pantalla que no está en la navegación, como una cuenta, un grupo, un formulario, Preguntas rápidas o Ajustes desde el avatar
- **THEN** el título sigue visible en móvil, tablet y escritorio
- **AND** el contexto que antes era subtítulo de la cabecera se muestra en el cuerpo con la misma tipografía que el resumen

#### Scenario: Variante header sin barra de subtítulo

- **WHEN** el shell usa la cabecera superior como navegación principal
- **THEN** solo existe `HeaderNav` en la parte superior, sin una segunda barra con el título y sin buscador ni avisos duplicados

#### Scenario: Contenido sin asomar por encima

- **WHEN** se hace scroll en una página larga con la navegación lateral
- **THEN** ningún encabezado del contenido queda visible por encima de la barra de título pegada al borde superior

### Requirement: Separación entre la cabecera y el contenido

La cabecera superior y el primer bloque del contenido SHALL mantener una separación vertical mínima de 24 px en todos los breakpoints donde existe una cabecera fija; el contenido MUST NOT empezar pegado al borde inferior de la cabecera.

#### Scenario: Título con aire bajo la cabecera

- **WHEN** se abre una página con la cabecera visible, en escritorio, tablet o móvil
- **THEN** el primer bloque del contenido empieza al menos 24 px por debajo del borde inferior de la cabecera

#### Scenario: Al hacer scroll

- **WHEN** la persona desplaza el contenido
- **THEN** la separación forma parte del contenido, la cabecera sigue pegada arriba y su altura no cambia

### Requirement: Identidad única en la navegación de escritorio

La variante de sidebar SHALL mostrar el avatar de la persona una sola vez, en el pie de la sidebar, y MUST NOT duplicarlo en la cabecera superior. La variante de header SHALL mostrarlo una sola vez en la navegación superior. El avatar SHALL servir como acceso a `/ajustes` en todas las variantes del shell y SHALL conservar el nombre accesible de la persona.

#### Scenario: Sidebar visible

- **WHEN** el shell usa la sidebar como navegación principal
- **THEN** solo hay un avatar visible, situado en el pie de la sidebar, y la cabecera superior muestra el buscador y el botón de avisos sin repetir la identidad

#### Scenario: Header superior

- **WHEN** el shell usa la cabecera superior como navegación principal
- **THEN** solo hay un avatar visible y está en la navegación superior

#### Scenario: Etiqueta accesible

- **WHEN** se inspecciona el avatar visible
- **THEN** conserva el nombre accesible de la persona, no se elimina del árbol de accesibilidad y su control de acceso anuncia que abre ajustes

#### Scenario: Acceso a ajustes desde la identidad

- **WHEN** la persona activa el avatar visible en sidebar, header, tablet o móvil
- **THEN** la aplicación abre `/ajustes` y muestra el panel con la sección de perfil

### Requirement: Tamaños unificados de la navegación

El shell SHALL usar una misma escala de tamaños para el logotipo, los ítems de navegación y el avatar en todas sus variantes, de modo que cambiar entre sidebar y header no altere esas dimensiones.

#### Scenario: Tamaños en escritorio

- **WHEN** se compara la sidebar expandida con `HeaderNav` en escritorio
- **THEN** ambos muestran el logotipo expandido a 32 px, los ítems de navegación con altura de 44 px y el avatar a 40 px

#### Scenario: Tamaños en tablet

- **WHEN** se muestra la navegación superior en el breakpoint de tablet
- **THEN** los ítems de navegación miden 44 px de altura y el avatar mide 40 px, con el logotipo expandido a 32 px

#### Scenario: Tamaños en móvil

- **WHEN** se muestra la barra superior y la barra inferior en móvil
- **THEN** el avatar de la barra superior mide 40 px y los destinos de la barra inferior mantienen un objetivo táctil de al menos 44 px

#### Scenario: Identidad sin duplicados

- **WHEN** se unifican los tamaños de la navegación
- **THEN** sigue apareciendo un único avatar por variante y el logotipo conserva su etiqueta accesible

### Requirement: Panel unificado de perfil y ajustes

La ruta `/ajustes` SHALL ser la única superficie de perfil y ajustes, y SHALL mostrar y permitir editar el nombre de la persona junto a la configuración local sin introducir autenticación, cifrado ni sincronización.

#### Scenario: Identidad en el panel

- **WHEN** se abre `/ajustes` desde el avatar del shell
- **THEN** el panel muestra una sección de perfil con la misma identidad que muestra el shell y conserva las opciones de datos locales existentes

#### Scenario: Edición del nombre

- **WHEN** se guarda un nombre válido desde la sección de perfil
- **THEN** el panel, el avatar de todas las variantes del shell y el saludo del resumen muestran el nombre guardado sin salir de la aplicación

#### Scenario: Identidad sin credenciales

- **WHEN** se consulta o edita la sección de perfil
- **THEN** la aplicación no pide credenciales ni envía datos a un servidor, y la identidad sigue siendo local al dispositivo

### Requirement: Título de la ruta de ajustes

La ruta `/ajustes` SHALL usar «Ajustes» como título de página y SHALL describir en el cuerpo que el panel reúne el perfil y los datos guardados en el dispositivo; la cabecera MUST NOT mostrar subtítulo.

#### Scenario: Título en la cabecera

- **WHEN** se abre `/ajustes` con la navegación lateral en escritorio
- **THEN** la cabecera muestra «Ajustes» como único `h1` visible y sin subtítulo, y el cuerpo menciona el perfil y los datos locales

#### Scenario: Título en móvil

- **WHEN** se abre `/ajustes` en móvil
- **THEN** el contenido muestra «Ajustes» como título con la separación mínima respecto a la barra superior

### Requirement: Afordancia del acceso desde la identidad

El control de identidad del shell SHALL mostrar un cambio visual al pasar el puntero y SHALL ofrecer un tooltip que identifique el destino «Ajustes», sin perder el foco visible por teclado ni el nombre accesible de la persona.

#### Scenario: Hover sobre el avatar

- **WHEN** la persona sitúa el puntero sobre el avatar en cualquier variante del shell
- **THEN** el control cambia de fondo y muestra el tooltip «Ajustes», haciendo perceptible que es pulsable

#### Scenario: Navegación por teclado

- **WHEN** la persona llega al avatar con el teclado
- **THEN** conserva el anillo de foco y su nombre accesible, y al activarlo abre `/ajustes`

### Requirement: Barra inferior flotante en móvil

En el breakpoint móvil la navegación principal SHALL mostrarse como una superficie flotante y elevada, separada de los bordes inferior y laterales, sin una franja opaca que cruce todo el ancho. SHALL conservar los destinos Resumen, Movimientos y Grupos, la acción «Añadir movimiento», el destino activo con `aria-current` y un objetivo táctil de al menos 44 px por destino.

#### Scenario: Superficie flotante

- **WHEN** se abre cualquier pantalla de la aplicación en móvil
- **THEN** la navegación inferior aparece separada de los bordes del viewport, con esquinas redondeadas, sombra y fondo difuminado, sin borde superior que ocupe todo el ancho

#### Scenario: Alineada con el contenido

- **WHEN** se abre una pantalla en móvil
- **THEN** la barra flotante ocupa el mismo ancho que el área de contenido, alineada con sus bordes laterales, sin un tope que la estreche en pantallas anchas

#### Scenario: Destinos y acción central

- **WHEN** la persona usa la navegación inferior flotante
- **THEN** siguen disponibles los destinos Resumen, Movimientos y Grupos y la acción «Añadir movimiento» abre la creación de movimiento

#### Scenario: Capacidad para más destinos

- **WHEN** la barra recibe un destino adicional
- **THEN** la píldora indicadora reparte los huecos entre todos los destinos y la acción central, solo se muestra la etiqueta del destino activo, las etiquetas ocultas conservan su hueco y ninguna etiqueta visible desborda ni provoca scroll horizontal a 320 px

#### Scenario: Etiqueta del activo e iconos fijos

- **WHEN** cambia el destino activo en móvil
- **THEN** la etiqueta del nuevo activo aparece con una transición de opacidad, la del anterior se oculta sin dejar de ocupar su espacio, el centro de todos los iconos permanece en la misma posición y cada icono sigue centrado verticalmente en su hueco

#### Scenario: Destino activo

- **WHEN** la persona navega a una sección principal en móvil
- **THEN** el destino correspondiente queda marcado con `aria-current`, se expande al doble que su vecino dentro de su columna lateral y una píldora redonda cubre ese ancho sin tocar el botón central; el icono se eleva con una transición mientras la etiqueta permanece en su sitio, sin mover el contenido ni duplicar la navegación

#### Scenario: Objetivos táctiles

- **WHEN** se mide cada enlace de la barra inferior flotante en móvil
- **THEN** su altura es de al menos 44 px y la barra no produce desplazamiento horizontal de página

#### Scenario: Area segura del dispositivo

- **WHEN** el dispositivo expone un margen inferior de área segura
- **THEN** la barra respeta ese margen y no queda cortada ni solapa los controles del sistema

#### Scenario: Contenido no tapado

- **WHEN** se recorre una página larga hasta el final en móvil
- **THEN** el último bloque de contenido queda por encima de la barra flotante y no queda oculto tras ella

#### Scenario: Estable durante el scroll

- **WHEN** la persona desplaza el contenido o el documento recibe un rebote elástico
- **THEN** la barra flotante conserva su posición, sin animaciones inducidas por el scroll

#### Scenario: Solo en móvil

- **WHEN** la ventana alcanza el breakpoint de tablet
- **THEN** la barra inferior flotante desaparece y la navegación superior ocupa su lugar sin destinos duplicados

### Requirement: Cabecera móvil transparente con acciones

En el breakpoint móvil la cabecera superior SHALL ser transparente, sin fondo opaco ni borde inferior, y SHALL mostrar el logotipo a la izquierda y las acciones de búsqueda, avisos y avatar a la derecha. El avatar SHALL seguir abriendo `/ajustes` y la campana SHALL abrir el panel de avisos. Cada acción SHALL mantener un objetivo táctil de al menos 44 px.

#### Scenario: Estado en reposo

- **WHEN** se abre una pantalla en móvil con el contenido en la parte superior
- **THEN** la cabecera muestra el logotipo a la izquierda y buscador, avisos y avatar a la derecha, sin fondo opaco ni borde que la separe del contenido

#### Scenario: Acciones disponibles

- **WHEN** la persona activa las acciones de la cabecera móvil
- **THEN** el buscador se abre, la campana abre el panel de avisos y el avatar abre `/ajustes`, sin destinos duplicados en la navegación

#### Scenario: Objetivos táctiles en la cabecera

- **WHEN** se mide cada control de la cabecera móvil
- **THEN** todos tienen al menos 44 px de altura y no aparece desplazamiento horizontal

#### Scenario: Agrupación visual de los iconos

- **WHEN** se comparan las separaciones entre los controles de la cabecera móvil
- **THEN** el hueco entre los glifos de búsqueda y avisos no es mayor que el hueco entre el glifo de avisos y el avatar sólido, con las tres separaciones equilibradas y sin reducir el tamaño de los botones

### Requirement: Cabecera móvil al hacer scroll

La cabecera móvil SHALL reaccionar al desplazamiento del contenido ocultando el logotipo y mostrando una píldora redondeada detrás de las acciones de la derecha. Al volver el contenido al inicio SHALL recuperarse el estado de reposo, sin cambiar la posición de la cabecera ni provocar saltos de layout.

#### Scenario: Contenido desplazado

- **WHEN** el contenido se desplaza más allá de un umbral pequeño en móvil
- **THEN** el logotipo desaparece y una píldora redondeada con superficie elevada aparece detrás de buscador, avisos y avatar

#### Scenario: Píldora fija

- **WHEN** la persona desplaza el contenido en móvil
- **THEN** la píldora de acciones permanece fija en la esquina superior derecha, alineada con el borde derecho del contenido, sin moverse con el scroll

#### Scenario: Vuelta al inicio

- **WHEN** el contenido vuelve a la parte superior en móvil
- **THEN** el logotipo vuelve a verse, la píldora pierde su superficie y la cabecera conserva su altura y posición

#### Scenario: Sin desplazamiento de la cabecera

- **WHEN** se recorre una página larga y se vuelve al inicio
- **THEN** la cabecera permanece fija en la parte superior, sin animaciones inducidas por el scroll ni cambio de altura

### Requirement: Scroll interno y máscaras del contenido en móvil

En el breakpoint móvil el contenido SHALL desplazarse dentro de un contenedor de altura de viewport, manteniendo la cabecera y la barra inferior flotante fijas. El contenedor SHALL aplicar `mask-image` para desvanecer el contenido bajo la cabecera y justo antes de la barra flotante, sin cortes duros.

#### Scenario: Desplazamiento contenido

- **WHEN** la persona desplaza el contenido en móvil
- **THEN** solo se mueve el área de contenido, mientras la cabecera y la barra inferior flotante conservan su posición

#### Scenario: Desvanecido superior

- **WHEN** el contenido se acerca al borde superior del viewport en móvil
- **THEN** se desvanece gradualmente desde el borde superior del viewport hasta el final de la cabecera transparente, sin cortarse de forma brusca ni dejar una franja vacía debajo

#### Scenario: Desvanecido inferior

- **WHEN** el contenido se acerca a la barra inferior flotante
- **THEN** se desvanece gradualmente en un tramo amplio antes de la barra, sin quedar contenido dibujado por encima de ella

#### Scenario: Sin rebote del fondo

- **WHEN** se alcanza el inicio o el final del contenido interno en móvil
- **THEN** el rebote no arrastra la cabecera ni la barra flotante y el scroll del panel de avisos no desplaza el fondo
