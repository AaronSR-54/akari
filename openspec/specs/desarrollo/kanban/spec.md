# Desarrollo · Kanban Specification

## Purpose

Mantiene sincronizado el estado de cada change de OpenSpec con su tarjeta en un tablero Kan.bn autoalojado, para que el tablero refleje el trabajo real sin mover tarjetas a mano.

## Requirements

### Requirement: Sincronización al crear un change

Al crear un change sin reclamación previa, la herramienta SHALL mover su tarjeta a In Progress, creándola en la lista de entrada si todavía no existe. Si el change ya tiene manifiesto, SHALL sincronizar las tarjetas del manifiesto en lugar de crear una tarjeta nueva.

#### Scenario: Tarjeta existente

- **WHEN** se sincroniza un change recién creado y ya hay una tarjeta del tablero cuyo título contiene su id
- **THEN** la herramienta mueve esa tarjeta a In Progress sin crear una tarjeta nueva

#### Scenario: Tarjeta ausente

- **WHEN** se sincroniza un change recién creado y ninguna tarjeta del tablero contiene su id
- **THEN** la herramienta crea una tarjeta en la lista de entrada con el id del change en el título y la mueve a In Progress

#### Scenario: Sincronización repetida

- **WHEN** se vuelve a sincronizar un change cuya tarjeta ya está en In Progress
- **THEN** la herramienta deja la tarjeta en esa lista y no crea duplicados

#### Scenario: Change ya reclamado

- **WHEN** se ejecuta `start` sobre un change que ya tiene `workflow.json`
- **THEN** la herramienta no crea ninguna tarjeta y sincroniza las tarjetas del manifiesto hacia In Progress

### Requirement: Asignación de la tarjeta

La herramienta SHALL garantizar que la tarjeta del change esté asignada a la persona indicada en `kan_CURRENT_USER` o, si no se define, a la persona dueña del token, sin retirar otras asignaciones existentes.

#### Scenario: Asignación al crear la tarjeta

- **WHEN** `start` crea la tarjeta porque no existía
- **THEN** la tarjeta nace asignada a `kan_CURRENT_USER` o, en su defecto, a la dueña del token

#### Scenario: Tarjeta existente sin asignar

- **WHEN** `start` encuentra la tarjeta y la persona objetivo no figura entre sus miembros
- **THEN** la añade como miembro de la tarjeta y conserva las asignaciones que ya tuviera

#### Scenario: Tarjeta ya asignada

- **WHEN** la tarjeta ya tiene a la persona objetivo entre sus miembros
- **THEN** la herramienta no hace ninguna petición de asignación

#### Scenario: Persona no encontrada

- **WHEN** `kan_CURRENT_USER` no corresponde a un miembro activo del workspace del tablero
- **THEN** la herramienta falla indicando el email configurado, enumera los miembros disponibles y no modifica la tarjeta

### Requirement: Sincronización al archivar

Al archivar un change, la herramienta SHALL mover a Done todas las tarjetas vinculadas en su manifiesto —o la tarjeta identificada por el id si no hay manifiesto— después de abrir la PR de archivado. SHALL conservar título, descripción y asignación, SHALL registrar la URL de la PR y SHALL ser idempotente.

#### Scenario: Archivo con tarjeta

- **WHEN** se archiva un change y existe una tarjeta con su id en el título
- **THEN** la tarjeta se mueve a Done conservando su título, su descripción y su asignación

#### Scenario: Archivo sin tarjeta

- **WHEN** se archiva un change y no existe ninguna tarjeta con su id
- **THEN** la herramienta informa de que no hay tarjeta, no crea ninguna y el archivado continúa

#### Scenario: Archivo con varias tarjetas

- **WHEN** el manifiesto del change vincula tres tarjetas
- **THEN** las tres se mueven a Done y ninguna queda en In Progress o Review

#### Scenario: Archivo con PR

