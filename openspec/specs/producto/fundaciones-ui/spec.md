# Producto · Fundaciones UI Specification

## Purpose

Define los fundamentos visuales de akari implementados en código —tokens, temas, tipografía, espaciado, iconografía y movimiento— para que toda la interfaz consuma una única fuente de verdad alineada con el diseño aprobado.

## Requirements

### Requirement: Tokens de diseño como fuente única

La aplicación SHALL definir color, tipografía, espaciado, radios, tamaños, elevación y movimiento como tokens reutilizables, y los componentes y pantallas MUST NOT declarar valores literales de esas categorías.

#### Scenario: Componente sin valores literales

- **WHEN** se inspecciona el estilo de cualquier componente de producto
- **THEN** sus colores, espaciados, radios y sombras referencian tokens y no valores escritos a mano

#### Scenario: Cambio global de token

- **WHEN** se modifica el valor de un token en el paquete de tokens
- **THEN** todas las pantallas que lo consumen reflejan el cambio sin editar componentes

### Requirement: Temas claro y oscuro

La aplicación SHALL ofrecer tema claro y oscuro mediante tokens semánticos, con el mismo conjunto de nombres en ambos modos y contraste mínimo AA en texto y controles.

#### Scenario: Cambio de tema

- **WHEN** la persona usuaria cambia el tema de claro a oscuro
- **THEN** toda la interfaz se adapta usando tokens semánticos sin recargar ni reescribir estilos

#### Scenario: Preferencia del sistema

- **WHEN** la persona usuaria no ha elegido un tema explícito
- **THEN** la aplicación respeta la preferencia de tema del sistema operativo

#### Scenario: Contraste en ambos temas

- **WHEN** se revisa un par texto/fondo de cualquier pantalla en claro y en oscuro
- **THEN** cumple contraste AA para su tamaño y estado

### Requirement: Tipografía Inter y escalas

La aplicación SHALL usar Inter con dos escalas: editorial para titulares y documentación, y UI compacta para producto, incluyendo cifras tabulares en importes.

#### Scenario: Texto de producto con estilo

- **WHEN** se inspecciona cualquier texto de producto
- **THEN** usa un estilo de la escala UI o editorial y no un tamaño suelto

#### Scenario: Importe tabular

- **WHEN** se muestra un importe monetario
- **THEN** usa cifras tabulares para que el ancho no cambie al actualizar el valor

#### Scenario: Importe que no cabe

- **WHEN** un importe excede el ancho de su contenedor
- **THEN** se reduce al siguiente estilo numérico y, si aún no cabe, se trunca con elipsis sin partirse en dos líneas

### Requirement: Espaciado, radios, elevación y layout

La aplicación SHALL usar la escala de espaciado de 4 px, los radios y elevaciones definidos por función, y un layout con ancho máximo y breakpoints consistentes.

#### Scenario: Espaciado del sistema

- **WHEN** se mide la separación entre bloques o el relleno de un componente
- **THEN** el valor pertenece a la escala de espaciado aprobada

#### Scenario: Layout de escritorio

- **WHEN** la ventana supera el breakpoint de escritorio
- **THEN** el contenido se centra con ancho máximo y no se estira más allá del definido

### Requirement: Movimiento y reducción de movimiento

La aplicación SHALL animar solo opacidad y transformaciones con las duraciones tokenizadas, y MUST respetar la preferencia de movimiento reducido.

#### Scenario: Movimiento reducido

- **WHEN** el sistema operativo indica preferencia por movimiento reducido
- **THEN** las transiciones pasan a duración cero y el cambio de estado sigue siendo perceptible por color, texto o posición final

#### Scenario: Animación de una interacción

- **WHEN** se abre un menú, un modal o se expande la navegación
- **THEN** la animación usa la duración y curva del token correspondiente y no bloquea la interacción

### Requirement: Iconografía y visualización de datos

La aplicación SHALL usar el set de iconos de trazo coherente en los tamaños tokenizados y una paleta de gráficos que se distinga por color y por un segundo canal en ambos temas.

#### Scenario: Icono con significado

