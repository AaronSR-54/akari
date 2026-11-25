# Spec Delta

## Purpose

El panel desplegable de avisos reúne los pagos próximos, la actividad de las cuentas conjuntas y las liquidaciones, con el saldo disponible de cada pago, acciones directas sobre cada aviso y un indicador de novedades que se limpia al abrirlo.

## ADDED Requirements

### Requirement: Apertura y cierre del panel de avisos

El shell SHALL abrir un panel desplegable anclado al botón de avisos de la cabecera, tanto con la navegación lateral como con la cabecera superior, y SHALL difuminar el fondo de la página con el mismo desenfoque ligero que las modales. MUST cerrarlo con Escape, con la ✕ o al pulsar fuera del panel.

#### Scenario: Apertura con navegación lateral

- **WHEN** la persona pulsa «Avisos» en la cabecera de la variante sidebar
- **THEN** se despliega bajo la campana un panel titulado «Avisos» con el foco dentro y la lista o el estado vacío visibles

#### Scenario: Apertura con cabecera superior

- **WHEN** la persona pulsa «Avisos» en la variante header
- **THEN** se despliega el mismo panel de avisos sin una segunda instancia ni una segunda navegación

#### Scenario: Fondo difuminado

- **WHEN** el panel de avisos está abierto
- **THEN** el resto de la página se ve difuminado con un desenfoque ligero, sin trampa de foco

#### Scenario: Cierre del panel

- **WHEN** el panel está abierto y la persona pulsa Escape, la ✕ o fuera del panel
- **THEN** el panel se cierra y el foco vuelve al botón de avisos

### Requirement: Lista única ordenada por fecha

El panel SHALL mostrar todos los avisos en una única lista cronológica por fecha, de la más antigua a la más reciente, sin secciones por tipo, y cada fila SHALL conservar un icono o etiqueta que identifique su categoría.

#### Scenario: Orden cronológico

- **WHEN** el panel contiene pagos, actividad de cuentas y liquidaciones
- **THEN** todos aparecen en una sola lista ordenada por fecha ascendente, con las cuotas vencidas al principio

#### Scenario: Categoría visible en la lista única

- **WHEN** se muestra un aviso dentro de la lista
- **THEN** su fila indica si es un pago, actividad de cuenta conjunta o liquidación mediante icono y etiqueta

### Requirement: Avisos de pagos con cobertura de saldo

El panel SHALL listar las cuotas de planes vencidas o que vencen en los 14 días siguientes y las suscripciones de gasto con próximo cargo en ese plazo. Las cuotas pendientes o vencidas SHALL mostrarse con el fondo rojo y un icono de aviso; los próximos pagos recurrentes, con el fondo azul y un icono de reloj. Ambos SHALL mostrar concepto, importe con divisa, cuenta, fecha, estado y saldo disponible de la cuenta.

#### Scenario: Cuota vencida

- **WHEN** un plan de plazos tiene una cuota pendiente con fecha anterior a hoy
- **THEN** su aviso lleva el fondo en rojo y el icono de aviso, se etiqueta como «Vencida» y muestra el importe, la cuenta, la fecha y el saldo disponible

#### Scenario: Pago próximo cubierto

- **WHEN** el saldo de la cuenta es igual o mayor que el importe del pago
- **THEN** el aviso muestra el saldo disponible sin añadir el texto «el saldo cubre el pago»

#### Scenario: Pago próximo sin saldo suficiente

- **WHEN** el saldo de la cuenta es menor que el importe del pago
- **THEN** el aviso, con el fondo en rojo, indica cuánto dinero falta para cubrirlo

#### Scenario: Pago fuera del plazo

- **WHEN** el próximo cargo de una suscripción o cuota queda a más de 14 días
- **THEN** no aparece en el panel

#### Scenario: Orden de los pagos

- **WHEN** el panel tiene varios pagos
- **THEN** las cuotas vencidas aparecen primero y el resto se ordena por fecha ascendente

### Requirement: Acción directa sobre un aviso

Toda la fila de un aviso SHALL ser accionable, sin un botón «Pagar» separado; un aviso de pago SHALL registrar el pago correspondiente y un aviso de cuenta o liquidación SHALL abrir su destino.

#### Scenario: Pago de una suscripción

