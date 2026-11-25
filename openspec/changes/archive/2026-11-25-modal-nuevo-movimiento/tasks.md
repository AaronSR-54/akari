# Tasks

## 1. Formulario reutilizable

- [x] 1.1 Añadir a `MovementForm` las props `formId`, `showActions`, `framed`, `onSaved`, `onCancel` y `onSavingChange`, de forma que la página conserve su comportamiento y el modal pueda montar el mismo formulario sin duplicarlo; verificar con `npm run typecheck` y con la ruta `/movimientos/nuevo`.

## 2. Modal de alta y edición

- [x] 2.1 Crear `MovementDialog` con `Modal` + `MovementForm`, título según alta o edición, pie con cancelar y guardar, borrado con deshacer y estado sin cuentas; verificar que abre, guarda, cierra y elimina.
- [x] 2.2 Convertir `MovementEditDialog` en un envoltorio de `MovementDialog` que conserve su API, y verificar con `npm run typecheck`.
- [x] 2.3 En `movements.tsx`, abrir el alta con `MovementDialog` sin navegar; la edición se abre desde el detalle reutilizando `MovementEditDialog`, manteniendo el filtrado y el refresco del listado; verificar que la URL sigue en `/movimientos` tras guardar.
- [x] 2.4 Añadir a `Modal` la variante `width="wide"` (`max-w-2xl`, 672 px) y usarla en `MovementDialog`; verificar que el resto de modales conserva 440 px y que el formulario respira en escritorio.

## 3. Pruebas y documentación

- [x] 3.1 Añadir `e2e/movement-dialog.spec.ts` con el alta en modal sin cambio de URL y la edición de tipo, importe, concepto y nota; verificar con `npx playwright test e2e/movement-dialog.spec.ts`.
- [x] 3.2 Actualizar `docs/desarrollo/mapa-diseno-codigo.md` y `docs/desarrollo/arquitectura.md` para reflejar que `/movimientos` crea y edita en modal y que `/movimientos/nuevo` sigue disponible como enlace directo.
- [x] 3.3 Registrar en `docs/desarrollo/desviaciones.md` que el diseño congelado no incluye el alta ni la edición completa en modal, con motivo y cierre.

## 4. Verificación de integración

- [x] 4.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`; `npm test` da 177/178 por el timeout conocido de `workflow.test.mjs` bajo carga (tarjeta `l4sfpw3rv9df`), que pasa en solitario.
- [x] 4.2 Ejecutar la suite E2E completa con `npm run e2e:worktree` y comprobar que pasan movimientos, cuentas, resumen, preguntas y accesibilidad.

## Workflow follow-up

- [x] La PR #10 (`feat/detalle-de-movimientos`) se mergeó antes que este change; al rebasar, los conflictos se limitaron a `movements.tsx` (detalle + alta en modal) y `desviaciones.md` (sección renumerada a 19).
- [x] El detalle de movimientos usa `MovementEditDialog` sin cambios y `e2e/movement-dialog.spec.ts` se adaptó al flujo detalle → editar.
- [x] Archivar con `openspec archive` y abrir la PR.
