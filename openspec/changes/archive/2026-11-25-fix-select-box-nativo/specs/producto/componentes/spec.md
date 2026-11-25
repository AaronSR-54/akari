# Spec Delta

## ADDED Requirements

### Requirement: Selector de opción única con panel propio

Los campos de opción única SHALL mostrar la etiqueta del valor actual y un chevron propio, y al abrirse SHALL presentar las opciones en un panel dibujado por la aplicación, sin el desplegable nativo del navegador ni del sistema.

#### Scenario: Apertura del selector

- **WHEN** la persona activa un selector cerrado con ratón, toque o teclado
- **THEN** se abre un panel con las opciones dentro de la aplicación y el chevron pasa a apuntar hacia arriba, sin que aparezca el desplegable nativo

#### Scenario: Elección de una opción

- **WHEN** la persona elige una opción del panel
- **THEN** el disparador muestra la etiqueta de esa opción, el panel se cierra y el valor se comunica una sola vez

#### Scenario: Cierre sin cambios

- **WHEN** el panel está abierto y la persona pulsa fuera o cancela
- **THEN** el panel se cierra, el valor anterior se conserva y el foco vuelve al disparador

#### Scenario: Campo con error

- **WHEN** el selector tiene un error de validación
- **THEN** mantiene el borde y el mensaje de error en texto y sigue pudiendo abrirse para corregir el valor

#### Scenario: Campo deshabilitado

- **WHEN** el selector está deshabilitado
- **THEN** muestra su valor actual, no responde a la interacción y no abre el panel

#### Scenario: Movimiento reducido

- **WHEN** el sistema indica preferencia por movimiento reducido
- **THEN** el giro del chevron usa duración cero y el estado abierto sigue siendo perceptible

### Requirement: Selección accesible por teclado y lector de pantalla

El selector SHALL ser operable solo con teclado, anunciar su etiqueta, valor y estado, y cerrarse recobrando el foco sin atraparlo.

#### Scenario: Recorrido con teclado

- **WHEN** el selector está enfocado y la persona usa las flechas, Home, End, Enter, Espacio, Escape o Tab
- **THEN** recorre y elige opciones, cierra el panel y devuelve el foco al disparador cuando corresponde, sin salir de un foco visible

#### Scenario: Anuncio a tecnologías de asistencia

- **WHEN** una tecnología de asistencia enfoca el selector
- **THEN** anuncia su etiqueta, el valor actual, si está expandido o contraído y la opción activa del panel

#### Scenario: Búsqueda escribiendo

- **WHEN** el panel está abierto y la persona escribe caracteres
- **THEN** la opción activa salta a la siguiente opción cuya etiqueta empieza por ese texto, sin elegirla hasta confirmar
