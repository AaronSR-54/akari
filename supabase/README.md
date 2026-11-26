# Supabase en Akari

La nube de Akari es un proyecto de Supabase (PostgreSQL + Auth). Los datos locales de IndexedDB siguen siendo la fuente inmediata; Supabase guarda una copia sincronizada por usuario.

## 1. Crear el proyecto

1. Entra en <https://supabase.com/dashboard> y crea un proyecto nuevo.
2. Guarda la **URL del proyecto** y la **anon public key** (Settings → API).
3. No uses nunca la `service_role` key en la app: solo la clave anónima, protegida por RLS.

## 2. Aplicar las migraciones

Los archivos se aplican **por orden** y son idempotentes en su mayor parte. Cada cambio futuro del esquema debe añadir un archivo nuevo, sin reescribir los anteriores.

| Orden | Archivo | Contenido |
| --- | --- | --- |
| 1 | `migrations/20261126100000_cloud_schema.sql` | Tablas, columnas e índices |
| 2 | `migrations/20261126100100_cloud_functions.sql` | `updated_at`, triggers y perfil al registrarse |
| 3 | `migrations/20261126100200_cloud_rls.sql` | Row Level Security y permisos |

### Opción A · Editor SQL (recomendada para empezar)

1. Abre **SQL Editor** en el panel de Supabase.
2. Pega el contenido del archivo 1 y pulsa **Run**.
3. Repite con el archivo 2 y después con el archivo 3.
4. Comprueba en **Table Editor** que aparecen las tablas `profiles`, `accounts`, `movements`, `recurrences`, `installment_plans`, `groups`, `group_expenses` y `transfers`.

### Opción B · Supabase CLI

```bash
# En la raíz del repositorio, una vez por máquina.
npx supabase login
npx supabase init   # crea config.toml si aún no existe; no toca migrations/
npx supabase link --project-ref <project-ref>

# Aplica las migraciones pendientes.
npx supabase db push
```

## 3. Configurar Auth

1. En **Authentication → Providers**, deja activado **Email**.
2. Para desarrollo, desactiva **Confirm email** en **Authentication → Sign In / Providers** si quieres entrar sin revisar el correo. Si lo dejas activo, la app muestra el aviso correspondiente y reanuda la sesión al volver desde el enlace.
3. En **Authentication → URL Configuration**, añade la URL donde sirves la app como **Site URL** y como **Redirect URL**:
   - Desarrollo: `http://localhost:3100` y `http://localhost:3100/onboarding` (o el puerto que use `npm run dev:worktree`).
   - Producción: la URL pública de Vercel y su `/onboarding`.
4. La app detecta la sesión en la URL de vuelta y la confirmación de correo vuelve a `/onboarding`; no hace falta una ruta de callback propia.

## 4. Configurar la app

Crea `apps/web/.env.local` (ignorado por Git; Next.js lee los env desde el directorio de la app):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

En un worktree, crea su propio `apps/web/.env.local`. No copies la `service_role` key ni el `.env` de Kan. Usa la **Publishable key** (`sb_publishable_...`) o la **anon public** legacy, nunca una `sb_secret_...`.

Sin estas variables la app arranca en modo local y el panel de cuenta explica que la nube no está disponible.

## 5. Comprobar RLS

Con dos usuarios de prueba:

1. Inicia sesión con el usuario A y crea una cuenta desde la app.
2. En **SQL Editor**, ejecuta:

```sql
select count(*) from public.accounts;
```

Debe devolver solo las filas del usuario autenticado en ese contexto. Para probar desde la API, usa el cliente de la app con la sesión del usuario B y comprueba que `select` devuelve cero filas y que `update`/`delete` no afectan a las filas de A.

3. Verifica que la clave anónima sin sesión no puede leer nada:

```bash
curl "https://<project-ref>.supabase.co/rest/v1/accounts?select=*" \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <anon-key>"
```

Debe devolver `[]` (o un error de permisos), nunca filas.

## 6. Modelo de sincronización

- Cada fila tiene `user_id`, `created_at`, `updated_at` y `deleted_at`.
- El cliente empuja primero los cambios locales pendientes y después descarga todas las filas del usuario.
- Un cambio local pendiente gana sobre el remoto; el resto se resuelve con el último estado remoto.
- Los borrados se hacen con `deleted_at` (borrado lógico) para poder propagarlos.
- No hay grupos compartidos entre usuarios en esta fase: cada cuenta ve solo sus datos.

## 7. Cambios futuros del esquema

Cuando un change necesite tocar la base de datos:

1. Añade un archivo nuevo en `supabase/migrations/` con fecha y nombre descriptivo.
2. Actualiza esta tabla de orden.
3. Aplícalo en el proyecto de Supabase antes de desplegar el código que lo usa.
4. No edites migraciones ya aplicadas en producción.
