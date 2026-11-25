# Spec Delta

## ADDED Requirements

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
