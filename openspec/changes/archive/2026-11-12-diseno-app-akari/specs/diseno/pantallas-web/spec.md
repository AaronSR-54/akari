# Spec Delta

## Purpose

Define la adaptación responsive de akari para web, reutilizando el design system y la lógica de los flujos móviles, y aprovechando el espacio de pantalla para vistas de mayor densidad.

## ADDED Requirements

### Requirement: Reutilización del design system

Las pantallas web SHALL usar las mismas variables y componentes publicados que móvil y MUST NOT crear variantes duplicadas, estilos locales ni valores hardcodeados.

#### Scenario: Componente compartido

- **WHEN** una pantalla web necesita un botón, campo o tarjeta de cuenta
- **THEN** usa el mismo componente del design system que la versión móvil

#### Scenario: Sin estilos locales

- **WHEN** se inspecciona una pantalla web
- **THEN** todos sus colores, textos y espaciados provienen de variables o estilos publicados

### Requirement: Layouts responsive

El diseño web SHALL definir breakpoints y layouts para móvil, tablet y escritorio, incluyendo navegación lateral en escritorio, contenido en una o varias columnas y tablas adaptadas.

#### Scenario: Escritorio

- **WHEN** se abre una pantalla en escritorio
- **THEN** la navegación principal es persistente y el contenido aprovecha el ancho disponible sin estirarse en exceso

#### Scenario: Tablet y móvil web

- **WHEN** se reduce el ancho de la ventana
- **THEN** la navegación y las columnas se reorganizan según los breakpoints definidos sin perder contenido

### Requirement: Paridad funcional con móvil

Cada flujo móvil SHALL tener equivalente web, salvo las superficies exclusivamente nativas como widgets y accesos rápidos del panel de notificaciones, que MUST documentarse como tales. Los flujos de alta de cuenta y registro de movimiento se reutilizan desde `M06` y `M09` en el shell web y MUST NOT duplicarse como frames W.

#### Scenario: Flujo con paridad

- **WHEN** se compara un flujo de cuentas, movimientos o gastos grupales entre móvil y web
- **THEN** la web permite completar las mismas acciones y ver la misma información

#### Scenario: Reutilización documentada

- **WHEN** un flujo móvil no tiene frame web propio
- **THEN** la matriz de cobertura indica qué pantalla móvil se reutiliza en el shell web y no se dibuja un duplicado

#### Scenario: Función exclusiva de móvil

- **WHEN** una función solo existe en la app nativa
- **THEN** el diseño web documenta su ausencia y, si aplica, una alternativa en navegador

### Requirement: Navegación y atajos de web

El diseño web SHALL definir navegación principal, migas o contexto de sección, enlaces profundos y atajos de teclado para las acciones frecuentes.

#### Scenario: Enlace profundo

- **WHEN** se abre un enlace directo a una cuenta o gasto grupal
- **THEN** la pantalla carga el contexto correcto y muestra dónde está dentro de la navegación

#### Scenario: Atajo de teclado

- **WHEN** se usa un atajo definido para una acción frecuente
- **THEN** el diseño documenta la combinación y el feedback visual correspondiente

### Requirement: Vistas de alta densidad

El diseño web SHALL incluir vistas de alta densidad para resumen de cuentas, detalle de gastos grupales, movimientos y dashboard, con filtros, ordenación y acciones masivas cuando aporten valor.

#### Scenario: Resumen multi-cuenta

- **WHEN** se consulta el resumen de cuentas en escritorio
- **THEN** se ven saldos, tipo de cuenta y evolución en una vista comparativa sin abrir cada cuenta

#### Scenario: Reparto de gasto grupal

- **WHEN** se revisa un gasto grupal en escritorio
- **THEN** se ve el reparto por participante, quién debe pagar y a qué cuenta en una sola vista

### Requirement: Accesibilidad y estados en web

Las pantallas web SHALL documentar navegación por teclado, foco visible, contraste, jerarquía de encabezados y estados de carga, vacío, error y sin conexión.

#### Scenario: Navegación por teclado

- **WHEN** se recorre una pantalla web solo con teclado
- **THEN** el orden de foco es lógico y todas las acciones son alcanzables

#### Scenario: Estado de error

- **WHEN** una vista web no puede cargar datos
- **THEN** muestra un error comprensible con acción de reintento y conserva la navegación disponible

### Requirement: Documentación de diferencias

El diseño web SHALL documentar explícitamente las diferencias de layout, navegación, densidad y capacidades respecto a móvil.

#### Scenario: Revisión de una pantalla

- **WHEN** se revisa una pantalla web frente a su equivalente móvil
- **THEN** existe una nota que explica qué cambia y por qué

### Requirement: Prototipo navegable web

Los flujos clave SHALL estar conectados en un prototipo web navegable que cubra al menos alta de cuenta, registro de movimiento, gasto grupal y dashboard.

#### Scenario: Recorrido web

- **WHEN** se abre el prototipo web
- **THEN** se pueden completar los flujos clave en resolución de escritorio y en una resolución responsive
