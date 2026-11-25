# Proposal

## Why

El perfil y los ajustes están separados en la interfaz: el avatar es decorativo y «Ajustes» ocupa un cuarto destino en la navegación principal. Eso duplica el acceso y obliga a buscar la configuración en la barra de navegación en lugar de entrar por la identidad, que es el punto de entrada natural. Unificar ambas superficies simplifica el shell y hace coherente el recorrido «persona → ajustes».

## What Changes

- El avatar pasa a ser un enlace accesible a `/ajustes` en las cuatro variantes del shell (sidebar, header de escritorio, cabecera de tablet y barra superior móvil), conservando el nombre accesible de la persona y el tamaño de 40 px, con una afordancia visual al pasar el puntero y un tooltip que identifica el destino.
- Se retira «Ajustes» de `navItems`; la navegación principal queda formada por Resumen, Movimientos y Grupos.
- La pantalla `/ajustes` incorpora una sección «Perfil» con la identidad que ya muestra el shell y permite editar el nombre, que se guarda en los ajustes locales y se refleja en el avatar de todas las variantes. No se almacenan imágenes: la foto sigue representada por iniciales.
- El título y el subtítulo de `/ajustes` pasan a «Ajustes» y a una descripción centrada en perfil y datos locales, para que coincidan con el nuevo acceso.
- Se actualizan las pruebas unitarias del shell y los E2E que hoy localizan «Ajustes» en la navegación o esperan el título «Datos y sincronización».
- No se añaden autenticación, sincronización ni cifrado: la identidad sigue siendo local y estática.
- La desviación respecto al diseño congelado se registra en `docs/desarrollo/desviaciones.md`; no se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.

## Capabilities

### New Capabilities

Ninguna. El comportamiento pertenece a la navegación del shell ya existente.

### Modified Capabilities

- `producto/shell-web`: la navegación principal deja de incluir «Ajustes» como destino y el acceso pasa a estar en la identidad de la persona; se añaden la afordancia del avatar, la edición del nombre en el panel y el título de la ruta `/ajustes`.
- `producto/datos-locales`: el nombre del perfil se guarda en los ajustes locales del dispositivo y se valida antes de persistirse.

## Impact

- Código: `apps/web/src/components/nav.ts`, `apps/web/src/components/shell/sidebar.tsx`, `apps/web/src/components/shell/app-shell.tsx`, `apps/web/src/components/pages/settings.tsx`, un módulo compartido de identidad en `apps/web/src/lib/`, `packages/domain/src/types.ts` y `packages/domain/src/services.ts`.
- Pruebas: `apps/web/src/components/shell/sidebar.test.tsx`, `e2e/shell.spec.ts`, `e2e/onboarding.spec.ts`, `e2e/questions-settings.spec.ts`, `e2e/a11y.spec.ts` y `e2e/dashboard.spec.ts`.
- Documentación técnica: `docs/desarrollo/desviaciones.md`.
- Sin cambios en `packages/domain`, `packages/data`, `packages/tokens`, en la persistencia ni en las fuentes de diseño congelado.
