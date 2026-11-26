# Design

## Context

Akari guarda todo en IndexedDB (`packages/data/src/db.ts`, esquema v3) y compone la aplicación en `apps/web`. No hay autenticación ni servidor. Las entidades no tienen marca de modificación homogénea: `Account` y `Group` tienen `updatedAt`, el resto solo `createdAt`; los borrados son físicos y no dejan rastro.

La nube será Supabase (PostgreSQL + Auth) y cada cambio de esquema remoto debe entregarse como un archivo SQL aplicable por separado. La app debe seguir arrancando sin variables de entorno de Supabase, sin conexión y sin cuenta.

## Goals / Non-Goals

**Goals:**

- Alta e inicio de sesión con email y contraseña, perfil con nombre y sesión persistente.
- Sincronización bidireccional fiable y comprensible entre IndexedDB y Supabase, con estado visible y reintentos.
- Aislamiento estricto por usuario mediante RLS; el cliente solo usa la clave anónima.
- Esquema remoto versionado en archivos SQL legibles, aplicables desde el editor SQL de Supabase.
- Mantener el modo local sin cuenta y el arranque sin configuración de Supabase.

**Non-Goals:**

- Importación real de CSV y parsers por banco; en este change solo se pinta el paso informativo.
- Grupos compartidos entre usuarios, invitaciones y permisos por grupo.
- Cifrado de extremo a extremo o cifrado de la base local.
- Resolución de conflictos por campo, historial de versiones o fusión de cuentas distintas.
- Sincronización en tiempo real con websockets; se usa sondeo por eventos y foco.
- Limpieza automática de filas con `deleted_at` antiguo.

## Decisions

### 1. Supabase Auth en cliente, sin SSR

Se usa `@supabase/supabase-js` en componentes cliente con `persistSession: true` y `detectSessionInUrl: true`. No se añade `@supabase/ssr` ni middleware: la app entera depende de IndexedDB y no renderiza datos en el servidor. La sesión vive en `localStorage` y `onAuthStateChange` mantiene el contexto.

**Alternativa descartada:** rutas de servidor con cookies. Añadiría dos flujos de sesión y no aporta nada a una app local-first.

### 2. Tablas relacionales con claves de texto

Los identificadores de Akari no son UUID puros: `services.ts` genera `acc_<uuid>` y el seed usa `demo-acc-day`. Por eso todas las claves primarias son `text`. Las columnas de dinero son `bigint` (unidad menor) y las fechas de negocio `date`.

Cada tabla lleva `user_id uuid not null default auth.uid()`, `created_at`, `updated_at` y `deleted_at`. Las referencias entre entidades no usan claves foráneas duras para no bloquear el orden de aplicación de cambios entre dispositivos; la integridad se valida en los casos de uso locales.

### 3. Metadatos de sincronización locales sin ensuciar el dominio

Las entidades de `packages/domain` no cambian. El esquema Dexie v4 añade dos tablas:

- `syncState` (`key`, `table`, `entityId`, `updatedAt`, `deletedAt`, `dirty`): una fila por entidad local, con la marca del último cambio y si está pendiente.
- `syncMeta` (`key`, `value`): propietario del espacio local (`ownerId`) y banderas internas.

Los repositorios que usa la app se envuelven con `createTrackedRepositories`, que marca `dirty` en cada `put` y registra una tumba en cada `delete`. Los casos de uso no saben que existe la nube. El seed, la importación de copias y el reset escriben directo en las tablas y quedan fuera del seguimiento; al conectar una cuenta se ejecuta un bootstrap que marca todas las filas locales existentes como pendientes.

**Alternativa descartada:** añadir `updatedAt`/`deletedAt` a cada entidad del dominio. Habría obligado a tocar cálculos, pruebas y copias, y a filtrar tumbas en cada lectura.

### 4. Empuje local-first y descarga completa idempotente

Cada ciclo de sincronización:

