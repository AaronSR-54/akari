# Producto · Nube Supabase Specification

## Purpose

Definir la cuenta de usuario y la sincronización opcional con Supabase para que los datos de akari se recuperen en otro dispositivo y sobrevivan a la pérdida del navegador, manteniendo el funcionamiento local-first y el aislamiento entre usuarios.

## Requirements

### Requirement: Cuenta con email y contraseña

La aplicación SHALL permitir crear una cuenta y iniciar sesión con email y contraseña mediante Supabase Auth, SHALL mantener la sesión entre recargas y SHALL permitir cerrar sesión desde Ajustes.

#### Scenario: Alta de cuenta

- **WHEN** la persona introduce un email válido y una contraseña de al menos 8 caracteres y confirma el alta
- **THEN** se crea la cuenta y la sesión queda disponible para sincronizar
- **AND** el nombre se recoge en el asistente de primeros pasos o se toma del perfil que ya existiera

#### Scenario: Inicio de sesión

- **WHEN** la persona introduce las credenciales de una cuenta existente
- **THEN** se inicia la sesión, se recupera su perfil y se descargan sus datos tras decidir qué hacer con los datos locales cuando los haya

#### Scenario: Credenciales incorrectas

- **WHEN** el email o la contraseña no son válidos
- **THEN** se muestra un error comprensible y no se modifica ningún dato local ni remoto

#### Scenario: Confirmación de correo pendiente

- **WHEN** Supabase exige confirmar el email antes de abrir sesión
- **THEN** se explica que hay que revisar el correo y la aplicación sigue usable en modo local

#### Scenario: Cierre de sesión

- **WHEN** la persona pulsa «Cerrar sesión» en Ajustes
- **THEN** se elimina la sesión del dispositivo y los datos locales permanecen disponibles sin sincronizar

#### Scenario: Página de acceso dedicada

- **WHEN** la persona abre `/entrar`
- **THEN** ve la marca de Akari y el mismo formulario de acceso y alta que la modal, con «Iniciar sesión» preseleccionado
- **AND** si ya tiene una sesión activa se le redirige al resumen

#### Scenario: Onboarding con sesión activa

- **WHEN** una persona con sesión iniciada abre `/onboarding` y no viene de crear la cuenta en `/entrar`
- **THEN** se le redirige al resumen sin repetir el asistente

### Requirement: Perfil de usuario

La aplicación SHALL guardar en la nube el nombre, la divisa principal y el día de ingreso del perfil cuando hay una cuenta conectada y SHALL reflejarlos en el shell y en Ajustes. Las preferencias MUST validarse con las mismas reglas que en modo local.

#### Scenario: Perfil actualizado

- **WHEN** se guarda un nombre, una divisa o un día de ingreso válidos desde Ajustes con la cuenta conectada
- **THEN** el perfil remoto se actualiza y se mantiene tras recargar o entrar desde otro dispositivo

#### Scenario: Perfil recuperado

- **WHEN** se inicia sesión en un dispositivo nuevo
- **THEN** el nombre, la divisa principal y el día de ingreso del perfil remoto sustituyen a los valores locales por defecto

#### Scenario: Perfil inválido

- **WHEN** el nombre está vacío o supera 40 caracteres, la divisa no es un código ISO o el día no está entre 1 y 31
- **THEN** el cambio se rechaza y el perfil remoto y local permanecen intactos

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

La pantalla de primeros pasos SHALL guiar con un asistente visual de nombre, divisa, día de ingreso opcional, bancos compatibles y cuenta opcional en la nube, sin impedir el flujo local existente. Cada paso posterior al nombre MUST poder omitirse. La primera cuenta y el primer movimiento se crean dentro de la app, no dentro del asistente.

#### Scenario: Perfil inicial

- **WHEN** la persona completa los pasos de nombre, divisa y día de ingreso
- **THEN** se guardan los valores y el día de ingreso puede quedar sin definir

#### Scenario: Continuar sin cuenta

- **WHEN** la persona omite los pasos opcionales o termina sin conectar una cuenta
- **THEN** el onboarding se completa y los datos quedan solo en el dispositivo

#### Scenario: Paso de bancos informativo

- **WHEN** la persona llega al paso de bancos
- **THEN** ve los iconos circulares de los bancos soportados y una explicación honesta de que la importación llegará próximamente, sin que se procese ningún archivo

#### Scenario: Guía dentro de la app

