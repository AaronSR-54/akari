# Producto · Componentes Specification

## Purpose

Define la librería de componentes React reutilizables de akari para que las pantallas web se compongan con piezas coherentes, accesibles y equivalentes al design system aprobado, sin duplicar estilos ni variantes.

## Requirements

### Requirement: Componentes reutilizables publicados

La aplicación SHALL exponer componentes reutilizables para navegación, acciones, formularios, datos, feedback y estados, y las pantallas MUST componerse con ellos en lugar de dibujar piezas equivalentes.

#### Scenario: Pantalla compuesta

- **WHEN** una pantalla necesita un botón, campo, tarjeta o fila de movimiento
- **THEN** usa el componente publicado de la librería con sus propiedades y no una copia local

#### Scenario: Cambio en el componente

- **WHEN** se corrige o evoluciona un componente de la librería
- **THEN** todas las pantallas que lo usan heredan el cambio sin ediciones individuales

### Requirement: Variantes y estados interactivos

Cada componente interactivo SHALL cubrir los estados aplicables de default, hover, focus, pressed, disabled, loading y error con diferencias perceptibles.

#### Scenario: Estado de carga de una acción

- **WHEN** una acción principal está en curso
- **THEN** el componente muestra su estado de carga, conserva su ancho y evita envíos duplicados

#### Scenario: Acción deshabilitada

- **WHEN** una acción no está disponible por validación o permisos
- **THEN** el componente aparece deshabilitado y explica en texto por qué no se puede usar

### Requirement: Accesibilidad de componentes

Los componentes interactivos SHALL tener foco visible, etiqueta accesible, objetivo táctil mínimo de 44×44 px en pantallas táctiles y semántica correcta.

#### Scenario: Navegación por teclado

- **WHEN** se recorre una pantalla solo con teclado
- **THEN** cada control es alcanzable, muestra un anillo de foco distinguible y activa su acción con las teclas esperadas

#### Scenario: Control táctil

- **WHEN** se mide un control interactivo en un viewport táctil
- **THEN** su área activa es de al menos 44×44 px aunque su icono sea menor

### Requirement: Formularios con validación visible

Los formularios SHALL mostrar etiqueta visible, ayuda y error en texto, marcar los campos obligatorios y conservar la altura del campo al mostrar un error.

#### Scenario: Error de validación

- **WHEN** una persona envía un formulario con un campo inválido
- **THEN** el campo muestra el error en texto bajo la etiqueta, mantiene su altura y anuncia el error a tecnologías de asistencia

#### Scenario: Campo obligatorio

- **WHEN** un formulario mezcla campos obligatorios y opcionales
- **THEN** los obligatorios se marcan con asterisco y texto accesible, no solo con color

### Requirement: Presentación de importes

Los componentes de datos SHALL mostrar importes con cifras tabulares, signo explícito, alineación a la derecha y ancho fijo, sin partir el importe en dos líneas.

#### Scenario: Gasto e ingreso

- **WHEN** se muestra un movimiento
- **THEN** el signo y el color distinguen gasto de ingreso y el rojo se reserva a alertas o saldos negativos

#### Scenario: Importe largo

- **WHEN** un importe supera el ancho de su columna
- **THEN** se reduce al estilo numérico inferior o se trunca con elipsis manteniendo el valor accesible

### Requirement: Feedback y overlays con salida

Los componentes de feedback SHALL incluir salida explícita, scrim propio en overlays, duración definida en toasts y contenido accionable en estados vacíos, error y carga.

#### Scenario: Cierre de un overlay

- **WHEN** se abre un modal o una hoja
- **THEN** se puede cerrar con botón, asa o toque fuera y el foco vuelve al control que lo abrió

#### Scenario: Confirmación efímera

- **WHEN** una acción reversible se completa
- **THEN** se muestra un toast temporal con opción de deshacer que no bloquea la pantalla

#### Scenario: Estado vacío

- **WHEN** una vista no tiene datos
- **THEN** se muestra qué falta, por qué y una acción principal para empezar

### Requirement: Sin estilos ni componentes duplicados

La librería MUST NOT contener variantes equivalentes con nombres distintos ni permitir que una pantalla sobrescriba colores o tipografía con valores ajenos a los tokens.

#### Scenario: Auditoría de duplicados

- **WHEN** se revisa la librería
- **THEN** cada componente tiene una única definición por comportamiento y las pantallas solo ajustan ancho, contenido y disposición

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
