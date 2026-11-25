# Spec Delta

## Purpose

Define la estructura de navegación y el comportamiento responsive de la aplicación web de akari para que todas las pantallas compartan shell, contexto de ubicación y patrones de interacción consistentes.

## ADDED Requirements

### Requirement: Navegación principal de escritorio

La aplicación web SHALL ofrecer una navegación principal persistente en escritorio con los destinos Resumen, Movimientos, Grupos y Ajustes, y SHALL indicar el destino activo.

#### Scenario: Destino activo

- **WHEN** la persona navega a cualquier sección principal
- **THEN** el shell marca esa sección como activa de forma textual y visual, no solo por color

#### Scenario: Sidebar compacta y expandida

- **WHEN** la ventana está en escritorio
- **THEN** la sidebar arranca compacta, se expande con hover o con el control dedicado y se colapsa al salir o al usar el control

#### Scenario: Navegación exclusiva

- **WHEN** se muestra la sidebar
- **THEN** no se muestra simultáneamente el header superior alternativo como segunda navegación principal

### Requirement: Header superior alternativo

La aplicación web SHALL ofrecer una variante de shell con header superior transparente y navegación centrada, utilizable como alternativa a la sidebar sin duplicar pantallas.

#### Scenario: Cambio de shell

- **WHEN** se activa el shell con header superior
- **THEN** las mismas pantallas y rutas siguen funcionando y solo el destino activo aparece resaltado

### Requirement: Comportamiento responsive

La aplicación web SHALL reorganizar navegación y contenido según breakpoints de escritorio, tablet y móvil sin perder funcionalidad ni contenido.

#### Scenario: Tablet

- **WHEN** el ancho de la ventana está entre los breakpoints de tablet
- **THEN** la navegación lateral se sustituye por la barra superior y el contenido pasa a dos columnas o tabla con desplazamiento

#### Scenario: Móvil web

- **WHEN** el ancho es menor que el breakpoint móvil
- **THEN** la navegación pasa a barra inferior, el contenido a una columna y los controles mantienen objetivos táctiles de 44 px

#### Scenario: Sin desbordamiento

- **WHEN** se reduce el ancho de la ventana hasta el mínimo soportado
- **THEN** no aparece desplazamiento horizontal de página y el contenido sigue siendo legible

### Requirement: Rutas, deep links y contexto

Cada pantalla principal SHALL tener una ruta estable y un título de página único, y SHALL conservar el contexto de navegación al abrir enlaces directos.

#### Scenario: Enlace directo a una cuenta

- **WHEN** se abre la URL de una cuenta o un gasto grupal
- **THEN** la aplicación carga ese recurso, marca la sección correspondiente y permite volver a su listado

#### Scenario: Ruta inexistente

- **WHEN** se abre una ruta que no existe
- **THEN** se muestra un estado de página no encontrada con una acción para volver al resumen

### Requirement: Atajos de teclado

La aplicación web SHALL soportar atajos para buscar, cerrar overlays y navegar con foco visible, documentados en la propia interfaz.

#### Scenario: Búsqueda rápida

- **WHEN** la persona pulsa el atajo de búsqueda
- **THEN** el foco pasa al buscador global y el resto de la pantalla conserva su estado

#### Scenario: Cierre con Escape

- **WHEN** hay un overlay abierto y se pulsa Escape
- **THEN** el overlay se cierra y el foco vuelve al control de origen

### Requirement: Estados de página del shell

El shell SHALL mostrar estados de carga, vacío, error y datos insuficientes sin romper la navegación disponible.

#### Scenario: Error de una sección

- **WHEN** una sección no puede cargar sus datos
- **THEN** muestra un mensaje comprensible, una acción de reintento y mantiene la navegación principal operativa

#### Scenario: Carga inicial

- **WHEN** una vista está cargando
- **THEN** muestra un esqueleto con la forma del contenido final y no un indicador genérico de pantalla completa
