# Producto · Datos Locales Specification

## MODIFIED Requirements

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
