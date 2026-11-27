# Spec Delta

## ADDED Requirements

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
