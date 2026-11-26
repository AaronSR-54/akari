# Proposal

## Why

Akari nació local-first y sin backend: cada dispositivo guarda sus datos en IndexedDB y no existe forma de recuperarlos si se pierde el navegador ni de verlos desde otro dispositivo. Las dos tarjetas reclamadas (`4meqc4n99j2g` y `6x8444lhgadh`) piden justo eso: guardar los datos en la nube y completar el onboarding con los datos de usuario y perfil.

La nube será Supabase sobre PostgreSQL. La app sigue funcionando sin conexión y sin cuenta; la nube es una capa opcional de continuidad y sincronización entre dispositivos, no un requisito para usar Akari. Cada modificación del esquema remoto quedará en un archivo SQL versionado y aplicable desde el panel de Supabase.

## What Changes

- **Onboarding guiado.** `/onboarding` pasa a ser un asistente visual con stepper y cinco pasos: nombre, divisa principal, día de ingreso opcional, bancos compatibles (paso informativo de CSV) y cuenta opcional en la nube. La primera cuenta y el primer movimiento se crean dentro de la app, guiados desde el resumen y el detalle de cuenta. El perfil se puede editar después en Ajustes.
- **Cuenta y perfil.** Onboarding incorpora un acceso opcional a la nube con email y contraseña (Supabase Auth). Crear cuenta sube los datos locales; iniciar sesión descarga los de la cuenta tras confirmación explícita. El perfil remoto guarda nombre, divisa principal y día de ingreso.
- **Sincronización local-first.** IndexedDB sigue siendo la fuente inmediata. Un motor de sincronización empuja los cambios locales pendientes y descarga los remotos al iniciar sesión, al recuperar el foco, al volver la conexión y al pulsar «Sincronizar ahora». Los cambios locales pendientes ganan; el resto se resuelve con el último cambio remoto.
- **Modelo remoto relacional.** Nueve tablas PostgreSQL (`profiles`, `accounts`, `movements`, `recurrences`, `installment_plans`, `groups`, `group_expenses`, `transfers`) con `user_id`, `updated_at`, `deleted_at`, RLS por usuario, triggers de `updated_at` y creación automática de perfil.
- **Borrados propagables.** Las eliminaciones locales se registran como tumbas y se aplican como borrado lógico en la nube; la descarga elimina también en el dispositivo las filas marcadas como borradas.
- **Panel de cuenta en Ajustes.** Estado de conexión, último sync, cambios pendientes, «Sincronizar ahora», «Desconectar» y edición de nombre, divisa principal y día de ingreso. Exportar copia sigue disponible; importar, cargar demo y reiniciar quedan bloqueados mientras haya una cuenta conectada para no sobrescribir la nube por accidente.
- **Paso informativo de CSV.** El onboarding muestra los bancos soportados con iconos circulares grandes y explica la futura importación como atajo, con una copia de privacidad honesta. No se procesan archivos en este change.
- **Migraciones SQL versionadas.** `supabase/migrations/` contiene un archivo por modificación (esquema, funciones/triggers, RLS y preferencias del perfil) y `supabase/README.md` explica cómo aplicarlas en el proyecto de Supabase.
- **Fuera de alcance:** importación real de CSV y parsers por banco, grupos compartidos entre usuarios reales, invitaciones, cifrado de extremo a extremo, resolución de conflictos por campo y limpieza automática de tumbas.

## Capabilities

### New Capabilities

- `producto/nube-supabase`: cuenta con Supabase Auth, sincronización local-first, aislamiento por usuario, panel de cuenta y migraciones SQL.

### Modified Capabilities

- `producto/datos-locales`: el onboarding recoge nombre, divisa principal y día de ingreso opcional; la primera cuenta y el primer movimiento se guían dentro de la app; al conectar una cuenta el espacio local se vincula a ese usuario y se sincroniza; las operaciones destructivas locales quedan bloqueadas mientras la cuenta está conectada.

## Impact

- Código: `packages/data/src/db.ts` (esquema v4 con `syncState` y `syncMeta`), `packages/data/src/sync/` (mapeo, gateway Supabase y motor), `packages/data/src/repositories.ts` (repositorios con seguimiento), `packages/data/src/lifecycle.ts`, `apps/web/src/lib/supabase.ts`, `apps/web/src/components/cloud-provider.tsx`, `apps/web/src/components/account-panel.tsx`, `apps/web/src/components/pages/onboarding.tsx`, `apps/web/src/components/pages/settings.tsx` y `apps/web/src/components/providers.tsx`.
- Dependencia nueva: `@supabase/supabase-js`.
- Datos: `supabase/migrations/20261126100000_cloud_schema.sql`, `20261126100100_cloud_functions.sql` y `20261126100200_cloud_rls.sql`; `supabase/README.md`.
- Documentación: `docs/desarrollo/nube-supabase.md`, `docs/desarrollo/arquitectura.md`, `docs/desarrollo/desviaciones.md`, `AGENTS.md` y `.env.example`.
- Pruebas: unitarias del mapeo y del motor de sincronización en `packages/data/src/sync/*.test.ts`, unitarias del panel de cuenta y E2E de onboarding y ajustes.
- Sin cambios en `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
