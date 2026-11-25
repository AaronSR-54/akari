# Spec Delta

## ADDED Requirements

### Requirement: Campo de fecha con calendario propio

El campo de fecha SHALL mostrar la fecha elegida con formato localizado y un icono de calendario, y al abrirse SHALL presentar una rejilla mensual dibujada por la aplicación, sin el selector nativo del navegador ni del sistema.

#### Scenario: Apertura del calendario

- **WHEN** la persona activa un campo de fecha cerrado con ratón, toque o teclado
- **THEN** se abre un panel con la rejilla del mes de la fecha elegida dentro de la aplicación, sin que aparezca el selector nativo

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
