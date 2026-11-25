# Spec Delta

## Purpose

Define cómo akari gestiona grupos y gastos compartidos para que varias personas puedan repartir un gasto, saber quién debe pagar a quién y liquidar sin perder el detalle original.

## ADDED Requirements

### Requirement: Grupos y miembros

La aplicación SHALL permitir crear grupos con nombre, divisa y miembros, y SHALL mostrar el rol de cada miembro dentro del grupo o cuenta conjunta.

#### Scenario: Grupo nuevo

- **WHEN** se crea un grupo con al menos dos miembros
- **THEN** el grupo queda disponible para registrar gastos y muestra sus miembros y su divisa

#### Scenario: Grupo sin miembros suficientes

- **WHEN** se intenta crear un gasto en un grupo con menos de dos miembros
- **THEN** la acción se bloquea con un mensaje que explica que falta añadir participantes

#### Scenario: Cambio de rol

- **WHEN** una persona administradora cambia el rol de un miembro
- **THEN** el nuevo rol se refleja en el grupo y solo la administración puede modificarlo

### Requirement: Reparto editable de un gasto grupal

La aplicación SHALL permitir repartir un gasto por partes iguales, porcentaje o cantidad fija por participante, y SHALL mostrar la parte de cada persona y el total.

#### Scenario: Reparto porcentual

- **WHEN** se edita el porcentaje de cada participante
- **THEN** la aplicación muestra la cantidad resultante y exige que la suma sea el 100 % antes de guardar

#### Scenario: Reparto por cantidad fija

- **WHEN** se introducen cantidades fijas por persona
- **THEN** la aplicación exige que la suma coincida con el importe total y señala el descuadre mientras exista

#### Scenario: Reparto por partes iguales

- **WHEN** se elige reparto igualitario
- **THEN** cada participante recibe una parte y el resto por redondeo se asigna de forma visible sin alterar el total

### Requirement: Gasto sin cuenta asociada

La aplicación SHALL permitir registrar un gasto grupal sin cuenta de origen y MUST NOT modificar saldos personales hasta que el gasto se liquide.

#### Scenario: Gasto solo del grupo

- **WHEN** se guarda un gasto sin seleccionar cuenta
- **THEN** el gasto aparece en el grupo y ningún saldo personal cambia

#### Scenario: Gasto con cuenta

- **WHEN** se selecciona una cuenta de origen
- **THEN** el gasto queda asociado a esa cuenta y el movimiento se refleja al liquidarse

### Requirement: Liquidación entre participantes

La aplicación SHALL calcular quién paga a quién y SHALL permitir marcar transferencias como pendientes o saldadas, indicando la cuenta de cobro.

#### Scenario: Transferencias pendientes

- **WHEN** se consulta la liquidación de un grupo con deudas
- **THEN** se lista cada transferencia con deudor, acreedor, importe y estado pendiente

#### Scenario: Liquidación completada

- **WHEN** se marca una transferencia como saldada
- **THEN** deja de contar como deuda pendiente y el historial conserva el registro

#### Scenario: Grupo saldado

- **WHEN** todas las transferencias de un grupo están saldadas
- **THEN** la liquidación muestra el grupo como saldado sin ocultar los gastos originales

### Requirement: Cuenta de cobro y conversión de divisas

Cuando el gasto use una divisa distinta a la del grupo, la aplicación SHALL conservar el importe y la divisa originales y SHALL registrar el tipo de cambio aplicado para expresar la deuda en la divisa de cobro.

#### Scenario: Divisa distinta

- **WHEN** se registra un gasto en una divisa diferente a la del grupo
- **THEN** se solicita o se muestra el tipo de cambio aplicado, la deuda se expresa en la divisa de cobro y el detalle conserva el importe original

#### Scenario: Cambio posterior del tipo

- **WHEN** el tipo de cambio del día cambia después de guardar el gasto
- **THEN** la deuda guardada no se recalcula y el detalle sigue mostrando el tipo aplicado en su creación

### Requirement: Historial y estado del gasto

La aplicación SHALL listar los gastos de un grupo con importe, fecha, pagador, participantes y estado de liquidación, y SHALL permitir filtrarlos.

#### Scenario: Gasto pendiente

- **WHEN** un gasto todavía tiene deudas sin saldar
- **THEN** aparece como pendiente con el importe que falta por liquidar

#### Scenario: Grupo sin gastos

- **WHEN** un grupo no tiene gastos
- **THEN** se muestra un estado vacío con la acción de registrar el primero
