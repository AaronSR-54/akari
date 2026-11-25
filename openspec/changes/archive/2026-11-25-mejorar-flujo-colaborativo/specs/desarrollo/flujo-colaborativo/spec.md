# Spec Delta

## Purpose

Define el ciclo de trabajo paralelo entre la cola de Kan.bn, OpenSpec, los worktrees de Git, las sesiones de OpenCode y las PR de GitHub, para que varias personas avancen a la vez sin compartir rama ni working tree.

## MODIFIED Requirements

### Requirement: Un claim, una rama y un worktree

Cada claim SHALL crear una rama llamada exactamente `<change-id>` (sin prefijo) desde `main` actualizado y un worktree propio fuera del checkout principal, sin tocar el checkout principal ni compartir rama entre claims.

#### Scenario: Creación del worktree

- **WHEN** se reclama un change desde `main` limpio
- **THEN** existe una rama `<change-id>` y un worktree nuevo asociado a ella, ambos visibles con `git worktree list`

#### Scenario: Checkout principal intacto

- **WHEN** termina un claim
- **THEN** el checkout principal sigue en `main` y no contiene ficheros modificados por el claim

#### Scenario: Reutilización de rama

- **WHEN** ya existe una rama `<change-id>` que no pertenece al mismo claim
- **THEN** la herramienta no crea otro worktree ni reutiliza la rama y pide elegir otro id o liberar el claim

#### Scenario: Worktree existente

- **WHEN** la ruta del worktree ya existe y no corresponde al mismo claim
- **THEN** la herramienta se detiene sin sobrescribir ni borrar ese directorio

### Requirement: Puertos aislados por worktree

Cada claim SHALL asignar un puerto de desarrollo y otro E2E guardados en `.opsx/ports.json` e ignorados por Git. Ambos SHALL empezar en 3100: el primer worktree libre lo usa y los demás SHALL tomar el siguiente libre. `E2E_PORT` SHALL ser configurable en CI; los overrides SHALL fallar si el puerto está ocupado.

#### Scenario: Asignación al reclamar

- **WHEN** se crea un claim
- **THEN** el worktree contiene `.opsx/ports.json` con un puerto de desarrollo y otro de E2E, y `claim` imprime ambos y la URL local

#### Scenario: Arranque de desarrollo

- **WHEN** se ejecuta `npm run dev:worktree` en un worktree con puertos asignados
- **THEN** Next arranca en el puerto asignado y la salida muestra la URL local de ese worktree

#### Scenario: E2E por worktree

- **WHEN** se ejecuta `npm run e2e:worktree`
- **THEN** Playwright usa el puerto E2E asignado al worktree y no el de otro worktree

#### Scenario: Dos worktrees en paralelo

- **WHEN** dos worktrees arrancan `dev:worktree` o `e2e:worktree` a la vez
- **THEN** el primero usa 3100, el segundo comprueba que está ocupado y usa el siguiente libre, y ninguno reutiliza ni bloquea el servidor del otro

#### Scenario: Puerto ocupado

- **WHEN** el puerto por defecto 3100 está ocupado por otro worktree al arrancar
- **THEN** el helper elige el siguiente puerto libre (3101, 3102…), lo guarda en `.opsx/ports.json` y no reutiliza el servidor ajeno

#### Scenario: Fichero de puertos ausente

- **WHEN** se ejecuta `dev:worktree` o `e2e:worktree` en un worktree sin `.opsx/ports.json`
- **THEN** el helper asigna puertos libres, escribe el fichero y continúa

#### Scenario: Servidor de desarrollo activo

- **WHEN** se ejecuta `e2e:worktree` mientras hay un frontal activo en el mismo worktree
- **THEN** el helper detiene el frontal, ejecuta E2E en el puerto asignado y lo reanuda al terminar, sin lanzar un segundo Next sobre el mismo `.next`

#### Scenario: Puertos forzados

- **WHEN** se pasa `--dev-port` o `--e2e-port` a `claim` o a los helpers
- **THEN** se usa el valor indicado si está libre y se falla con un mensaje claro si no lo está

#### Scenario: Valores por defecto en CI

- **WHEN** no se define `E2E_PORT` ni existe `.opsx/ports.json`, como en CI
- **THEN** E2E usa el puerto por defecto 3100 y el flujo de una sola persona sigue funcionando

#### Scenario: Primer change

- **WHEN** se reclama o arranca el primer worktree y el puerto 3100 está libre
- **THEN** desarrollo y E2E empiezan desde 3100, sin desplazamiento por hash del change id

#### Scenario: Puertos no versionados

- **WHEN** se inspecciona el estado de Git después de reclamar o arrancar un servidor
- **THEN** `.opsx/ports.json` no aparece como cambio pendiente ni se commitea

## ADDED Requirements

### Requirement: Convención de nombres en inglés

El id del change SHALL ser corto (≤30 caracteres), en inglés, en minúsculas y separado por guiones; la rama SHALL usar ese mismo id sin prefijo. Los mensajes de commit generados por la herramienta SHALL estar en inglés y la documentación SHALL exigir inglés para los commits manuales. La herramienta SHALL rechazar ids que superen los 30 caracteres o contengan caracteres distintos de `a-z0-9` y guiones.

