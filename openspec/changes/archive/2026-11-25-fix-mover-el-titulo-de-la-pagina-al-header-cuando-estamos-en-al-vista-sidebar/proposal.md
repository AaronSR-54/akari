# Proposal

## Why

En la variante sidebar (escritorio, `shellMode === 'sidebar'`), el título de la sección vive solo en el contenido (`PageHeader > h1`) y desaparece al hacer scroll, mientras la cabecera fija (`DesktopHeader`) solo muestra buscador y avisos. La tarjeta pide que el título se mueva a la cabecera en vista sidebar para mantener el contexto visible sin hacer scroll hacia arriba.

## What Changes

- `DesktopHeader` (solo variante sidebar, `lg`) muestra a la izquierda el título de la página como único `h1` visible en escritorio y debajo su subtítulo (`meta`/`description`), con truncado; mantiene a la derecha buscador y avisos.
- El `h1` y el subtítulo de `PageHeader` en el contenido se ocultan en `lg` cuando el shell está en modo sidebar, para no duplicarlos (una sola cabecera visible). `actions` y `breadcrumbs` siguen en el contenido.
- Título y subtítulo se alimentan del mismo origen que el encabezado visible del contenido (wrapper `PageHeaderResponsive` vía contexto), con fallback a `routeTitles` para rutas sin encabezado montado; los valores dinámicos (nombre de cuenta/grupo, saludo y fecha del resumen) funcionan sin cambios por pantalla.
- Tablet (`TabletHeader`), móvil (`MobileTopBar`) y variante `header` (`HeaderNav`) no cambian: el título sigue en el contenido.
- **BREAKING (spec):** cambia el Requirement `Cabecera sin título de sección` de `producto/shell-web`: la variante sidebar pasa a mostrar el título en la cabecera.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `producto/shell-web`: la cabecera de la variante sidebar muestra el título y el subtítulo de la sección; el contenido no repite ninguno en escritorio.

## Impact

- Código: `apps/web/src/components/shell/*` (`app-shell.tsx`, `sidebar.tsx`, `page-title.tsx` + posible contexto), `packages/ui/src/layout.tsx` (`PageHeader`), las 9 pantallas que usan `PageHeader`/`PageTitle` solo si se necesita prop adicional, y `e2e/shell.spec.ts`.
- Specs: delta en `openspec/specs/producto/shell-web/spec.md` (Requirement `Cabecera sin título de sección` → `Cabecera con título en sidebar`) y escenarios de scroll/separación.
- Docs: `docs/desarrollo/arquitectura.md` (regla l.100 y `pt-6` si cambia la separación).
- Sin cambios en `domain`, `data`, `tokens`, ni en `docs/diseno/` ni `design/` (diseño congelado; cualquier desviación visual va a `docs/desarrollo/desviaciones.md`).
