# Spec Delta

## MODIFIED Requirements

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
