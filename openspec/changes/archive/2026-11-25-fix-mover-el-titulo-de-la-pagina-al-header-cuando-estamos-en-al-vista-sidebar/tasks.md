# Tasks

## 1. Título en la cabecera sidebar

- [x] 1.1 Ampliar `page-title.tsx` a proveedor de título (`PageTitleProvider`, `usePageTitle`) con fallback a `routeTitles` y verificar con prueba unitaria que `PageTitle` actualiza `document.title` y el contexto
- [x] 1.2 Proveer el contexto en `AppShell` y pasar el título a `DesktopHeader`, verificando que en `/ajustes` el contexto expone `Datos y sincronización`
- [x] 1.3 Rediseñar `DesktopHeader` a `justify-between` con `h1` truncado a la izquierda y buscador/avisos a la derecha sin avatar, verificando con prueba de componente que existe un único `h1` visible y las acciones siguen accesibles

## 2. Contenido sin duplicado y pantallas

- [x] 2.1 Añadir `hideTitleAtLg` a `PageHeader` en `packages/ui` (`h1` con `lg:hidden` cuando es `true`) y verificar con prueba unitaria ambos estados
- [x] 2.2 Pasar `hideTitleAtLg={shellMode === 'sidebar'}` en las 9 pantallas (`dashboard`, `movements`, `groups`, `group-detail`, `account-detail`, `account-edit`, `new-movement`, `questions`, `settings`) y verificar con `npm run typecheck` y que el `h1` del contenido se oculta solo en `lg` + sidebar
- [x] 2.3 Actualizar `docs/desarrollo/arquitectura.md` (regla de cabecera sin título) y registrar desviación visual si aplica en `docs/desarrollo/desviaciones.md`, verificando que no se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`

## 3. E2E y verificación final

- [x] 3.1 Actualizar `e2e/shell.spec.ts` (cabecera contiene el título, `h1` único, gap ≥24 px, tablet/móvil y variante `header` sin cambios) y verificar con `npm run e2e:worktree` el archivo `shell.spec.ts`
- [x] 3.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`, verificando que los cuatro pasan sin errores

## 4. Subtítulo en la cabecera sidebar

- [x] 4.1 Ampliar el contexto de `page-title.tsx` con `meta` y publicarlo desde `PageHeaderResponsive` (`meta ?? description`), verificando con prueba unitaria que la cabecera recibe ambos valores
- [x] 4.2 Mostrar `h1` y subtítulo en `DesktopHeader` y ocultar ambos en `PageHeader` cuando `hideTitleAtLg` es `true`, verificando con pruebas de componente un único encabezado visible y la fecha del resumen en cabecera
- [x] 4.3 Actualizar `e2e/shell.spec.ts` (subtítulo visible en cabecera y oculto en contenido en escritorio; tablet/móvil y variante `header` sin cambios), `docs/desarrollo/arquitectura.md` y `docs/desarrollo/desviaciones.md`, verificando con `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y el E2E de shell
