# Spec Delta

## ADDED Requirements

### Requirement: Tarjeta de próximas cuotas en el resumen

El dashboard SHALL mostrar bajo el panel de Cuentas una tarjeta «Próximas cuotas» con los planes de plazos activos en una lista vertical de filas enlazadas a su detalle, ordenadas por cuotas vencidas y fecha de próximo vencimiento, con progreso, cuotas e importe pendientes e importe y fecha de la próxima cuota. La tarjeta MUST NOT renderizarse sin planes activos.

#### Scenario: Planes activos bajo Cuentas

- **WHEN** el dashboard tiene al menos un plan de plazos con cuotas pendientes
- **THEN** aparece una tarjeta «Próximas cuotas» directamente debajo del panel de Cuentas
- **AND** cada plan ocupa una fila de la misma tarjeta, una debajo de otra, separadas solo por espacio y sin líneas ni cajas independientes
- **AND** cada fila muestra su concepto, el progreso «x de y», las cuotas pendientes, el importe pendiente y el importe y la fecha de la próxima cuota
- **AND** la tarjeta ocupa el mismo ancho que el panel de Cuentas

#### Scenario: Progreso del plan

- **WHEN** un plan tiene cuotas pagadas sobre el total
- **THEN** la tarjeta muestra una barra de progreso con el tramo completado
- **AND** el texto indica cuántas cuotas quedan y qué importe falta por pagar

#### Scenario: Orden de los planes

- **WHEN** hay varios planes activos
- **THEN** los que tienen una cuota vencida aparecen primero
- **AND** el resto se ordena por fecha de próximo vencimiento ascendente

#### Scenario: Cuota vencida

- **WHEN** la próxima cuota de un plan tiene fecha anterior a hoy
- **THEN** el plan se marca como atrasado con texto y color de aviso
- **AND** la barra de progreso usa el color de peligro

#### Scenario: Fila con hover y enlace al detalle

- **WHEN** la persona pasa el puntero sobre una fila de plan
- **THEN** la fila muestra un fondo de hover coherente con el resto del dashboard
- **AND** la fila es un enlace accesible que abre `/cuotas/<id>`
- **AND** el foco por teclado muestra el mismo estado visual y conserva el anillo de foco

#### Scenario: Sin acción de registro en el resumen

- **WHEN** se revisa la tarjeta «Próximas cuotas»
- **THEN** las filas son informativas y no incluyen un botón para registrar la cuota
- **AND** el registro de cuotas sigue disponible en el detalle de la cuenta, junto al plan
- **AND** el resumen no crea movimientos por sí solo

#### Scenario: Sin planes activos

- **WHEN** no hay ningún plan con cuotas pendientes
- **THEN** la tarjeta «Próximas cuotas» no se renderiza
- **AND** no se muestra una barra de progreso vacía ni cifras inventadas

#### Scenario: Varias divisas

- **WHEN** los planes activos usan divisas distintas
- **THEN** cada importe se muestra en la divisa de su plan
- **AND** la tarjeta no convierte importes entre divisas

## MODIFIED Requirements

### Requirement: Hero del resumen sin contenedor

El dashboard SHALL presentar el saldo total y la evolución del saldo del mes sobre el lienzo, sin borde, fondo, sombra ni tarjeta, y SHALL componer el hero con saldo, gráfica, últimos movimientos, balance del mes y accesos rápidos, manteniendo Cuentas y Próximas cuotas por debajo del hero.

#### Scenario: Hero sin caja

- **WHEN** se abre el dashboard con al menos una cuenta
- **THEN** el saldo total y la gráfica del saldo del mes aparecen sobre el lienzo sin contenedor propio
- **AND** el hero muestra en la columna izquierda saldo y últimos movimientos, y en la derecha gráfica, balance del mes y accesos rápidos
- **AND** las secciones de cuentas y próximas cuotas siguen visibles debajo del hero

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

El dashboard MUST NOT mostrar el gráfico semanal de movimientos ni duplicar el balance del mes o las cuotas en el hero, y SHALL conservar el acceso a «Preguntas rápidas» en el panel de accesos rápidos.

#### Scenario: Un único balance del mes

- **WHEN** se revisa el dashboard completo
- **THEN** el balance del mes solo aparece en la tarjeta del hero, bajo la gráfica
- **AND** no hay un gráfico semanal ni una segunda tarjeta con el balance o el gasto mensual

#### Scenario: Cuota sin duplicar

- **WHEN** existe un plan de plazos con cuotas pendientes
- **THEN** su información aparece una sola vez, en la tarjeta «Próximas cuotas» debajo de Cuentas
- **AND** el hero no muestra tarjeta ni banner duplicado de la cuota
- **AND** el aviso de próximo pago recurrente no repite la información de los planes de plazos

#### Scenario: Acceso conservado

- **WHEN** la persona busca las preguntas rápidas desde el resumen
- **THEN** encuentra un acceso visible dentro del panel de accesos rápidos que lleva a `/preguntas`
- **AND** el panel de últimos movimientos conserva el enlace «Ver todos» hacia `/movimientos`
- **AND** no hay un segundo enlace a preguntas rápidas en el panel de últimos movimientos

### Requirement: Panel único de cuentas

El resumen SHALL presentar todas las cuentas en un único panel a todo el ancho, con un encabezado que empieza por «Cuentas» dentro de la tarjeta y bloques distinguidos por fondo hundido, sin tabla ni líneas divisorias, manteniendo íntegro el bento superior. El encabezado SHALL incluir el número de cuentas del dispositivo.

#### Scenario: Panel único responsive

- **WHEN** se abre el dashboard con al menos una cuenta
- **THEN** todas las cuentas aparecen como bloques dentro de una sola superficie que ocupa todo el ancho del contenido, directamente debajo de los accesos rápidos
- **AND** la tarjeta del panel muestra en su interior un encabezado «Cuentas · N cuentas en este dispositivo» con un enlace «Gestionar cuentas» que lleva a `/cuentas/nueva`
- **AND** en escritorio los bloques se reparten lado a lado, sin tabla ni líneas divisorias, y se distinguen por un fondo de superficie hundida con esquinas redondeadas y espaciado entre ellos
- **AND** en móvil los bloques se apilan unos sobre otros
- **AND** el saldo, la gráfica del mes, los últimos movimientos, el balance del mes y los accesos rápidos conservan su composición y comportamiento anteriores
- **AND** la tarjeta de próximas cuotas queda debajo de este panel

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
- **AND** el encabezado «Cuentas · N cuentas en este dispositivo» nombra la sección y el enlace «Gestionar cuentas» es él mismo un enlace independiente de los bloques
