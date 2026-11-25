# Tasks

## 1. Selector propio en `packages/ui`

- [x] 1.1 Añadir `IconChevronDown` al set de `icons.tsx` con el mismo trazo y tamaño que el resto y verificar que la prueba de iconos/axe sigue pasando.
- [x] 1.2 Implementar el selector de opción única con disparador `combobox`, panel `listbox`, chevron rotatorio y variantes `field`/`pill` en `packages/ui/src/fields.tsx`, y verificar con `npm test -- fields` que abre, elige y cierra sin `<select>` nativo.
- [x] 1.3 Cubrir estados cerrado, abierto, error y deshabilitado, y el respeto a movimiento reducido en `fields.test.tsx`; verificar que las pruebas nuevas fallan sin el selector y pasan con él.
- [x] 1.4 Cubrir teclado y anuncio accesible (flechas, Home/End, Enter/Espacio, Escape, Tab, búsqueda por letra, `aria-expanded`/`aria-activedescendant`) en `fields.test.tsx` y `accessibility.test.tsx`; verificar con `npm test -- fields accessibility` y axe sin violaciones.

## 2. Integración en campos y pantallas

- [x] 2.1 Cambiar `SelectField` a `value`/`onValueChange` y adaptar `SelectPill` al selector compartido; verificar que `npm run typecheck` detecta las llamadas pendientes.
- [x] 2.2 Migrar las doce llamadas de `apps/web` (`account-form`, `movement-form`, `movement-edit-dialog`, `group-form`, `group-expense-form`, `group-detail`) a `onValueChange`; verificar `npm run typecheck` y `npm run lint` limpios.
- [x] 2.3 Comprobar en la app que cada selector muestra su chevron, abre el panel dentro del modal sin recortes y mantiene el valor al cerrar con Escape o clic fuera; verificar con `npm run dev:worktree` en el flujo de alta de movimiento y de grupo.
- [x] 2.4 Añadir la fila del selector al mapa diseño→código en `docs/desarrollo/mapa-diseno-codigo.md` y verificar que la ruta y las pruebas citadas existen.

## 3. E2E y verificación final

- [x] 3.1 Añadir el helper `chooseOption` en `e2e/helpers.ts` y migrar los diez `selectOption` de `e2e/*.spec.ts`; verificar que `npm run e2e:worktree` pasa.
- [x] 3.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`; verificar que los cuatro terminan sin errores.
- [x] 3.3 Revisar `git status` y confirmar que el cambio no incluye `docs/diseno/`, `design/`, `openspec/specs/diseno/*` ni `.env`.

## Workflow follow-up

- Archivar el change con `openspec archive` tras la revisión.
- Abrir la PR con `node scripts/kan-sync.mjs pr-body fix-select-box-nativo` como borrador y `gh pr create --base main`.
- Cerrar el seguimiento con `node scripts/kan-sync.mjs done fix-select-box-nativo --pr <url>`.
