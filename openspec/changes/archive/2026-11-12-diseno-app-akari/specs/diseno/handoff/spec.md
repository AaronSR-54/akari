# Spec Delta

## Purpose

Define cómo se organiza, documenta y entrega el design file de akari para que el diseño sea trazable, revisable y directamente consumible por la implementación.

## ADDED Requirements

### Requirement: Organización del archivo

El design file SHALL organizarse en tres páginas —`00-Portada`, `01-Diseño` y `02-Pantallas`— y usar secciones internas para fundamentos, componentes, prototipos, móvil, web y archivo, manteniendo cada bloque acotado a su propósito.

#### Scenario: Navegación del archivo

- **WHEN** una persona abre el design file
- **THEN** encuentra la portada, la página de diseño con fundamentos, componentes y prototipos, y la página de pantallas con móvil, web y archivo claramente separadas

#### Scenario: Contenido fuera de lugar

- **WHEN** se revisa una página o sección del archivo
- **THEN** no contiene pantallas ni componentes que pertenezcan a otra página o sección

### Requirement: Convención de nombres

El archivo SHALL aplicar una convención única: componentes en PascalCase, tokens en kebab-case y frames de pantalla con el patrón `[Plataforma]/[Flujo]/[Pantalla]`, sin nombres genéricos como "Frame 123".

#### Scenario: Nombres de pantalla

- **WHEN** se revisa cualquier frame de pantalla
- **THEN** su nombre identifica plataforma, flujo y pantalla

#### Scenario: Nombres de componente

- **WHEN** se revisa cualquier componente publicado
- **THEN** su nombre es único, descriptivo y sigue la convención del archivo

### Requirement: Anotaciones de comportamiento

Cada pantalla interactiva SHALL incluir anotaciones con disparadores, navegación, validaciones, estados no visibles, origen de datos y reglas de negocio relevantes.

#### Scenario: Pantalla con formulario

- **WHEN** se revisa una pantalla con formulario
- **THEN** las notas indican campos obligatorios, validaciones, mensajes de error y qué ocurre al guardar

#### Scenario: Estado no visible

- **WHEN** una pantalla tiene estados que no se muestran en el frame principal
- **THEN** las notas indican dónde encontrarlos y cuándo aparecen

### Requirement: Trazabilidad requisito-pantalla

El handoff SHALL incluir una matriz que relacione cada funcionalidad del canvas con las pantallas móvil y web que la cubren, y con los estados diseñados.

#### Scenario: Funcionalidad sin pantalla

- **WHEN** se revisa la matriz de cobertura
- **THEN** toda funcionalidad del canvas tiene al menos una pantalla asociada o una justificación explícita de exclusión

#### Scenario: Pantalla sin requisito

- **WHEN** se revisa una pantalla del archivo
- **THEN** se puede rastrear al requisito o funcionalidad que la justifica

### Requirement: Prototipo y enlaces de flujo

El handoff SHALL enlazar el prototipo de cada flujo clave desde la portada o la matriz de cobertura, indicando su estado de revisión.

#### Scenario: Acceso al prototipo

- **WHEN** se abre la portada del archivo
- **THEN** hay enlaces directos a los prototipos móvil y web de los flujos clave

### Requirement: Preparación para desarrollo

Los componentes y pantallas SHALL estar listos para Dev Mode: variables vinculadas, sin estilos ni componentes separados (detached), iconos y assets exportables, y sin texto ni medidas que deban interpretarse a ojo.

#### Scenario: Inspección en Dev Mode

- **WHEN** una persona de implementación inspecciona una pantalla
- **THEN** obtiene tokens, medidas y assets sin ambigüedad

#### Scenario: Componente separado

- **WHEN** se audita el archivo
- **THEN** no quedan instancias separadas de componentes publicados sin justificación

### Requirement: Estado de revisión y versionado

El handoff SHALL marcar cada flujo como borrador, en revisión o aprobado, y mantener un registro de cambios con fecha y alcance de cada iteración.

#### Scenario: Flujo aprobado

- **WHEN** un flujo se marca como aprobado
- **THEN** existe evidencia de revisión y su versión queda registrada en el changelog

#### Scenario: Cambio posterior

- **WHEN** se modifica un flujo aprobado
- **THEN** se añade una entrada al changelog y se actualiza su estado
