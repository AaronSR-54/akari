# Producto · Finanzas Personales Specification

## Purpose

Define el comportamiento de las finanzas personales de akari —cuentas, movimientos, suscripciones, plazos, dashboard y preguntas rápidas— para que la persona usuaria gestione su dinero desde datos locales con información consistente.

## Requirements

### Requirement: Alta y edición de cuentas

La aplicación SHALL permitir crear y editar cuentas personales, conjuntas y de depósito con nombre, tipo, divisa y saldo inicial obligatorio, y SHALL mostrar los campos condicionales de cada tipo.

#### Scenario: Saldo inicial obligatorio

- **WHEN** se intenta guardar una cuenta sin saldo inicial o con saldo cero
- **THEN** la acción principal permanece deshabilitada o muestra un error en texto y la cuenta no se crea

#### Scenario: Cuenta de depósito

- **WHEN** se elige el tipo depósito
- **THEN** aparece el campo de TAE y la previsión de ingresos estimados sin ocultar el saldo real

#### Scenario: Edición de una cuenta

- **WHEN** se modifica el nombre, la divisa o el saldo inicial de una cuenta existente
- **THEN** los saldos y agregados que dependen de ella se recalculan de inmediato

### Requirement: Saldo agregado y saldo estimado

La aplicación SHALL mostrar el saldo total de las cuentas incluidas y SHALL separar el saldo real del saldo estimado a fin de mes o de los ingresos previstos.

#### Scenario: Total entre cuentas

- **WHEN** se consulta el resumen
- **THEN** el saldo total suma solo las cuentas incluidas y cada cuenta conserva su propio saldo

#### Scenario: Estimado negativo

- **WHEN** la proyección de una cuenta o del total resulta negativa
- **THEN** se muestra una alerta textual además del color y se explica qué partidas la provocan

### Requirement: Registro de movimientos

La aplicación SHALL permitir registrar gastos e ingresos con importe, fecha, cuenta, concepto y repetición opcional, SHALL actualizar el saldo de la cuenta afectada y SHALL abrir el alta desde el listado en un modal con ese formulario, sin abandonar el listado.

#### Scenario: Movimiento único

- **WHEN** se guarda un gasto o ingreso marcado como único
- **THEN** aparece en la cuenta y en el listado de movimientos y modifica su saldo una sola vez

#### Scenario: Movimiento periódico

- **WHEN** se marca un movimiento como periódico
- **THEN** se solicita una frecuencia y el movimiento queda identificado como suscripción o ingreso recurrente

#### Scenario: Validación del importe

- **WHEN** el importe está vacío, no es numérico o no corresponde al tipo de movimiento
- **THEN** se muestra un error en texto y no se guarda el movimiento

#### Scenario: Alta en modal

- **WHEN** se pulsa «Añadir movimiento» en el listado de movimientos
- **THEN** se abre un modal con el formulario completo sobre el listado y, al guardar, el nuevo movimiento aparece en la lista sin cambiar de URL

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

### Requirement: Suscripciones e ingresos periódicos

La aplicación SHALL identificar suscripciones y ingresos recurrentes, mostrar su próxima fecha e importe y avisar de los pagos próximos.

#### Scenario: Próximo pago

- **WHEN** una suscripción o ingreso periódico tiene una fecha próxima
- **THEN** aparece en el resumen y en los avisos con importe, cuenta y acción para revisarlo

#### Scenario: Pago registrado

- **WHEN** se registra el pago de una suscripción
- **THEN** el movimiento se añade a la cuenta y la próxima fecha avanza según su frecuencia

### Requirement: Pagos a plazos

La aplicación SHALL representar pagos a plazos con número de cuotas, importe pagado, importe pendiente y estado de cada cuota, y SHALL mostrar la cuota vencida o el próximo pago en un único panel unificado debajo de Cuentas.

#### Scenario: Cuota vencida

- **WHEN** una cuota está vencida
- **THEN** se muestra como atrasada con texto y color en el panel unificado, y la acción principal permite registrarla
- **AND** no aparece una segunda tarjeta ni un banner duplicado en el resumen

#### Scenario: Próximo pago sin vencer

- **WHEN** existe un próximo pago no vencido y ninguna cuota vencida
- **THEN** el panel unificado muestra su importe, etiqueta y fecha con la acción de revisarlo
- **AND** no se renderiza un aviso adicional en otra sección del resumen

#### Scenario: Progreso del plazo

- **WHEN** se consulta un pago a plazos
- **THEN** se ve el progreso en formato «x de y» y qué falta por pagar

### Requirement: Detalle de cuenta

La aplicación SHALL mostrar el detalle de una cuenta con su saldo real, su estimado, la evolución reciente y los movimientos asociados.

#### Scenario: Navegación desde el resumen

- **WHEN** se selecciona una cuenta en el resumen
- **THEN** se abre su detalle con el contexto de esa cuenta y una forma de volver al resumen

#### Scenario: Cuenta sin movimientos

- **WHEN** una cuenta no tiene movimientos
- **THEN** el detalle muestra un estado vacío con la acción de añadir el primero

### Requirement: Dashboard y preguntas rápidas

La aplicación SHALL mostrar un dashboard con métricas del mes y accesos que respondan preguntas rápidas sobre los datos, y SHALL indicar cuándo no hay datos suficientes.

#### Scenario: Mayor gasto del mes

- **WHEN** la persona abre la pregunta de mayor gasto
- **THEN** ve el resultado con importe, categoría y periodo suficiente para interpretarlo

#### Scenario: Datos insuficientes

- **WHEN** no hay movimientos suficientes para responder una pregunta
- **THEN** se muestra un estado informativo con la acción de registrar datos y no una cifra inventada

#### Scenario: Una idea por tarjeta

- **WHEN** se revisa una tarjeta del dashboard
- **THEN** contiene una sola métrica principal con su contexto y, si aplica, una microserie

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

### Requirement: Edición de movimiento en modal

La aplicación SHALL editar un movimiento en un modal con el mismo formulario completo del alta —tipo, importe, cuenta, concepto, fecha, categoría y nota—, SHALL conservar el contexto desde el que se abre y SHALL ofrecer eliminarlo con opción de deshacer.

#### Scenario: Edición completa

- **WHEN** se abre la edición de un movimiento y se cambian el tipo, la cuenta, el importe, la fecha, la categoría o la nota
- **THEN** el movimiento y el saldo de las cuentas afectadas se actualizan y se confirma la acción

#### Scenario: Cerrar sin guardar

- **WHEN** se cierra el modal de edición con «Cancelar», con `Escape` o con un toque fuera
- **THEN** el movimiento conserva sus datos anteriores

#### Scenario: Eliminar desde el modal

- **WHEN** se pulsa «Eliminar» en el modal de edición
- **THEN** el movimiento desaparece de las listas, el saldo se recalcula y se ofrece deshacer
