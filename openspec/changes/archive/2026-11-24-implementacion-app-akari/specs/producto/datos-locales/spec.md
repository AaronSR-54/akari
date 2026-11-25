# Spec Delta

## Purpose

Define el almacenamiento local-first de akari para que cuentas, movimientos y grupos persistan en el dispositivo, sobrevivan a recargas y migraciones, y sigan disponibles sin conexión.

## ADDED Requirements

### Requirement: Inicialización del espacio de datos

En la primera apertura, la aplicación SHALL crear un espacio de datos local y SHALL dejar la aplicación lista para usarse sin depender de servicios remotos.

#### Scenario: Primera apertura

- **WHEN** la persona abre la aplicación sin datos guardados
- **THEN** se crea el espacio local y se ofrece empezar vacío o cargar datos de ejemplo

#### Scenario: Aperturas posteriores

- **WHEN** la persona vuelve a abrir la aplicación con datos existentes
- **THEN** se cargan sus cuentas, movimientos y grupos sin volver a preguntar por la inicialización

### Requirement: Persistencia local-first

La aplicación SHALL guardar los datos en el almacenamiento local del navegador y SHALL mantenerlos disponibles tras recargar, cerrar o quedarse sin conexión.

#### Scenario: Recarga de la página

- **WHEN** se recarga la aplicación después de guardar un movimiento
- **THEN** el movimiento y el saldo actualizado siguen presentes

#### Scenario: Uso sin conexión

- **WHEN** el dispositivo no tiene conexión a internet
- **THEN** la aplicación permite consultar y editar datos locales y no bloquea la navegación

### Requirement: Integridad del modelo de datos

La aplicación SHALL validar importes, referencias entre entidades y estados antes de guardar, y MUST NOT dejar movimientos o gastos apuntando a entidades inexistentes.

#### Scenario: Borrado de una cuenta con movimientos

- **WHEN** se intenta eliminar una cuenta que tiene movimientos asociados
- **THEN** se solicita confirmación y se explica qué ocurre con esos movimientos antes de completar el borrado

#### Scenario: Importe inválido

- **WHEN** un importe llega vacío, no numérico o con más precisión de la permitida por su divisa
- **THEN** la operación se rechaza y se muestra un error comprensible sin modificar los datos existentes

#### Scenario: Referencia inexistente

- **WHEN** se intenta guardar un movimiento con una cuenta o grupo que ya no existe
- **THEN** la operación se rechaza y no se crea un registro huérfano

### Requirement: Migraciones y versionado

El almacenamiento SHALL declarar una versión de esquema y SHALL aplicar migraciones ordenadas que preserven los datos existentes.

#### Scenario: Actualización de la aplicación

- **WHEN** una nueva versión requiere un esquema distinto
- **THEN** la aplicación migra los datos existentes antes de mostrarlos y registra la versión aplicada

#### Scenario: Migración fallida

- **WHEN** una migración no se puede completar
- **THEN** la aplicación no descarta los datos, muestra un estado de error recuperable y no continúa como si hubiera migrado

### Requirement: Datos de ejemplo y reinicio

La aplicación SHALL permitir cargar datos de ejemplo y reiniciar el espacio local con confirmación explícita.

#### Scenario: Carga de ejemplo

- **WHEN** se eligen datos de ejemplo en la primera apertura o desde ajustes
- **THEN** se crean cuentas, movimientos y grupos coherentes que permiten recorrer los flujos core

#### Scenario: Reinicio del espacio

- **WHEN** se confirma el reinicio de los datos locales
- **THEN** se elimina el contenido anterior y la aplicación vuelve al estado de primera apertura

### Requirement: Copia local exportable

La aplicación SHALL permitir exportar e importar una copia de los datos locales en un formato legible, y SHALL advertir de que la copia no está cifrada en esta fase.

#### Scenario: Exportación

- **WHEN** se exporta una copia
- **THEN** se descarga un archivo con cuentas, movimientos y grupos, identificado con la versión del esquema y una advertencia de que no está cifrado

#### Scenario: Importación validada

- **WHEN** se importa una copia con un esquema incompatible o un contenido inválido
- **THEN** la importación se rechaza sin alterar los datos actuales y se explica el motivo

### Requirement: Errores de almacenamiento

La aplicación SHALL detectar y comunicar los fallos de almacenamiento —cuota agotada, modo privado o almacenamiento no disponible— sin perder silenciosamente los datos ya guardados.

#### Scenario: Cuota agotada

- **WHEN** el navegador rechaza una escritura por falta de espacio
- **THEN** se muestra un error con la acción de liberar espacio o exportar una copia, y los datos previos siguen accesibles

#### Scenario: Almacenamiento no disponible

- **WHEN** el navegador no permite el almacenamiento local
- **THEN** la aplicación explica la limitación y no simula que los cambios se han guardado