1. **Empuje:** por cada tabla, lee las filas `dirty` (máximo 200 por lote), hace `upsert` de la entidad mapeada o `update` de `deleted_at` si es una tumba, y marca la fila como limpia con el `updated_at` devuelto por el servidor.
2. **Descarga:** por cada tabla, trae todas las filas del usuario (el volumen personal es pequeño) y las aplica fila a fila. Si la fila local está `dirty`, se conserva la local y se empujará en el siguiente ciclo. Si la remota tiene `deleted_at`, se borra la local y se elimina su estado. Si no, se escribe la entidad y se marca limpia.

Se prefiere una descarga completa idempotente a un cursor incremental: evita perder filas por empates de `updated_at`, simplifica la recuperación tras un error y el tamaño de datos de finanzas personales lo permite. La descarga se paginará por tabla si en el futuro supera el límite de filas de Supabase.

**Resolución de conflictos:** los cambios locales pendientes ganan; el resto, el último estado remoto. Es determinista, no depende de relojes y cubre el caso real de un mismo usuario en varios dispositivos.

### 5. Propiedad del espacio local

`syncMeta.ownerId` vincula el IndexedDB a una cuenta. Al conectar:

- Sin propietario: se adopta el usuario actual. En alta se suben los datos locales; en inicio de sesión se ofrece descargar y sustituir los locales tras confirmación.
- Mismo propietario: sincronización normal.
- Otro propietario: se bloquea con un mensaje que pide cerrar sesión y restablecer el espacio local. Nunca se mezclan datos de dos cuentas.

Desconectar borra la sesión pero conserva `ownerId` y los datos locales; volver a entrar con la misma cuenta continúa donde estaba.

### 6. Onboarding sin romper el flujo local

La pantalla `/onboarding` mantiene la elección «Empezar vacío» / «Ver con datos de ejemplo» y añade encima un campo de nombre de perfil y una tarjeta opcional «Guarda tus datos en la nube» con un modal de alta o inicio de sesión. Quien no quiera cuenta sigue exactamente el flujo actual.

- Alta: crea usuario, guarda el nombre en `profiles`, adopta el espacio local y sube lo que haya.
- Inicio de sesión: descarga el perfil y los datos; si el dispositivo tiene datos, pide confirmación porque se sustituirán.
- Si Supabase no está configurado, la tarjeta explica que la nube no está disponible y el modo local sigue operativo.
- Si Supabase exige confirmar el correo, se muestra el aviso y no se fuerza la sesión.

`profiles` se crea con un trigger `on_auth_user_created` a partir de `raw_user_meta_data.display_name`; el cliente actualiza el nombre cuando cambia en Ajustes.

### 7. Operaciones destructivas bloqueadas con cuenta conectada

Mientras hay una cuenta conectada, «Importar copia», «Cargar datos de ejemplo» y «Borrar base local» se deshabilitan con una explicación: primero hay que desconectar. Así una copia local no puede sustituir silenciosamente la nube, y el reset no provoca una descarga inesperada en el siguiente ciclo. Exportar la copia sigue permitido.

### 8. Estado y errores visibles

`CloudProvider` expone `status` (`disabled`, `signed-out`, `syncing`, `idle`, `offline`, `error`), `lastSyncedAt`, `pendingChanges`, `error` y acciones `connect`, `signIn`, `signUp`, `signOut`, `syncNow`. Sin conexión se mantiene `offline` y los cambios se acumulan como pendientes. Los errores de red no bloquean la app; los de autenticación se muestran en el modal.

Los disparadores de sincronización son: conexión establecida, cambio local (debounce de 1,5 s), foco/visibilidad, evento `online`, intervalo de 60 s y botón manual.

### 9. Asistente de onboarding y preferencias del perfil

`/onboarding` pasa a ser un asistente con estado local de cinco pasos: perfil, primera cuenta, CSV informativo, primer movimiento y nube. El progreso se muestra con una barra y cada paso permite volver o omitirse; el perfil es el único obligatorio. «Omitir el asistente» completa el onboarding con los valores por defecto.

