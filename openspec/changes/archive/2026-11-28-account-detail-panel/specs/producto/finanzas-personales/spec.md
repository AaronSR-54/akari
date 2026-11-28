# Spec Delta

## MODIFIED Requirements

### Requirement: Alta y edición de cuentas

La aplicación SHALL permitir crear y editar cuentas personales, conjuntas y de depósito con nombre, tipo, divisa y saldo inicial obligatorio, SHALL mostrar los campos condicionales de cada tipo, SHALL ofrecer un selector opcional de banco del catálogo local y SHALL crear cuentas desde un modal sobre la pantalla actual, sin ruta de alta propia.

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

#### Scenario: Alta en modal

- **WHEN** la persona pulsa «Nueva cuenta» o «Añadir cuenta» desde el resumen, el selector de cuentas o un aviso de «sin cuentas»
- **THEN** se abre un modal con el formulario completo sobre la pantalla actual sin cambiar la URL
- **AND** al guardar, el modal se cierra y la nueva cuenta queda disponible para abrir su detalle
- **AND** cancelar cierra el modal sin crear nada

#### Scenario: Sin ruta de alta

- **WHEN** se navega directamente a `/cuentas/nueva`
- **THEN** la aplicación muestra el estado de página no encontrada y no un formulario de alta

#### Scenario: Eliminar una cuenta

- **WHEN** se abre la edición de una cuenta sin movimientos
- **THEN** aparece la acción de eliminar dentro de la edición, pide confirmación y, al aceptar, vuelve al resumen
- **AND** el detalle de la cuenta no muestra una acción de eliminar
- **AND** si la cuenta tiene movimientos, la eliminación se rechaza con un mensaje comprensible

### Requirement: Detalle de cuenta

La aplicación SHALL mostrar el detalle de una cuenta como panel de cuentas: la cuenta activa con un selector para cambiar de cuenta, su saldo actual, el balance del mes y los paneles de detalles, últimos movimientos, plazos y recurrentes.

#### Scenario: Navegación desde el resumen

- **WHEN** se selecciona una cuenta en el resumen
- **THEN** se abre su detalle con el contexto de esa cuenta y una forma de volver al resumen

#### Scenario: Selector de cuentas en escritorio

- **WHEN** se abre el panel de una cuenta en escritorio
- **THEN** el nombre de la cuenta en la cabecera tiene un chevron que despliega un selector en una sola columna con las cuentas activas en tarjetas reducidas, con banco, nombre, saldo y tipo en la esquina superior
- **AND** al elegir otra cuenta se navega a su detalle en `/cuentas/<id>` sin recargar la aplicación

#### Scenario: Selector de cuentas en móvil

- **WHEN** se abre el panel de una cuenta en viewport estrecho
- **THEN** el chevron del nombre abre una hoja inferior anclada al borde inferior de la pantalla, no un modal centrado, con las tarjetas de las cuentas activas
- **AND** al elegir otra cuenta se navega a su detalle y la hoja se cierra

#### Scenario: Resumen depurado

- **WHEN** se revisa la parte superior del panel de cuenta
- **THEN** solo aparece la cifra de saldo actual, con su etiqueta y la fecha debajo, y sin barra de tipo, divisa ni actualización
- **AND** no aparece una tarjeta de saldo estimado ni una tarjeta de movimientos del mes
- **AND** la cabecera no muestra las acciones «Editar», «Añadir movimiento» ni «Eliminar»

#### Scenario: Balance del mes

- **WHEN** se revisa el panel de balance de la cuenta
- **THEN** se muestra la evolución diaria del saldo con la base del cierre del mes anterior, el balance neto del mes con signo y color y el saldo estimado a fin de mes
- **AND** se reutiliza el mismo componente de balance del resumen y los mismos cálculos de progreso diario

#### Scenario: Panel en dos columnas

