# Spec Delta

## ADDED Requirements

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

La ruta `/ajustes` SHALL usar «Ajustes» como título de página y SHALL describir en el subtítulo que el panel reúne el perfil y los datos guardados en el dispositivo.

#### Scenario: Título en la cabecera

- **WHEN** se abre `/ajustes` con la navegación lateral en escritorio
- **THEN** la cabecera muestra «Ajustes» como único `h1` visible y el subtítulo menciona el perfil y los datos locales

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

## MODIFIED Requirements

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
