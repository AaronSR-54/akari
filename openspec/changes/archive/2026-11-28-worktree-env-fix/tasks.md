# Tasks

## 1. Aislamiento de paquetes `@akari/*` por worktree

- [x] 1.1 Reescribir `linkNodeModules` en `scripts/kan-sync.mjs` para crear `worktree/node_modules` como directorio real con un symlink por entrada del principal excepto `@akari`, y `@akari/*` enlazado a los paquetes del worktree; verificar con una prueba en `scripts/kan-sync.test.mjs` que use directorios temporales y compruebe los realpath de los enlaces.
- [x] 1.2 Hacer que `linkNodeModules` detecte y sustituya el symlink heredado de `node_modules` y sea idempotente sobre el layout nuevo; verificar con pruebas que cubran ambos estados iniciales y una segunda llamada sin cambios.
- [x] 1.3 Comprobar en este worktree que `import.meta.resolve('@akari/domain')`, `@akari/tokens`, `@akari/ui` y `@akari/data` devuelven rutas dentro de `worktree-env-fix` y no del checkout principal; verificar con un comando `node --input-type=module -e ...`.
- [x] 1.4 Actualizar `docs/desarrollo/flujo-colaborativo.md` para describir el nuevo enlazado y que las dependencias se instalan en el checkout principal; verificar que el texto ya no recomienda enlazar todo `node_modules` ni copiar `.env` al worktree.

## 2. Configuración sin secretos desde el checkout principal

- [x] 2.1 Cambiar `resolveMainRoot` en `scripts/lib/config.mjs` para lanzar `KanSyncError` con mensaje accionable cuando falle `git rev-parse --git-common-dir` o no devuelva una ruta; verificar con pruebas en `scripts/config.test.mjs` que inyecten un runner que falla y que devuelve un objeto sin `stdout`.
- [x] 2.2 Resolver `--env` relativo contra la raíz del checkout principal en `scripts/kan-sync.mjs`, manteniendo que las variables del entorno ganan sobre el fichero; verificar con una prueba que use un worktree simulado y otra que compruebe que el mensaje de error no contiene tokens.
- [x] 2.3 Ejecutar `node scripts/kan-sync.mjs whoami` desde este worktree y verificar que lee la identidad del checkout principal sin crear ni copiar un `.env` en el worktree.

## 3. Publicación atómica estable bajo carga

- [x] 3.1 Asignar un timeout explícito de 30 s a la prueba de publicación atómica en `scripts/workflow.test.mjs`, sin cambiar `test.testTimeout` global; verificar que `npm test -- scripts/workflow.test.mjs` termina correctamente.
- [x] 3.2 Añadir un timeout por subprocesso al helper `git(...)` de la prueba y a `execGit` en `scripts/lib/workflow.mjs`, identificando el comando en el error; verificar con una prueba que simule un subprocesso lento o que compruebe la opción pasada al runner inyectado.
- [x] 3.3 Ejecutar `npm test -- scripts/workflow.test.mjs` tres veces seguidas y verificar que las tres pasan sin timeouts.

## 4. Verificación integral del change

- [x] 4.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` en el worktree y verificar que los cuatro terminan sin errores.
- [x] 4.2 Ejecutar `npm run e2e:worktree` y verificar que los tests E2E pasan usando el puerto asignado al worktree (verificado con `CI=1`: 222 pasados, 12 omitidos, 0 fallos; en local sin reintentos hay flakiness preexistente de timing en `shell.spec.ts`).
- [x] 4.3 Ejecutar `node scripts/kan-sync.mjs check worktree-env-fix` y verificar que avisa de los ficheros compartidos tocados antes de abrir la PR.

## Workflow follow-up

- Archivar el change en la rama `worktree-env-fix` tras la revisión, deteniendo el frontal con `npm run preview:worktree:stop`.
- Crear la PR contra `main` con `node scripts/kan-sync.mjs pr-body worktree-env-fix` y `gh pr create`, sin mergear ni cerrar.
- Ejecutar `node scripts/kan-sync.mjs done worktree-env-fix --pr <url>` para mover las tres tarjetas a Done.
- Conservar el worktree hasta que una persona confirme el merge; entonces ejecutar `node scripts/kan-sync.mjs cleanup worktree-env-fix`.
