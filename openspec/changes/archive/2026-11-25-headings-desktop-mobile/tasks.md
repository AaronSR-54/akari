# Tasks

## 1. Encabezado del resumen

- [x] 1.1 Ocultar el encabezado del dashboard en móvil desde `apps/web` (contenedor `hidden md:block` y `actions` compartidas en un bloque `md:hidden`), sin tocar `packages/ui`; verificar que el saludo no se ve en móvil y las acciones siguen visibles
- [x] 1.2 Quitar `meta` del `PageHeaderResponsive` del dashboard (con y sin cuentas) y verificar que el saludo es el único `h1` visible en escritorio y no aparece en móvil
- [x] 1.3 Registrar la desviación visual en `docs/desarrollo/desviaciones.md` y verificar que no se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`

## 2. Contexto movido al cuerpo del resumen

- [x] 2.1 Concatenar la fecha al rótulo «Saldo total» del hero con `formatFullDate()` y verificar el texto «Saldo total · domingo, 29 de noviembre» en los tres viewports
- [x] 2.2 Concatenar el recuento al encabezado «Cuentas» con `plural` y verificar «Cuentas · 3 cuentas en este dispositivo» sin perder el enlace «Gestionar cuentas»
- [x] 2.3 Trasladar el aviso de datos locales al estado vacío y verificar que el saludo sigue sin subtítulo y sin encabezado en móvil
- [x] 2.4 Igualar la línea de «Saldo total · fecha» a la de «Cuentas · recuento»: mismo tamaño y color, etiqueta en negrita y dato en cursiva con peso normal, sin cambiar los nombres accesibles
- [x] 2.5 Aplicar el mismo tamaño, color y negrita a los encabezados «Últimos movimientos» y «Balance del mes», y verificar los nombres accesibles

## 3. Pruebas y verificación del dashboard

- [x] 3.1 Actualizar `e2e/helpers.ts` (`seedDemo` espera el hero en vez del saludo) y los asertos del saludo en `e2e/onboarding.spec.ts`, verificando los tres proyectos de Playwright
- [x] 3.2 Actualizar `e2e/shell.spec.ts` y `e2e/dashboard.spec.ts` con las etiquetas nuevas y la ausencia de subtítulo en la cabecera, y verificar `npm run e2e`
- [x] 3.3 Abrir `npm run preview:worktree` y verificar visualmente el dashboard en 1440, 900 y 390 px antes de continuar con las demás pantallas

## 4. Resto de pantallas

- [x] 4.1 Tras la revisión del frontal, aplicar el mismo patrón a las pantallas restantes y verificar que cada una conserva su `h1` visible donde corresponde y sus acciones
- [x] 4.2 Actualizar las specs y los E2E afectados por esas pantallas y verificar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`

## Workflow follow-up

- Revisar el frontal con `npm run preview:worktree:status` y detenerlo con `npm run preview:worktree:stop` antes de archivar.
- Archivar el change en la rama `headings-desktop-mobile`, commitear solo su alcance y abrir la PR con `node scripts/kan-sync.mjs pr-body headings-desktop-mobile`.
- Mover las tarjetas a `DONE` con `node scripts/kan-sync.mjs done headings-desktop-mobile --pr <url>` sin hacer merge.