- **WHEN** el archivado ha abierto una PR y se ejecuta `done` con su URL
- **THEN** la URL queda registrada en el manifiesto y en la descripción de cada tarjeta del grupo

#### Scenario: Archivo repetido

- **WHEN** se ejecuta `done` sobre un change cuyas tarjetas ya están en Done
- **THEN** la herramienta no crea tarjetas ni vuelve a moverlas y termina correctamente

### Requirement: Identificación inequívoca de la tarjeta

La herramienta SHALL identificar las tarjetas por el manifiesto del change y, en su defecto, por el id como token completo del título o por el marcador `<!-- openspec-change: <id> -->` de la descripción. SHALL rechazar ambigüedades sin modificar ninguna tarjeta.

#### Scenario: Coincidencia parcial

- **WHEN** el tablero contiene una tarjeta con `[integrar-kanban]` y se sincroniza `integrar-kanban-openspec`
- **THEN** esa tarjeta no se considera coincidencia y no se modifica

#### Scenario: Varias coincidencias

- **WHEN** más de una tarjeta del tablero contiene el id del change como token
- **THEN** la herramienta no modifica ninguna tarjeta, enumera los candidatos y termina con error

#### Scenario: Coincidencia por marcador

- **WHEN** una tarjeta no lleva el id en el título pero su descripción contiene el marcador del change
- **THEN** la herramienta la considera parte del change sin exigir cambiar el título

#### Scenario: Manifiesto prioritario

- **WHEN** el manifiesto enumera tarjetas y una de ellas ya no contiene el id en el título
- **THEN** la herramienta usa la tarjeta del manifiesto y no la descarta por el título

### Requirement: Configuración sin secretos en el repositorio

La herramienta SHALL leer la URL base, el id del tablero y los nombres de las listas de un fichero versionado; la lista de revisión SHALL ser opcional. SHALL obtener el token de `kan_API_KEY` desde el entorno o desde el `.env` del checkout principal, sin escribirlo ni mostrarlo. En un worktree SHALL resolver ese `.env` mediante el directorio común de Git. Si no puede resolver ese directorio, SHALL fallar con un mensaje accionable en lugar de buscar el fichero en el directorio del worktree. Una ruta relativa indicada con `--env` SHALL resolverse contra el checkout principal.

#### Scenario: Falta el token

- **WHEN** se ejecuta la herramienta sin `kan_API_KEY`
- **THEN** falla antes de hacer peticiones de red con un mensaje que indica cómo definirla y no imprime ningún secreto

#### Scenario: Lista configurada inexistente

- **WHEN** el tablero no tiene una lista con el nombre configurado para una transición
- **THEN** la herramienta informa del nombre que falta y de las listas disponibles, y no modifica ninguna tarjeta

#### Scenario: Revisión no configurada

- **WHEN** la configuración no incluye la lista de revisión y se ejecuta una operación que no sea `review`
- **THEN** la herramienta funciona con las listas de entrada, progreso y fin sin exigir la lista opcional

#### Scenario: Worktree sin `.env`

- **WHEN** se ejecuta la herramienta desde un worktree que no contiene `.env`
- **THEN** lee el `.env` del checkout principal a través del directorio común de Git y no exige copiar secretos al worktree

#### Scenario: Directorio común de Git inaccesible

- **WHEN** se ejecuta la herramienta desde un repositorio en el que no se puede resolver el directorio común de Git
- **THEN** falla con un mensaje que explica la causa y cómo definir `kan_API_KEY`, sin leer un `.env` del worktree ni imprimir secretos

#### Scenario: Ruta de entorno relativa

- **WHEN** se ejecuta la herramienta desde un worktree con `--env ruta/fichero.env`
- **THEN** la ruta se resuelve contra el checkout principal y se lee ese fichero en lugar de uno situado en el worktree

### Requirement: Descubrimiento de identificadores

La herramienta SHALL ofrecer un modo de consulta que enumere los workspaces accesibles, sus tableros y las listas de un tablero, para configurar el fichero sin adivinar identificadores.

