# Spec Delta

## MODIFIED Requirements

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