#### Scenario: Id derivado de un título largo

- **WHEN** la tarjeta se llama «fix: mover el título de la página al header cuando estamos en la vista sidebar» y no se pasa `--change`
- **THEN** el id propuesto no supera 30 caracteres y la persona puede sustituirlo por uno corto en inglés con `--change`

#### Scenario: Id inválido

- **WHEN** se pasa un `--change` con más de 30 caracteres, acentos o mayúsculas
- **THEN** la herramienta falla antes de crear rama, worktree ni tarjeta con un mensaje que explica la convención

#### Scenario: Mensajes de commit

- **WHEN** `claim`, `link` o `done` crean un commit
- **THEN** el mensaje está en inglés y `release` sigue reconociendo los commits del claim

### Requirement: Aislamiento de sesiones de OpenCode

Cada worktree SHALL abrirse en su propia sesión de OpenCode mediante `opencode <ruta>` o moviendo la sesión actual. Varias sesiones SHALL poder trabajar en paralelo en worktrees distintos sin compartir ficheros, rama ni índice de Git.

#### Scenario: Dos tareas en paralelo

- **WHEN** dos personas reclaman dos changes distintos
- **THEN** cada claim imprime una ruta de worktree distinta y cada persona puede abrir su propia sesión en esa ruta

#### Scenario: Sesión en el worktree correcto

- **WHEN** una sesión de OpenCode trabaja en un claim
- **THEN** su directorio de trabajo es el worktree del claim y no el checkout principal

#### Scenario: Cambios aislados

- **WHEN** una sesión modifica ficheros en su worktree
- **THEN** la otra sesión no ve esos cambios en su worktree ni en `main`

#### Scenario: Rama compartida

- **WHEN** dos sesiones intentan trabajar en el mismo claim
- **THEN** la segunda recibe un aviso de que el worktree ya está en uso y no se le asigna otro branch

### Requirement: Ciclo de PR y archivo

El flujo SHALL archivar el change en su rama, commitear solo el alcance del change, publicar la rama, abrir una PR a `main` y después mover las tarjetas a Done. El agente SHALL NOT mergear ni cerrar la PR; la revisión y el merge SHALL quedar en manos de una persona.

#### Scenario: PR tras archivar

- **WHEN** un change se archiva y se publica
- **THEN** la PR se abre contra `main` con el id del change en el título y las tarjetas vinculadas en el cuerpo

#### Scenario: Sin merge automático

- **WHEN** el agente termina el flujo
- **THEN** la PR queda abierta y el agente informa su URL sin mergearla ni cerrarla

#### Scenario: Alcance del commit

- **WHEN** se commitea un change
- **THEN** el commit incluye el change archivado, sus deltas de specs, el código y las pruebas, y excluye `docs/diseno/`, `design/` y `openspec/specs/diseno/*`

#### Scenario: Trabajo ajeno en el worktree

- **WHEN** el worktree contiene cambios que no pertenecen al change
- **THEN** el flujo se detiene y pide separarlos antes de commitear

### Requirement: CI obligatoria en cada PR

Cada PR SHALL ejecutar en CI las verificaciones de tipos, lint, pruebas unitarias, build y E2E. Un fallo SHALL impedir el merge mientras la rama no esté corregida. La CI SHALL usar una versión de Node compatible con `engines` y SHALL conservar trazas o informes cuando E2E falle.

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

### Requirement: Plantilla de PR

Cada PR SHALL rellenar una plantilla versionada con el id del change, las tarjetas vinculadas, el resumen, los deltas de specs, el resultado de las verificaciones y una lista de comprobación. La plantilla SHALL recordar que el diseño está congelado y que un change usa una sola rama y una sola PR.

#### Scenario: PR de un change agrupado

- **WHEN** el change agrupa tres tarjetas
- **THEN** la plantilla enumera las tres tarjetas y explica por qué forman un solo change

#### Scenario: Verificaciones declaradas

- **WHEN** se abre la PR
- **THEN** el cuerpo indica el resultado de `typecheck`, `lint`, `test`, `build` y E2E, o el motivo por el que E2E no aplica

#### Scenario: Diseño congelado

- **WHEN** el autor revisa la lista de comprobación
- **THEN** la plantilla le recuerda no incluir cambios en `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`

### Requirement: Frontal de revisión gestionado por el agente

El agente SHALL arrancar el frontal al aplicar el change y SHALL detenerlo al archivar, sin intervención de la persona. `npm run preview:worktree` SHALL ejecutar el servidor en segundo plano, guardar url, puerto y pid en `.opsx/preview.json` (ignorado) y ofrecer `status` y `stop`; `/opsx-apply` y `/opsx-archive` SHALL incluir esos pasos.

#### Scenario: Aplicar un change

- **WHEN** el agente empieza a aplicar un change en su worktree
- **THEN** arranca el frontal en segundo plano, imprime la URL local y `.opsx/preview.json` contiene el proceso

