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