- **WHEN** un icono representa una acción o un estado
- **THEN** tiene etiqueta textual o nombre accesible y no depende solo de su forma o color

#### Scenario: Gráfico accesible

- **WHEN** se muestra una serie de datos
- **THEN** cada serie se identifica por color y por marcador, patrón o etiqueta directa

### Requirement: Barra de desplazamiento teñida con los tokens de la app

La aplicación SHALL usar la barra del motor con ancho fino y el ámbar de acento al 55 % de opacidad sobre un carril transparente, y MUST adaptar el color al tema claro y oscuro sin declarar colores literales.

#### Scenario: Barra coherente en tema claro

- **WHEN** se muestra una zona con desplazamiento en tema claro
- **THEN** el carril es transparente y no dibuja una franja sobre el contenido
- **AND** el pulgar usa el ámbar de acento al 55 % de opacidad
- **AND** la barra es más fina que la del motor por defecto

#### Scenario: Barra coherente en tema oscuro

- **WHEN** la persona cambia al tema oscuro
- **THEN** la barra toma el valor oscuro del mismo token sin recargar ni reescribir estilos

#### Scenario: Compatibilidad entre navegadores

- **WHEN** la app se abre en Chromium, Safari o Firefox
- **THEN** la barra usa el mecanismo disponible en ese motor y conserva el ancho fino y el tinte ámbar donde el motor lo permite

### Requirement: La barra se oculta al dejar de desplazar

La barra SHALL aparecer mientras se desplaza y ocultarse sola al dejar de interactuar, en lugar de quedar fija de forma permanente.

#### Scenario: Desvanecimiento tras el scroll

- **WHEN** la persona termina de desplazar una zona
- **THEN** la barra se desvanece pasados unos instantes
- **AND** vuelve a aparecer al retomar el desplazamiento o al pasar el puntero por su carril

#### Scenario: Contenido que cabe en pantalla

- **WHEN** una zona no tiene desbordamiento
- **THEN** no reserva carril ni dibuja barra

### Requirement: Scroll de escritorio dentro del contenido

En escritorio, la aplicación SHALL desplazar el contenido dentro de su propia área, con la barra pegada al borde derecho de la ventana y sin separación del lienzo, y MUST mantener la navegación y la cabecera fijas.

#### Scenario: Barra dentro del contenedor

- **WHEN** el contenido de una pantalla desborda en escritorio
- **THEN** el documento no se desplaza y lo hace el área de contenido
- **AND** la barra queda pegada al borde derecho de la ventana, sin hueco con el contenido
- **AND** la sidebar y la cabecera permanecen en su posición

#### Scenario: Móvil y tablet

- **WHEN** la ventana está por debajo del breakpoint de escritorio
- **THEN** se mantiene el desplazamiento de la página y la barra del motor sin tinte propio
- **AND** no se reserva carril ni se superpone a la cabecera o la navegación

#### Scenario: Overlay abierto

- **WHEN** se abre una modal o un panel sobre el contenido
- **THEN** el desplazamiento del área de contenido se bloquea junto con el del documento
- **AND** al cerrar el overlay se restaura la posición de desplazamiento

#### Scenario: Scroll dentro de un modal

- **WHEN** el contenido de un modal desborda
- **THEN** el scroll vive en el cuerpo del modal y la cabecera permanece visible
- **AND** la barra no toca las esquinas redondeadas del panel

### Requirement: Barras ocultas de forma deliberada

La utilidad `no-scrollbar` SHALL seguir ocultando la barra de desplazamiento en los carruseles y filtros que la usan, sin que los estilos globales vuelvan a mostrarla.

#### Scenario: Contenedor con `no-scrollbar`

- **WHEN** un contenedor usa `no-scrollbar` y su contenido desborda
- **THEN** se puede desplazar pero no se dibuja ninguna barra, en ambos temas

#### Scenario: Resto de zonas desplazables

- **WHEN** un contenedor con desbordamiento no declara `no-scrollbar`
- **THEN** muestra la barra teñida descrita en los requisitos anteriores
