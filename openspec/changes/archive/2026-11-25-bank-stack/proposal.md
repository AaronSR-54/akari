# Proposal

## Why

Las cuentas no registran qué entidad bancaria las gestiona y todos los movimientos comparten el mismo icono genérico, así que no se reconoce de un vistazo el origen del dinero. Un catálogo local de bancos con sus iconos permite asociar cada cuenta a su banco y mostrar esa marca en las listas y en el detalle, sin depender de servicios remotos.

El código pasa a ser la fuente de verdad también para lo visual: el archivo de diseño/Figma se ha quedado obsoleto y deja de ser bloqueante. Esta decisión se refleja en `AGENTS.md` dentro de este change.

## What Changes

- Añadir un catálogo fijo y local de bancos en código (`id`, nombre, icono de app propio y color de respaldo), con las opciones especiales `Efectivo` y `Sin banco / Otro`.
- Descargar y versionar los iconos oficiales de las apps móviles de los bancos del catálogo, con un documento de fuentes, y mostrarlos sobre fondos circulares.
- Añadir el campo opcional `bankId` a `Account` y `AccountInput`. Las cuentas existentes y las que elijan `Sin banco / Otro` conservan el icono genérico actual; no hay cambios obligatorios en los datos.
- Añadir un selector de banco al formulario de alta y edición de cuentas.
- Resolver el icono del banco a partir de la cuenta origen de cada movimiento y usarlo en los últimos movimientos del resumen, en los de una cuenta, en el listado de movimientos (escritorio y móvil) y en la modal de detalle.
- En el listado filtrado por una cuenta, no repetir el icono en el detalle: la cuenta ya está identificada en el filtro.
- Actualizar `AGENTS.md` para dejar constancia de que el código manda en lo visual y Figma no bloquea.
- No se añaden autenticación, sincronización, cifrado ni llamadas a servicios bancarios: todo sigue siendo local-first.

## Capabilities

### New Capabilities

- `producto/bancos`: catálogo local de bancos, asociación opcional de cuentas a un banco y resolución del icono del banco para los movimientos.

### Modified Capabilities

- `producto/finanzas-personales`: el alta y edición de cuentas incorpora la selección opcional de banco, y las listas y el detalle de movimientos muestran el icono del banco de la cuenta origen.

## Impact

- `packages/domain`: `bankId` en `Account`/`AccountInput` y validación del catálogo en los casos de uso de cuenta.
- `packages/data`: migración sensible a la versión 3 del esquema que añade el campo sin borrar datos, y seed con bancos asignados.
- `packages/ui`: catálogo de bancos, componente de icono de banco y extensión de `MovementRow` para aceptarlo.
- `apps/web`: formulario de cuenta, resumen, detalle de cuenta, listado de movimientos, modal de detalle y assets de iconos de app.
- Pruebas unitarias, de componentes y E2E de los flujos afectados; documentación en `docs/desarrollo/` y `AGENTS.md`.
- Sin dependencias de red en tiempo de ejecución: los iconos se sirven desde la propia aplicación.