- **WHEN** termina el onboarding sin cuenta o sin movimientos
- **THEN** el resumen muestra los primeros pasos y el detalle de una cuenta sin movimientos invita a añadir el primero

#### Scenario: Alta desde el onboarding

- **WHEN** la persona crea una cuenta desde el onboarding
- **THEN** su perfil (nombre, divisa y día de ingreso) se guarda en la nube y los datos locales existentes se suben

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

### Requirement: Marca en la modal de acceso

La modal compartida de acceso y alta de cuenta en la nube SHALL mostrar el logo de Akari junto al formulario, de forma que la marca sea visible tanto desde el onboarding como desde cualquier otro punto que abra la modal.

#### Scenario: Logo en la modal

- **WHEN** se abre la modal de cuenta en la nube
- **THEN** la parte superior de la modal muestra el logo de Akari con su nombre accesible
- **AND** la modal conserva el título, las pestañas de iniciar sesión y crear cuenta y el formulario existentes

#### Scenario: Ruta de acceso dedicada

- **WHEN** la persona abre `/entrar`
- **THEN** la ruta sigue mostrando la marca de Akari y el mismo formulario de acceso y alta
- **AND** el logo de la modal y el de la ruta usan la misma marca

### Requirement: Acceso rápido con Google

El inicio de sesión SHALL ofrecer un acceso rápido con Google además del acceso con email y contraseña. El alta SHALL permitir crear la cuenta con Google sin pasar por el formulario de email.

#### Scenario: Iniciar sesión con Google

- **WHEN** la persona pulsa «Iniciar sesión con Google»
- **THEN** se abre el flujo OAuth de Google y, al volver, la sesión queda iniciada
- **AND** si hay datos locales sin cuenta, el selector de datos decide si se suben o se sustituyen antes de abrir el flujo

#### Scenario: Registrarse con Google

- **WHEN** la persona pulsa «Registrarse con Google»
- **THEN** se abre el flujo OAuth de Google y, al volver, la cuenta queda creada o iniciada
- **AND** los datos locales del dispositivo se suben a la cuenta como en el alta con email

#### Scenario: Google no disponible

- **WHEN** el proveedor de Google no está habilitado en la nube
- **THEN** se muestra un error comprensible y se ofrece seguir con email o sin cuenta

### Requirement: Alta en dos pasos y salida sin cuenta

La pestaña «Crear cuenta» SHALL mostrar el acceso con Google y un formulario de email con «Continuar». Al continuar SHALL pedir la contraseña dos veces antes de crear la cuenta. «Continuar sin registrarte» SHALL estar siempre visible debajo del formulario, tanto en iniciar sesión como en crear cuenta.

#### Scenario: Alta en dos pasos

- **WHEN** la persona escribe su email y pulsa «Continuar»
- **THEN** se muestra el paso de contraseña con los campos «Contraseña» y «Repite la contraseña»
- **AND** puede volver al email con «Cambiar email» sin cerrar la modal

#### Scenario: Nombre en el onboarding

- **WHEN** la persona crea la cuenta desde `/entrar`
- **THEN** el acceso solo pide email y contraseña
- **AND** el nombre se recoge después en el asistente de primeros pasos

#### Scenario: Contraseñas distintas

- **WHEN** las dos contraseñas no coinciden
- **THEN** se muestra un error y no se crea la cuenta

#### Scenario: Google en el mismo sitio

- **WHEN** se compara iniciar sesión con crear cuenta
- **THEN** el botón de Google aparece en la parte superior del formulario en ambos modos
- **AND** al pulsar «Continuar» en el alta, el botón de Google desaparece para dejar solo el paso de contraseña

#### Scenario: Seguir sin registrarse

- **WHEN** se pulsa «Continuar sin registrarte» desde cualquiera de las dos pestañas
- **THEN** la modal se cierra o la ruta de acceso vuelve a la app sin crear cuenta
- **AND** no se modifica ningún dato local ni remoto

### Requirement: Datos locales sin sincronizar

Cuando el dispositivo tenga datos que aún no pertenecen a ninguna cuenta, al intentar iniciar sesión el mismo formulario SHALL sustituir el paso de credenciales por un paso con el mensaje y un selector para sincronizarlos con la cuenta o empezar solo con los de la cuenta. El selector MUST usar los componentes y tokens visuales del resto de la aplicación y MUST aparecer únicamente tras intentar el acceso.

#### Scenario: El selector llega después de las credenciales

