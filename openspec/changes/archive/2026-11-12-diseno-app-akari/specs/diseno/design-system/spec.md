# Spec Delta

## Purpose

Define el lenguaje visual y la librería de componentes reutilizables de akari para que móvil y web compartan tokens, estados y reglas de uso, evitando valores hardcodeados y duplicación de UI.

## ADDED Requirements

### Requirement: Tokens visuales como variables

El design system SHALL definir color, tipografía, espaciado, radios, elevación, iconografía y duración de movimiento como variables y estilos de Figma, sin valores hardcodeados en componentes ni pantallas.

#### Scenario: Componente usa variables

- **WHEN** se inspecciona cualquier componente publicado del design system
- **THEN** sus rellenos, textos, espaciados y radios referencian variables o estilos, no valores literales

#### Scenario: Cambio global de token

- **WHEN** se modifica el valor de una variable de token
- **THEN** todos los componentes y pantallas que la consumen reflejan el cambio sin edición manual

### Requirement: Temas claro y oscuro

Todos los tokens de color SHALL tener valor para tema claro y oscuro, con nombres semánticos (por ejemplo, superficie, texto principal, borde, peligro) y contraste mínimo AA en texto y controles.

#### Scenario: Cambio de modo

- **WHEN** se cambia el modo de color de una pantalla de claro a oscuro
- **THEN** la pantalla se adapta usando únicamente variables y mantiene contraste legible

#### Scenario: Verificación de contraste

- **WHEN** se revisa un par texto/fondo de cualquier pantalla
- **THEN** cumple contraste AA para su tamaño y estado

### Requirement: Escala tipográfica

El design system SHALL definir una escala tipográfica con familia, tamaños, pesos, alturas de línea y usos asignados, y las pantallas SHALL usar estilos de texto publicados en lugar de tamaños sueltos.

#### Scenario: Jerarquía consistente

- **WHEN** se comparan títulos, cuerpos, etiquetas y datos numéricos entre pantallas
- **THEN** todos usan estilos de la escala y respetan la jerarquía definida

### Requirement: Librería de componentes con variantes

El design system SHALL incluir componentes de Figma para navegación, botones, campos, listas, tarjetas de cuenta, movimientos, gráficos, modales y hojas, feedback y estados vacíos, con variantes de tamaño, jerarquía y estado.

#### Scenario: Componente reutilizado

- **WHEN** una pantalla necesita un botón, campo o tarjeta
- **THEN** usa una instancia de un componente publicado y no una copia dibujada desde cero

#### Scenario: Variantes cubiertas

- **WHEN** se revisa un componente interactivo
- **THEN** existen variantes para sus tamaños y estados aplicables: default, hover, focus, pressed, disabled, loading y error

### Requirement: Accesibilidad de componentes

Los componentes interactivos SHALL definir foco visible, etiquetas accesibles, tamaño mínimo de objetivo táctil de 44×44 px en móvil y alternativas textuales para iconos con significado.

#### Scenario: Objetivo táctil

- **WHEN** se mide cualquier control interactivo en una pantalla móvil
- **THEN** su área táctil es de al menos 44×44 px

#### Scenario: Foco visible

- **WHEN** un control recibe foco por teclado en web
- **THEN** muestra un indicador de foco visible y distinguible del estado hover

### Requirement: Documentación de uso

Cada componente publicado SHALL incluir descripción, cuándo usarlo, cuándo no, variantes disponibles y estados, visible desde las propiedades del componente en Figma.

#### Scenario: Consulta de un componente

- **WHEN** una persona de implementación abre un componente en Figma
- **THEN** encuentra su propósito, variantes y reglas de uso sin depender de conversaciones externas

### Requirement: Iconografía y visualización de datos

El design system SHALL definir un set de iconos coherente en trazo y tamaños tokenizados, y una paleta semántica para gráficos que funcione en tema claro y oscuro sin depender solo del color.

#### Scenario: Icono consistente

- **WHEN** se comparan iconos de la misma familia en distintas pantallas
- **THEN** comparten trazo, proporción y tamaños de la escala

#### Scenario: Gráfico accesible

- **WHEN** se revisa un gráfico en tema claro y oscuro
- **THEN** sus series se distinguen por color y por un segundo canal, como patrón, etiqueta o forma
