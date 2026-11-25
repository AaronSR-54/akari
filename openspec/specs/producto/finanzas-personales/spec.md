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

La aplicación SHALL permitir registrar gastos e ingresos con importe, fecha, cuenta, concepto y repetición opcional, y SHALL actualizar el saldo de la cuenta afectada.

#### Scenario: Movimiento único

- **WHEN** se guarda un gasto o ingreso marcado como único
- **THEN** aparece en la cuenta y en el listado de movimientos y modifica su saldo una sola vez

#### Scenario: Movimiento periódico

- **WHEN** se marca un movimiento como periódico
- **THEN** se solicita una frecuencia y el movimiento queda identificado como suscripción o ingreso recurrente

#### Scenario: Validación del importe

- **WHEN** el importe está vacío, no es numérico o no corresponde al tipo de movimiento
- **THEN** se muestra un error en texto y no se guarda el movimiento

### Requirement: Listado, búsqueda y filtros de movimientos

La aplicación SHALL listar los movimientos con concepto, fecha, cuenta, categoría e importe, y SHALL permitir buscarlos, filtrarlos y ordenarlos.

#### Scenario: Filtro sin resultados

- **WHEN** los filtros aplicados no devuelven movimientos
- **THEN** se muestra un estado vacío con la opción de limpiar filtros

#### Scenario: Volumen alto

- **WHEN** hay más movimientos de los que caben en la vista
- **THEN** la tabla se pagina en escritorio y la lista carga por scroll en viewports móviles sin perder filtros

#### Scenario: Edición en línea

- **WHEN** se edita un movimiento desde el listado web
- **THEN** el cambio se guarda, el saldo se recalcula y se confirma la acción sin abandonar la tabla

### Requirement: Suscripciones e ingresos periódicos

La aplicación SHALL identificar suscripciones y ingresos recurrentes, mostrar su próxima fecha e importe y avisar de los pagos próximos.

#### Scenario: Próximo pago

- **WHEN** una suscripción o ingreso periódico tiene una fecha próxima
- **THEN** aparece en el resumen y en los avisos con importe, cuenta y acción para revisarlo

#### Scenario: Pago registrado

- **WHEN** se registra el pago de una suscripción
- **THEN** el movimiento se añade a la cuenta y la próxima fecha avanza según su frecuencia

### Requirement: Pagos a plazos

La aplicación SHALL representar pagos a plazos con número de cuotas, importe pagado, importe pendiente y estado de cada cuota.

#### Scenario: Cuota vencida

- **WHEN** una cuota está vencida
- **THEN** se muestra como atrasada con texto y color, y la acción principal permite registrarla

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
