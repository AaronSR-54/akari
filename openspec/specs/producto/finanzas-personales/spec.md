# Producto · Finanzas Personales Specification

## Purpose

Define el comportamiento de las finanzas personales de akari —cuentas, movimientos, suscripciones, plazos, dashboard y preguntas rápidas— para que la persona usuaria gestione su dinero desde datos locales con información consistente.

## Requirements

### Requirement: Alta y edición de cuentas

La aplicación SHALL permitir crear y editar cuentas personales, conjuntas y de depósito con nombre, tipo, divisa y saldo inicial obligatorio, SHALL mostrar los campos condicionales de cada tipo y SHALL ofrecer un selector opcional de banco del catálogo local.

#### Scenario: Saldo inicial obligatorio

- **WHEN** se intenta guardar una cuenta sin saldo inicial o con saldo cero
- **THEN** la acción principal permanece deshabilitada o muestra un error en texto y la cuenta no se crea

#### Scenario: Cuenta de depósito

- **WHEN** se elige el tipo depósito
- **THEN** aparece el campo de TAE y la previsión de ingresos estimados sin ocultar el saldo real

#### Scenario: Edición de una cuenta

- **WHEN** se modifica el nombre, la divisa o el saldo inicial de una cuenta existente
- **THEN** los saldos y agregados que dependen de ella se recalculan de inmediato

#### Scenario: Selección de banco en el formulario

- **WHEN** se abre el formulario de alta o edición de una cuenta
- **THEN** aparece un selector con los bancos del catálogo, «Efectivo» y «Sin banco / Otro», y la cuenta se puede guardar sin elegir ninguno

### Requirement: Saldo agregado y saldo estimado

La aplicación SHALL mostrar el saldo total de las cuentas incluidas y SHALL separar el saldo real del saldo estimado a fin de mes o de los ingresos previstos.

#### Scenario: Total entre cuentas

- **WHEN** se consulta el resumen
- **THEN** el saldo total suma solo las cuentas incluidas y cada cuenta conserva su propio saldo

#### Scenario: Estimado negativo

- **WHEN** la proyección de una cuenta o del total resulta negativa
- **THEN** se muestra una alerta textual además del color y se explica qué partidas la provocan

### Requirement: Registro de movimientos

La aplicación SHALL permitir registrar gastos e ingresos con importe, fecha, cuenta, concepto y repetición opcional, SHALL actualizar el saldo de la cuenta afectada y SHALL abrir el alta en un modal desde cualquier acceso de la app —listado, resumen, barra móvil, detalle de cuenta o preguntas rápidas— sin cambiar de URL. En cuentas conjuntas SHALL registrar además el miembro autor del movimiento.

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

#### Scenario: Alta desde cualquier acceso

- **WHEN** se pulsa un acceso de alta de movimiento en el resumen, la barra móvil, el detalle de una cuenta o las preguntas rápidas
- **THEN** se abre el mismo modal sobre la pantalla actual, sin navegar ni cambiar la URL
- **AND** al guardar, el movimiento aparece en las listas y saldos de la pantalla de origen

#### Scenario: Cuenta preseleccionada

- **WHEN** el alta se abre desde el detalle de una cuenta o desde un aviso de pago recurrente
- **THEN** el formulario abre con la cuenta correspondiente ya seleccionada
- **AND** la persona puede cambiarla antes de guardar

#### Scenario: Ruta de alta retirada

- **WHEN** se abre `/movimientos/nuevo` directamente
- **THEN** la aplicación muestra la página de no encontrado
- **AND** ningún enlace de la interfaz apunta a esa ruta

#### Scenario: Autor en cuenta conjunta

- **WHEN** se registra un movimiento en una cuenta con miembros
- **THEN** se solicita el miembro autor, se guarda en el movimiento y los avisos pueden atribuirle la actividad

#### Scenario: Cuenta sin miembros

- **WHEN** se registra un movimiento en una cuenta personal o de depósito
- **THEN** no se solicita miembro y el movimiento no queda atribuido a nadie

#### Scenario: Autor ajeno a la cuenta

- **WHEN** se intenta guardar un movimiento con un miembro que no pertenece a la cuenta
- **THEN** la operación se rechaza con un error de validación y no se guarda el movimiento

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

La aplicación SHALL representar pagos a plazos con número de cuotas, importe pagado, importe pendiente y estado de cada cuota, y SHALL mostrar los planes activos en una tarjeta informativa «Próximas cuotas» bajo Cuentas, en filas verticales, con barra de progreso, cuotas restantes y fecha de próximo pago.

