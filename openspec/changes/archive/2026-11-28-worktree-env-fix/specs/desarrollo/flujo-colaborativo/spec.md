# Spec Delta

## ADDED Requirements

### Requirement: Aislamiento de paquetes del workspace en el worktree

Cada worktree SHALL resolver los paquetes `@akari/*` al código contenido en ese worktree para desarrollo, compilación, tipos y E2E, y SHALL NOT resolverlos al checkout principal ni a otro worktree. La resolución de las pruebas SHALL coincidir con la de la aplicación.

#### Scenario: Código del worktree en desarrollo

- **WHEN** se modifica un fichero de `packages/*` en un worktree y se arranca `dev:worktree` o `preview:worktree`
- **THEN** la aplicación sirve el código modificado del worktree y no la copia del checkout principal

#### Scenario: Build, tipos y E2E coherentes

- **WHEN** se ejecutan `typecheck`, `build` o E2E en un worktree
- **THEN** `@akari/*` se resuelve a los ficheros de ese worktree en todas las herramientas, incluidas las pruebas

#### Scenario: Worktrees paralelos

- **WHEN** dos worktrees con ramas distintas arrancan al mismo tiempo
- **THEN** cada uno usa sus propios paquetes `@akari/*` y ninguno lee el código del otro ni el de `main`

#### Scenario: Dependencias externas reutilizables

- **WHEN** se inspecciona `node_modules` de un worktree recién creado
- **THEN** las dependencias de terceros pueden reutilizarse del checkout principal sin que ello redirija los paquetes `@akari/*` fuera del worktree

## MODIFIED Requirements

### Requirement: CI obligatoria en cada PR

Cada PR SHALL ejecutar en CI las verificaciones de tipos, lint, pruebas unitarias, build y E2E. Un fallo SHALL impedir el merge mientras la rama no esté corregida. La CI SHALL usar una versión de Node compatible con `engines` y SHALL conservar trazas o informes cuando E2E falle. Las pruebas que lancen muchos subprocessos SHALL declarar un presupuesto de tiempo explícito acorde con su coste, de modo que la carga de la máquina no produzca falsos fallos.

#### Scenario: PR correcta

- **WHEN** se abre una PR con todos los cambios y pruebas
- **THEN** la CI ejecuta `typecheck`, `lint`, `test`, `build` y E2E y los cinco pasos terminan correctamente

#### Scenario: Fallo de tipos o lint

- **WHEN** una PR introduce un error de tipos o de lint
- **THEN** la CI falla y la PR no se considera lista para merge

#### Scenario: Fallo de E2E

- **WHEN** un flujo E2E falla en la CI
- **THEN** la CI conserva las trazas o el informe del fallo y la PR no se considera lista para merge

#### Scenario: Push posterior

- **WHEN** se añade un commit a una PR ya abierta
- **THEN** la CI vuelve a ejecutar las verificaciones sobre el nuevo HEAD

#### Scenario: Verificación estable bajo carga

- **WHEN** se ejecuta en CI una prueba que crea repositorios temporales y lanza múltiples subprocessos de Git
- **THEN** la prueba usa un límite de tiempo explícito y suficiente para completarse con CPU o E/S cargadas, sin depender del valor implícito de 5 segundos

### Requirement: Entorno e identidad sin secretos compartidos

El flujo SHALL leer `kan_API_KEY` y `kan_CURRENT_USER` del `.env` del checkout principal y SHALL NOT copiar ese fichero a los worktrees. La configuración versionada SHALL seguir sin secretos y cada persona SHALL usar su propia identidad de Kan. Cuando no pueda resolver el directorio común de Git, la herramienta SHALL fallar con un mensaje accionable y SHALL NOT buscar el `.env` en el worktree ni usar valores del entorno local del worktree como sustituto silencioso.

#### Scenario: Worktree sin secretos

- **WHEN** se inspecciona un worktree recién creado
- **THEN** no contiene `.env` ni el token, y la herramienta puede sincronizar Kan leyendo el `.env` del checkout principal

#### Scenario: Identidad por persona

- **WHEN** dos personas de la misma máquina ejecutan claims en worktrees distintos
- **THEN** cada una usa el `kan_CURRENT_USER` de su propio checkout principal y las tarjetas quedan asignadas a la persona correcta

#### Scenario: Token no visible

- **WHEN** la herramienta falla o imprime la ruta del worktree
- **THEN** la salida no contiene el valor de `kan_API_KEY` ni el contenido de `.env`

#### Scenario: Directorio común de Git no disponible

- **WHEN** se ejecuta una operación de Kan desde un worktree y no se puede resolver el directorio común de Git
- **THEN** la herramienta falla antes de hacer peticiones de red con un mensaje que indica cómo configurar el entorno, sin leer un `.env` del worktree ni revelar secretos
