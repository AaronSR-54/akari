# Nube y sincronización (Supabase)

Akari sigue siendo local-first: IndexedDB es la fuente inmediata y la app funciona sin conexión y sin cuenta. La nube es una copia opcional por usuario en Supabase (PostgreSQL + Auth) que permite recuperar los datos en otro dispositivo.

## Puesta en marcha

1. Crea un proyecto en <https://supabase.com/dashboard>.
2. Aplica los archivos de `supabase/migrations/` en orden desde el SQL Editor. El detalle está en [`supabase/README.md`](../../supabase/README.md).
3. Configura Auth con email y contraseña. Para desarrollo puedes desactivar la confirmación de correo.
4. Crea `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

Sin estas variables la app arranca en modo local y el panel de cuenta explica que la nube no está disponible. Nunca uses la `service_role` key en el cliente.

En un worktree, Next.js solo lee el `.env.local` de su propio directorio; créalo allí si vas a probar la nube.

## Arquitectura

```
Pantalla / hook
  → caso de uso (@akari/domain)
    → repositorio con seguimiento (@akari/data · sync/tracked.ts)
      → IndexedDB (Dexie v4)
        → syncState (dirty, deletedAt)
          → motor de sync (sync/engine.ts)
            → CloudGateway (sync/supabase-gateway.ts)
              → Supabase (RLS por auth.uid())
```

- **Dexie v4** añade `syncState` (una fila por entidad con `dirty` y `deletedAt`) y `syncMeta` (`ownerId`, `lastSyncedAt`). Las entidades del dominio no cambian.
- **Repositorios con seguimiento.** `createTrackedRepositories` marca `dirty` en cada `put` y guarda una tumba en cada `delete`. Se usa en `Providers`; los casos de uso no saben que existe la nube.
- **Motor.** Empuja primero los cambios pendientes y después descarga todas las filas del usuario. La descarga es idempotente y se pagina por tablas.
- **Conflictos.** Un cambio local pendiente gana y se empuja; el resto se resuelve con el estado remoto. No hay fusión por campo.
- **Borrados.** Se hacen con `deleted_at` para poder propagarlos. La descarga elimina también la fila local.
- **Propietario.** `syncMeta.ownerId` impide mezclar dos cuentas en el mismo navegador. Para cambiar de cuenta hay que desconectar y restablecer los datos locales.
- **Disparadores.** Inicio de sesión, cambio local (1,5 s), foco/visibilidad, evento `online`, intervalo de 60 s si hay pendientes y botón «Sincronizar ahora».

## Modelo remoto

| Tabla | Contenido |
| --- | --- |
| `profiles` | Perfil público: nombre y divisa por defecto |
| `accounts` | Cuentas personales, conjuntas y depósitos |
| `movements` | Movimientos; `amount_minor` siempre positivo |
| `recurrences` | Suscripciones e ingresos periódicos |
| `installment_plans` | Planes de cuotas |
| `groups` | Grupos y miembros en JSONB |
| `group_expenses` | Gastos de grupo y repartos en JSONB |
| `transfers` | Transferencias y liquidaciones |

Todas las tablas de datos llevan `user_id`, `created_at`, `updated_at` y `deleted_at`. Los identificadores son `text` porque Akari usa ids como `acc_<uuid>` y `demo-acc-day`; la clave primaria es `(user_id, id)` para que dos cuentas puedan subir demos con ids idénticos. Los importes son `bigint` en la unidad menor y las fechas de negocio `date`.

## Seguridad

- RLS activo en todas las tablas con políticas por `auth.uid()`.
- El cliente usa solo la clave anónima; la sesión la gestiona Supabase Auth.
- `user_id` tiene `default auth.uid()` y las políticas comprueban el propietario en lectura, alta, actualización y borrado.
- Verificación manual con dos usuarios en [`supabase/README.md`](../../supabase/README.md).

No hay cifrado de extremo a extremo: Supabase cifra en tránsito y en reposo según su infraestructura, pero el contenido es legible para quien administre el proyecto. No uses datos sensibles reales hasta que exista cifrado de extremo a extremo.

## Onboarding y ajustes

- `/onboarding` mantiene «Empezar vacío» y «Ver con datos de ejemplo» y añade un campo de nombre y una tarjeta opcional para crear cuenta o iniciar sesión.
- Al crear cuenta se suben los datos locales existentes (bootstrap).
- Al iniciar sesión se descargan los de la cuenta; si el dispositivo ya tiene datos, se pide confirmación antes de sustituirlos.
- Si el correo requiere confirmación, se muestra el aviso y la sesión se reanuda al volver desde el enlace.
- `/ajustes` muestra el estado, el último sync, los cambios pendientes, «Sincronizar ahora» y «Desconectar».
- Mientras hay una cuenta conectada, importar una copia, cargar ejemplos y borrar la base local están deshabilitados para no sustituir la nube por accidente. Exportar sigue disponible.

## Cambios de esquema

Cada modificación de la base de datos remota debe entregarse como un archivo nuevo en `supabase/migrations/` con fecha y nombre descriptivo. No se reescriben migraciones ya aplicadas. Actualiza la tabla de orden de `supabase/README.md` y aplica el archivo antes de desplegar el código que lo usa.

## Pruebas

- `packages/data/src/sync/*.test.ts` cubre el mapeo, el bootstrap, el empuje, la descarga, los conflictos y la propagación de borrados con un gateway en memoria.
- Los E2E no requieren Supabase: sin variables de entorno, la app arranca en local y la tarjeta de nube muestra el estado «Sin configurar».
- Prueba manual recomendada: dos navegadores con la misma cuenta, crear un movimiento en uno y comprobar que aparece en el otro al recuperar el foco.

## Limitaciones actuales

- Sin grupos compartidos entre usuarios, invitaciones ni permisos por grupo.
- Sin cifrado de extremo a extremo.
- Sin resolución de conflictos por campo ni historial de versiones.
- Descarga completa por tabla; si el volumen crece, se añadirá un cursor incremental.
- Las tumbas remotas no se limpian automáticamente.
- El modo demo y la importación de copias no están disponibles con una cuenta conectada.