#### Scenario: Consulta del tablero

- **WHEN** se ejecuta el modo de descubrimiento con credenciales válidas
- **THEN** la salida muestra el id de cada tablero y, para el tablero indicado, el nombre y el id de cada lista, sin crear ni mover tarjetas

### Requirement: Fallo de sincronización no bloqueante

Un fallo de Kan.bn SHALL NOT interrumpir el flujo de OpenSpec una vez creado el claim: la rama y el worktree se conservan, la herramienta informa y el trabajo puede continuar. El preflight de `claim` sí SHALL abortar si no puede leer la cola, porque no puede validar que las tarjetas estén libres.

#### Scenario: Error de credenciales durante el propose

- **WHEN** la API responde con un error de autenticación al crear un change
- **THEN** el agente informa del error y la creación del change y sus artefactos se completan igualmente

#### Scenario: Error de red durante el archivado

- **WHEN** la API no responde al archivar un change
- **THEN** el agente informa del error y el archivado, el commit y la PR siguen su curso

#### Scenario: Fallo al mover tarjetas de un claim

- **WHEN** el claim ya se ha publicado en Git y Kan.bn falla al asignar o mover las tarjetas
- **THEN** la herramienta conserva la rama y el worktree, informa del error y permite reintentar la sincronización sin volver a reclamar

#### Scenario: Cola inaccesible al reclamar

- **WHEN** `claim` no puede leer el tablero durante el preflight
- **THEN** no crea rama, etiquetas ni worktree y termina con un error que indica que la cola no está disponible

### Requirement: Cola de trabajo

La herramienta SHALL ofrecer una consulta de la cola que enumere las tarjetas de `TO DO` libres y las ya reclamadas con su change, rama y persona asignada. `claim` SHALL aceptar solo tarjetas de `TO DO`, sin asignar o asignadas a quien reclama, y sin vínculo a otro change.

#### Scenario: Consulta de la cola

- **WHEN** se ejecuta `queue` con credenciales válidas
- **THEN** la salida muestra las tarjetas libres de `TO DO` y las reclamadas con su change, rama y asignación, sin modificar el tablero

#### Scenario: Salida estructurada para agentes

- **WHEN** se ejecuta `queue --json`
- **THEN** la salida incluye para cada tarjeta `publicId`, `title`, `list`, `members`, `changeId`, `branch` y `claimable`, sin modificar el tablero

#### Scenario: Reclamar una tarjeta libre

- **WHEN** se reclama una tarjeta de `TO DO` sin asignar y sin vínculo a un change
- **THEN** la reclamación continúa y la tarjeta pasa a In Progress

#### Scenario: Tarjeta asignada a otra persona

- **WHEN** se intenta reclamar una tarjeta de `TO DO` asignada a otra persona
- **THEN** la herramienta no crea rama, etiquetas ni worktree y enumera la asignación existente

#### Scenario: Tarjeta ya vinculada

- **WHEN** se intenta reclamar una tarjeta cuyo título o descripción ya apunta a otro change activo
- **THEN** la herramienta no modifica la tarjeta y muestra el change que ya la posee

#### Scenario: Tarjeta fuera de la cola

- **WHEN** se intenta reclamar una tarjeta que está en In Progress, Review o Done
- **THEN** la herramienta rechaza el claim e indica la lista en la que se encuentra

### Requirement: Reclamación atómica

`claim` SHALL crear la rama `<change-id>` y una etiqueta `claims/<card-id>/<change-id>` por tarjeta, y SHALL publicarlas en un único push atómico. Si cualquiera existe, SHALL no crear ni mover nada y SHALL indicar el change que la posee. Repetir el mismo claim SHALL ser idempotente.

#### Scenario: Primera reclamación

- **WHEN** dos personas reclaman la misma tarjeta con changes distintos y ambas intentan publicar su claim
- **THEN** solo una publicación tiene éxito y la otra falla sin mover ni asignar la tarjeta

#### Scenario: Colisión de rama

