# Spec Delta

## ADDED Requirements

### Requirement: Barra de filtros unificada de movimientos

El listado de movimientos SHALL presentar búsqueda, tipo, categoría, cuenta y ordenación en una única barra de filtros alineada a la derecha, con controles del mismo patrón, y SHALL NOT mostrar una cápsula de mes independiente que no filtre.

#### Scenario: Tipo en un selector único

- **WHEN** se consulta la barra de filtros
- **THEN** el tipo se elige entre Todos, Gastos, Ingresos y Suscripciones desde un solo selector y no desde botones separados

#### Scenario: Sin cápsula de mes decorativa

- **WHEN** se muestra la barra de filtros
- **THEN** no aparece una cápsula con el mes actual como elemento independiente

#### Scenario: Alineación de los filtros

- **WHEN** la pantalla es de escritorio o tablet
- **THEN** el grupo de filtros se alinea a la derecha de la barra y la búsqueda permanece a la izquierda

#### Scenario: Sin limpieza duplicada

- **WHEN** hay filtros activos y quedan resultados
- **THEN** la barra no muestra un botón «Limpiar filtros» adicional; la limpieza se ofrece en el estado vacío

#### Scenario: Filtros accesibles en móvil

- **WHEN** la pantalla es móvil
- **THEN** la búsqueda y los filtros de tipo, categoría, cuenta y ordenación siguen accesibles sin desbordar horizontalmente

### Requirement: Ordenación de movimientos

La barra SHALL incluir una cápsula de ordenación con fecha descendente, fecha ascendente, importe descendente e importe ascendente, y esa cápsula MUST NOT contener el calendario ni el filtro de periodo.

#### Scenario: Ordenar por fecha o importe

- **WHEN** se elige una opción de la cápsula de ordenación
- **THEN** el listado se reordena y el periodo activo se conserva

### Requirement: Filtro de periodo por rango de fechas

El periodo SHALL mostrarse como un control propio junto al resumen del listado, con atajos —cualquier fecha, este mes, mes anterior y últimos 30 días— y con un rango personalizado elegido con el calendario, aplicado por fecha de negocio con ambos extremos incluidos.

#### Scenario: Calendario junto al resumen

- **WHEN** se consulta el listado
- **THEN** el control de periodo aparece junto al recuento de movimientos, encima del buscador, con su borde derecho alineado con el del buscador y separado de la cápsula de ordenación

#### Scenario: Periodo activo

- **WHEN** se elige un atajo o un rango personalizado
- **THEN** el control muestra el periodo activo y el resumen se actualiza sin cambiar la ordenación

#### Scenario: Periodo por defecto

- **WHEN** se abre el listado sin haber elegido periodo
- **THEN** se muestran los movimientos de cualquier fecha y el selector indica «Cualquier fecha»

#### Scenario: Atajo de periodo

- **WHEN** se elige «Este mes», «Mes anterior» o «Últimos 30 días»
- **THEN** solo aparecen los movimientos cuya fecha cae dentro de ese periodo y el selector muestra su etiqueta

#### Scenario: Rango personalizado

- **WHEN** se elige un rango personalizado con el calendario y se aplica
- **THEN** solo aparecen los movimientos entre la fecha inicial y la final, ambas incluidas

#### Scenario: Rango incompleto

- **WHEN** solo se ha elegido una de las dos fechas del rango personalizado
- **THEN** la acción de aplicar permanece deshabilitada hasta que existan los dos extremos

#### Scenario: Rango invertido

- **WHEN** la segunda fecha elegida es anterior a la primera
- **THEN** ambas se reordenan para formar un rango válido y se muestra el resultado

#### Scenario: Limpiar filtros

- **WHEN** se pulsa «Limpiar filtros»
- **THEN** la búsqueda, el tipo, el periodo, la categoría y la cuenta vuelven a su valor inicial

### Requirement: Resumen coherente con el periodo

El resumen del listado SHALL indicar cuántos movimientos coinciden, y el control de periodo SHALL mostrar el periodo activo; ambos SHALL actualizarse al cambiar los filtros.

#### Scenario: Recuento y periodo

- **WHEN** se aplica un filtro o un periodo
- **THEN** el recuento refleja solo los movimientos visibles y el control de periodo muestra el periodo aplicado

#### Scenario: Sin resultados

- **WHEN** el periodo u otro filtro no devuelve movimientos
- **THEN** se muestra el estado vacío con la acción de limpiar filtros
