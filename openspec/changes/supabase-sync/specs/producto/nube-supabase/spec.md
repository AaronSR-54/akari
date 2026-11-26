# Producto · Nube Supabase Specification

## Purpose

Definir la cuenta de usuario y la sincronización opcional con Supabase para que los datos de akari se recuperen en otro dispositivo y sobrevivan a la pérdida del navegador, manteniendo el funcionamiento local-first y el aislamiento entre usuarios.

## ADDED Requirements

### Requirement: Cuenta con email y contraseña

La aplicación SHALL permitir crear una cuenta y iniciar sesión con email y contraseña mediante Supabase Auth, SHALL mantener la sesión entre recargas y SHALL permitir cerrar sesión desde Ajustes.

#### Scenario: Alta de cuenta

- **WHEN** la persona introduce un nombre, un email válido y una contraseña de al menos 8 caracteres y confirma el alta
- **THEN** se crea la cuenta, se guarda el nombre en su perfil y la sesión queda disponible para sincronizar

#### Scenario: Inicio de sesión

- **WHEN** la persona introduce las credenciales de una cuenta existente
- **THEN** se inicia la sesión, se recupera su perfil y se descargan sus datos tras la confirmación correspondiente

#### Scenario: Credenciales incorrectas

- **WHEN** el email o la contraseña no son válidos
- **THEN** se muestra un error comprensible y no se modifica ningún dato local ni remoto

#### Scenario: Confirmación de correo pendiente

- **WHEN** Supabase exige confirmar el email antes de abrir sesión
- **THEN** se explica que hay que revisar el correo y la aplicación sigue usable en modo local

#### Scenario: Cierre de sesión

- **WHEN** la persona pulsa «Desconectar»
- **THEN** se elimina la sesión del dispositivo y los datos locales permanecen disponibles sin sincronizar

### Requirement: Perfil de usuario

La aplicación SHALL guardar el nombre del perfil en la nube cuando hay una cuenta conectada y SHALL reflejarlo en el shell y en Ajustes. El nombre MUST validarse con las mismas reglas que en modo local.

#### Scenario: Nombre actualizado

- **WHEN** se guarda un nombre válido desde Ajustes con la cuenta conectada
- **THEN** el nombre se actualiza en el perfil remoto y se mantiene tras recargar o entrar desde otro dispositivo

#### Scenario: Nombre recuperado

- **WHEN** se inicia sesión en un dispositivo nuevo
- **THEN** el nombre del perfil remoto sustituye al valor local por defecto

#### Scenario: Nombre inválido

- **WHEN** el nombre está vacío o supera 40 caracteres
- **THEN** el cambio se rechaza y el nombre remoto y local permanecen intactos

### Requirement: Sincronización local-first

La aplicación SHALL seguir leyendo y escribiendo primero en IndexedDB, SHALL empujar los cambios locales pendientes y SHALL descargar los cambios remotos al iniciar sesión, recuperar el foco, volver la conexión, cada 60 segundos y al pulsar «Sincronizar ahora».

#### Scenario: Cambio sin conexión

- **WHEN** se registra un movimiento sin conexión
- **THEN** el movimiento queda visible y guardado en local, figura como cambio pendiente y se sube cuando vuelve la conexión

#### Scenario: Cambio en otro dispositivo

- **WHEN** otra sesión del mismo usuario ha guardado un cambio y este dispositivo recupera el foco o sincroniza
- **THEN** el cambio remoto aparece en la pantalla sin recargar la página

#### Scenario: Conflicto entre dispositivos

- **WHEN** la misma entidad tiene un cambio local pendiente y otro remoto
- **THEN** prevalece el cambio local pendiente y el remoto no lo sobrescribe

#### Scenario: Borrado propagado

- **WHEN** una entidad se elimina en un dispositivo y otro sincroniza
- **THEN** la entidad desaparece también del segundo dispositivo

#### Scenario: Sincronización manual

