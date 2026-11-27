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
### Requirement: Fondo atenuado y difuminado en overlays

Al abrir un overlay modal, la aplicación SHALL atenuar el contenido de fondo con el scrim del sistema y SHALL difuminarlo, y al cerrarlo SHALL devolver el fondo a su estado normal.

#### Scenario: Apertura de un modal

- **WHEN** la persona abre un modal o una hoja
- **THEN** el fondo queda atenuado con `overlay/scrim` al 50 % y difuminado, sin que el panel del overlay pierda nitidez

#### Scenario: Cierre del overlay

- **WHEN** el overlay se cierra con su botón, con Escape o pulsando fuera
- **THEN** el fondo recupera su nitidez y su atenuación previas

#### Scenario: Contraste del panel

- **WHEN** el overlay está abierto en tema claro u oscuro
- **THEN** el texto y los controles del panel mantienen el contraste que exige la spec de componentes

### Requirement: Scroll de la página bloqueado con un overlay abierto

Mientras un overlay modal esté abierto, la página principal SHALL NOT desplazarse, y al cerrarlo SHALL conservar la posición de scroll que tenía antes de abrirlo.

#### Scenario: Intento de scroll con el overlay abierto

- **WHEN** el overlay está abierto y la persona usa la rueda, el teclado o un gesto táctil sobre el fondo
- **THEN** la posición de scroll de la página no cambia, aunque el panel del overlay siga pudiendo desplazarse por dentro

#### Scenario: Restauración al cerrar

- **WHEN** el overlay se cierra
- **THEN** la página vuelve a poder desplazarse y mantiene la posición de scroll previa a la apertura

#### Scenario: Overlays superpuestos

- **WHEN** se abre un segundo overlay sobre uno ya abierto y después se cierra
- **THEN** el bloqueo de scroll se mantiene hasta que se cierra el último overlay

### Requirement: Círculo de la marca como punto final

El componente `Logo` SHALL colocar el círculo ámbar a la derecha del glifo o del wordmark y SHALL apoyar su base en la línea base, como punto final de frase, sin tapar ningún trazo ni desplazar el texto.

#### Scenario: Logotipo compacto en la sidebar colapsada

- **WHEN** se renderiza `Logo` con `format="initial"`
- **THEN** el círculo ámbar queda a la derecha de la «ı» y su base coincide con la línea base del glifo, por debajo de su centro vertical

#### Scenario: Logotipo expandido

- **WHEN** se renderiza `Logo` con `format="expanded"` en cualquier tamaño
- **THEN** el círculo ámbar continúa situado tras el wordmark «akarı» y su base coincide con la línea base del texto

#### Scenario: Accesibilidad y dimensiones

- **WHEN** se renderiza cualquiera de los formatos del logotipo
- **THEN** conserva `role="img"` con el nombre accesible «akari», los adornos siguen siendo `aria-hidden` y el alto del conjunto no cambia respecto a la versión anterior

### Requirement: Favicon con el icono compacto

La aplicación SHALL servir como favicon el icono compacto de la marca, formado por el trazo de la «ı» y el círculo ámbar a su derecha y apoyado en su línea base, y MUST NOT servir el monograma «a» sobre cuadrado redondeado.

#### Scenario: Recurso del favicon

- **WHEN** el navegador solicita el icono del sitio
- **THEN** recibe un SVG con el trazo de la «ı» y un círculo ámbar situado a su derecha y con su base coincidiendo con la base del trazo

#### Scenario: Contraste en ambos temas

- **WHEN** el favicon se muestra en una pestaña con tema claro o con tema oscuro
- **THEN** el trazo usa tinta en claro y papel en oscuro mediante `prefers-color-scheme` y el círculo conserva su ámbar, sin alterar la composición del icono

### Requirement: Campo de fecha con calendario propio

El campo de fecha SHALL mostrar la fecha elegida con formato localizado y un icono de calendario, y al abrirse SHALL presentar una rejilla mensual dibujada por la aplicación, sin el selector nativo del navegador ni del sistema.

#### Scenario: Apertura del calendario

- **WHEN** la persona activa un campo de fecha cerrado con ratón, toque o teclado
- **THEN** se abre un panel con la rejilla del mes de la fecha elegida dentro de la aplicación, sin que aparezca el selector nativo

#### Scenario: Ajuste al espacio disponible

