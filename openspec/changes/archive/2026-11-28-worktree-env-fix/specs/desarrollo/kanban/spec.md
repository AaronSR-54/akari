# Spec Delta

## MODIFIED Requirements

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
