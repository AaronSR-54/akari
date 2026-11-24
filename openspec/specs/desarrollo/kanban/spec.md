# Desarrollo · Kanban Specification

## Purpose

Mantiene sincronizado el estado de cada change de OpenSpec con su tarjeta en un tablero Kan.bn autoalojado, para que el tablero refleje el trabajo real sin mover tarjetas a mano.

## Requirements

### Requirement: Sincronización al crear un change

Al crear un change, la herramienta SHALL mover su tarjeta a la lista configurada como In Progress, creándola primero en la lista de entrada si todavía no existe.

#### Scenario: Tarjeta existente

- **WHEN** se sincroniza un change recién creado y ya hay una tarjeta del tablero cuyo título contiene su id
- **THEN** la herramienta mueve esa tarjeta a In Progress sin crear una tarjeta nueva

#### Scenario: Tarjeta ausente

- **WHEN** se sincroniza un change recién creado y ninguna tarjeta del tablero contiene su id
- **THEN** la herramienta crea una tarjeta en la lista de entrada con el id del change en el título y la mueve a In Progress

#### Scenario: Sincronización repetida

- **WHEN** se vuelve a sincronizar un change cuya tarjeta ya está en In Progress
- **THEN** la herramienta deja la tarjeta en esa lista y no crea duplicados

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

Al archivar un change, la herramienta SHALL mover su tarjeta a la lista configurada como Done.

#### Scenario: Archivo con tarjeta

- **WHEN** se archiva un change y existe una tarjeta con su id en el título
- **THEN** la tarjeta se mueve a Done conservando su título, su descripción y su asignación

#### Scenario: Archivo sin tarjeta

- **WHEN** se archiva un change y no existe ninguna tarjeta con su id
- **THEN** la herramienta informa de que no hay tarjeta, no crea ninguna y el archivado continúa

### Requirement: Identificación inequívoca de la tarjeta

La herramienta SHALL identificar la tarjeta por el id del change como token completo del título, delimitado por caracteres que no sean letras, dígitos o guiones.

#### Scenario: Coincidencia parcial

- **WHEN** el tablero contiene una tarjeta con `[integrar-kanban]` y se sincroniza `integrar-kanban-openspec`
- **THEN** esa tarjeta no se considera coincidencia y no se modifica

#### Scenario: Varias coincidencias

- **WHEN** más de una tarjeta del tablero contiene el id del change como token
- **THEN** la herramienta no modifica ninguna tarjeta, enumera los candidatos y termina con error

### Requirement: Configuración sin secretos en el repositorio

La herramienta SHALL leer la URL base, el id del tablero y los nombres de las listas de un fichero de configuración versionado, y SHALL obtener el token de `kan_API_KEY` desde el entorno, sin escribirlo ni mostrarlo en la salida.

#### Scenario: Falta el token

- **WHEN** se ejecuta la herramienta sin `kan_API_KEY`
- **THEN** falla antes de hacer peticiones de red con un mensaje que indica cómo definirla y no imprime ningún secreto

#### Scenario: Lista configurada inexistente

- **WHEN** el tablero no tiene una lista con el nombre configurado para una transición
- **THEN** la herramienta informa del nombre que falta y de las listas disponibles, y no modifica ninguna tarjeta

### Requirement: Descubrimiento de identificadores

La herramienta SHALL ofrecer un modo de consulta que enumere los workspaces accesibles, sus tableros y las listas de un tablero, para configurar el fichero sin adivinar identificadores.

#### Scenario: Consulta del tablero

- **WHEN** se ejecuta el modo de descubrimiento con credenciales válidas
- **THEN** la salida muestra el id de cada tablero y, para el tablero indicado, el nombre y el id de cada lista, sin crear ni mover tarjetas

### Requirement: Fallo de sincronización no bloqueante

Un fallo al sincronizar el tablero SHALL NOT interrumpir el flujo de OpenSpec: la herramienta termina con error, el agente muestra el mensaje y el propose o el archivado continúan.

#### Scenario: Error de credenciales durante el propose

- **WHEN** la API responde con un error de autenticación al crear un change
- **THEN** el agente informa del error y la creación del change y sus artefactos se completan igualmente

#### Scenario: Error de red durante el archivado

- **WHEN** la API no responde al archivar un change
- **THEN** el agente informa del error y el archivado, el commit y la PR siguen su curso
