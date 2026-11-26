# Spec Delta

## ADDED Requirements

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
