# Spec Delta

## MODIFIED Requirements

### Requirement: Hero del resumen sin contenedor

El dashboard SHALL presentar el saldo total y la evolución del saldo del mes sobre el lienzo, sin borde, fondo, sombra ni tarjeta, y SHALL componer el hero con saldo, gráfica, últimos movimientos, balance del mes y accesos rápidos, manteniendo Cuentas y Cuota unificada por debajo del hero.

#### Scenario: Hero sin caja

- **WHEN** se abre el dashboard con al menos una cuenta
- **THEN** el saldo total y la gráfica del saldo del mes aparecen sobre el lienzo sin contenedor propio
- **AND** el hero muestra en la columna izquierda saldo y últimos movimientos, y en la derecha gráfica, balance del mes y accesos rápidos
- **AND** las secciones de cuentas y cuota unificada siguen visibles debajo del hero

#### Scenario: Viewport estrecho

- **WHEN** el ancho disponible no permite mostrar dos columnas en el hero
- **THEN** los bloques se apilan en una columna en el orden saldo, gráfica, últimos movimientos, balance, accesos rápidos
- **AND** el bloque de saldo se centra horizontalmente
- **AND** la gráfica y el panel de últimos movimientos van unidos sin separación
- **AND** ninguno recupera borde ni fondo de tarjeta

#### Scenario: Saldo con proyección

- **WHEN** existe una proyección de fin de mes para la divisa del saldo total
- **THEN** el bloque de saldo muestra solo los totales por divisa, con el importe en talla grande (52px)
- **AND** el delta proyectado aparece únicamente en la tarjeta de balance del mes

### Requirement: Sin gráficos semanales ni tarjetas duplicadas

El dashboard MUST NOT mostrar el gráfico semanal de movimientos ni duplicar el balance del mes o la cuota en el hero, y SHALL conservar el acceso a «Preguntas rápidas» en el panel de accesos rápidos.

#### Scenario: Un único balance del mes

- **WHEN** se revisa el dashboard completo
- **THEN** el balance del mes solo aparece en la tarjeta del hero, bajo la gráfica
- **AND** no hay un gráfico semanal ni una segunda tarjeta con el balance o el gasto mensual

#### Scenario: Cuota sin duplicar

- **WHEN** existe un próximo pago o una cuota vencida
- **THEN** aparece una sola vez, en el panel unificado debajo de cuentas
- **AND** el hero no muestra tarjeta ni banner duplicado de cuota

#### Scenario: Acceso conservado

- **WHEN** la persona busca las preguntas rápidas desde el resumen
- **THEN** encuentra un acceso visible dentro del panel de accesos rápidos que lleva a `/preguntas`
- **AND** el panel de últimos movimientos conserva el enlace «Ver todos» hacia `/movimientos`
- **AND** no hay un segundo enlace a preguntas rápidas en el panel de últimos movimientos

### Requirement: Unión de la gráfica y la tarjeta

El hero SHALL componerse de dos columnas independientes de igual anchura y de igual altura: a la izquierda saldo y últimos movimientos con aire entre ambos, a la derecha gráfica, balance y accesos. La tarjeta de balance SHALL ir por delante de la gráfica, sin borde superior, con una sombra superior sutil y recortando el área ámbar en sus esquinas, limitada a la altura de su contenido. En desktop, la gráfica SHALL adaptar su altura para que ambas columnas terminen siempre a la misma altura, sin alterar el tamaño del panel de últimos movimientos.

#### Scenario: Sin línea de separación

- **WHEN** la gráfica y la tarjeta comparten su borde en desktop
- **THEN** la tarjeta no dibuja una línea superior entre ellas
- **AND** las esquinas redondeadas de la tarjeta recortan el área ámbar

#### Scenario: Unión en móvil

- **WHEN** el viewport es estrecho
- **THEN** la tarjeta de últimos movimientos va por delante de la gráfica, sin borde superior y con sombra superior sutil

#### Scenario: Columnas equilibradas

- **WHEN** se abre el resumen en desktop con cualquier cantidad de movimientos
- **THEN** ambas columnas empiezan a la misma altura y terminan siempre a la misma altura
- **AND** entre el saldo y los últimos movimientos hay aire visible
- **AND** la gráfica y la tarjeta de balance van unidas sin separación
- **AND** la gráfica adapta su altura a la columna izquierda (mínimo 160px) para igualar los fondos
- **AND** la columna izquierda reparte su hueco como aire, sin cambiar el tamaño del panel de últimos movimientos

#### Scenario: Final del área redondeado

- **WHEN** aún faltan días para el final de mes y el relleno se extiende en plano hasta el borde derecho
- **THEN** la esquina superior del final del área se redondea con el mismo radio que el panel
- **AND** el inicio del área se mantiene recto
- **AND** con el mes completo el trazado no cambia

#### Scenario: Signo y color

- **WHEN** el balance del mes es positivo
- **THEN** el importe se muestra en verde y con el signo «+»
- **AND** si es negativo se muestra en rojo y con el signo «−»

#### Scenario: Balance en cero

- **WHEN** los ingresos y los gastos del mes se compensan
- **THEN** el balance se muestra sin signo y con el color de texto principal

#### Scenario: Saldo total estimado

- **WHEN** existe una proyección de fin de mes para la divisa de referencia
- **THEN** la tarjeta muestra el saldo total estimado a fin de mes como única línea de pie
- **AND** no muestra el desglose de ingresos y gastos

#### Scenario: Sin proyección

- **WHEN** no hay una proyección de fin de mes para la divisa de referencia
- **THEN** la tarjeta omite la línea del saldo total estimado
