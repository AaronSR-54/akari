# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