- **WHEN** la rama `<change-id>` ya existe en el remoto y no pertenece al mismo claim
- **THEN** la herramienta no reutiliza la rama y pide elegir otro id o liberar el claim anterior

#### Scenario: Fallo parcial de publicación

- **WHEN** el push atómico falla después de crear la rama y las etiquetas locales
- **THEN** la herramienta elimina el worktree y la rama local y no mueve ninguna tarjeta

#### Scenario: Reintento idempotente

- **WHEN** se repite `claim` para el mismo change y las mismas tarjetas ya publicadas
- **THEN** la herramienta reconoce el claim existente, sincroniza el estado de las tarjetas y no duplica ramas ni etiquetas

### Requirement: Agrupación de tarjetas

`claim` SHALL aceptar varias tarjetas y `link` SHALL añadirlas a un claim existente; todas SHALL compartir un único manifiesto, change, rama y PR. Una tarjeta SHALL pertenecer como máximo a un change activo. Al archivar o liberar, todas las tarjetas del grupo SHALL moverse juntas.

#### Scenario: Reclamar varias tarjetas

- **WHEN** se ejecuta `claim` con tres tarjetas de `TO DO` y un `--change` explícito
- **THEN** se crea un único change, una única rama, un único worktree y tres etiquetas de claim

#### Scenario: Enlazar una tarjeta después

- **WHEN** se ejecuta `link <change-id> --cards <card-id>` sobre una tarjeta libre
- **THEN** la tarjeta se añade al manifiesto, recibe el marcador del change y pasa a In Progress con la asignación del claim

#### Scenario: Tarjeta ya usada por otro change

- **WHEN** se intenta enlazar una tarjeta que ya pertenece a otro claim activo
- **THEN** la herramienta no la añade y muestra el change que la posee

#### Scenario: Archivo del grupo

- **WHEN** se archiva un change con varias tarjetas
- **THEN** todas las tarjetas del grupo pasan a Done en la misma operación

#### Scenario: Liberación del grupo

- **WHEN** se libera un claim con varias tarjetas
- **THEN** todas las tarjetas vuelven a `TO DO` o quedan con las asignaciones de otras personas, según corresponda

#### Scenario: Agrupación tardía

- **WHEN** se intenta enlazar una tarjeta a un change ya archivado
- **THEN** la herramienta rechaza la operación y no modifica la tarjeta

### Requirement: Manifiesto del change

Cada claim SHALL escribir `openspec/changes/<change-id>/workflow.json` con el change, la rama, las tarjetas y la PR, sin tokens, credenciales ni correos de personas, y SHALL versionarlo. El manifiesto SHALL ser la fuente de verdad para `review`, `done`, `release` y la PR; si falta, la herramienta SHALL usar la coincidencia por título o marcador.

#### Scenario: Manifiesto al reclamar

- **WHEN** se crea un claim
- **THEN** el change contiene `workflow.json` con el id, la rama y las tarjetas reclamadas antes de moverlas en el tablero

#### Scenario: Sin secretos

- **WHEN** se inspecciona un `workflow.json` versionado
- **THEN** no contiene `kan_API_KEY`, tokens, correos ni credenciales

#### Scenario: Manifiesto prioritario

- **WHEN** `done` se ejecuta sobre un change con manifiesto
- **THEN** usa las tarjetas del manifiesto aunque sus títulos ya no contengan el id

#### Scenario: Compatibilidad sin manifiesto

- **WHEN** `done` se ejecuta sobre un change antiguo sin `workflow.json`
- **THEN** usa la coincidencia por título o marcador y mantiene el comportamiento anterior

#### Scenario: Actualización al enlazar

- **WHEN** `link` añade una tarjeta
- **THEN** el manifiesto se actualiza y el cambio se commitea en la rama del change

### Requirement: Liberación de un claim

