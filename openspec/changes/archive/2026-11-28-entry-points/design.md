# Design

## Context

El modal de alta ya existe y lo usa `/movimientos` con `MovementDialog`, que monta `MovementForm` y comparte guardado con la edición. El problema no es el formulario, sino quién controla su apertura: hoy cada enlace navega a `/movimientos/nuevo`, que monta `NewMovementScreen`. El shell ya envuelve todas las pantallas de `(app)` con `Providers`, `PageTitleProvider` y los datos locales, y la barra móvil vive dentro de `AppShell`.

## Goals / Non-Goals

**Goals:**

- Un único punto de montaje del modal de alta, accesible desde cualquier pantalla del shell.
- Conservar el formulario, las validaciones y el guardado existentes.
- Preservar el contexto y la URL de la pantalla desde la que se abre.
- Quitar la ruta y la pantalla de alta sin dejar enlaces huérfanos.
- Mostrar la marca de Akari en la modal de acceso compartida.

**Non-Goals:**

- Cambiar el formulario, las validaciones o el flujo de edición de movimientos.
- Convertir el modal de edición en global: sigue ligado al movimiento abierto.
- Añadir login obligatorio, cierre de sesión obligatorio o protección de rutas.

## Decisions

### Provider del compositor en el shell

Se añade `MovementComposerProvider` en `apps/web/src/components/movement-composer.tsx`, montado dentro de `AppShell` y por encima de `AppShellInner`. Expone `useMovementComposer()` con `open({ accountId? })`, mantiene el estado `open` y `accountId`, y renderiza un único `MovementDialog` con las cuentas de `useAccounts()`.

- **Por qué:** el shell ya contiene la barra móvil, el resumen y todas las pantallas de `(app)`. Un provider allí evita duplicar el modal en cada página y permite que la barra móvil y las páginas compartan el mismo estado.
- **Alternativa descartada:** mantener el modal en `/movimientos` y navegar allí con un parámetro de consulta. Obligaría a conservar una ruta y a cambiar de pantalla, que es justo lo que se quiere evitar.
- **Alternativa descartada:** montar el modal en `Providers`. Funcionaría, pero `Providers` también cubre `/onboarding` y `/entrar`, donde el compositor de movimientos no pinta nada; el shell acota mejor el alcance.

### API mínima del compositor

`open()` no recibe el formulario ni el movimiento: solo la cuenta opcional. El modal siempre crea. La edición sigue en `MovementEditDialog` porque necesita el movimiento y su borrado con deshacer.

### Botones de acción reutilizables

`action-link.tsx` exporta `ActionButton`, que comparte las clases de `ActionLink` y recibe `onClick`. Los accesos que antes eran enlaces y ahora abren el modal usan `ActionButton` para conservar tamaño, forma y foco. Las píldoras del panel de accesos y el botón central móvil mantienen sus clases propias porque tienen geometría distinta.

### Migración de `/movimientos`

La página de movimientos deja de tener estado `creating` y de montar su propio `MovementDialog` para el alta: usa `useMovementComposer()`. Así solo hay una instancia del modal de alta en toda la app. El listado y los filtros no cambian.

### Eliminación de la ruta

Se eliminan `apps/web/app/(app)/movimientos/nuevo/page.tsx` y `apps/web/src/components/pages/new-movement.tsx`. No se deja redirección: la ruta desaparece y Next muestra `not-found`.

### Logo en la modal de acceso

`CloudAuthDialog` renderiza `Logo` de `@akari/ui` en la parte superior del contenido, centrado, antes de `CloudAuthForm`. La ruta `/entrar` ya usa `Logo` sobre el formulario; no se duplica en `CloudAuthForm` para que la ruta no muestre dos marcas.

### Detalle de movimiento en modo lectura

`MovementDetailDialog` reutiliza `MovementForm` con una nueva prop `readOnly`, que deshabilita los campos y oculta las acciones del formulario. El pie del modal mantiene «Eliminar» y «Editar»; «Editar» abre el `MovementEditDialog` existente con el formulario activo. Al guardar, la edición se cierra y el detalle sigue mostrando el modo lectura con los datos actualizados.

- **Por qué:** el detalle y la edición comparten campos y validaciones; reutilizar el formulario evita una segunda presentación incompleta y mantiene la app alineada con la idea de que el detalle «es» el formulario.
- **Alternativa descartada:** mantener las filas `InfoRow` y añadir solo un botón de edición. El usuario quiere que el detalle tenga aspecto de formulario, no una ficha de lectura.
- **Alternativa descartada:** abrir directamente el formulario editable. Se descarta porque permitiría modificar un movimiento sin una acción explícita de edición.
- **Cambio en la UI:** `SegmentedControl` necesita una prop `disabled` para que el selector de tipo no cambie en modo lectura; los demás campos ya aceptan `disabled` o lo heredan de sus controles.

### Acceso animado y Google

`CloudAuthForm` pasa a tener dos capas de estado: `mode` (`signin`/`signup`) y `signupStep` (`email`/`password`). Las pestañas mueven un indicador con `transform`; el contenido se monta con una animación de entrada y vive dentro de `AnimatedHeight`, un contenedor que mide su contenido con `ResizeObserver` y transiciona `height`. Todo respeta `prefers-reduced-motion`.