- **WHEN** se pulsa «Sincronizar ahora»
- **THEN** se ejecuta un ciclo completo y se muestra el resultado o el error sin bloquear la interfaz

### Requirement: Estado de sincronización visible

La aplicación SHALL mostrar en Ajustes si la cuenta está conectada, el estado del último ciclo, la fecha del último sync y el número de cambios pendientes.

#### Scenario: Sincronización en curso

- **WHEN** hay un ciclo activo
- **THEN** el panel indica que se está sincronizando y deshabilita el botón manual

#### Scenario: Error de red

- **WHEN** el ciclo falla por falta de red o un error del servidor
- **THEN** el panel muestra el error, conserva los cambios pendientes y la app sigue operativa

#### Scenario: Sin cuenta

- **WHEN** no hay sesión
- **THEN** el panel invita a crear una cuenta o iniciar sesión y explica que el modo local sigue disponible

### Requirement: Aislamiento por usuario

Cada fila remota SHALL pertenecer a un único usuario y PostgreSQL MUST aplicar RLS por `auth.uid()` en lectura, alta, actualización y borrado.

#### Scenario: Acceso a filas ajenas

- **WHEN** un cliente autenticado intenta leer o modificar filas de otro usuario
- **THEN** Supabase devuelve cero filas o rechaza la operación y no se produce ninguna fuga

#### Scenario: Dispositivo vinculado a otra cuenta

- **WHEN** se intenta conectar una cuenta distinta a la propietaria del espacio local
- **THEN** la conexión se bloquea con un mensaje que explica cómo restablecer el dispositivo y no se mezclan datos

### Requirement: Onboarding de perfil y nube

La pantalla de primeros pasos SHALL recoger el nombre del perfil y SHALL ofrecer, de forma opcional, crear una cuenta o iniciar sesión sin impedir el flujo local existente.

#### Scenario: Continuar sin cuenta

- **WHEN** la persona elige empezar vacío o con datos de ejemplo sin conectar una cuenta
- **THEN** el onboarding termina igual que antes y los datos quedan solo en el dispositivo

#### Scenario: Alta desde el onboarding

- **WHEN** la persona crea una cuenta desde el onboarding
- **THEN** el nombre introducido se guarda en el perfil y los datos locales existentes se suben a la nube

#### Scenario: Inicio de sesión con datos locales

- **WHEN** la persona inicia sesión en un dispositivo que ya tiene datos locales
- **THEN** se avisa de que se sustituirán por los de la cuenta y solo se continúa tras confirmación

#### Scenario: Supabase no configurado

- **WHEN** faltan las variables de entorno de Supabase
- **THEN** el onboarding explica que la nube no está disponible y permite continuar en modo local

### Requirement: Migraciones SQL versionadas

Cada cambio del esquema remoto SHALL entregarse como un archivo SQL versionado en `supabase/migrations/`, aplicable por separado y acompañado de instrucciones de aplicación.

#### Scenario: Puesta en marcha de un proyecto

- **WHEN** se crea un proyecto de Supabase vacío
- **THEN** los archivos SQL aplicados por orden crean las tablas, funciones, triggers y políticas necesarias sin pasos manuales adicionales

#### Scenario: Cambio posterior del esquema

- **WHEN** una nueva versión modifica tablas o políticas
- **THEN** se añade un archivo SQL nuevo sin reescribir los anteriores y se documenta su orden de aplicación

### Requirement: Operaciones destructivas protegidas

Mientras haya una cuenta conectada, la aplicación MUST NOT permitir importar una copia, cargar datos de ejemplo ni borrar la base local.

#### Scenario: Importación con cuenta conectada

- **WHEN** la persona intenta importar una copia estando conectada
- **THEN** la acción está deshabilitada y se explica que debe desconectar la cuenta primero

#### Scenario: Exportación con cuenta conectada

- **WHEN** la persona exporta una copia estando conectada
- **THEN** la exportación se completa con los datos locales actuales
