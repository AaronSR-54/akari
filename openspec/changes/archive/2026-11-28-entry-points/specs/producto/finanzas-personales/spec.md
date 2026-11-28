# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
