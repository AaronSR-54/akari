# Spec Delta

## MODIFIED Requirements

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
- **AND** la gráfica usa el acento mostaza para la línea y para el área, sin convertir divisas
- **AND** la línea conserva ese mismo acento mostaza en tema claro y en tema oscuro, sin teñirse por el signo del movimiento

#### Scenario: Trazado continuo suave

- **WHEN** la serie tiene al menos tres puntos
- **THEN** la línea se dibuja como una curva continua que suaviza los cambios de dirección
- **AND** la curva pasa por el saldo de cierre del mes anterior, por cada día transcurrido y por el punto más alto de la serie
- **AND** la curva arranca en la tangente de la esquina redondeada de inicio y termina en la del final, sin tocar los bordes del área
- **AND** la curva no sobresale por encima del borde superior ni por debajo del área

#### Scenario: Detalle de un día con el puntero

- **WHEN** la persona pasa el puntero sobre un día transcurrido
- **THEN** aparece un detalle con la fecha, los movimientos con su signo y el saldo tras ese día
- **AND** el detalle se dibuja por encima de la tarjeta de balance aunque la gráfica quede detrás
- **AND** el detalle usa el mismo fondo que los bloques de cuenta del dashboard, con borde y texto legibles en tema claro y oscuro
- **AND** el detalle muestra la fecha y el saldo con tipografía reforzada y los movimientos con texto y cifras de tamaño superior al resto de la gráfica
- **AND** el punto activo del trazo lleva un borde del mismo color de fondo del detalle
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

El hero SHALL componerse de dos columnas independientes de igual anchura y de igual altura: a la izquierda saldo y últimos movimientos con aire entre ambos, a la derecha gráfica, balance y accesos. La tarjeta de balance SHALL ir por delante de la gráfica, sin borde superior, con una sombra superior sutil y sin recortar el área ámbar, que queda separada de los bordes laterales y de las esquinas de la tarjeta. En desktop, la gráfica SHALL adaptar su altura para que ambas columnas terminen siempre a la misma altura, sin alterar el tamaño del panel de últimos movimientos.

#### Scenario: Sin línea de separación

- **WHEN** la gráfica y la tarjeta comparten su borde en desktop
- **THEN** la tarjeta no dibuja una línea superior entre ellas
- **AND** el área ámbar conserva su espacio lateral y no llega a las esquinas de la tarjeta

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

- **WHEN** se dibuja el área de la evolución del saldo
- **THEN** el trazado y el relleno dejan 8 px de espacio a cada lado del bloque de la gráfica
- **AND** el área redondea sus esquinas tanto al inicio como al final
- **AND** el mismo trazado se aplica con el mes abierto y con el mes completo
- **AND** el recorrido por puntero y teclado sigue cubriendo el cierre anterior y todos los días transcurridos

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