- **Perfil.** `Settings` gana `primaryCurrency` y `primaryIncomeDay` opcionales con valores por defecto (`EUR` y `1`), de modo que las instalaciones existentes no necesitan migración de Dexie. La validación vive en `updateProfilePreferences` y `updateProfileName` delega en ella.
- **Cuenta y movimiento.** Se reutilizan `AccountForm` y `MovementForm` con callbacks de guardado para no duplicar formularios ni validaciones. `AccountForm` acepta divisa por defecto, texto de envío y `onSaved`; `MovementForm` ya exponía `onSaved`, `showActions` y `framed`.
- **CSV informativo.** Se muestran los bancos del catálogo con `BankIcon` y una copia de privacidad honesta: el archivo se procesará en el navegador, no se usa para nada más y Supabase cifra en tránsito y en reposo. No se promete cifrado de extremo a extremo ni se implementa todavía el parser.
- **Sincronización del perfil.** `profiles` ya tenía `currency`; la migración 0004 añade `income_day`. El trigger de alta lee `currency` e `income_day` de `options.data`, y el cliente actualiza los tres campos al conectar o editar. Si la migración no está aplicada, la sincronización de datos sigue funcionando y el error de perfil se muestra sin bloquear.
- **Divisa por defecto.** `AccountForm` usa `defaultCurrency` o `Settings.primaryCurrency` para nuevas cuentas, sin cambiar la divisa de las existentes.

**Alternativa descartada:** guardar las preferencias solo en local. La divisa y el día de ingreso son datos de perfil y deben recuperarse al entrar desde otro dispositivo.

### 10. Independencia del transporte para probar

El motor de `packages/data/src/sync/engine.ts` depende de una interfaz `CloudGateway` (`fetchAll`, `upsert`, `softDelete`), no del cliente de Supabase. `createSupabaseGateway(client)` es la implementación real y las pruebas usan un gateway en memoria con `fake-indexeddb`. Así el comportamiento de sincronización se prueba sin red ni credenciales.

## Risks / Trade-offs

- [Riesgo] Un usuario entra con otra cuenta en un dispositivo con datos → Mitigación: `ownerId` bloquea la mezcla y el mensaje indica cómo restablecer.
- [Riesgo] Dos dispositivos editan la misma fila sin conexión → Mitigación: gana el cambio local pendiente y se documenta; no hay fusión por campo.
- [Riesgo] Descarga completa en cuentas con muchos datos → Mitigación: el volumen actual es pequeño; el gateway pagina por tablas y queda preparado para un cursor incremental.
- [Riesgo] El seed o la importación no pasan por el seguimiento → Mitigación: bootstrap al conectar y bloqueo de operaciones destructivas mientras hay cuenta.
- [Riesgo] Supabase exige confirmación de correo y no hay sesión tras el alta → Mitigación: mensaje explícito y reanudación al volver con la sesión detectada en la URL.
- [Riesgo] RLS mal configurada expone datos → Mitigación: políticas por `auth.uid()` en todas las tablas, `user_id` por defecto y pruebas manuales descritas en `supabase/README.md`.
- [Riesgo] Sin variables de entorno la app falla → Mitigación: cliente perezoso y `cloudEnabled` falso; el build y los E2E no requieren Supabase.

## Migration Plan

1. Aplicar en Supabase, por orden, `20261126100000_cloud_schema.sql`, `20261126100100_cloud_functions.sql` y `20261126100200_cloud_rls.sql`.
2. Configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` (nunca en el repositorio).
3. Desplegar la app. Las instalaciones existentes abren con Dexie v4; las tablas nuevas se crean vacías y no se pierde nada.
4. Al crear cuenta o iniciar sesión se ejecuta el bootstrap o la descarga descritos.
5. Reversión: desplegar la versión anterior y dejar de usar la nube. IndexedDB conserva los datos locales; las tablas remotas no se borran.

## Open Questions

Ninguna. El método de acceso, el modelo local-first y el alcance de un solo usuario se confirmaron antes de redactar el change.
