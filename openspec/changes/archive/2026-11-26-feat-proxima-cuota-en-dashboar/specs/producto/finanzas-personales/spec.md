# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
