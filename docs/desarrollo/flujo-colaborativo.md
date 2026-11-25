# Flujo colaborativo: Kan, OpenSpec, worktrees y PR

Este documento describe cómo varias personas —o varias sesiones de OpenCode— trabajan a la vez sin compartir rama, worktree ni índice de Git. La cola vive en Kan.bn, el plan en OpenSpec y la revisión en GitHub.

## Requisitos

- Node.js ≥ 20.9 y `npm` para el runtime; la CI usa Node 24 LTS porque `jsdom 31`/`undici 8` requieren ≥22.19.
- Un `.env` en el checkout principal con `kan_API_KEY` y `kan_CURRENT_USER` (email de un miembro activo). Nunca se commitea.
- `kan.config.json` versionado con la URL de Kan, el tablero y las listas `todo`, `inProgress` y `done`. `review` es opcional.
- `gh` autenticado para abrir PRs y comprobar el estado de una PR al liberar un claim.
- Para `review`, una lista `REVIEW` en el tablero y `lists.review` en la configuración.

## La cola

```bash
node scripts/kan-sync.mjs queue
node scripts/kan-sync.mjs queue --json
```

`queue` es de solo lectura. En texto muestra las tarjetas de `TO DO` con su estado y las reclamadas con su change, rama y persona. En JSON devuelve:

```json
{
  "todo": [
    {
      "publicId": "h4isbq13sxo7",
      "title": "Mejorar el flujo",
      "list": "TO DO",
      "members": [],
      "changeId": null,
      "branch": null,
      "claimable": true
    }
  ],
  "claimed": []
}
```

`claimable` se calcula contra la identidad de `kan_CURRENT_USER`. Los agentes deben usar `queue --json` antes de proponer un claim y no inventar `publicId`. Con `kan-sync whoami` comprueban qué email están usando; con `kan-sync comment <change-id> "<texto>"` escriben comentarios firmados con ese email.

### Disparadores para el agente

En `AGENTS.md` están documentadas estas frases: «revisa la cola», «mira el Kan», «qué tareas hay», «qué puedo hacer», «busca trabajo», «tareas libres», «siguiente tarea», «estado del tablero» y `/kan-queue`. Todas significan: ejecutar `queue --json`, resumir y no escribir en el tablero.

El atajo de OpenCode `/kan-queue` envuelve la misma consulta.

## Reclamar una tarea

```bash
# Una tarjeta: el id se deriva del título.
node scripts/kan-sync.mjs claim h4isbq13sxo7

# Una tarjeta con un id explícito.
node scripts/kan-sync.mjs claim h4isbq13sxo7 --change mejorar-facturas

# Varias tarjetas que se entregan juntas.
node scripts/kan-sync.mjs claim card-a card-b card-c --change mejorar-facturas
```

Si hay más de una tarjeta, `--change` es obligatorio: el id debe describir el grupo. El id del change —y por tanto la rama— es corto (≤30 caracteres), en inglés, minúsculas y con guiones; los commits también van en inglés. No copies el título literal de la tarjeta como id.

Preflight de `claim`:

- las tarjetas existen y están en `TO DO`;
- están libres o asignadas a quien reclama;
- no tienen el marcador de otro change;
- la rama y las etiquetas `claims/<card-id>/<change-id>` no pertenecen a otro claim;
- el change no está archivado.

Después crea:

- rama `<change-id>` desde `origin/main`;
- worktree fuera del checkout principal;
- scaffold de OpenSpec si el change no existe;
- `openspec/changes/<change-id>/workflow.json`;
- `.opsx/ports.json` con los puertos de la máquina;
- un commit de claim;
- una etiqueta por tarjeta y un `git push --atomic` con rama y etiquetas.

La primera persona que publica gana. Si otra intenta la misma tarjeta, falla indicando el change que la posee.

### Agrupar tarjetas

```bash
node scripts/kan-sync.mjs link mejorar-facturas --cards card-d,card-e
```

`link` añade tarjetas libres a un claim existente. Todas comparten el mismo `workflow.json`, la misma rama y la misma PR. Una tarjeta no puede pertenecer a dos claims activos. Si ya está en otro claim, hay que liberarlo primero.

### Dry-run

```bash
node scripts/kan-sync.mjs claim h4isbq13sxo7 --change mejorar-facturas --dry-run
```

Resuelve rama, worktree, puertos y tarjetas sin crear nada.

## Worktree y sesión

El claim imprime:

```text
Change: facturas-panel
Rama: facturas-panel
Worktree: /ruta/a/akari-worktrees/facturas-panel
Puertos: dev=3100 e2e=3100
Abrir: opencode /ruta/a/akari-worktrees/facturas-panel
Dev:   npm run dev:worktree
E2E:   npm run e2e:worktree
Preview: npm run preview:worktree
```

