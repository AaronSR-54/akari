# Proposal

## Why

El encabezado del resumen («Buenas tardes, Marta» con «domingo, 29 de noviembre · 3 cuentas en este dispositivo») se siente demasiado arriba en escritorio: el subtítulo empuja el saludo por encima del centro de la cabecera fija. En móvil el bloque completo es redundante, porque la fecha y el número de cuentas pueden vivir junto a los datos que describen. La tarjeta pide revisar los headings en desktop y mobile; empezamos por el dashboard para validar el patrón antes de llevarlo al resto de pantallas.

## What Changes

- El saludo del resumen deja de llevar subtítulo: en escritorio queda como único `h1`, centrado verticalmente en `DesktopHeader`; en móvil el bloque del saludo no se renderiza; en tablet permanece en el contenido.
- La fecha del resumen se traslada al hero, junto al rótulo del saldo: «Saldo total · domingo, 29 de noviembre».
- El número de cuentas se traslada al encabezado del panel: «Cuentas · 3 cuentas en este dispositivo», con concordancia singular/plural.
- El estado vacío aplica el mismo patrón: saludo sin subtítulo y sin encabezado en móvil; el aviso de que los datos viven en el dispositivo pasa al cuerpo del estado vacío.
- El dashboard oculta su encabezado en móvil mediante un contenedor de la capa web; el resto de pantallas conservan su comportamiento actual. `packages/ui` no cambia.
- **Tras validar el dashboard**, se aplica el mismo criterio a las demás pantallas: el subtítulo deja de vivir en la cabecera y se integra donde aporte contexto. El detalle por pantalla se concretará en la revisión del frontal.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `producto/shell-web`: la cabecera sidebar puede mostrar solo el título (sin subtítulo), y una pantalla puede optar por no renderizar su bloque de título/subtítulo en móvil. El saludo del resumen es el primer caso.
- `producto/dashboard-hero`: la fecha del saldo y el número de cuentas pasan a formar parte de las etiquetas del cuerpo del resumen.

## Impact

- Código: `apps/web/src/components/pages/dashboard.tsx` y los tests `e2e/helpers.ts`, `e2e/dashboard.spec.ts`, `e2e/onboarding.spec.ts`, `e2e/shell.spec.ts`. Sin cambios en `packages/ui`.
- Specs: deltas en `producto/shell-web` y `producto/dashboard-hero`.
- Docs: nueva desviación en `docs/desarrollo/desviaciones.md`. No se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/*` (diseño congelado).
- Sin cambios en `domain`, `data`, `tokens` ni en el modelo de dinero/fechas.
