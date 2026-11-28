# Proposal

## Why

El alta de movimientos tiene ya un modal completo, pero el resumen, la barra móvil, el detalle de cuenta y las preguntas rápidas siguen navegando a `/movimientos/nuevo`. Eso deja dos superficies para la misma tarea, pierde el contexto de la pantalla y mantiene una ruta que ya no aporta nada. Además, la modal de cuenta en la nube no muestra la marca de Akari, aunque la ruta dedicada de acceso sí la tiene.

## What Changes

- Añadir un compositor global de movimientos en el shell: cualquier pantalla puede abrir el modal de alta, con la cuenta ya seleccionada cuando haga falta, sin cambiar de URL.
- Migrar al modal los accesos del resumen (incluido el pago recurrente y los primeros pasos), la acción central de la barra móvil, el detalle de cuenta y las preguntas rápidas.
- **BREAKING** Eliminar la ruta `/movimientos/nuevo` y la pantalla `NewMovementScreen`; ya no habrá enlaces directos a esa URL.
- Mantener `/entrar` como ruta de acceso dedicada, reutilizando el formulario compartido, y añadir el logo de Akari a la modal de cuenta en la nube.
- Convertir el detalle de un movimiento en el mismo formulario de edición en modo lectura, con un botón «Editar» que active los campos.
- Animar el cambio entre «Iniciar sesión» y «Crear cuenta», y la altura del contenedor cuando cambia el contenido.
- Añadir acceso rápido con Google en ambos modos, un alta en dos pasos con email y contraseña repetida, y una salida «Continuar sin registrarte» siempre visible bajo el formulario.
- Enrutar el alta desde `/entrar` al onboarding y el inicio de sesión normal al resumen; «Continuar sin registrarte» salta el asistente cuando ya hay datos locales.
- Retirar de la pantalla de acceso la redirección inferior, el aviso de cifrado y las menciones internas a Supabase.
- Actualizar la documentación de arquitectura, el mapa diseño→código y las pruebas E2E afectadas.

## Capabilities

### New Capabilities

<!-- Ninguna. -->

### Modified Capabilities

- `producto/finanzas-personales`: el registro de movimientos se abre en modal desde cualquier acceso de la app, sin ruta intermedia; el detalle usa el formulario en modo lectura y se edita al pulsar «Editar».
- `producto/accesos-rapidos`: la acción central de la barra móvil abre el modal en lugar de navegar a `/movimientos/nuevo`.
- `producto/nube-supabase`: la modal de acceso compartida muestra la marca de Akari, ofrece Google en ambos modos, un alta en dos pasos y una salida sin cuenta bajo el formulario, y anima el cambio de contenido. El alta desde `/entrar` continúa en el onboarding, el inicio de sesión abre el resumen y la salida sin cuenta lo salta si ya hay datos locales.

## Impact

- `apps/web/src/components/shell/`: nuevo proveedor del compositor de movimientos y botón central de la barra móvil.
- `apps/web/src/components/pages/`: resumen, detalle de cuenta y preguntas rápidas abren el modal; se elimina `new-movement.tsx`.
- `apps/web/app/(app)/movimientos/nuevo/`: se elimina la ruta.
- `apps/web/src/components/forms/movement-form.tsx` y `movement-detail-dialog.tsx`: modo lectura del mismo formulario y paso a edición.
- `apps/web/src/components/account-panel.tsx`: logo, animaciones, Google y opciones de alta.
- `apps/web/src/components/pages/login.tsx`: acceso limpio, sin redirección inferior ni textos de cifrado, con Google y salida sin cuenta, y destino distinto para alta, inicio de sesión y salida sin cuenta.
- `apps/web/src/lib/access-intent.ts`: marcador del alta que sobrevive al OAuth y helpers de destino tras el acceso y la salida sin cuenta.
- `apps/web/src/components/cloud-provider.tsx`: método de acceso con Google y conservación de la intención de subida o descarga.
- `apps/web/app/globals.css`: transición de entrada del contenido del acceso.
- `e2e/`: pruebas de resumen, shell y selector de fecha adaptadas al modal.
- `docs/desarrollo/arquitectura.md`, `docs/desarrollo/mapa-diseno-codigo.md` y `docs/desarrollo/desviaciones.md`.