- **WHEN** se abre el panel de una cuenta en escritorio
- **THEN** el saldo, la gráfica, el balance del mes y los detalles de la cuenta ocupan la parte fija, y los últimos movimientos, las próximas cuotas y las recurrentes la columna derecha
- **AND** el scroll vive en la raíz de la aplicación, el saldo y la columna izquierda quedan siempre fijos y solo se desplaza la columna derecha, que empieza debajo del saldo
- **AND** la columna derecha sube hasta el borde superior de la raíz y pasa difuminada por detrás de la cabecera fija, sin cortarse a la altura del saldo; su borde inferior se funde con una máscara de degradado de 20 px como la del panel de avisos
- **AND** al llegar al final del scroll, el último panel de la derecha termina alineado con el último panel de la izquierda
- **AND** la gráfica se ajusta al alto disponible sin superar su tamaño máximo y deja margen arriba para que el punto de hover no se recorte

#### Scenario: Cuenta sin movimientos

- **WHEN** una cuenta no tiene movimientos
- **THEN** el detalle muestra un estado vacío con la acción de añadir el primero

#### Scenario: Detalles de la cuenta

- **WHEN** se consulta el panel «Detalles de la cuenta»
- **THEN** se ven tipo, divisa, titular, inclusión en el saldo total, TAE cuando proceda y fecha de creación
- **AND** el panel integra la acción «Editar» que abre la edición de la cuenta

#### Scenario: Últimos movimientos con subtítulo

- **WHEN** se consulta el panel de últimos movimientos
- **THEN** el subtítulo indica cuántos movimientos tiene la cuenta este mes y la variación de gasto frente al mes anterior, o que no hay comparación
- **AND** el panel ofrece «Añadir movimiento», que abre el modal de movimiento con la cuenta preseleccionada sin cambiar de ruta
- **AND** en móvil la acción de añadir aparece en el pie del panel

#### Scenario: Plazos y recurrentes existentes

- **WHEN** la cuenta tiene planes de plazos o recurrencias
- **THEN** el panel «Próximas cuotas» reutiliza el componente, el progreso y la próxima cuota del resumen, y cada plan enlaza a su detalle para registrar la cuota
- **AND** el panel de recurrentes lista concepto e importe de cada una
- **AND** cada panel ofrece un botón para añadir un plan o una recurrencia

## ADDED Requirements

### Requirement: Alta de un plan de plazos

La aplicación SHALL permitir crear un plan de plazos desde el panel de la cuenta con concepto, importe total, número de cuotas, fecha de la primera cuota y frecuencia, y SHALL calcular la cuota a partir del importe total sin registrar ningún movimiento hasta que se registre una cuota.

#### Scenario: Validación del plan

- **WHEN** faltan concepto, importe, número de cuotas o primera fecha, o el importe no es positivo o las cuotas son menores que dos
- **THEN** se muestra un error en texto y el plan no se crea

#### Scenario: Plan creado

- **WHEN** se guarda un plan válido desde el modal de la cuenta
- **THEN** el plan aparece en el panel de plazos con su progreso «0 de N» y su próxima cuota
- **AND** no se crea ningún movimiento hasta registrar la primera cuota
- **AND** la divisa del plan es la de la cuenta

### Requirement: Alta de una recurrencia

La aplicación SHALL permitir crear una recurrencia desde el panel de la cuenta con tipo, importe, concepto, categoría, frecuencia, próxima fecha y fecha de fin opcional, sin registrar el movimiento hasta que se pague.

#### Scenario: Validación de la recurrencia

- **WHEN** faltan concepto, importe, próxima fecha o frecuencia, o el importe no es positivo
- **THEN** se muestra un error en texto y la recurrencia no se crea
- **AND** si se indica una fecha de fin anterior a la próxima fecha, se rechaza con un mensaje

#### Scenario: Recurrencia creada

- **WHEN** se guarda una recurrencia válida desde el modal de la cuenta
- **THEN** aparece en el panel de recurrentes con su concepto e importe
- **AND** no se crea ningún movimiento hasta que se registre su pago
- **AND** la recurrencia queda vinculada a la cuenta y a su divisa