#### Scenario: Cuota vencida

- **WHEN** una cuota está vencida
- **THEN** se muestra como atrasada con texto y color en la tarjeta «Próximas cuotas»
- **AND** no aparece una segunda tarjeta ni un banner duplicado con la misma cuota en el resumen
- **AND** el registro de la cuota se realiza desde el detalle de la cuenta

#### Scenario: Próximo pago sin vencer

- **WHEN** existe un próximo pago no vencido y ninguna cuota vencida
- **THEN** la tarjeta muestra su importe, etiqueta y fecha
- **AND** no se renderiza un aviso adicional del mismo plan en otra sección del resumen
- **AND** el registro se mantiene en el detalle de la cuenta, no en el resumen

#### Scenario: Progreso del plazo

- **WHEN** se consulta un pago a plazos
- **THEN** se ve el progreso en formato «x de y» sobre una barra
- **AND** se indica cuántas cuotas quedan y qué importe falta por pagar

#### Scenario: Varios planes activos

- **WHEN** hay más de un plan con cuotas pendientes
- **THEN** todos aparecen en la misma tarjeta, cada uno en su fila
- **AND** las cuotas vencidas se ordenan antes que las futuras
- **AND** el resto se ordena por fecha de próximo pago ascendente

#### Scenario: Plan completado

- **WHEN** se registra la última cuota de un plan
- **THEN** el plan deja de aparecer entre las próximas cuotas
- **AND** su historial de movimientos se conserva en la cuenta

#### Scenario: Detalle de cuenta

- **WHEN** se consulta el detalle de una cuenta con planes de plazos
- **THEN** se mantiene el progreso de cada plan con su próxima cuota y la acción de registrar
- **AND** el resumen y el detalle usan los mismos cálculos de progreso y estado

### Requirement: Detalle de un pago a plazos

La aplicación SHALL ofrecer una página de detalle para cada plan en `/cuotas/<id>` con estado, progreso, importes pagado y pendiente, próxima cuota, calendario de cuotas y la acción de registrar la siguiente. SHALL enlazar con la cuenta del plan y mostrar un estado informativo si el plan no existe o ya está completado.

#### Scenario: Progreso y próxima cuota

- **WHEN** se abre el detalle de un plan activo
- **THEN** se ve su estado, la barra de progreso «x de y», el importe pagado y el pendiente
- **AND** se muestra el importe y la fecha de la próxima cuota

#### Scenario: Calendario de cuotas

- **WHEN** el plan tiene cuotas programadas
- **THEN** el detalle lista cada cuota con su número, fecha e importe
- **AND** cada cuota se marca como Pagada, Vencida o Pendiente según su estado

#### Scenario: Registro desde el detalle

- **WHEN** la persona registra la cuota desde el detalle
- **THEN** se crea el movimiento, el plan avanza y el detalle actualiza el progreso y el calendario sin recargar
- **AND** al registrar la última cuota el plan pasa a completado y desaparece la acción de registrar

#### Scenario: Enlace a la cuenta

- **WHEN** el plan pertenece a una cuenta existente
- **THEN** el detalle muestra un enlace a `/cuentas/<id>` con el nombre de la cuenta

#### Scenario: Plan inexistente

- **WHEN** se abre un detalle con un identificador que no existe
- **THEN** se muestra un estado informativo con la acción de volver al resumen
- **AND** no se inventan importes ni cuotas

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

### Requirement: Barra de filtros unificada de movimientos

El listado de movimientos SHALL presentar búsqueda, tipo, categoría, cuenta y ordenación en una única barra de filtros alineada a la derecha, con controles del mismo patrón, y SHALL NOT mostrar una cápsula de mes independiente que no filtre.

#### Scenario: Tipo en un selector único

- **WHEN** se consulta la barra de filtros
- **THEN** el tipo se elige entre Todos, Gastos, Ingresos y Suscripciones desde un solo selector y no desde botones separados

#### Scenario: Sin cápsula de mes decorativa

- **WHEN** se muestra la barra de filtros
- **THEN** no aparece una cápsula con el mes actual como elemento independiente

#### Scenario: Alineación de los filtros

- **WHEN** la pantalla es de escritorio o tablet
- **THEN** el grupo de filtros se alinea a la derecha de la barra y la búsqueda permanece a la izquierda

#### Scenario: Sin limpieza duplicada