Reglas:

- Una sesión de OpenCode por worktree.
- No edites `main`; el checkout principal se queda limpio.
- No abras dos sesiones sobre el mismo worktree.
- Para otra tarea, reclama otra tarjeta y abre otra sesión en su worktree.
- Si usas el worktree integrado de OpenCode, asegúrate de que apunta a la rama del claim; el flujo canónico usa la ruta que imprime `claim`.

El worktree no contiene `.env`: `kan-sync` lee el del checkout principal a través del directorio común de Git. `node_modules` se enlaza desde el checkout principal; si cambias dependencias, ejecuta `rm -rf node_modules && npm ci` en ese worktree.

## Proponer, aplicar y archivar

Desde el worktree del claim:

```bash
cd /ruta/a/akari-worktrees/mejorar-facturas
opencode .
```

- `/opsx-propose`: si el claim ya creó el scaffold, continúa ese change; no ejecutes `openspec new change` para duplicarlo.
- `/opsx-apply`: abre el frontal con `npm run preview:worktree` antes de implementar las tareas y deja la URL impresa para revisar. No es un paso manual: lo hace el agente.
- `npm run preview:worktree:status`: imprime la URL si el frontal sigue activo. `npm run e2e:worktree` lo detiene y lo reanuda solo.
- `openspec archive`: ejecuta `npm run preview:worktree:stop` y archiva el change en la rama. El frontal se cierra en ese momento.

Antes de commitear:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run e2e        # o npm run e2e:worktree
```

El commit de archivado incluye solo el change, su código y sus pruebas. No incluye `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.

## PR, CI y DONE

```bash
node scripts/kan-sync.mjs pr-body mejorar-facturas
git push -u origin facturas-panel
gh pr create --base main --title "feat(mejorar-facturas): ..." --body-file /tmp/pr.md
```

La plantilla `.github/pull_request_template.md` pide change, tarjetas, resumen, deltas de specs, verificaciones y la lista de comprobación. La CI ejecuta `verify` (`typecheck`, `lint`, `test`, `build`) y `e2e`.

Después de abrir la PR:

```bash
node scripts/kan-sync.mjs done mejorar-facturas --pr https://github.com/.../pull/123
```

`done` mueve todas las tarjetas del manifiesto a `DONE`, añade la URL de la PR a sus descripciones, actualiza `workflow.json` y publica ese cambio en la rama. **No mergea la PR.** `DONE` significa «archivado y PR abierta»; GitHub sigue siendo la fuente de verdad del merge. El agente **no borra el worktree al archivar**: lo conserva hasta que una persona confirme el merge y ejecute la limpieza descrita más abajo.

Si abres una PR antes de archivar:

```bash
node scripts/kan-sync.mjs review mejorar-facturas
```

## Puertos por worktree

Cada claim asigna dos puertos. Ambos empiezan en 3100: el primer worktree lo obtiene libre; si otro worktree ya lo ocupa, se toma el primer puerto libre (3101, 3102…). No hay hash ni rangos separados.

| Uso | Puerto inicial | Ejemplo |
| --- | --- | --- |
| Desarrollo | 3100 | 3100 |
| E2E | 3100 | 3100 |

Se guardan en `.opsx/ports.json`, ignorado por Git. `workflow.json` no los contiene: son específicos de la máquina.

```bash
npm run dev:worktree          # Next en el puerto de desarrollo
npm run e2e:worktree          # Playwright con E2E_PORT del worktree
npm run preview:worktree      # frontal en segundo plano; imprime la URL
npm run preview:worktree:stop # cierra el frontal
```

- `dev:worktree` regenera tokens antes de arrancar.
- `e2e:worktree` usa el puerto E2E del worktree, detiene el frontal antes de correr y lo reanuda al terminar: comparten `.next`.
- Si un puerto está ocupado, el helper reasigna o falla con el puerto en el mensaje.
- `--dev-port` y `--e2e-port` fuerzan un valor; si está ocupado, falla.
- En CI no hay `.opsx/ports.json`: E2E usa `E2E_PORT` o 3100.
- El checkout principal sigue usando `npm run dev` en el puerto 3000.

Ejemplo de dos sesiones:

| Worktree | Dev | E2E |
| --- | --- | --- |
| `facturas-panel` | 3100 | 3100 |
| `login-social` | 3101 | 3101 |

## Conflictos y ficheros compartidos

