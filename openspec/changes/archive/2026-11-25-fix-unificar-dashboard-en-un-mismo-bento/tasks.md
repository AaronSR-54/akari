# Tasks

## 1. Fila de cuentas del bento

- [x] 1.1 Sustituir en `apps/web/src/components/pages/dashboard.tsx` el `section aria-labelledby="cuentas"` y su `SectionHeader` por un contenedor de fila completa con `aria-label="Cuentas"`; verificación: `git diff` muestra cambios solo en ese bloque (nada por encima del antiguo encabezado) y `npm run typecheck` pasa.
- [x] 1.2 Añadir en `e2e/dashboard.spec.ts` una aserción de que el resumen ya no muestra el encabezado «Cuentas» ni el enlace «Gestionar cuentas», y de que las tres cuentas siguen visibles; verificación: el test E2E del dashboard pasa.
- [x] 1.3 Registrar la desviación visual en `docs/desarrollo/desviaciones.md` indicando que la fila de cuentas pierde su encabezado visible frente al frame `W01` congelado y que el hero queda intacto; verificación: la nueva entrada existe y no se han tocado `docs/diseno/` ni `openspec/specs/diseno/`.
- [x] 1.4 Dar a cada bloque de cuenta un fondo `surface-sunken` con `rounded-xl` y padding dentro de la tarjeta, sin líneas divisorias; verificación: `git diff` sigue limitado al bloque de cuentas y `npm run typecheck` pasa.
- [x] 1.5 Ajustar el E2E para comprobar que el encabezado y su enlace son descendientes de `[data-panel="accounts"]`, que los bloques tienen fondo distinto al del panel y el escalado sin desbordamiento; verificación: los tests del dashboard pasan en los tres viewports.
- [x] 1.6 Actualizar la nota 16 de `docs/desarrollo/desviaciones.md` para reflejar los bloques con fondo hundido y sin líneas; verificación: la nota describe la superficie única y el hero sigue intacto.

## 2. Verificación de integración

- [x] 2.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e` sobre la fila sin encabezado; verificación: los cinco comandos terminaron sin errores y las aserciones de geométrica de la gráfica y el balance siguen pasando sin cambios.
- [x] 2.2 Repetir `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e` tras el fondo de los bloques; verificación: los cinco comandos terminan sin errores y las aserciones de geométrica de la gráfica y el balance siguen pasando sin cambios.

## Workflow follow-up

- Archivar el change con `openspec archive` y commitear solo el alcance del change.
- Abrir la PR con `node scripts/kan-sync.mjs pr-body <change-id>` como borrador y `gh pr create --base main`.
- Mover las tarjetas a `DONE` con `node scripts/kan-sync.mjs done <change-id> --pr <url>` y limpiar el claim tras la revisión.
