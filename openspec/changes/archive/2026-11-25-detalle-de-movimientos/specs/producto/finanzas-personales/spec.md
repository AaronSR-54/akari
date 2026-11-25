# Spec Delta

## ADDED Requirements

### Requirement: Detalle de movimiento

La aplicación SHALL mostrar el detalle de un movimiento con su concepto, tipo, importe con signo, divisa, fecha, categoría, cuenta y nota, y SHALL permitir editarlo y eliminarlo solo desde ahí.

#### Scenario: Acceso desde una lista

- **WHEN** se selecciona un movimiento en el listado de movimientos, en los últimos movimientos del resumen o en los de una cuenta
- **THEN** se abre el detalle de ese movimiento en una modal sobre el listado y se cierra sin perder la vista

#### Scenario: Datos completos

- **WHEN** se consulta el detalle de un movimiento
- **THEN** se ven concepto, tipo (gasto o ingreso), importe con signo y divisa, fecha, categoría, cuenta asociada y nota cuando exista

#### Scenario: Vínculos del movimiento

- **WHEN** el movimiento está enlazado a una recurrencia, a un plan de plazos o a un gasto grupal
- **THEN** el detalle lo indica y permite ir al elemento enlazado

#### Scenario: Edición desde el detalle

- **WHEN** se pulsa «Editar» en el detalle y se guardan los cambios
- **THEN** el detalle muestra los datos actualizados, el saldo de la cuenta se recalcula y se confirma la acción

#### Scenario: Eliminación desde el detalle

- **WHEN** se pulsa «Eliminar» en el detalle y se confirma
- **THEN** el movimiento desaparece de las listas, el saldo se recalcula y se ofrece deshacer

#### Scenario: Movimiento desaparecido

- **WHEN** el movimiento deja de existir mientras su detalle está abierto
- **THEN** la modal se cierra y el listado refleja su ausencia, sin dejar una pantalla bloqueada

## MODIFIED Requirements

### Requirement: Listado, búsqueda y filtros de movimientos

La aplicación SHALL listar los movimientos con concepto, fecha, cuenta, categoría e importe, SHALL permitir buscarlos, filtrarlos y ordenarlos, y SHALL abrir el detalle de un movimiento al seleccionarlo. El listado no SHALL ofrecer acciones de edición en línea.

#### Scenario: Filtro sin resultados

- **WHEN** los filtros aplicados no devuelven movimientos
- **THEN** se muestra un estado vacío con la opción de limpiar filtros

#### Scenario: Volumen alto

- **WHEN** hay más movimientos de los que caben en la vista
- **THEN** la tabla se pagina en escritorio y la lista carga por scroll en viewports móviles sin perder filtros

#### Scenario: Apertura del detalle

- **WHEN** se selecciona una fila del listado, en escritorio o en móvil
- **THEN** se abre la modal de detalle del movimiento y el listado no muestra botones de editar ni una columna de acciones

#### Scenario: Edición en línea

- **WHEN** se consulta el listado de movimientos
- **THEN** no hay acciones de edición en la tabla ni en las tarjetas, y editar un movimiento solo es posible desde su detalle

#### Scenario: Cierre del detalle

- **WHEN** se cierra la modal de detalle
- **THEN** se sigue en el listado de movimientos con la acción de añadir movimiento disponible