- **WHEN** la persona escribe su email y contraseña y pulsa «Entrar» con datos locales sin cuenta
- **THEN** la misma caja muestra el mensaje y el selector en lugar de iniciar sesión
- **AND** no se modifica ningún dato hasta confirmar la elección
- **AND** «Volver» regresa a las credenciales sin borrar lo escrito

#### Scenario: Elegir sincronizar

- **WHEN** la persona elige «Sincronizar» y confirma
- **THEN** los datos locales se marcan para subir y se combinan con los de la cuenta
- **AND** no se pierde ningún dato del dispositivo

#### Scenario: Elegir los de la cuenta

- **WHEN** la persona elige «Usar los de la cuenta» y confirma
- **THEN** las entidades sincronizables del dispositivo se sustituyen por las de la cuenta
- **AND** los ajustes y preferencias del dispositivo se conservan

#### Scenario: Datos ya vinculados

- **WHEN** los datos locales ya pertenecen a la cuenta que inicia sesión
- **THEN** no se muestra el paso de datos locales y se reutiliza la copia local sin sustituirla
- **AND** el aviso de sustitución desaparece del formulario

### Requirement: Destino tras el acceso

Al crear una cuenta desde `/entrar`, la aplicación SHALL continuar con el asistente de primeros pasos si no estaba completado. Al iniciar sesión con una cuenta existente SHALL abrir el resumen. «Continuar sin registrarte» SHALL saltar el asistente cuando el dispositivo ya tenga datos locales.

#### Scenario: Alta desde la ruta de acceso

- **WHEN** la persona crea una cuenta desde `/entrar` y el asistente no estaba completado
- **THEN** se abre `/onboarding` para completar el perfil
- **AND** al terminar u omitir el asistente se abre el resumen

#### Scenario: Alta con Google

- **WHEN** la persona crea la cuenta con Google desde `/entrar` y vuelve del OAuth
- **THEN** se abre `/onboarding` en lugar del resumen

#### Scenario: Inicio de sesión normal

- **WHEN** la persona inicia sesión con una cuenta existente
- **THEN** se abre el resumen sin repetir el asistente

#### Scenario: Continuar sin cuenta con datos

- **WHEN** la persona pulsa «Continuar sin registrarte» y el dispositivo ya tiene datos locales
- **THEN** se abre el resumen y el asistente queda completado

#### Scenario: Continuar sin cuenta sin datos

- **WHEN** la persona pulsa «Continuar sin registrarte» y el dispositivo no tiene datos
- **THEN** se abre el asistente de primeros pasos

### Requirement: Acceso sin desplazamiento

La ruta `/entrar` SHALL ocupar la ventana y bloquear el desplazamiento del documento, de modo que el formulario completo quede visible sin scroll vertical en los tamaños de pantalla habituales.

#### Scenario: Sin scroll en la ruta de acceso

- **WHEN** se abre `/entrar`
- **THEN** el documento no permite desplazamiento vertical
- **AND** el formulario y «Continuar sin registrarte» quedan visibles

#### Scenario: Salir de la ruta

- **WHEN** la persona navega fuera de `/entrar`
- **THEN** el desplazamiento del documento vuelve a su estado normal

### Requirement: Transiciones del acceso

El acceso SHALL animar el cambio entre iniciar sesión y crear cuenta, el paso entre el email y la contraseña, y el cambio de altura del contenedor. Las animaciones MUST respetar `prefers-reduced-motion`.

#### Scenario: Cambio entre pestañas

- **WHEN** se cambia entre «Iniciar sesión» y «Crear cuenta»
- **THEN** la pestaña activa se mueve de forma continua y el contenido entra con una transición suave
- **AND** el contenedor acompaña el cambio de altura sin saltos

#### Scenario: Paso a contraseña

- **WHEN** se pulsa «Continuar» en el alta
- **THEN** el contenido cambia con la misma transición y la altura se ajusta de forma animada

#### Scenario: Movimiento reducido

- **WHEN** el sistema operativo indica `prefers-reduced-motion: reduce`
- **THEN** los cambios de contenido y altura aparecen directamente en su estado final

### Requirement: Acceso sin textos internos

La pantalla de acceso MUST NOT mostrar la redirección inferior, el aviso de cifrado ni menciones internas a Supabase o a variables de entorno.

#### Scenario: Acceso limpio

- **WHEN** se abre `/entrar`
- **THEN** no aparecen los botones «Volver al resumen» ni «Volver a primeros pasos» al pie
- **AND** no aparece el texto sobre cifrado de extremo a extremo
- **AND** las ayudas del formulario no mencionan Supabase
