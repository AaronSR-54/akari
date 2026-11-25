# Spec Delta

## MODIFIED Requirements

### Requirement: Hero del resumen sin contenedor

El dashboard SHALL presentar el saldo total y la evolución del saldo del mes sobre el lienzo, sin borde, fondo, sombra ni tarjeta, y SHALL componer el hero como retícula 2×2 con saldo, gráfica, últimos movimientos y balance del mes, manteniendo Cuentas y Cuota unificada por debajo del hero.

#### Scenario: Hero sin caja

- **WHEN** se abre el dashboard con al menos una cuenta
- **THEN** el saldo total y la gráfica del saldo del mes aparecen sobre el lienzo sin contenedor propio
- **AND** el hero muestra en la fila 1 saldo y gráfica, y en la fila 2 últimos movimientos y balance del mes
- **AND** las secciones de cuentas y cuota unificada siguen visibles debajo del hero

#### Scenario: Viewport estrecho

- **WHEN** el ancho disponible no permite mostrar dos columnas en el hero
- **THEN** los cuatro bloques se apilan en una columna en el orden saldo, gráfica, últimos movimientos, balance
- **AND** el bloque de saldo se centra horizontalmente
- **AND** la gráfica y el panel de últimos movimientos van unidos sin separación
- **AND** ninguno recupera borde ni fondo de tarjeta

#### Scenario: Saldo con proyección

- **WHEN** existe una proyección de fin de mes para la divisa del saldo total
- **THEN** el bloque de saldo muestra solo los totales por divisa, con el importe en talla grande (52px)
- **AND** el delta proyectado aparece únicamente en la tarjeta de balance del mes

### Requirement: Evolución del saldo del mes

La gráfica del hero SHALL representar el saldo de la cuenta de referencia a lo largo del mes, partiendo del saldo de cierre del mes anterior como base. Cada ingreso SHALL subir la línea y cada gasto bajarla; la serie SHALL terminar en el día actual y MUST NOT inventar días futuros. La gráfica SHALL permitir recorrer el cierre del mes anterior y cada día transcurrido para consultar sus movimientos y el saldo resultante. El punto más alto de la serie SHALL tocar siempre el borde superior de la gráfica.

#### Scenario: Base en el saldo de apertura

- **WHEN** el mes actual tiene movimientos y existe saldo del mes anterior
- **THEN** la serie arranca en el cierre del mes anterior, como primer punto antes del día 1
- **AND** el primer punto se puede recorrer y su detalle lo identifica como «Cierre del mes anterior» con su saldo
- **AND** la fecha del cierre anterior no se muestra como texto fijo en la gráfica
- **AND** el último punto de la serie coincide con el saldo actual de la divisa de referencia

#### Scenario: Gastos hacia abajo e ingresos hacia arriba

- **WHEN** un día tiene gastos o ingresos
- **THEN** los gastos reducen la línea y los ingresos la elevan
- **AND** la gráfica usa tinta para la línea y ámbar para el área, sin convertir divisas

#### Scenario: Detalle de un día con el puntero

- **WHEN** la persona pasa el puntero sobre un día transcurrido
- **THEN** aparece un detalle con la fecha, los movimientos con su signo y el saldo tras ese día
- **AND** el detalle se dibuja por encima de la tarjeta de balance aunque la gráfica quede detrás
- **AND** un día sin movimientos lo indica y mantiene el saldo del día anterior

#### Scenario: Detalle de un día con el teclado

- **WHEN** la gráfica recibe el foco y se usan las flechas izquierda y derecha, Inicio o Fin
- **THEN** el detalle recorre el cierre anterior y los días transcurridos y se anuncia el día activo a los lectores de pantalla
- **AND** Escape cierra el detalle sin mover el foco fuera de la gráfica

#### Scenario: Días futuros

- **WHEN** el mes aún no ha terminado
- **THEN** la serie termina hoy y los días posteriores no se pueden seleccionar
- **AND** el detalle nunca muestra datos inventados de días futuros

#### Scenario: Ingreso previsto a fin de mes

- **WHEN** hay una nómina fechada en un día posterior a hoy dentro del mes, como movimiento o como recurrencia
- **THEN** ni la serie ni el balance del mes la incluyen todavía
- **AND** el saldo total estimado a fin de mes sí la incluye
- **AND** el saldo total real no la adelanta

#### Scenario: Divisa de referencia

- **WHEN** las cuentas activas usan más de una divisa
- **THEN** la gráfica usa la divisa de referencia y la etiqueta de forma explícita
- **AND** suma solo las cuentas incluidas en el saldo total

#### Scenario: Sin movimientos en el mes

- **WHEN** el mes actual no tiene movimientos en la divisa de referencia
- **THEN** la serie se mantiene plana en el saldo de apertura
- **AND** el detalle de cada día indica que no hay movimientos

#### Scenario: Movimiento nuevo o editado

- **WHEN** se registra o edita un movimiento del mes actual
- **THEN** la serie, el saldo y el detalle del día se actualizan
- **AND** la gráfica no reinicia su animación de entrada por ese refresco de datos

#### Scenario: Máximo a alto completo

- **WHEN** hay al menos un día transcurrido en el mes
- **THEN** el punto más alto de la línea toca el borde superior de la gráfica

### Requirement: Unión de la gráfica y la tarjeta

El hero SHALL componerse de dos columnas independientes de igual anchura: a la izquierda saldo y últimos movimientos con aire entre ambos, a la derecha gráfica y balance unidos. La tarjeta de balance SHALL ir por delante de la gráfica, sin borde superior, con una sombra superior sutil y recortando el área ámbar en sus esquinas, limitada a la altura de su contenido. La gráfica SHALL mantener una altura mínima mayor en desktop para que ambas columnas terminen a la misma altura de contenido.

#### Scenario: Sin línea de separación

- **WHEN** la gráfica y la tarjeta comparten su borde en desktop
- **THEN** la tarjeta no dibuja una línea superior entre ellas
- **AND** las esquinas redondeadas de la tarjeta recortan el área ámbar

#### Scenario: Unión en móvil

- **WHEN** el viewport es estrecho
- **THEN** la tarjeta de últimos movimientos va por delante de la gráfica, sin borde superior y con sombra superior sutil

#### Scenario: Columnas equilibradas

- **WHEN** se abre el resumen en desktop con movimientos y proyección de ejemplo
- **THEN** ambas columnas empiezan a la misma altura y terminan a la misma altura de contenido
- **AND** entre el saldo y los últimos movimientos hay aire visible
- **AND** la gráfica y la tarjeta de balance van unidas sin separación
- **AND** la gráfica absorbe la altura restante para igualar los fondos

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

### Requirement: Sin gráficos semanales ni tarjetas duplicadas

El dashboard MUST NOT mostrar el gráfico semanal de movimientos ni duplicar el balance del mes o la cuota en el hero, y SHALL conservar el acceso a «Preguntas rápidas» dentro del panel de últimos movimientos.

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
- **THEN** encuentra un enlace visible dentro del panel de últimos movimientos que lleva a `/preguntas`
- **AND** el panel conserva el enlace «Ver todos» hacia `/movimientos`