- **Por qué:** el usuario quiere que el cambio de pestaña y el cambio de altura del contenedor se sientan continuos, sin añadir una dependencia de animación.
- **Alternativa descartada:** instalar `framer-motion`. El cambio es pequeño y se resuelve con CSS y una medición; no compensa una dependencia nueva.
- **Google:** `cloud.signInWithGoogle(mode, options)` usa `client.auth.signInWithOAuth({ provider: 'google' })`, guarda la intención `upload` o `download` en `localStorage` y vuelve a `/entrar`, donde el listener de sesión existente adopta la sesión. Antes de redirigir valida el propietario y exige una decisión si hay datos locales sin cuenta. El botón ocupa la parte superior del formulario en ambos modos y desaparece en el paso de contraseña del alta.
- **Alta:** el primer paso pide solo el email y «Continuar»; el segundo pide contraseña y repetición y solo entonces crea la cuenta. El nombre no se pide en el acceso: lo recoge el onboarding. Google y el divisor desaparecen en ese segundo paso.
- **Salida sin cuenta:** «Continuar sin registrarte» vive fuera de `CloudAuthForm`, debajo de la tarjeta en `/entrar` y debajo del formulario en la modal, y se muestra en ambas pestañas.
- **Datos locales sin cuenta:** el proveedor expone `hasUnlinkedLocalData` (`hasLocalData` y sin propietario). Solo en ese caso, al pulsar «Entrar» o Google, la misma caja pasa a un paso que pregunta si sincronizar los datos y muestra un `SegmentedControl` —«Sincronizar» / «Usar los de la cuenta»— coherente con el resto de la app. La elección viaja como `localData: 'sync' | 'discard'` y se traduce a la intención `upload` o `download`; el check de sustitución desaparece. «Volver» regresa a las credenciales sin perder lo escrito y los errores de acceso devuelven a ese paso.
- **Sin scroll:** `/entrar` fuerza `overflow: hidden` en `html` y `body` mientras está montada, ocupa `100dvh` y reduce el aire vertical para que la tarjeta completa y la salida sin cuenta entren en la ventana. En alturas menores de 740 px el logo se compacta, se oculta la entradilla y se recortan márgenes y relleno. El efecto se limpia al desmontar.
- **Textos:** la ruta `/entrar` deja de mostrar la redirección inferior y el aviso de cifrado. La ayuda de la contraseña deja de mencionar Supabase y el paso de contraseña no repite «Creando cuenta para…».

### Destino tras el acceso

`CloudAuthForm` avisa con `onAccessIntent('signin' | 'signup')` antes de cada intento. La ruta de acceso guarda un marcador en `localStorage` (`akari:onboarding-after-signup`) cuando es un alta; sobrevive al OAuth de Google y, al aparecer la sesión, decide el destino: alta sin onboarding previo → `/onboarding`; cualquier otra entrada → resumen. Al entrar se marca `onboardingCompleted` para que el shell no rebote al asistente. `routeAfterAccess` y `routeAfterSkip` concentran la decisión y se prueban aparte.

- **Por qué:** el alta necesita el asistente (nombre, divisa, día de ingreso), pero un inicio de sesión normal ya trae el perfil de la nube y no debe repetirlo.
- **Onboarding:** al montar, si existe el marcador de alta, el asistente no se auto-completa por tener sesión; se limpia al terminar u omitir. El resto de visitas con sesión conservan el salto directo al resumen.
- **Continuar sin cuenta:** se comprueba IndexedDB directamente; con datos locales se marca el asistente como completado y se abre el resumen. Sin datos se abre `/onboarding`.

## Risks / Trade-offs

- **Dos instancias del modal si alguna página sigue montando `MovementDialog` para crear** → se migra también `/movimientos` al compositor y las pruebas buscan un único diálogo de alta.
- **El proveedor se monta antes de que `useAccounts()` resuelva** → el modal no se puede abrir hasta que el shell muestra la app (`ready` + onboarding completado); aun así, el diálogo recibe `[]` y muestra el estado «crea una cuenta» si se abriera sin datos.
- **El estado de la cuenta preseleccionada persiste entre aperturas** → abrir sin cuenta debe limpiar el `accountId`. El provider guarda la cuenta en cada `open()` y el modal se desmonta al cerrar porque `Modal` devuelve `null` cuando `open` es falso.
- **Enlaces antiguos o marcadores a `/movimientos/nuevo` dejan de funcionar** → es un cambio deliberado y breaking; se actualizan docs, E2E y cualquier enlace interno.
- **El pago recurrente ahora abre el modal en el resumen** → guardar crea el movimiento pero no avanza la recurrencia por sí solo; el comportamiento es el mismo que el enlace anterior, que solo preseleccionaba la cuenta.
- **Google exige configuración externa** → si el proveedor no está habilitado o el redirect no está permitido en Supabase, el botón muestra un error comprensible y el acceso con email sigue disponible.
- **El OAuth recarga la página** → la intención de subida o descarga se guarda antes de salir y el listener de sesión existente la recupera al volver a `/entrar`.
- **La altura animada puede recortar contenido alto** → el contenedor mide el contenido real con `ResizeObserver` y el modal conserva su `max-h` con scroll propio.
- **Bloquear el scroll puede recortar el acceso en pantallas muy bajas** → se reducen los márgenes verticales y se mantiene el contenido centrado; si el selector de datos locales añade altura, el formulario sigue cabiendo en los tamaños habituales.