- La rama aísla el trabajo, pero los archivados escriben en `openspec/specs/**`.
- Deja solo una PR de archivado lista a la vez o rebasa sobre `main` actualizado antes de pedir revisión; vuelve a ejecutar la CI.
- `node scripts/kan-sync.mjs check <change-id>` avisa si la rama toca `AGENTS.md`, `README.md`, `package.json`, `package-lock.json`, `kan.config.json`, `.github/**`, configuración de tests/lint o la documentación de flujo.
- Los changes que tocan esos ficheros se coordinan y se mergean en serie.
- `done` ejecuta el aviso de `check` salvo que pases `--no-check`; no bloquea.

## Limpieza tras el merge y claims abandonados

Archivar deja el worktree intacto a propósito. Cuando una persona confirma que la PR está mergeada, el agente ejecuta:

```bash
node scripts/kan-sync.mjs cleanup facturas-panel
node scripts/kan-sync.mjs cleanup facturas-panel --dry-run
node scripts/kan-sync.mjs cleanup facturas-panel --pr https://github.com/.../pull/123
node scripts/kan-sync.mjs cleanup facturas-panel --force
```

`cleanup` toma la URL de `workflow.json` (o `--pr`) y consulta `gh pr view <url> --json state,mergedAt,headRefName`. Sin `mergedAt`, falla con `PR_NOT_MERGED` y no toca nada; si `gh` no está disponible o no autentica, falla con `GH_UNAVAILABLE`/`GH_PR_FAILED`. Solo con el merge confirmado elimina el directorio del worktree y la rama local (`git branch -d`, con `-D` como respaldo). **No borra las etiquetas `claims/*` ni la rama remota**, y se niega a borrar el checkout principal de `main`. `--dry-run` imprime la acción sin ejecutarla; `--force` permite retirar un worktree con cambios sin commitear. El agente debe esperar a esta validación antes de dar el worktree por limpio.

Las etiquetas `claims/*` se borran al liberar un claim abandonado:

```bash
node scripts/kan-sync.mjs release mejorar-facturas
node scripts/kan-sync.mjs release mejorar-facturas --dry-run
node scripts/kan-sync.mjs release mejorar-facturas --force
```

`release` devuelve las tarjetas a `TO DO`, retira tu asignación, elimina el marcador del change, borra las etiquetas y limpia worktree y rama si no hay trabajo pendiente. Se niega si el change está archivado, hay una PR abierta o el worktree tiene cambios sin commitear, salvo `--force`.

## Configuración de GitHub

La protección de `main` no se puede versionar en el repositorio. Configúrala una vez como administrador:

```bash
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
gh api -X PUT "repos/$REPO/branches/main/protection" --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["verify", "e2e"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
```

Comprueba el resultado:

```bash
gh api "repos/$REPO/branches/main/protection" --jq '.required_status_checks.contexts'
```

Notas:

- La protección de rama puede requerir un plan de GitHub compatible si el repositorio es privado.
- «Require branches to be up to date» es `strict: true`.
- Una merge queue es opcional; si la activas, los checks `verify` y `e2e` deben ser obligatorios.
- No configures Actions para escribir en Kan.bn: el tablero se sincroniza desde el flujo local, que es el que conoce la identidad y el token.

## Problemas frecuentes

| Síntoma | Causa y arreglo |
| --- | --- |
| `Falta kan_API_KEY` | No hay `.env` en el checkout principal o falta la variable. |
| `La tarjeta … ya está reclamada por el change …` | Otra persona ganó el claim. Usa otra tarjeta o libera la anterior. |
| `La rama … ya existe` | Hay un claim o una rama previa. Elige otro `--change` corto en inglés o libera el claim. |
| `La ruta del worktree ya existe` | Quedó un worktree de un intento anterior; límpialo o usa otra ruta. |
| `No existe workflow.json` | Estás en el checkout equivocado; ejecuta el comando dentro del worktree del claim. |
| `El puerto … está ocupado` | Otro servidor lo usa; el helper reasigna o pide `--dev-port`/`--e2e-port`. |
| `e2e:worktree` pide parar el dev | `next dev` y `next build` comparten `.next`; el helper detiene y reanuda el frontal, pero otro `dev:worktree` hay que pararlo antes. |
| `release` se niega por PR abierta | Cierra la PR o usa `--force` si de verdad vas a descartar el trabajo. |
| `openspec new change` falla | El claim ya creó el change; continúa el existente. |

## Seguridad

- El token de Kan solo vive en `.env`, ignorado por Git.
- `workflow.json` guarda ids de tarjetas, títulos, rama y URL de PR; nunca tokens, correos ni credenciales.
- `.opsx/ports.json` es local y está ignorado.
- No copies `.env` a los worktrees: se lee del checkout principal.
- Revoca el token desde Kan si se filtra.
