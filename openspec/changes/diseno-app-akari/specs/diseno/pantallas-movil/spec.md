# Spec Delta

## Purpose

Define los flujos y pantallas mobile-first de akari para que la experiencia completa descrita en el canvas pueda validarse antes de implementarse, incluyendo estados, casos límite y navegación.

## ADDED Requirements

### Requirement: Cobertura de flujos del canvas

El diseño móvil SHALL cubrir onboarding, cuentas, detalle de cuenta, movimientos, suscripciones, ingresos periódicos, pagos a plazos, gastos grupales, dashboard, compartición, notificaciones y ajustes de datos.

#### Scenario: Trazabilidad desde el canvas

- **WHEN** se revisa una funcionalidad del canvas de akari
- **THEN** existe al menos una pantalla o flujo móvil que la representa

#### Scenario: Flujo con entrada y salida

- **WHEN** se revisa un flujo móvil completo
- **THEN** tiene un punto de entrada identificado, los pasos intermedios y el resultado final o retorno

### Requirement: Onboarding y acceso a datos

El diseño móvil SHALL incluir creación o restauración de la base de datos local cifrada, selección de ubicación de almacenamiento, desbloqueo con contraseña y activación de sincronización para cuentas compartidas.

#### Scenario: Primera apertura

- **WHEN** la persona usuaria abre la app por primera vez
- **THEN** el flujo permite crear una base de datos, elegir su ubicación y establecer la contraseña de cifrado

#### Scenario: Desbloqueo

- **WHEN** la persona usuaria vuelve a abrir la app con una base existente
- **THEN** se le solicita la contraseña y se muestra un estado de error claro si es incorrecta

### Requirement: Cuentas personales, conjuntas y de depósito

El diseño móvil SHALL incluir alta y detalle de cuentas personales, conjuntas y de depósito, con saldo inicial obligatorio, tipo de cuenta, TAE cuando aplique, saldo total agregado y comparación entre saldo e ingresos estimados y reales.

#### Scenario: Alta de cuenta

- **WHEN** se crea una cuenta
- **THEN** el formulario exige saldo inicial, permite elegir tipo y muestra los campos condicionales del tipo seleccionado

#### Scenario: Cuenta de depósito

- **WHEN** se elige una cuenta de depósito
- **THEN** el diseño muestra el campo de TAE y la previsión de ingresos estimados

#### Scenario: Saldo agregado

- **WHEN** la persona usuaria consulta el resumen de cuentas
- **THEN** ve el saldo total de todas sus cuentas separado de los ingresos estimados

### Requirement: Movimientos, suscripciones, ingresos y plazos

El diseño móvil SHALL incluir alta, edición y detalle de movimientos, suscripciones, ingresos periódicos y pagos a plazos, mostrando en los pagos a plazos cuotas restantes, importe pagado e importe pendiente.

#### Scenario: Movimiento único o periódico

- **WHEN** se añade un movimiento
- **THEN** el diseño permite marcarlo como único o periódico y, si es periódico, definir su frecuencia

#### Scenario: Seguimiento de plazos

- **WHEN** se consulta un pago a plazos
- **THEN** se muestran cuántas cuotas quedan, lo pagado y lo pendiente

### Requirement: Gastos grupales y reparto proporcional

El diseño móvil SHALL incluir creación de grupos y gastos grupales, reparto proporcional a ingresos editable por porcentaje, proporción o cantidad fija, indicación de quién paga a quién y a qué cuenta, gastos sin cuenta asociada y conversión de divisas.

#### Scenario: Reparto editable

- **WHEN** se configura un gasto grupal proporcional
- **THEN** el diseño permite editar el porcentaje, la proporción o la cantidad fija de cada participante y muestra el total cuadrando

#### Scenario: Gasto sin cuenta

- **WHEN** se registra un gasto grupal que no pertenece a ninguna cuenta
- **THEN** el flujo permite completarlo sin seleccionar cuenta y mantiene el reparto entre participantes

#### Scenario: Conversión de divisas

- **WHEN** el gasto usa una divisa distinta a la del grupo
- **THEN** el diseño muestra importe original, tipo de cambio y equivalente antes de confirmar

### Requirement: Dashboard y preguntas rápidas

El diseño móvil SHALL incluir un dashboard tipo bento con accesos directos que responden preguntas rápidas sobre los datos, como el mayor gasto del mes o los gastos evitables.

#### Scenario: Pregunta rápida

- **WHEN** la persona usuaria pulsa un acceso directo del dashboard
- **THEN** se muestra el resultado de esa pregunta con contexto suficiente para interpretarlo

#### Scenario: Dashboard sin datos

- **WHEN** todavía no hay movimientos suficientes
- **THEN** el dashboard muestra un estado vacío informativo y una acción para empezar a registrar datos

### Requirement: Compartición de cuentas y red social

El diseño móvil SHALL incluir gestión de miembros y permisos de cuentas conjuntas, invitaciones y una red de amistades desde la que compartir cuentas.

#### Scenario: Invitación a cuenta conjunta

- **WHEN** se invita a una persona a una cuenta conjunta
- **THEN** el diseño muestra el estado pendiente y el permiso que tendrá al aceptar

#### Scenario: Red de amigos

- **WHEN** se consulta la red social
- **THEN** se distinguen amistades, invitaciones pendientes y cuentas compartidas en común

### Requirement: Notificaciones y superficies externas

El diseño móvil SHALL incluir notificaciones de próximos pagos periódicos, un acceso rápido para añadir gastos desde el panel de notificaciones y la previsualización de widgets para Android e iOS.

#### Scenario: Próximo pago

- **WHEN** se acerca el vencimiento de un pago periódico
- **THEN** el diseño muestra una notificación con importe, cuenta y acción para revisar o registrar el pago

#### Scenario: Acceso rápido

- **WHEN** la persona usuaria usa el acceso rápido desde notificaciones
- **THEN** el diseño muestra el formulario mínimo para añadir un gasto a una cuenta

### Requirement: Estados de pantalla completos

Cada pantalla móvil SHALL documentar sus estados de carga, vacío, error, sin conexión, éxito y datos parciales cuando apliquen.

#### Scenario: Estado sin conexión

- **WHEN** una pantalla depende de sincronización y no hay conexión
- **THEN** se muestra el estado sin conexión y qué acciones siguen disponibles en local

#### Scenario: Error recuperable

- **WHEN** una operación falla
- **THEN** la pantalla muestra el error y una acción para reintentar sin perder los datos introducidos

### Requirement: Navegación y ergonomía móvil

El diseño móvil SHALL definir la navegación principal, el comportamiento de volver, los accesos desde notificaciones y las reglas de safe area, alcance con una mano y objetivos táctiles.

#### Scenario: Navegación principal

- **WHEN** se revisa la estructura móvil
- **THEN** las secciones principales son accesibles desde la navegación persistente y cada flujo indica cómo se vuelve

#### Scenario: Área segura

- **WHEN** se revisa una pantalla en dispositivos con notch o barra inferior
- **THEN** el contenido respeta las áreas seguras y los controles principales quedan al alcance del pulgar

### Requirement: Prototipo navegable móvil

Los flujos clave SHALL estar conectados en un prototipo navegable que permita recorrerlos sin intervención de diseño.

#### Scenario: Recorrido de flujo clave

- **WHEN** se abre el prototipo móvil
- **THEN** se puede completar al menos alta de cuenta, registro de movimiento, gasto grupal y consulta de dashboard