- **WHEN** hay filtros activos y quedan resultados
- **THEN** la barra no muestra un botón «Limpiar filtros» adicional; la limpieza se ofrece en el estado vacío

#### Scenario: Filtros accesibles en móvil

- **WHEN** la pantalla es móvil
- **THEN** la búsqueda y los filtros de tipo, categoría, cuenta y ordenación siguen accesibles sin desbordar horizontalmente

### Requirement: Ordenación de movimientos

La barra SHALL incluir una cápsula de ordenación con fecha descendente, fecha ascendente, importe descendente e importe ascendente, y esa cápsula MUST NOT contener el calendario ni el filtro de periodo.

#### Scenario: Ordenar por fecha o importe

- **WHEN** se elige una opción de la cápsula de ordenación
- **THEN** el listado se reordena y el periodo activo se conserva

### Requirement: Filtro de periodo por rango de fechas

El periodo SHALL mostrarse como un control propio junto al resumen del listado, con atajos —cualquier fecha, este mes, mes anterior y últimos 30 días— y con un rango personalizado elegido con el calendario, aplicado por fecha de negocio con ambos extremos incluidos.

#### Scenario: Calendario junto al resumen

- **WHEN** se consulta el listado
- **THEN** el control de periodo aparece junto al recuento de movimientos, encima del buscador, con su borde derecho alineado con el del buscador y separado de la cápsula de ordenación

#### Scenario: Periodo activo

- **WHEN** se elige un atajo o un rango personalizado
- **THEN** el control muestra el periodo activo y el resumen se actualiza sin cambiar la ordenación

#### Scenario: Periodo por defecto

- **WHEN** se abre el listado sin haber elegido periodo
- **THEN** se muestran los movimientos de cualquier fecha y el selector indica «Cualquier fecha»

#### Scenario: Atajo de periodo

- **WHEN** se elige «Este mes», «Mes anterior» o «Últimos 30 días»
- **THEN** solo aparecen los movimientos cuya fecha cae dentro de ese periodo y el selector muestra su etiqueta

#### Scenario: Rango personalizado

- **WHEN** se elige un rango personalizado con el calendario y se aplica
- **THEN** solo aparecen los movimientos entre la fecha inicial y la final, ambas incluidas

#### Scenario: Rango incompleto

- **WHEN** solo se ha elegido una de las dos fechas del rango personalizado
- **THEN** la acción de aplicar permanece deshabilitada hasta que existan los dos extremos

#### Scenario: Rango invertido

- **WHEN** la segunda fecha elegida es anterior a la primera
- **THEN** ambas se reordenan para formar un rango válido y se muestra el resultado

#### Scenario: Limpiar filtros

- **WHEN** se pulsa «Limpiar filtros»
- **THEN** la búsqueda, el tipo, el periodo, la categoría y la cuenta vuelven a su valor inicial

### Requirement: Resumen coherente con el periodo

El resumen del listado SHALL indicar cuántos movimientos coinciden, y el control de periodo SHALL mostrar el periodo activo; ambos SHALL actualizarse al cambiar los filtros.

#### Scenario: Recuento y periodo

- **WHEN** se aplica un filtro o un periodo
- **THEN** el recuento refleja solo los movimientos visibles y el control de periodo muestra el periodo aplicado

#### Scenario: Sin resultados

- **WHEN** el periodo u otro filtro no devuelve movimientos
- **THEN** se muestra el estado vacío con la acción de limpiar filtros

### Requirement: Detalle de movimiento como formulario en modo lectura

El detalle de un movimiento SHALL mostrar los mismos campos del formulario de edición —tipo, importe, cuenta, concepto, fecha, categoría y nota— en modo lectura, y SHALL ofrecer «Editar» para activarlos con el formulario editable.

#### Scenario: Detalle con aspecto de formulario

- **WHEN** se selecciona un movimiento en el listado, el resumen o el detalle de una cuenta
- **THEN** el modal muestra los campos del formulario con los valores del movimiento
- **AND** los campos están bloqueados y no se puede modificar el movimiento desde ese estado
- **AND** el pie conserva las acciones «Eliminar» y «Editar»

#### Scenario: Pasar a edición

- **WHEN** se pulsa «Editar» en el detalle
- **THEN** se abre el formulario editable con los mismos datos
- **AND** al guardar se actualiza el movimiento y se vuelve a mostrar el detalle en modo lectura

#### Scenario: Cerrar sin editar

- **WHEN** se cierra el detalle en modo lectura
- **THEN** el movimiento conserva sus datos anteriores