`release` SHALL devolver a `TO DO` las tarjetas del manifiesto, retirar a quien libera de su asignación, borrar las etiquetas de claim y eliminar el worktree y la rama si no tienen trabajo pendiente. SHALL negarse si el change está archivado. SHALL negarse si la rama tiene una PR abierta o el worktree tiene cambios sin commitear, salvo `--force` explícito.

#### Scenario: Liberación limpia

- **WHEN** se libera un claim sin commits posteriores al claim y sin cambios locales
- **THEN** las tarjetas vuelven a `TO DO`, se retira la asignación de quien libera y se borran rama, worktree y etiquetas

#### Scenario: Tarjeta con otra persona asignada

- **WHEN** una tarjeta del grupo tiene otra persona asignada además de quien libera
- **THEN** se retira solo a quien libera y la tarjeta permanece en In Progress para la otra persona

#### Scenario: Worktree con cambios

- **WHEN** el worktree tiene cambios sin commitear y se ejecuta `release` sin `--force`
- **THEN** la herramienta no borra nada y enumera los ficheros pendientes

#### Scenario: Change archivado

- **WHEN** se intenta liberar un change ya archivado
- **THEN** la herramienta rechaza la operación y no modifica el tablero ni el repositorio

#### Scenario: Liberación repetida

- **WHEN** se repite `release` sobre un claim ya liberado
- **THEN** la herramienta no falla por elementos ausentes y no mueve tarjetas ya devueltas

### Requirement: Estado de revisión

`review` SHALL mover a la lista `REVIEW` todas las tarjetas del manifiesto sin cambiar su asignación ni su título. Si la lista no está configurada o no existe, SHALL fallar con un mensaje que indique cómo configurarla y SHALL no mover ninguna tarjeta.

#### Scenario: Revisión de un grupo

- **WHEN** se ejecuta `review` sobre un change con tres tarjetas en In Progress
- **THEN** las tres pasan a `REVIEW` y conservan su asignación

#### Scenario: Lista de revisión ausente

- **WHEN** `kan.config.json` no define `lists.review` o el tablero no tiene esa lista
- **THEN** la herramienta no mueve ninguna tarjeta e indica el nombre que falta y las listas disponibles

#### Scenario: Revisión repetida

- **WHEN** se ejecuta `review` sobre tarjetas que ya están en `REVIEW`
- **THEN** la herramienta no hace peticiones de movimiento y termina correctamente

#### Scenario: Archivo desde revisión

- **WHEN** se archiva un change cuyas tarjetas están en `REVIEW`
- **THEN** `done` las mueve a Done y no las deja en `REVIEW`

### Requirement: Identidad configurada en el entorno

La herramienta SHALL usar el email de `kan_CURRENT_USER` del `.env` del checkout principal como única identidad para escribir en Kan, y SHALL fallar antes de cualquier petición de escritura si falta o no corresponde a un miembro activo del workspace. El email SHALL preceder al texto de cada comentario escrito por el agente. Ningún correo concreto SHALL aparecer en código, manifiestos, documentación ni mensajes de commit; los ejemplos SHALL usar `persona@example.com`.

#### Scenario: whoami sin secretos

- **WHEN** se ejecuta `node scripts/kan-sync.mjs whoami` con `kan_CURRENT_USER` configurado
- **THEN** imprime el email, el `publicId` del miembro y su nombre, y no imprime `kan_API_KEY` ni el token

#### Scenario: Identidad ausente

- **WHEN** falta `kan_CURRENT_USER` y se ejecuta una operación que escribe en Kan
- **THEN** la herramienta falla con un mensaje que indica cómo definirlo y no usa la persona dueña del token

#### Scenario: Comentario identificado

- **WHEN** se ejecuta `comment <change-id> <texto>`
- **THEN** la tarjeta del change recibe un comentario que empieza por `[<email>]` y el texto indicado

#### Scenario: Email no configurable en el repositorio

- **WHEN** se inspecciona el repositorio buscando un correo real
- **THEN** solo aparece en el `.env` ignorado por Git y en la documentación como ejemplo genérico