- **WHEN** el panel no cabe entero debajo del campo
- **THEN** se muestra arriba del campo si allí cabe entero y, si tampoco cabe arriba, se centra en el viewport con su altura completa, sin recortarse

#### Scenario: Elección de un día

- **WHEN** la persona elige un día del mes visible
- **THEN** el disparador muestra esa fecha en formato localizado, el panel se cierra y el valor se comunica una sola vez como fecha de negocio `YYYY-MM-DD`

#### Scenario: Campo vacío

- **WHEN** el campo no tiene fecha y se abre
- **THEN** el panel muestra el mes actual, ningún día seleccionado y la acción «Hoy» disponible

#### Scenario: Cierre sin cambios

- **WHEN** el panel está abierto y la persona pulsa fuera o cancela
- **THEN** el panel se cierra, la fecha anterior se conserva y el foco vuelve al disparador

#### Scenario: Campo con error

- **WHEN** el campo tiene un error de validación
- **THEN** mantiene el borde y el mensaje de error en texto y sigue pudiendo abrirse para corregir la fecha

#### Scenario: Campo deshabilitado

- **WHEN** el campo está deshabilitado
- **THEN** muestra su fecha actual, no responde a la interacción y no abre el panel

### Requirement: Navegación del calendario mensual

El panel de fecha SHALL mostrar el mes y el año visibles, permitir avanzar y retroceder un mes y ofrecer una acción «Hoy», y SHALL mantener una única fecha seleccionada dentro del panel.

#### Scenario: Mes anterior y siguiente

- **WHEN** la persona pulsa la flecha de mes anterior o siguiente
- **THEN** la rejilla muestra el mes contiguo con sus días correctos y conserva la fecha seleccionada sin elegirla

#### Scenario: Cambio de año

- **WHEN** la navegación cruza diciembre o enero
- **THEN** el encabezado actualiza mes y año a la vez y la rejilla sigue el calendario gregoriano

#### Scenario: Acción «Hoy»

- **WHEN** la persona pulsa «Hoy»
- **THEN** el panel se sitúa en el mes actual y el día de hoy queda seleccionado y comunicado como el nuevo valor

#### Scenario: Días fuera del mes

- **WHEN** la rejilla muestra las semanas del mes
- **THEN** los días de los meses contiguos aparecen como no seleccionables y no alteran la fecha al pulsarlos

### Requirement: Selector de mes y año en la cabecera

La cabecera del calendario SHALL ser accionable: un primer clic SHALL mostrar los meses del año visible, un segundo clic el selector de años, y elegir un mes o un año SHALL volver a la vista correspondiente con la selección aplicada.

#### Scenario: Meses del año

- **WHEN** la persona pulsa la cabecera con el mes y el año visibles
- **THEN** aparecen los doce meses del año visible, con el mes de la fecha elegida y el mes actual distinguidos

#### Scenario: Selector de años

- **WHEN** la persona vuelve a pulsar la cabecera estando en la vista de meses
- **THEN** aparece un selector de doce años alrededor del año visible, con el año elegido y el actual distinguidos

#### Scenario: Elegir un mes

- **WHEN** la persona elige un mes de la vista de meses
- **THEN** el calendario vuelve a la rejilla de días de ese mes y conserva el día activo si existe en el mes destino

#### Scenario: Elegir un año

- **WHEN** la persona elige un año del selector de años
- **THEN** el calendario muestra los meses de ese año y el año pasa a ser el visible

#### Scenario: Volver a los días

- **WHEN** la persona pulsa la cabecera estando en el selector de años
- **THEN** el calendario vuelve a la rejilla de días del mes visible

#### Scenario: Navegación por años y décadas

- **WHEN** la persona usa las flechas en la vista de meses o de años
- **THEN** avanza o retrocede un año o una página de años, actualizando la cabecera y dejando el foco en un control visible

#### Scenario: Tamaño estable al cambiar de vista

- **WHEN** la persona alterna entre la rejilla de días, los meses y los años
- **THEN** el calendario conserva la misma altura y el contenido se centra sin dar un salto de tamaño

#### Scenario: Nombres de mes capitalizados

- **WHEN** el calendario muestra el mes en la cabecera o en la vista de meses
- **THEN** el nombre del mes empieza siempre por mayúscula

### Requirement: Selección de fecha accesible por teclado y lector de pantalla

