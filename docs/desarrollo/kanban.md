# Kan.bn: tarjetas por change

`scripts/kan-sync.mjs` mantiene el tablero autoalojado de Kan.bn sincronizado con el ciclo de vida de los changes de OpenSpec: al proponer un change su tarjeta pasa a **IN PROGRESS** y al archivarlo pasa a **DONE**. No hay sincronización en sentido contrario.

## Requisitos

- Node.js ≥ 20.9 (el mismo mínimo del repositorio).
- Un token de Kan.bn creado en **Settings → API → Create new key**. Solo se muestra una vez.
- Un `.env` en la raíz del checkout con la convención `kan_`:

  ```bash
  kan_API_KEY=kan_...
  kan_CURRENT_USER=tu@email.com
  ```

  `kan_CURRENT_USER` es el email de un miembro activo del workspace y determina a quién se asigna la tarjeta. Si se omite, se usa la persona dueña del token.

  `.env` está ignorado por git. Un worktree no hereda ficheros sin seguimiento: copia el `.env` al worktree activo antes de ejecutar el script.

- Un `.env.example` versionado documenta las dos variables; el token y el email reales nunca se commitean.

## Configuración

`kan.config.json` se versiona y no contiene secretos:

```json
{
  "baseUrl": "https://kan.example.com/api/v1",
  "boardPublicId": "pzfz4njgyrkf",
  "lists": { "todo": "TO DO", "inProgress": "IN PROGRESS", "done": "DONE" }
}
```

- `baseUrl` termina en `/api/v1`.
- `boardPublicId` y los nombres de lista se obtienen con `discover`.
- Las listas se resuelven por nombre, así que recrear una lista con el mismo nombre no rompe la configuración.

## Descubrir identificadores

```bash
node scripts/kan-sync.mjs discover --base-url https://kan.example.com/api/v1
node scripts/kan-sync.mjs discover --board <boardPublicId>
node scripts/kan-sync.mjs discover --board <boardPublicId> --json
```

La primera ejecución solo necesita `--base-url` (o `kan_BASE_URL`); el resto ya lee la URL de `kan.config.json`. La salida enumera workspaces, tableros, listas y miembros activos con sus `publicId` para rellenar la configuración.

## Uso diario

```bash
# Al crear el change: crea la tarjeta en TO DO si falta, la asigna y la mueve a IN PROGRESS.
node scripts/kan-sync.mjs start integrar-kanban-openspec

# Al archivar: mueve la tarjeta a DONE sin crear duplicados.
node scripts/kan-sync.mjs done integrar-kanban-openspec

# Revisar el movimiento sin escribir en el tablero.
node scripts/kan-sync.mjs start integrar-kanban-openspec --dry-run
node scripts/kan-sync.mjs done integrar-kanban-openspec --dry-run
```

Opciones útiles:

| Opción | Para qué |
| --- | --- |
| `--title "texto"` | Título legible al crear la tarjeta: `[<change-id>] texto`. |
| `--card <publicId>` | Fija la tarjeta y evita la búsqueda por título. |
| `--dry-run` | Resuelve listas, tarjeta y persona, y muestra la acción sin escribir. |
| `--config <ruta>` / `--env <ruta>` | Usa otra configuración o otro `.env`. |
| `--timeout <ms>` | Timeout por petición (10 000 ms por defecto). |

## Comportamiento

- La tarjeta se identifica porque el título contiene el id del change como token completo, sin distinguir mayúsculas: `[integrar-kanban-openspec]` coincide, `[integrar-kanban]` no.
- Si hay varias tarjetas candidatas, el script no toca ninguna, las enumera y falla; usa `--card` para desambiguar.
- `start` crea la tarjeta en la lista `todo` y la mueve a `inProgress`. Es idempotente: repetirlo no duplica tarjetas ni peticiones de asignación.
- `done` solo mueve tarjetas existentes; si no encuentra ninguna, avisa y falla sin crear nada.
- La asignación usa el endpoint de miembros, que alterna: el script solo llama si la persona no está ya en la tarjeta, y no retira a nadie más.
- Salida: una línea por acción y código 0; los errores van a stderr con código 1. El token nunca se imprime.

## Problemas frecuentes

| Síntoma | Causa y arreglo |
| --- | --- |
| `Falta kan_API_KEY` | No hay `.env` en la raíz del checkout o falta la variable. En un worktree, copia el `.env`. |
| `kan_API_KEY no es válida o ha sido revocada` | Genera otra clave en Settings → API y actualiza `.env`. |
| `No se pudo conectar con …` | La instancia no es accesible (VPN/Tailscale caída) o la URL no termina en `/api/v1`. |
| `No hay un miembro activo con el email …` | `kan_CURRENT_USER` no coincide con ningún miembro activo; revisa `discover --board <id>`. |
| `No existe la lista "…"` | El nombre configurado no está en el tablero; la salida enumera las listas disponibles. |
| `Hay N tarjetas que coinciden …` | Varias tarjetas contienen el id; usa `--card <publicId>` o deja una sola. |

## Seguridad

El token actúa con los permisos de tu usuario y no admite ámbitos reducidos. Mantenlo solo en `.env` (ignorado por git) y revócalo desde Settings → API si se filtra. `kan.config.json` no debe contener claves ni datos personales.
