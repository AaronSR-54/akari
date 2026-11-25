# Kan.bn: tarjetas por change

`scripts/kan-sync.mjs` conecta la cola de Kan.bn con el ciclo de OpenSpec: reclama tarjetas, las agrupa en un change, las mueve entre listas y las cierra al archivar. El flujo paralelo completo está en [flujo-colaborativo.md](flujo-colaborativo.md).

## Requisitos

- Node.js ≥ 20.9 (el mínimo del repositorio).
- Un token de Kan.bn creado en **Settings → API → Create new key**. Solo se muestra una vez.
- Un `.env` en la raíz del checkout principal:

  ```bash
  kan_API_KEY=kan_...
  kan_CURRENT_USER=tu@email.com
  ```

  `kan_CURRENT_USER` es el email de un miembro activo y determina la identidad con la que se escriben las tarjetas y se firman los comentarios. Es obligatorio: si falta, la herramienta falla antes de escribir y no usa la persona dueña del token. `.env` está ignorado por Git.

- `kan.config.json` versionado, sin secretos:

  ```json
  {
    "baseUrl": "https://kan.example.com/api/v1",
    "boardPublicId": "pzfz4njgyrkf",
    "lists": {
      "todo": "TO DO",
      "inProgress": "IN PROGRESS",
      "done": "DONE",
      "review": "REVIEW"
    }
  }
  ```

  `review` es opcional. Si no existe, `claim`, `done` y `release` funcionan y solo `review` falla con un mensaje claro. `baseUrl` termina en `/api/v1`.

## Comandos

| Comando | Para qué |
| --- | --- |
| `queue` | Consulta de solo lectura: tarjetas libres de `TO DO` y reclamadas. `--json` para agentes. |
| `claim <card...>` | Reclama una o varias tarjetas, crea rama y worktree y las mueve a `IN PROGRESS`. |
| `link <change-id> --cards <card,...>` | Añade tarjetas libres a un claim existente. |
| `review <change-id>` | Mueve las tarjetas del manifiesto a `REVIEW`. |
| `done <change-id> [--pr <url>]` | Mueve las tarjetas a `DONE` y registra la PR. |
| `release <change-id> [--force]` | Abandona el claim: devuelve tarjetas y limpia rama, worktree y etiquetas. |
| `cleanup <change-id> [--pr <url>] [--force] [--dry-run]` | Tras validar el merge con `gh`, borra el worktree y la rama local; conserva etiquetas y rama remota. |
| `pr-body <change-id>` | Imprime un borrador de cuerpo de PR. |
| `check <change-id>` | Avisa si la rama toca ficheros compartidos. |
| `whoami` | Imprime el email y el miembro configurados, sin secretos. |
| `comment <change-id> <texto>` | Comenta la tarjeta del change con el texto firmado por el email configurado. |
| `start <change-id>` | Vía heredada para un change sin claim previo. |
| `discover` | Enumera workspaces, tableros, listas y miembros. |

### Cola

```bash
node scripts/kan-sync.mjs queue
node scripts/kan-sync.mjs queue --json
```

El JSON agrupa `todo` y `claimed`. Cada tarjeta incluye `publicId`, `title`, `list`, `members`, `changeId`, `branch` y `claimable`. `claimable` se calcula contra la identidad actual, así que un agente puede elegir una tarjeta sin comparar correos.

No escribe en el tablero. Los disparadores de agente («revisa la cola», «qué tareas hay», `/kan-queue`…) están en `AGENTS.md`.

### Identidad del agente

```bash
node scripts/kan-sync.mjs whoami
node scripts/kan-sync.mjs comment facturas-panel "Listo para revisar"
```

`whoami` imprime `email`, `memberPublicId` y `name` del miembro configurado en `kan_CURRENT_USER`, nunca el token. `comment` busca la tarjeta por manifiesto, marcador o título y publica el texto precedido de `[<email>]`. Así cada cambio del agente queda identificado con el correo del `.env`, sin correos fijos en el repositorio.

### Reclamar y agrupar

```bash
# Una tarjeta; el id se deriva del título.
node scripts/kan-sync.mjs claim h4isbq13sxo7

# Varias tarjetas en un solo change.
node scripts/kan-sync.mjs claim card-a card-b --change facturas-panel

# Añadir una tarjeta después.
node scripts/kan-sync.mjs link facturas-panel --cards card-c
```

`claim` crea:

- rama `<change-id>` desde `origin/main` (id corto, en inglés y sin prefijo);
- worktree fuera del checkout principal;
- `openspec/changes/<change-id>/workflow.json`;
- `.opsx/ports.json` con los puertos de la máquina;
- etiquetas `claims/<card-id>/<change-id>` y un push atómico.

