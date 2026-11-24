# Producto · Shell Web Specification

## Purpose

Define la estructura de navegación y el comportamiento responsive de la aplicación web de akari para que todas las pantallas compartan shell, contexto de ubicación y patrones de interacción consistentes. Incluye la fijación de la navegación, la cabecera de acciones, la identidad de la persona y la separación con el contenido.

## Requirements

### Requirement: Navegación principal de escritorio

La aplicación web SHALL ofrecer una navegación principal persistente en escritorio con los destinos Resumen, Movimientos, Grupos y Ajustes, y SHALL indicar el destino activo.

#### Scenario: Destino activo

- **WHEN** la persona navega a cualquier sección principal
- **THEN** el shell marca esa sección como activa de forma textual y visual, no solo por color

#### Scenario: Sidebar compacta y expandida

- **WHEN** la ventana está en escritorio
- **THEN** la sidebar arranca compacta, se expande con hover o con el control dedicado y se colapsa al salir o al usar el control

#### Scenario: Navegación exclusiva

- **WHEN** se muestra la sidebar
- **THEN** no se muestra simultáneamente el header superior alternativo como segunda navegación principal

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
- **THEN** la navegación pasa a barra inferior, el contenido a una columna y los controles mantienen objetivos táctiles de 44 px

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
- **THEN** la barra superior de acciones con el buscador y el botón de avisos sigue visible, pegada al borde superior y sin mostrar el título de la sección

#### Scenario: Rebote elástico contenido

- **WHEN** el documento recibe un gesto de overscroll en el borde superior o inferior
- **THEN** el rebote no arrastra la navegación y el desplazamiento normal del contenido sigue funcionando

#### Scenario: Ambas variantes del shell

- **WHEN** el shell usa sidebar o cabecera superior como navegación principal
- **THEN** la navegación principal permanece fija en ambos casos, `HeaderNav` ocupa el borde superior desde el reposo y no aparece una segunda navegación duplicada

### Requirement: Cabecera sin título de sección

La barra superior de acciones de la variante sidebar MUST NOT mostrar el título de la sección: el título SHALL mostrarse solo en el contenido de la página. La variante header MUST NOT mostrar una barra secundaria de título; `HeaderNav` SHALL ser la única barra superior.

#### Scenario: Sidebar sin título duplicado

- **WHEN** se abre una página como Ajustes o Movimientos con la navegación lateral
- **THEN** la cabecera superior muestra solo el buscador y el botón de avisos, y el único título de sección visible es el encabezado del contenido

#### Scenario: Variante header sin barra de subtítulo

- **WHEN** el shell usa la cabecera superior como navegación principal
- **THEN** solo existe `HeaderNav` en la parte superior, sin una segunda barra con el título y sin buscador ni avisos duplicados

#### Scenario: Contenido sin asomar por encima

- **WHEN** se hace scroll en una página larga con la navegación lateral
- **THEN** ningún encabezado del contenido queda visible por encima de la barra de acciones pegada al borde superior

### Requirement: Separación entre la cabecera y el contenido

La cabecera superior y el primer título del contenido SHALL mantener una separación vertical mínima de 24 px en todos los breakpoints donde existe una cabecera fija; el contenido MUST NOT empezar pegado al borde inferior de la cabecera.

#### Scenario: Título con aire bajo la cabecera

- **WHEN** se abre una página con la cabecera visible, en escritorio, tablet o móvil
- **THEN** el primer título del contenido empieza al menos 24 px por debajo del borde inferior de la cabecera

#### Scenario: Al hacer scroll

- **WHEN** la persona desplaza el contenido
- **THEN** la separación forma parte del contenido, la cabecera sigue pegada arriba y su altura no cambia

### Requirement: Identidad única en la navegación de escritorio

La variante de sidebar SHALL mostrar el avatar de la persona una sola vez, en el pie de la sidebar, y MUST NOT duplicarlo en la cabecera superior. La variante de header SHALL mostrarlo una sola vez en la navegación superior.

#### Scenario: Sidebar visible

- **WHEN** el shell usa la sidebar como navegación principal
- **THEN** solo hay un avatar visible, situado en el pie de la sidebar, y la cabecera superior muestra el buscador y el botón de avisos sin repetir la identidad

#### Scenario: Header superior

- **WHEN** el shell usa la cabecera superior como navegación principal
- **THEN** solo hay un avatar visible y está en la navegación superior

#### Scenario: Etiqueta accesible

- **WHEN** se inspecciona el avatar visible
- **THEN** conserva el nombre accesible de la persona y no se elimina del árbol de accesibilidad