El calendario SHALL ser operable solo con teclado, anunciar el día activo, la fecha seleccionada y el mes visible, y SHALL devolver el foco al disparador al cerrarse sin atraparlo.

#### Scenario: Recorrido con teclado

- **WHEN** el panel está abierto y la persona usa flechas, Inicio, Fin, PageUp, PageDown, Enter, Espacio o Escape
- **THEN** mueve el día activo por días, semanas y meses, elige la fecha, cierra el panel o devuelve el foco al disparador según la tecla, sin perder un foco visible

#### Scenario: Anuncio a tecnologías de asistencia

- **WHEN** una tecnología de asistencia enfoca el campo o el panel abierto
- **THEN** anuncia la etiqueta del campo, la fecha elegida, si el panel está expandido y el mes visible

#### Scenario: Movimiento reducido

- **WHEN** el sistema indica preferencia por movimiento reducido
- **THEN** las transiciones del panel usan duración cero y el estado abierto sigue siendo perceptible

### Requirement: Calendario en hoja inferior en móvil

En vistas móviles el campo de fecha SHALL presentar el mismo calendario dentro de una hoja inferior modal anclada al borde inferior, con el scrim del sistema, el scroll de fondo bloqueado y el foco retenido, y SHALL cerrarla al elegir o cancelar devolviendo el foco al disparador.

#### Scenario: Apertura en móvil

- **WHEN** la persona abre un campo de fecha en una vista móvil
- **THEN** aparece una hoja inferior modal con el calendario, el fondo atenuado y el resto del formulario inerte mientras la hoja está abierta

#### Scenario: Ajuste al espacio disponible

- **WHEN** el panel no cabe entero debajo del campo
- **THEN** se muestra arriba del campo si allí cabe entero y, si tampoco cabe arriba, se centra en el viewport con su altura completa, sin recortarse

#### Scenario: Elección de un día en la hoja

- **WHEN** la persona elige un día en la hoja inferior
- **THEN** la hoja se cierra, el disparador muestra la fecha elegida y el valor se comunica una sola vez

#### Scenario: Cierre sin cambios en la hoja

- **WHEN** la persona cierra la hoja con Escape, con la ✕ o pulsando el scrim
- **THEN** la hoja se cierra, la fecha anterior se conserva y el foco vuelve al disparador

#### Scenario: Hoja sobre otro modal

- **WHEN** la hoja de fecha se abre desde un formulario que ya está dentro de un modal
- **THEN** Escape y la trampa de foco afectan solo a la hoja, y al cerrarla el modal inferior sigue abierto con su estado y su foco

#### Scenario: Sin hoja fuera de móvil

- **WHEN** la vista es de tablet o escritorio
- **THEN** el campo abre el panel flotante junto al disparador y no aparece ninguna hoja inferior

### Requirement: Selector en hoja inferior en móvil

En vistas móviles, los selectores SHALL presentar sus opciones dentro de una hoja inferior modal anclada al borde inferior, con scrim, scroll de fondo bloqueado y foco retenido, y SHALL cerrarla al elegir o cancelar devolviendo el foco al disparador.

#### Scenario: Apertura en móvil

- **WHEN** se abre un selector de tipo, periodo, categoría, cuenta u orden en una vista móvil
- **THEN** aparece una hoja inferior modal con las opciones, el fondo atenuado y el resto de la pantalla inerte

#### Scenario: Elección en la hoja

- **WHEN** se elige una opción en la hoja inferior
- **THEN** la hoja se cierra, el disparador muestra la etiqueta elegida y el valor se comunica una sola vez

#### Scenario: Cierre sin cambios

- **WHEN** se cierra la hoja con Escape, con la ✕ o pulsando el scrim
- **THEN** el valor anterior se conserva y el foco vuelve al disparador

#### Scenario: Sin hoja en escritorio

- **WHEN** la vista es de tablet o escritorio
- **THEN** el selector abre su panel flotante junto al disparador y no aparece ninguna hoja inferior

### Requirement: Panel del selector anclado al documento

Mientras el panel de un selector está abierto en escritorio, la aplicación SHALL mantenerlo en su posición inicial del documento al hacer scroll en la página, de modo que se desplace con el contenido y no se quede fijo en el viewport, y SHALL cerrarlo al pulsar fuera.

#### Scenario: Scroll con el panel abierto

- **WHEN** el panel está abierto y la persona hace scroll en la página
- **THEN** el panel se desplaza con el contenido desde su posición inicial, sin quedarse pegado a la pantalla y sin mover la página por abrirse