#### Scenario: Revisión lista

- **WHEN** el change está pendiente de validación para archivarse
- **THEN** la URL del frontal sigue disponible sin que la persona haya tenido que arrancar nada

#### Scenario: Archivar

- **WHEN** el agente archiva el change
- **THEN** detiene el proceso del frontal, borra `.opsx/preview.json` y el puerto queda libre

#### Scenario: Archivado por otra vía

- **WHEN** el change se archiva sin pasar por `/opsx-archive`
- **THEN** `done` intenta detener el frontal y, si falla, avisa sin bloquear el cierre

#### Scenario: Frontal no versionado

- **WHEN** se inspecciona `git status` con el frontal activo
- **THEN** ni `.opsx/preview.json` ni `.opsx/preview.log` aparecen como cambios pendientes

### Requirement: Conflictos y orden de aterrizaje

El flujo SHALL evitar que dos PR de archivado compitan por los mismos ficheros de specs: solo una PR de archivado SHALL estar lista para merge a la vez, o cada una SHALL rebasar sobre `main` actualizado antes de pedir revisión. Los cambios en ficheros compartidos SHALL coordinarse antes de abrir la PR.

#### Scenario: Dos archivados en paralelo

- **WHEN** dos changes terminan a la vez y sus PR tocan los mismos ficheros de specs
- **THEN** solo una se marca como lista y la otra se rebasa y vuelve a ejecutar la CI antes de revisarse

#### Scenario: Rama desactualizada

- **WHEN** `main` avanza después de abrir una PR de archivado
- **THEN** la PR se rebasa o actualiza antes del merge y la CI se vuelve a ejecutar

#### Scenario: Fichero compartido

- **WHEN** un change necesita modificar `AGENTS.md`, `package.json`, `kan.config.json`, la CI o la documentación de flujo
- **THEN** el flujo avisa de que es un fichero compartido y pide coordinarlo antes de abrir la PR

### Requirement: Limpieza de claims y worktrees

Al mergear una PR, el flujo SHALL eliminar el worktree y la rama local, y SHALL borrar las etiquetas de claim. Un claim abandonado SHALL poder liberarse sin dejar ramas, etiquetas ni tarjetas bloqueadas.

#### Scenario: Limpieza tras merge

- **WHEN** una PR de change se mergea y la persona ejecuta la limpieza
- **THEN** el worktree desaparece de `git worktree list`, la rama local se borra y las etiquetas de claim de sus tarjetas ya no existen

#### Scenario: Claim abandonado

- **WHEN** una persona abandona un claim y ejecuta `release`
- **THEN** las tarjetas vuelven a `TO DO`, el worktree se elimina si está limpio y las etiquetas se borran

#### Scenario: Limpieza con trabajo pendiente

- **WHEN** se intenta limpiar un worktree con cambios sin commitear o una rama con una PR abierta
- **THEN** el flujo se niega sin `--force` y enumera lo que impide la limpieza

### Requirement: Entorno e identidad sin secretos compartidos

El flujo SHALL leer `kan_API_KEY` y `kan_CURRENT_USER` del `.env` del checkout principal y SHALL NOT copiar ese fichero a los worktrees. La configuración versionada SHALL seguir sin secretos y cada persona SHALL usar su propia identidad de Kan.

#### Scenario: Worktree sin secretos

- **WHEN** se inspecciona un worktree recién creado
- **THEN** no contiene `.env` ni el token, y la herramienta puede sincronizar Kan leyendo el `.env` del checkout principal

#### Scenario: Identidad por persona

- **WHEN** dos personas de la misma máquina ejecutan claims en worktrees distintos
- **THEN** cada una usa el `kan_CURRENT_USER` de su propio checkout principal y las tarjetas quedan asignadas a la persona correcta

#### Scenario: Token no visible

- **WHEN** la herramienta falla o imprime la ruta del worktree
- **THEN** la salida no contiene el valor de `kan_API_KEY` ni el contenido de `.env`

### Requirement: Agrupación de tareas en un solo change

Cuando varias tarjetas de Kan describan trabajo que se entrega junto, el flujo SHALL permitir reclamarlas como un solo change, con una propuesta, unas specs, una rama y una PR. El cuerpo de la PR SHALL justificar la agrupación y SHALL NOT dejar tarjetas del grupo fuera del archivado.

#### Scenario: Grupo con una sola PR

- **WHEN** se reclaman tres tarjetas relacionadas con `--change`
- **THEN** existe un solo change, una sola rama y una sola PR que las enumera a las tres

#### Scenario: Grupo incompleto

- **WHEN** una tarjeta del grupo no aparece en el manifiesto ni en el cuerpo de la PR
- **THEN** el flujo avisa antes de archivar y no mueve el grupo a Done hasta corregirlo

#### Scenario: Tareas independientes

- **WHEN** dos tarjetas no comparten alcance ni capacidad
- **THEN** el flujo recomienda claims separados y no las agrupa por conveniencia
