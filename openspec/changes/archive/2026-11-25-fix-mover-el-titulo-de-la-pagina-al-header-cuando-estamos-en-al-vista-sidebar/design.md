# Design

## Context

Ver `proposal.md` para la motivación. Estado actual:

- `AppShell` (`apps/web/src/components/shell/app-shell.tsx`) monta `Sidebar` + `DesktopHeader` solo si `shellMode !== 'header'`; `DesktopHeader` (`sidebar.tsx:128`) es `justify-end`, sin título, solo buscador y avisos.
- Cada pantalla monta `<PageTitle title>` (solo `document.title`) + `<PageHeader title meta actions>` (`packages/ui/src/layout.tsx:96`) que pinta el único `h1` en `main`.
- `routeTitles` (`nav.ts:17`) existe pero no se usa; los títulos dinámicos (nombre de cuenta/grupo, saludo) solo existen en la pantalla.
- Spec y E2E actuales exigen cabecera sin título (`shell-web`, `shell.spec.ts:42-43`).

## Goals / Non-Goals

**Goals:**

- Título y subtítulo visibles y fijos en `DesktopHeader` en vista sidebar `lg`, sin duplicarlos en el contenido.
- Títulos/subtítulos dinámicos sin cambios por pantalla; `document.title` sin cambios.
- Tablet, móvil y variante `header` intactos.

**Non-Goals:**

- Mover `meta`, `actions` o `breadcrumbs` a la cabecera; siguen en el contenido.
- Cambiar `HeaderNav`, `TabletHeader`, `MobileTopBar` o el sistema de navegación.
- Rediseño visual (`docs/diseno/` congelado).

## Decisions

1. **Origen del encabezado: contexto publicado por `PageHeaderResponsive`, fallback a `routeTitles`.**
   - `page-title.tsx` expone `PageTitleProvider` + `usePageTitle` con `title` y `meta`; `PageTitle` solo escribe `document.title`.
   - `PageHeaderResponsive` (web, client) lee `useSettings()`, calcula `hideTitleAtLg`, publica su `title` y su `meta ?? description` en el contexto y renderiza el `PageHeader` de `ui`. `AppShell` provee el contexto y pasa ambos a `DesktopHeader`; si no hay título publicado (skeleton/error), fallback a `routeTitles[pathname]`.
   - Así el saludo del resumen (`Buenos días, Marta`) y su fecha llegan a la cabecera aunque `PageTitle` sea `Resumen`.
   - Alternativa descartada: fijar el contexto desde `PageTitle` — falla cuando el H1 visible difiere del título de pestaña (resumen).
   - Alternativa descartada: solo `routeTitles` por `pathname` — no cubre títulos dinámicos.

2. **`DesktopHeader`: `justify-between`, bloque de encabezado a la izquierda.**
   - El bloque izquierdo apila `<h1 class="text-ui-28-bold truncate">` y `<p class="text-ui-11 text-text-secondary truncate">` con el subtítulo; solo se renderiza el `p` si hay subtítulo.
   - El bloque derecho mantiene buscador y avisos sin cambios. `sticky top-0 h-[72px]` y superficies actuales; sin avatar.

3. **Contenido sin encabezado duplicado solo en `lg` + sidebar.**
   - `PageHeader` (`packages/ui`) recibe `hideTitleAtLg?: boolean`; cuando es `true`, el `h1` y el `p` de `meta`/`description` llevan `lg:hidden`, mientras `actions` y `breadcrumbs` siguen visibles.
   - Las pantallas usan `PageHeaderResponsive` (que calcula `hideTitleAtLg={shellMode === 'sidebar'}` vía `useSettings()`); en `header`/tablet/móvil el encabezado del contenido sigue visible. `cuentas/nueva` (ruta server) también usa el wrapper.
   - Alternativa descartada: ocultar por CSS global con `[data-shell]` — frágil y afecta a todos los `h1`.
   - Alternativa descartada: eliminar `PageHeader` de las pantallas — perdería `meta/actions`.

4. **Accesibilidad: un solo `h1` visible.**
   - En `lg` + sidebar el `h1` visible es el de `DesktopHeader`; el de `PageHeader` queda `hidden` en ese breakpoint (no solo visualmente oculto) para que `getByRole('heading', level:1)` tenga `count === 1`.
   - Foco, `skip link` (`#contenido`) y orden de lectura sin cambios.

## Risks / Trade-offs

- [Riesgo] Encabezado largo (título + subtítulo) desborda la cabecera junto al buscador `w-60` → Mitigación: `min-w-0 flex-1 truncate` en ambos textos y `shrink-0` en acciones; E2E con fecha del resumen.
- [Riesgo] La altura fija de 72 px no basta para dos líneas → Mitigación: título 28 y subtítulo 11 con `leading` ajustado dentro de las 72 px, sin cambiar la altura de la cabecera.
- [Riesgo] Flash sin título en primer render / skeleton → Mitigación: fallback `routeTitles` y `aria-busy`; `PageSkeleton` no monta `PageTitle`.
- [Riesgo] Doble `h1` si una pantalla olvida la prop → Mitigación: prueba unitaria de `PageHeader` + E2E `toHaveCount(1)` en `/ajustes` y detalle dinámico.
- [Trade-off] 9 pantallas tocan `PageHeader` para pasar la prop; cambio mecánico pero amplio → se agrupa en una sola tarea con codemod/manual.

## Migration Plan

- Cambio solo de `web` + `ui` presentacional; sin migraciones de datos.
- Actualizar `openspec/specs/producto/shell-web/spec.md` (este change), `docs/desarrollo/arquitectura.md` (regla l.100) y `e2e/shell.spec.ts` (invertir `not.toContainText` → `toContainText`, mantener `toHaveCount(1)` y gap ≥24 px).
- Rollback: revert del change; el spec anterior vuelve a exigir cabecera sin título.

## Open Questions

- Ninguna que bloquee specs o tareas; el truncado exacto y el tamaño tipográfico del `h1` en cabecera se validan en implementación contra tokens existentes.
