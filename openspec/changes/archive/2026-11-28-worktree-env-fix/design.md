# Design

## Context

Ver `proposal.md` para la motivación. Tres hechos del estado actual condicionan el enfoque:

- `linkNodeModules` (`scripts/kan-sync.mjs`) crea un único symlink de `worktree/node_modules` a `mainRoot/node_modules`. Los enlaces workspace de ese árbol (`@akari/domain -> ../../packages/domain`, etc.) son relativos al checkout principal, de modo que `import.meta.resolve('@akari/domain')` desde un worktree devuelve `main/packages/domain/src/index.ts`. Vitest, en cambio, ya aplica alias a `packages/*` del worktree (`vitest.config.ts`), así que las pruebas pueden pasar mientras la app usa código de `main`.
- `resolveMainRoot` (`scripts/lib/config.mjs`) ya usa `git rev-parse --path-format=absolute --git-common-dir`, pero devuelve `ROOT` (el worktree) en silencio si el comando falla o el resultado no es una cadena. El bug de la tarjeta ya está arreglado en el camino feliz; queda el fallback silencioso y la resolución de `--env` relativa al `cwd`.
- La prueba de publicación atómica (`scripts/workflow.test.mjs`) no define timeout: hereda los 5 s por defecto de Vitest mientras lanza ~25 procesos Git secuenciales.

## Goals / Non-Goals

**Goals:**
- Que el código de `@akari/*` que consumen desarrollo, build, tipos, pruebas y E2E sea siempre el del worktree activo.
- Que la configuración y las credenciales se lean del checkout principal o fallen de forma explícita, nunca del worktree por accidente.
- Que la verificación de la publicación atómica tenga un presupuesto determinista y mensajes de error claros por subprocesso.

**Non-Goals:**
- Instalar `node_modules` completo dentro de cada worktree (`npm ci`): las dependencias de terceros siguen reutilizándose del principal.
- Cambiar la semántica de `claim`, las reglas de Kan, los puertos ni el frontal de revisión.
- Añadir alias en `next.config.mjs`, `tsconfig*.json` o `vitest.config.ts`: la corrección se hace en el propio árbol de módulos.

## Decisions

1. **`node_modules` propio por worktree con enlaces por entrada.** `linkNodeModules` crea `worktree/node_modules` como directorio real, symlinka cada entrada del `node_modules` principal excepto `@akari`, y crea `worktree/node_modules/@akari` con symlinks a `worktree/packages/{domain,data,tokens,ui}` y `worktree/apps/web`. Como la resolución de Node sigue symlinks hasta su realpath, todos los consumidores —Next, TypeScript, Vitest, scripts— ven el código del worktree sin tocar configuraciones por herramienta.
   - Alternativa descartada: `npm ci` en cada worktree. Coste de instalación y divergencia del lockfile en cada claim; además rompe el flujo de puertos compartidos.
   - Alternativa descartada: solo alias de webpack/TypeScript. Deja `node_modules/@akari` apuntando a `main` para cualquier consumidor no configurado (scripts, `npm exec`), que es justo el fallo observado.
   - Las entradas `.bin`, scoped (`@types/...`) y ficheros sueltos se enlazan tal cual; no se copian ni se reescriben.

2. **Detección y sustitución del enlace heredado.** Si `worktree/node_modules` ya es un symlink al `node_modules` principal (worktrees creados antes de este change), `linkNodeModules` lo sustituye por el nuevo layout. La operación es idempotente: si el directorio ya tiene el layout correcto no hace nada. Así `claim`/`resume` repara worktrees antiguos sin intervención manual.

3. **Fallo explícito al resolver el entorno.** `resolveMainRoot` lanza `KanSyncError` con un mensaje que indica cómo definir `kan_API_KEY`/`kan_CURRENT_USER`, en lugar de caer en `ROOT`. `readEnv` mantiene que el entorno del proceso gana sobre el fichero, pero una ruta relativa de `--env` se resuelve contra la raíz del checkout principal, no contra el `cwd` del worktree. El mensaje nunca incluye el valor del token ni el contenido del `.env`.

4. **Presupuesto explícito en la prueba atómica, no global.** La prueba `it(...)` recibe un timeout propio (30 s, alineado con `packages/ui/src/dates.test.ts`) y el helper `git(...)` de la prueba, además de `execGit` en `scripts/lib/workflow.mjs`, usan un `timeout` por subprocesso. No se sube `test.testTimeout` global: eso enmascararía hangs reales en el resto de la suite.

5. **Pruebas de regresión sin worktree real.** Se usan directorios temporales para comprobar el layout de enlaces de `linkNodeModules` y runners inyectados para los casos de error de `resolveMainRoot`/`--env`. Una prueba end-to-end con `git worktree add` sería lenta y frágil en CI; el comportamiento real se comprueba además en el worktree del propio change con `npm run typecheck`, `npm run build`, `npm test` y `npm run e2e:worktree`.

## Risks / Trade-offs

- **[Riesgo] `npm` puede reescribir los symlinks de `@akari/*` si se ejecuta `npm install` dentro del worktree.** → Mitigación: documentar que las dependencias se instalan en el checkout principal; `linkNodeModules` vuelve a crear el layout al reclamar/reanudar.
- **[Riesgo] En sistemas Windows los symlinks pueden fallar.** → Mitigación: se mantiene el `try/catch` actual; si no se puede enlazar, el worktree puede instalar sus propias dependencias, y la prueba de regresión comprueba el layout solo donde los symlinks están disponibles.
- **[Riesgo] Sustituir un `node_modules` symlink heredado puede dejar processes con el frontal abierto apuntando al directorio viejo.** → Mitigación: el helper de preview ya detiene y reanuda el frontal; la sustitución solo ocurre al crear/reanudar el worktree.
- **[Riesgo] Un timeout de 30 s sigue siendo insuficiente en una CI muy cargada.** → Mitigación: timeout por subprocesso con mensaje identificando el comando; si vuelve a fallar, se ajusta el valor declarado sin tocar el resto de la suite.
- **[Trade-off] Se tocan `scripts/` y documentación de flujo, marcados como ficheros compartidos.** → Mitigación: un solo change, una sola PR, y `check` antes de abrirla; merge en serie.

## Migration Plan

1. Implementar el nuevo `linkNodeModules` y los cambios de configuración con sus pruebas.
2. Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e:worktree` en este worktree, comprobando con `import.meta.resolve` que `@akari/*` apunta a `worktree-env-fix`.
3. Verificar `node scripts/kan-sync.mjs whoami` desde el worktree: debe leer el `.env` del checkout principal sin copiar secretos.
4. Archivar, abrir PR y merger en serie; los worktrees antiguos se reparan solos al reclamarlos de nuevo. Rollback: sustituir `worktree/node_modules` por el symlink anterior al checkout principal; no hay datos que perder.

## Open Questions

Ninguna.