- **WHEN** la persona pulsa un aviso de suscripción pendiente
- **THEN** se registra el gasto en su cuenta, la próxima fecha avanza según la frecuencia y el aviso se actualiza o desaparece

#### Scenario: Pago de una cuota

- **WHEN** la persona pulsa un aviso de cuota de un plan de plazos
- **THEN** se registra la cuota, el plan avanza y el aviso se actualiza o desaparece

#### Scenario: Apertura del destino

- **WHEN** la persona pulsa un aviso de actividad conjunta o de liquidación
- **THEN** se cierra el panel y se abre el detalle de la cuenta o el grupo correspondiente

### Requirement: Actividad de cuentas conjuntas

El panel SHALL listar los movimientos de los últimos 7 días en cuentas conjuntas indicando autor, concepto, cuenta, fecha e importe, y SHALL expresar si el autor añadió o quitó dinero. MUST NOT listar actividad de cuentas personales o depósitos ni los movimientos cuyo autor es la persona actual.

#### Scenario: Compañero añade dinero

- **WHEN** otro miembro registra un ingreso en una cuenta conjunta dentro de los últimos 7 días
- **THEN** el aviso indica su nombre, «añadió dinero», el importe, el concepto y la cuenta

#### Scenario: Compañero quita dinero

- **WHEN** otro miembro registra un gasto en una cuenta conjunta dentro de los últimos 7 días
- **THEN** el aviso indica su nombre, «gastó dinero», el importe, el concepto y la cuenta

#### Scenario: Movimiento sin autor

- **WHEN** un movimiento antiguo de una cuenta conjunta no tiene autor registrado
- **THEN** el aviso muestra la actividad de la cuenta sin atribuirla a una persona

### Requirement: Liquidaciones pendientes y recibidas

El panel SHALL listar las liquidaciones que afectan al perfil actual en los grupos donde es miembro: las pendientes, indicando si debe pagar o cobrar y a quién, y las recibidas en los últimos 7 días.

#### Scenario: Liquidación pendiente a favor

- **WHEN** el perfil actual es acreedor en una liquidación pendiente
- **THEN** el aviso indica que otra persona le debe dinero, el importe y el grupo

#### Scenario: Liquidación pendiente en contra

- **WHEN** el perfil actual es deudor en una liquidación pendiente
- **THEN** el aviso indica a quién debe pagar, el importe y el grupo

#### Scenario: Liquidación recibida

- **WHEN** el perfil actual ha recibido una liquidación en los últimos 7 días
- **THEN** el aviso indica quién la ha pagado, el importe y el grupo

### Requirement: Indicador de avisos no vistos

La campana SHALL mostrar el número de avisos no vistos, y al abrir el panel SHALL marcar como vistos los avisos actuales y retirar el indicador; MUST volver a mostrarlo cuando aparezca un aviso nuevo.

#### Scenario: Campana con avisos nuevos

- **WHEN** hay uno o más avisos no vistos
- **THEN** la campana muestra su número y se anuncia como «Avisos, N pendientes»

#### Scenario: Limpieza al abrir

- **WHEN** se abre el panel con avisos pendientes
- **THEN** esos avisos quedan marcados como vistos y el indicador de la campana desaparece al cerrar

#### Scenario: Nueva actividad después de abrir

- **WHEN** aparece un aviso con un identificador que no se había visto
- **THEN** la campana vuelve a mostrar el indicador

#### Scenario: Campana sin avisos

- **WHEN** no hay avisos pendientes ni no vistos
- **THEN** la campana sigue visible, sin indicador y con el nombre «Avisos»

### Requirement: Estado vacío y actualización del panel

Cuando no hay avisos, el panel SHALL mostrar un estado vacío comprensible; el listado y el indicador SHALL reflejar los cambios de los datos locales sin recargar la página.

#### Scenario: Bandeja sin avisos

- **WHEN** el panel se abre sin pagos, actividad conjunta ni liquidaciones
- **THEN** muestra un mensaje de que no hay avisos y explica qué actividad aparecerá

#### Scenario: Datos en carga

- **WHEN** el panel se abre antes de que los datos locales estén listos
- **THEN** muestra un mensaje de carga y no un estado vacío prematuro

#### Scenario: Pago registrado desde el panel

- **WHEN** se paga un aviso y su próxima fecha queda fuera del plazo
- **THEN** el aviso desaparece del panel y el contador se actualiza sin recargar
