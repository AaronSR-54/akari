# Producto · Datos Locales Specification

## Purpose

Define el almacenamiento local-first de akari para que cuentas, movimientos y grupos persistan en el dispositivo, sobrevivan a recargas y migraciones, y sigan disponibles sin conexión.

## Requirements

### Requirement: Inicialización del espacio de datos

En la primera apertura, la aplicación SHALL crear un espacio de datos local y SHALL guiar a la persona con un asistente visual para configurar su nombre, divisa, día de ingreso opcional y banco. La conexión con una cuenta en la nube MUST ser opcional; la primera cuenta y el primer movimiento se guían después dentro de la app.

#### Scenario: Primera apertura

- **WHEN** la persona abre la aplicación sin datos guardados
- **THEN** se crea el espacio local y se muestra el asistente con los pasos de nombre, divisa, día de ingreso opcional, bancos y nube

#### Scenario: Omitir el asistente

- **WHEN** la persona pulsa «Omitir el asistente»
- **THEN** el onboarding se completa con los valores por defecto y la aplicación abre el resumen sin bloquear el uso

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

La aplicación SHALL permitir cargar datos de ejemplo y reiniciar el espacio local con confirmación explícita. Mientras haya una cuenta conectada, estas operaciones MUST estar deshabilitadas para no sustituir los datos remotos.

#### Scenario: Carga de ejemplo

- **WHEN** se eligen datos de ejemplo en la primera apertura o desde ajustes sin cuenta conectada
- **THEN** se crean cuentas, movimientos y grupos coherentes que permiten recorrer los flujos core

#### Scenario: Reinicio del espacio

- **WHEN** se confirma el reinicio de los datos locales sin cuenta conectada
- **THEN** se elimina el contenido anterior y la aplicación vuelve al estado de primera apertura

#### Scenario: Cuenta conectada

- **WHEN** se intenta cargar datos de ejemplo o reiniciar el espacio con una cuenta conectada
- **THEN** la acción está deshabilitada y se explica que hay que desconectar la cuenta primero

### Requirement: Copia local exportable

La aplicación SHALL permitir exportar e importar una copia de los datos locales en un formato legible, y SHALL advertir de que la copia no está cifrada en esta fase. Mientras haya una cuenta conectada, la importación MUST estar deshabilitada.

#### Scenario: Exportación

- **WHEN** se exporta una copia
- **THEN** se descarga un archivo con cuentas, movimientos y grupos, identificado con la versión del esquema y una advertencia de que no está cifrado

#### Scenario: Importación validada

- **WHEN** se importa una copia con un esquema incompatible o un contenido inválido sin cuenta conectada
- **THEN** la importación se rechaza sin alterar los datos actuales y se explica el motivo

#### Scenario: Importación con cuenta conectada

- **WHEN** se intenta importar una copia con una cuenta conectada
- **THEN** la acción está deshabilitada y se explica que hay que desconectar la cuenta primero

### Requirement: Errores de almacenamiento

La aplicación SHALL detectar y comunicar los fallos de almacenamiento —cuota agotada, modo privado o almacenamiento no disponible— sin perder silenciosamente los datos ya guardados.

#### Scenario: Cuota agotada

- **WHEN** el navegador rechaza una escritura por falta de espacio
- **THEN** se muestra un error con la acción de liberar espacio o exportar una copia, y los datos previos siguen accesibles

#### Scenario: Almacenamiento no disponible

- **WHEN** el navegador no permite el almacenamiento local
- **THEN** la aplicación explica la limitación y no simula que los cambios se han guardado

### Requirement: Nombre del perfil persistente

La aplicación SHALL guardar el nombre editable, la divisa principal y el día de ingreso del perfil en los ajustes locales y SHALL reutilizarlos tras recargar. Sin cuenta conectada, esos datos MUST NOT enviarse a ningún servidor. Con cuenta conectada, SHALL sincronizarse con el perfil remoto.

#### Scenario: Guardado y persistencia

- **WHEN** se guardan un nombre, una divisa y un día de ingreso válidos desde el asistente o desde Ajustes
- **THEN** los valores se escriben en los ajustes locales y siguen visibles tras recargar

#### Scenario: Validación del nombre

- **WHEN** se intenta guardar un nombre vacío, una divisa que no es un código ISO de tres letras o un día fuera de 1–31
- **THEN** el cambio se rechaza con un mensaje comprensible y los valores guardados permanecen intactos

#### Scenario: Divisa por defecto

- **WHEN** se crea una cuenta nueva
- **THEN** la divisa principal del perfil aparece seleccionada por defecto, sin cambiar la divisa de cuentas existentes

#### Scenario: Sincronización del perfil

- **WHEN** hay una cuenta conectada y se guarda cualquier preferencia del perfil
- **THEN** el perfil remoto se actualiza y los valores se recuperan al entrar desde otro dispositivo

#### Scenario: Dato existente sin nombre

- **WHEN** se abre una instalación creada antes de que existieran estos campos
- **THEN** se usa `EUR` como divisa y el día de ingreso queda sin definir, sin borrar ni alterar los ajustes ya guardados

### Requirement: Seguimiento de cambios locales

La aplicación SHALL registrar qué entidades locales han cambiado desde la última sincronización y SHALL conservar esas marcas aunque no haya conexión o no haya cuenta.

#### Scenario: Escritura local

- **WHEN** se crea o edita una cuenta, movimiento, recurrencia, plan, grupo, gasto o transferencia
- **THEN** la entidad queda marcada como pendiente de sincronizar sin alterar su comportamiento local

#### Scenario: Borrado local

- **WHEN** se elimina una entidad
- **THEN** se conserva una marca de borrado para propagarlo a la nube y a otros dispositivos

### Requirement: Vinculación del espacio local a una cuenta

La aplicación SHALL vincular el espacio IndexedDB al usuario que conecta por primera vez y MUST NOT mezclar los datos de dos cuentas distintas en el mismo dispositivo.

#### Scenario: Primera vinculación

- **WHEN** una instalación local sin propietario conecta una cuenta
- **THEN** se guarda el identificador del propietario y se aplica la subida o descarga elegida

#### Scenario: Cambio de cuenta

- **WHEN** se intenta conectar una cuenta distinta de la propietaria
- **THEN** la conexión se rechaza sin modificar los datos locales ni los remotos

#### Scenario: Reapertura con la misma cuenta

- **WHEN** la persona desconecta y vuelve a conectar la misma cuenta
- **THEN** el espacio local se reconoce y la sincronización continúa sin pedir una decisión nueva
