# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
