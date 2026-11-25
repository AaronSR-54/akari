# Spec Delta

## Purpose

Ofrece desde el resumen los atajos más usados (nueva cuenta, preguntas rápidas, exportar) sin obligar a navegar por el shell ni a rebuscar enlaces a pie de otros paneles. En móvil, registrar un movimiento vive como acción central de la barra de navegación.

## ADDED Requirements

### Requirement: Panel de accesos rápidos

El dashboard SHALL mostrar unos «Accesos rápidos» justo debajo de la tarjeta de balance del mes: una fila sin caja que ocupa todo el ancho, con píldoras siempre expandidas (icono + etiqueta visible) que reparten el ancho: tres en móvil y cuatro en desktop. La cabecera del resumen no repite esos atajos.

#### Scenario: Contenido del panel

- **WHEN** se abre el resumen con al menos una cuenta
- **THEN** el panel muestra píldoras siempre expandidas con icono y etiqueta visible que ocupan todo el ancho: en móvil tres (`wallet` «Nueva cuenta» clara con borde, `arrows` «Exportar» clara con borde, `insights` «Preguntas» oscura)
- **AND** las tres ocupan todo el ancho del panel en una sola línea a 390 px de ancho
- **AND** cada píldora lleva a su destino existente (`/cuentas/nueva`, `/preguntas`, `/ajustes`)
- **AND** cada píldora expone su nombre a lectores de pantalla («Preguntas rápidas» aunque el texto visible sea «Preguntas»)
- **THEN** en viewport de 768 px o más la fila muestra cuatro píldoras con este orden: `add` «Nuevo movimiento» (acento), `wallet` «Nueva cuenta» y `arrows` «Exportar» (claras con borde), `insights` «Preguntas rápidas» (oscura, a la derecha)

### Requirement: Atajo central de nuevo movimiento en móvil

En viewport estrecho, la barra de navegación inferior SHALL mostrar «Añadir movimiento» como acción central destacada (botón circular elevado) hacia `/movimientos/nuevo`, de modo que cada destino aparece una sola vez entre barra y panel.

#### Scenario: Acción central en móvil

- **WHEN** se abre la app en viewport estrecho
- **THEN** la barra inferior muestra el botón circular «Añadir movimiento» entre Movimientos y Grupos
- **AND** lleva a `/movimientos/nuevo`
- **AND** el panel de accesos no repite ese destino en ese viewport

#### Scenario: Sin duplicar atajos

- **WHEN** se revisa el resumen con cuentas
- **THEN** la cabecera no muestra botones de acción
- **AND** cada destino aparece una sola vez en el resumen

#### Scenario: Posición en desktop

- **WHEN** se abre el resumen en desktop
- **THEN** el panel aparece en la columna derecha, debajo de la tarjeta de balance
- **AND** mantiene aire visible con la tarjeta de balance

#### Scenario: Posición en viewport estrecho

- **WHEN** el ancho disponible no permite mostrar dos columnas en el hero
- **THEN** el panel se apila al final, tras la tarjeta de balance

#### Scenario: Sin duplicar el acceso a preguntas

- **WHEN** el panel de accesos rápidos está visible
- **THEN** el panel de últimos movimientos no muestra un segundo enlace a preguntas rápidas
- **AND** conserva el enlace «Ver todos» hacia `/movimientos`

#### Scenario: Estado vacío

- **WHEN** el resumen se abre sin cuentas activas
- **THEN** el hero muestra el estado vacío existente y no el panel de accesos
