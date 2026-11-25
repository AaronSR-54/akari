# producto/dashboard-hero Specification

## Purpose
Define la presentación editorial del resumen: el saldo total sobre el lienzo, la evolución del saldo del mes fuera de cualquier tarjeta y, debajo, la tarjeta con el balance del mes y el saldo total estimado, junto al detalle de cada día a partir del saldo de apertura.

## Requirements

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

### Requirement: Tarjeta del balance del mes

El dashboard SHALL mostrar «Balance del mes» en una tarjeta justo debajo de la gráfica, alineada con ella y con su misma anchura, con el neto del mes firmado y coloreado y, como única línea de pie, el saldo total estimado a fin de mes.

#### Scenario: Tarjeta de balance

- **WHEN** el mes tiene ingresos o gastos
- **THEN** la tarjeta muestra el balance neto con signo
- **AND** queda debajo de la gráfica, compartiendo su columna y su anchura

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

### Requirement: Demo reproducible

La demo SHALL usar una fecha fija y un histórico de varios meses para que el saldo, el progreso y la proyección se vean siempre iguales.

#### Scenario: Demo con historial

- **WHEN** se cargan los datos de ejemplo con la fecha fija del mock
- **THEN** la demo incluye movimientos del mes en curso y de al menos dos meses anteriores
- **AND** la gráfica muestra el saldo desde el cierre del mes anterior y la tarjeta el mismo saldo total estimado entre sesiones y recargas

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

### Requirement: Entrada animada del hero

El bloque de la gráfica SHALL animar su entrada sin desplazar el contenido y SHALL respetar `prefers-reduced-motion`.

#### Scenario: Entrada animada

- **WHEN** el dashboard aparece por primera vez tras cargar los datos
- **THEN** la gráfica se asienta en su posición sin saltos de layout
- **AND** el espacio del hero ya está reservado durante la animación

#### Scenario: Movimiento reducido

- **WHEN** el sistema operativo indica `prefers-reduced-motion: reduce`
- **THEN** la gráfica aparece directamente en su estado final
- **AND** la interacción con la línea de días se mantiene

#### Scenario: Refresco de datos

- **WHEN** los datos locales cambian y la vista se actualiza sin remontar el dashboard
- **THEN** la gráfica actualiza sus valores sin repetir la animación de entrada

### Requirement: Hero sin datos disponibles

El hero SHALL mostrar un estado informativo cuando no hay cuentas activas y MUST NOT presentar cifras de saldo o gasto cuando no existen datos.

#### Scenario: Sin cuentas

- **WHEN** el dashboard se abre sin cuentas activas
- **THEN** el hero se sustituye por el estado vacío existente con la acción de añadir una cuenta
- **AND** no se renderiza una gráfica con valores inventados

### Requirement: Panel único de cuentas

El resumen SHALL presentar todas las cuentas en un único panel a todo el ancho, con el encabezado «Cuentas» dentro de la tarjeta y bloques distinguidos por fondo hundido, sin tabla ni líneas divisorias, manteniendo íntegro el bento superior.

#### Scenario: Panel único responsive

- **WHEN** se abre el dashboard con al menos una cuenta
- **THEN** todas las cuentas aparecen como bloques dentro de una sola superficie que ocupa todo el ancho del contenido, directamente debajo de los accesos rápidos
- **AND** la tarjeta del panel muestra en su interior un encabezado «Cuentas» con un enlace «Gestionar cuentas» que lleva a `/cuentas/nueva`
- **AND** en escritorio los bloques se reparten lado a lado, sin tabla ni líneas divisorias, y se distinguen por un fondo de superficie hundida con esquinas redondeadas y espaciado entre ellos
- **AND** en móvil los bloques se apilan unos sobre otros
- **AND** el saldo, la gráfica del mes, los últimos movimientos, el balance del mes y los accesos rápidos conservan su composición y comportamiento anteriores

#### Scenario: Escalado de 0 a N cuentas

- **WHEN** el número de cuentas cambia entre ninguna, una y muchas
- **THEN** con ninguna cuenta no se renderiza el panel de cuentas y se muestra el estado vacío existente
- **AND** con una o muchas cuentas el panel acomoda los bloques en columnas y pasa a siguientes líneas cuando hace falta, sin desbordar el ancho del contenido ni introducir scroll propio
- **AND** los nombres largos de cuenta se truncan sin desplazar a los demás bloques

#### Scenario: Accesos a cuentas conservados

- **WHEN** se revisan los accesos del resumen
- **THEN** el pill «Nueva cuenta» y el enlace «Gestionar cuentas» del encabezado siguen llevando a `/cuentas/nueva`
- **AND** cada bloque del panel sigue llevando al detalle de su cuenta

#### Scenario: Agrupación accesible

- **WHEN** una persona usa un lector de pantalla en el resumen
- **THEN** las cuentas siguen formando un grupo con un nombre accesible
- **AND** el encabezado «Cuentas» nombra la sección y el enlace «Gestionar cuentas» es él mismo un enlace independiente de los bloques
