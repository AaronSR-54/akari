# Tasks

## 1. Esquema remoto y migraciones SQL

- [x] 1.1 Crear `supabase/migrations/20261126100000_cloud_schema.sql` con las tablas `profiles`, `accounts`, `movements`, `recurrences`, `installment_plans`, `groups`, `group_expenses` y `transfers`, sus columnas, índices y marcas `user_id`, `created_at`, `updated_at` y `deleted_at`; verificar que el archivo se aplica sin errores en un proyecto Supabase vacío.
- [x] 1.2 Crear `supabase/migrations/20261126100100_cloud_functions.sql` con la función `set_updated_at`, el trigger de actualización en cada tabla y el trigger `on_auth_user_created` que crea el perfil desde `raw_user_meta_data.display_name`; verificar que crear un usuario genera su fila en `profiles`.
- [x] 1.3 Crear `supabase/migrations/20261126100200_cloud_rls.sql` con RLS activo y políticas de `select`, `insert`, `update` y `delete` por `auth.uid()` en todas las tablas; verificar con dos usuarios que ninguno ve ni modifica filas del otro.
- [x] 1.4 Escribir `supabase/README.md` con el orden de aplicación, el uso del editor SQL y de la CLI, y las comprobaciones de RLS; verificar que las instrucciones no contienen secretos.

## 2. Modelo local de sincronización

- [x] 2.1 Subir `SCHEMA_VERSION` a 4 en `packages/data/src/db.ts` y añadir las tablas `syncState` y `syncMeta`; verificar con una base v3 existente que los datos se conservan y las tablas nuevas se crean vacías.
- [x] 2.2 Implementar `packages/data/src/sync/mapping.ts` con el mapeo entidad ↔ fila remota para las ocho entidades y sus pruebas de ida y vuelta, incluidos importes, fechas, miembros y repartos.
- [x] 2.3 Implementar `packages/data/src/sync/tracked.ts` para marcar `dirty` en cada `put`, registrar tumbas en cada `delete` y exponer un callback de cambio local; verificar con pruebas que crear, editar y borrar dejan el estado esperado.
- [x] 2.4 Implementar `packages/data/src/sync/engine.ts` contra la interfaz `CloudGateway` con bootstrap, empuje por lotes, descarga completa idempotente, prioridad del cambio local pendiente y propagación de borrados; verificar con un gateway en memoria y `fake-indexeddb`.
- [x] 2.5 Implementar `packages/data/src/sync/supabase-gateway.ts` con `fetchAll`, `upsert` y `softDelete` sobre `@supabase/supabase-js` y manejar los errores de red sin perder cambios pendientes; verificar los caminos de error con un cliente simulado.

## 3. Cuenta y sincronización en la web

- [x] 3.1 Añadir `@supabase/supabase-js` y crear `apps/web/src/lib/supabase.ts` con cliente perezoso, `cloudEnabled` y variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`; verificar que la app arranca y compila sin esas variables.
- [x] 3.2 Implementar `CloudProvider` en `apps/web/src/components/cloud-provider.tsx` con sesión, alta, inicio, cierre, propietario del espacio, bootstrap, descarga, estado, errores y disparadores de sync; verificar que el modo local sigue operativo sin sesión.
- [x] 3.3 Implementar el panel de cuenta reutilizable en `apps/web/src/components/account-panel.tsx` con formulario de alta e inicio, validaciones, confirmación de sustitución de datos locales y mensajes de confirmación de correo; verificar los estados de error y carga.
- [x] 3.4 Integrar el nombre del perfil y el acceso opcional a la nube en `apps/web/src/components/pages/onboarding.tsx` sin romper los botones «Empezar vacío» y «Ver con datos de ejemplo»; verificar el flujo local completo.
- [x] 3.5 Integrar el panel de cuenta en `apps/web/src/components/pages/settings.tsx`, mostrar estado, último sync y pendientes, permitir «Sincronizar ahora» y «Desconectar», y deshabilitar importar, demo y reset con cuenta conectada; verificar cada estado.
- [x] 3.6 Sincronizar el nombre editado en Ajustes con `profiles` cuando hay sesión y recuperarlo al iniciar sesión; verificar que el shell refleja el nombre remoto.

## 4. Copia, ciclo de vida y compatibilidad

- [x] 4.1 Ajustar `packages/data/src/lifecycle.ts` y `backup.ts` para limpiar el estado de sincronización en reset y demostración, y documentar que el bootstrap vuelve a marcar los datos locales; verificar que no quedan marcas huérfanas.
- [x] 4.2 Verificar que las instalaciones existentes migran de v3 a v4 sin pérdida y que las pruebas de repositorios, migraciones y copias siguen pasando.

## 5. Documentación y verificación

- [x] 5.1 Escribir `docs/desarrollo/nube-supabase.md` con arquitectura del sync, modelo de datos, variables de entorno, migraciones, conflictos y limitaciones; actualizar `docs/desarrollo/arquitectura.md`, `.env.example`, `AGENTS.md` y `docs/desarrollo/desviaciones.md`.
- [x] 5.2 Añadir o actualizar E2E de onboarding (nombre, modo local y nube no configurada) y de ajustes (panel de cuenta, acciones deshabilitadas); los casos quedan preparados para ejecutarse sin credenciales de Supabase. No se completó la suite por indicación de la persona usuaria.
- [x] 5.3 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`; los cuatro terminan sin errores. La ejecución de `npm run e2e:worktree` queda pendiente por indicación de la persona usuaria; los E2E añadidos se dejaron preparados y se corrigieron dos selectores detectados en una ejecución previa.
- [x] 5.4 Ejecutar `openspec validate supabase-sync` y revisar que no hay cambios en `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.

## 6. Onboarding guiado y preferencias

- [x] 6.1 Añadir `primaryCurrency` y `primaryIncomeDay` a `Settings`, con valores por defecto, y el caso de uso `updateProfilePreferences` con validación; verificar con tests de dominio que se guardan y que los valores inválidos se rechazan sin alterar los existentes.
- [x] 6.2 Convertir `/onboarding` en un asistente de cinco pasos (perfil, primera cuenta, CSV informativo, primer movimiento y nube) con progreso, vuelta atrás y omisión por paso; verificar que el atajo «Omitir el asistente» completa el onboarding.
- [x] 6.3 Reutilizar `AccountForm` y `MovementForm` con callbacks para crear la primera cuenta y el primer movimiento, incluyendo la divisa principal como valor por defecto; verificar que se puede omitir cada paso sin bloquear el resumen.
- [x] 6.4 Pintar el paso de CSV con los bancos del catálogo, la copia honesta de privacidad y el estado «Próximamente», sin procesar archivos.
- [x] 6.5 Añadir la migración `20261126100300_profile_preferences.sql` con `income_day`, el trigger actualizado y las instrucciones en `supabase/README.md`; verificar que se aplica después de las anteriores.
- [x] 6.6 Sincronizar nombre, divisa y día de ingreso con `profiles` al conectar y al editar desde Ajustes, y mostrar los tres campos en el panel de perfil.
- [ ] 6.7 Actualizar los E2E del onboarding y ejecutar la suite cuando la persona usuaria lo autorice; no se ejecutan en esta fase por indicación expresa.

## Workflow follow-up

- Archivar el change y abrir la PR siguiendo el flujo de `AGENTS.md`; no mergear la PR.
