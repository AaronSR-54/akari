# Spec Delta

## MODIFIED Requirements

### Requirement: Panel de accesos rápidos

El dashboard SHALL mostrar unos «Accesos rápidos» justo debajo de la tarjeta de balance del mes: una fila sin caja que ocupa todo el ancho, con píldoras siempre expandidas (icono + etiqueta visible) que reparten el ancho: tres en móvil y cuatro en desktop. La cabecera del resumen no repite esos atajos.

#### Scenario: Contenido del panel

- **WHEN** se abre el resumen con al menos una cuenta
- **THEN** el panel muestra píldoras siempre expandidas con icono y etiqueta visible que ocupan todo el ancho: en móvil tres (`wallet` «Nueva cuenta» clara con borde, `arrows` «Exportar» clara con borde, `insights` «Preguntas» oscura)
- **AND** las tres ocupan todo el ancho del panel en una sola línea a 390 px de ancho
- **AND** «Nueva cuenta» abre el modal de alta de cuenta sin cambiar de ruta, «Exportar» lleva a `/ajustes` y «Preguntas» a `/preguntas`
- **AND** cada píldora expone su nombre a lectores de pantalla («Preguntas rápidas» aunque el texto visible sea «Preguntas»)
- **THEN** en viewport de 768 px o más la fila muestra cuatro píldoras con este orden: `add` «Nuevo movimiento» (acento), `wallet` «Nueva cuenta» y `arrows` «Exportar» (claras con borde), `insights` «Preguntas rápidas» (oscura, a la derecha)

#### Scenario: Alta desde el estado vacío

- **WHEN** el resumen se abre sin cuentas y se pulsa «Añadir cuenta»
- **THEN** se abre el mismo modal de alta de cuenta que en el panel de accesos
- **AND** al guardar, la nueva cuenta queda disponible y se puede abrir su detalle
