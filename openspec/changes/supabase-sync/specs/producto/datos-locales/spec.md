# Producto · Datos Locales Specification

## MODIFIED Requirements

### Requirement: Inicialización del espacio de datos

En la primera apertura, la aplicación SHALL crear un espacio de datos local, SHALL permitir recoger el nombre del perfil y SHALL dejar la aplicación lista para usarse sin depender de servicios remotos. La conexión con una cuenta en la nube MUST ser opcional.

#### Scenario: Primera apertura

- **WHEN** la persona abre la aplicación sin datos guardados
- **THEN** se crea el espacio local y se ofrece un nombre de perfil, empezar vacío o cargar datos de ejemplo, con la nube como opción adicional

#### Scenario: Aperturas posteriores

- **WHEN** la persona vuelve a abrir la aplicación con datos existentes
- **THEN** se cargan sus cuentas, movimientos y grupos sin volver a preguntar por la inicialización

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

### Requirement: Nombre del perfil persistente

La aplicación SHALL guardar el nombre editable del perfil en los ajustes locales del dispositivo y SHALL reutilizarlo en el panel y en el shell tras recargar. Sin cuenta conectada, el nombre MUST NOT enviarse a ningún servidor. Con cuenta conectada, el nombre SHALL sincronizarse con el perfil remoto.

#### Scenario: Guardado y persistencia

- **WHEN** se guarda un nombre válido desde el panel de ajustes
- **THEN** el nombre se escribe en los ajustes locales y sigue visible en `/ajustes` y en el avatar del shell después de recargar

#### Scenario: Validación del nombre

- **WHEN** se intenta guardar un nombre vacío o que supera la longitud permitida
- **THEN** el cambio se rechaza con un mensaje comprensible y el nombre guardado permanece intacto

#### Scenario: Sincronización del nombre

- **WHEN** hay una cuenta conectada y se guarda un nombre válido
- **THEN** el nombre se actualiza también en el perfil remoto y se recupera al entrar desde otro dispositivo

#### Scenario: Dato existente sin nombre

- **WHEN** se abre una instalación creada antes de que existiera este campo
- **THEN** se usa el nombre por defecto sin borrar ni alterar los ajustes ya guardados

## ADDED Requirements

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