#### Scenario: Scroll dentro del panel

- **WHEN** la lista de opciones no cabe y se desplaza dentro del panel
- **THEN** solo se mueve el contenido del panel y su posición en la página no cambia

#### Scenario: Cierre al pulsar fuera

- **WHEN** se pulsa fuera del panel y del disparador
- **THEN** el panel se cierra y el valor anterior se conserva

### Requirement: Campo de rango de fechas con calendario

El campo de rango de fechas SHALL mostrar un disparador con la etiqueta del rango o «Cualquier fecha» y, al abrirse, SHALL presentar dos extremos seleccionables con el calendario, destacar los días incluidos y aplicar solo un rango completo.

#### Scenario: Apertura sin rango

- **WHEN** se abre el campo sin un rango elegido
- **THEN** se muestra el mes actual, ningún día seleccionado, los atajos disponibles y la acción de aplicar deshabilitada

#### Scenario: Elección de los extremos

- **WHEN** la persona elige dos días del calendario
- **THEN** ambos extremos quedan seleccionados, los días intermedios se destacan y el disparador describe el rango resultante

#### Scenario: Rango continuo

- **WHEN** el rango ocupa varios días de la misma semana
- **THEN** la selección se ve como una banda continua, con los extremos redondeados por fuera y sin redondear cada día por separado

#### Scenario: Cambio de semana con un rango corto

- **WHEN** el rango ocupa una o dos semanas
- **THEN** la banda cierra sus esquinas al final de una fila y las abre al empezar la siguiente, y los extremos conservan el redondeo exterior

#### Scenario: Rango de más de dos semanas

- **WHEN** el rango ocupa más de dos semanas
- **THEN** los cortes entre semanas quedan rectos porque la banda continúa, y solo se redondean los extremos reales del rango

#### Scenario: Atajos centrados

- **WHEN** el panel muestra los atajos de periodo
- **THEN** los botones aparecen centrados horizontalmente

#### Scenario: Días de los meses contiguos

- **WHEN** la rejilla muestra días del mes anterior o del siguiente
- **THEN** esos días se pueden elegir como extremos del rango, se ven atenuados y la selección usa su fecha real aunque la cabecera siga mostrando el mes en curso

#### Scenario: Selección tras cambiar de mes

- **WHEN** se navega a un mes anterior o posterior y se elige un día
- **THEN** el rango se calcula con esa fecha y se reordena si queda antes del extremo inicial

#### Scenario: Extremo contiguo marcado al volver a su mes

- **WHEN** se elige un día del mes contiguo y se navega al mes al que pertenece
- **THEN** ese extremo aparece marcado con el color de selección, con texto de contraste suficiente, y no con el color atenuado del mes contiguo

#### Scenario: Panel sin scroll horizontal

- **WHEN** el panel del calendario está abierto
- **THEN** la rejilla de días cabe en el ancho del panel y no aparece desplazamiento horizontal

#### Scenario: Aplicar el rango

- **WHEN** existen dos extremos y se pulsa aplicar
- **THEN** el campo comunica el rango una sola vez, se cierra y el disparador muestra la etiqueta del rango

#### Scenario: Rango invertido

- **WHEN** la segunda fecha elegida es anterior a la primera
- **THEN** el calendario las reordena y destaca el rango entre ambas sin aplicar una combinación inválida

#### Scenario: Cierre sin aplicar

- **WHEN** se cierra el panel o la hoja sin pulsar aplicar
- **THEN** el rango anterior se conserva y el foco vuelve al disparador

#### Scenario: Hoja inferior en móvil

- **WHEN** el campo se abre en una vista móvil
- **THEN** el calendario aparece dentro de una hoja inferior modal, igual que el campo de fecha, y no como panel flotante

### Requirement: Panel de periodo compacto en movimientos

El panel de periodo del listado SHALL mostrar los atajos, el calendario y las acciones Aplicar y Limpiar sin necesidad de desplazarse, y MUST NOT mostrar el botón «Hoy» ni la pista inferior del rango pendiente.

#### Scenario: Apertura del periodo

- **WHEN** se abre el control de periodo del listado de movimientos
- **THEN** se ven los atajos, el calendario y las acciones Aplicar y Limpiar sin hacer scroll dentro del panel, y no aparecen el botón Hoy ni la pista inferior