La primera persona que publica gana. Reintentar el mismo claim es idempotente; una tarjeta de otro claim falla con el change que la posee.

### Revisión, archivo y liberación

```bash
node scripts/kan-sync.mjs review facturas-panel
node scripts/kan-sync.mjs done facturas-panel --pr https://github.com/.../pull/123
node scripts/kan-sync.mjs release facturas-panel --dry-run
node scripts/kan-sync.mjs release facturas-panel
```

`done` se ejecuta después de abrir la PR. Mueve todas las tarjetas del manifiesto, añade la URL a sus descripciones y actualiza `workflow.json`. No mergea la PR: `DONE` significa «archivado y PR abierta».

`release` retira tu asignación, devuelve las tarjetas a `TO DO`, borra el marcador y las etiquetas y limpia el worktree si no hay trabajo pendiente. Sin `--force` se niega si hay una PR abierta o cambios sin commitear.

Para limpiar un change ya mergeado, usa `cleanup` en lugar de `release`:

```bash
node scripts/kan-sync.mjs cleanup facturas-panel --dry-run
node scripts/kan-sync.mjs cleanup facturas-panel
```

`cleanup` consulta `gh pr view` y solo borra el worktree y la rama local cuando la PR tiene `mergedAt`. Si la PR no está mergeada o `gh` falla, termina con error y no modifica Git. No borra etiquetas ni la rama remota y se niega a eliminar el checkout principal. `--force` permite limpiar un worktree con cambios sin commitear.

## Manifiesto

`openspec/changes/<change-id>/workflow.json`:

```json
{
  "changeId": "facturas-panel",
  "branch": "facturas-panel",
  "cards": [
    { "publicId": "card-a", "title": "Mejorar facturas" }
  ],
  "prUrl": null,
  "claimedAt": "2026-11-25T10:00:00.000Z"
}
```

Es la fuente de verdad para `review`, `done`, `release`, `check` y `pr-body`. No contiene tokens, correos ni credenciales; los puertos viven en `.opsx/ports.json`, que está ignorado.

## Entorno y worktrees

`kan-sync` resuelve `.env` así:

1. Si pasas `--env <ruta>`, usa esa ruta.
2. Si no, obtiene el checkout principal con `git rev-parse --path-format=absolute --git-common-dir`.
3. Lee `.env` de ese directorio y da prioridad a las variables ya exportadas.

En un worktree no copies `.env`: se lee del checkout principal. `kan.config.json` sí se versiona y viaja con la rama.

## Puertos

Cada worktree recibe un puerto de desarrollo y otro de E2E en `.opsx/ports.json` (ignorado por Git). Usa:

```bash
npm run dev:worktree
npm run e2e:worktree
```

No ejecutes ambos a la vez en el mismo worktree. Detalles en [flujo-colaborativo.md](flujo-colaborativo.md).

## Descubrir identificadores

```bash
node scripts/kan-sync.mjs discover --base-url https://kan.example.com/api/v1
node scripts/kan-sync.mjs discover --board <boardPublicId>
node scripts/kan-sync.mjs discover --board <boardPublicId> --json
```

La primera ejecución solo necesita `--base-url` (o `kan_BASE_URL`). La salida enumera workspaces, tableros, listas y miembros activos.

## Problemas frecuentes

| Síntoma | Causa y arreglo |
| --- | --- |
| `Falta kan_API_KEY` | No hay `.env` en el checkout principal o falta la variable. |
| `kan_API_KEY no es válida o ha sido revocada` | Genera otra clave y actualiza `.env`. |
| `No se pudo conectar con …` | La instancia no es accesible (VPN/Tailscale) o la URL no termina en `/api/v1`. |
| `No hay un miembro activo con el email …` | `kan_CURRENT_USER` no coincide con un miembro activo; revisa `discover --board <id>`. |
| `No existe la lista "…"` | El nombre configurado no está en el tablero; la salida enumera las disponibles. |
| `La tarjeta … ya está reclamada por el change …` | Otra persona ganó el claim; elige otra tarjeta o libera la anterior. |
| `La rama … ya existe` | Hay una rama de otro claim; usa otro `--change` o libera. |
| `No existe workflow.json` | Ejecuta el comando dentro del worktree del claim. |
| `El puerto … está ocupado` | Otro servidor lo usa; el helper reasigna o pide `--dev-port`/`--e2e-port`. |
| `release` se niega por PR abierta | Cierra la PR o usa `--force` si vas a descartar el trabajo. |

## Seguridad

El token actúa con los permisos de tu usuario y no admite ámbitos reducidos. Mantenlo solo en `.env` (ignorado por Git) y revócalo desde Settings → API si se filtra. `kan.config.json`, `workflow.json` y `.opsx/ports.json` no contienen secretos.
