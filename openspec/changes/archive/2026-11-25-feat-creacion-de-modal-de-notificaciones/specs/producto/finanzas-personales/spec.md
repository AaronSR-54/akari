# Spec Delta

## MODIFIED Requirements

### Requirement: Registro de movimientos

La aplicación SHALL permitir registrar gastos e ingresos con importe, fecha, cuenta, concepto y repetición opcional, y SHALL actualizar el saldo de la cuenta afectada. En cuentas conjuntas SHALL registrar además el miembro autor del movimiento.

#### Scenario: Movimiento único

- **WHEN** se guarda un gasto o ingreso marcado como único
- **THEN** aparece en la cuenta y en el listado de movimientos y modifica su saldo una sola vez

#### Scenario: Movimiento periódico

- **WHEN** se marca un movimiento como periódico
- **THEN** se solicita una frecuencia y el movimiento queda identificado como suscripción o ingreso recurrente

#### Scenario: Validación del importe

- **WHEN** el importe está vacío, no es numérico o no corresponde al tipo de movimiento
- **THEN** se muestra un error en texto y no se guarda el movimiento

#### Scenario: Autor en cuenta conjunta

- **WHEN** se registra un movimiento en una cuenta con miembros
- **THEN** se solicita el miembro autor, se guarda en el movimiento y los avisos pueden atribuirle la actividad

#### Scenario: Cuenta sin miembros

- **WHEN** se registra un movimiento en una cuenta personal o de depósito
- **THEN** no se solicita miembro y el movimiento no queda atribuido a nadie

#### Scenario: Autor ajeno a la cuenta

- **WHEN** se intenta guardar un movimiento con un miembro que no pertenece a la cuenta
- **THEN** la operación se rechaza con un error de validación y no se guarda el movimiento
