# Tasks

## 1. Formulario reutilizable

- [x] 1.1 Añadir a `MovementForm` las props `formId`, `showActions`, `framed`, `onSaved`, `onCancel` y `onSavingChange`, de forma que la página conserve su comportamiento y el modal pueda montar el mismo formulario sin duplicarlo; verificar con `npm run typecheck` y con la ruta `/movimientos/nuevo`.

## 2. Modal de alta y edición

- [x] 2.1 Crear `MovementDialog` con `Modal` + `MovementForm`, título según alta o edición, pie con cancelar y guardar, borrado con deshacer y estado sin cuentas; verificar que abre, guarda, cierra y elimina.
- [x] 2.2 Convertir `MovementEditDialog` en un envoltorio de `MovementDialog` que conserve su API, y verificar con `npm run typecheck`.
- [x] 2.3 En `movements.tsx`, abrir el alta y la edición con `MovementDialog` sin navegar, manteniendo el filtrado y el refresco del listado; verificar que la URL sigue en `/movimientos` tras guardar.
- [x] 2.4 Añadir a `Modal` la variante `width="wide"` (`max-w-2xl`, 672 px) y usarla en `MovementDialog`; verificar que el resto de modales conserva 440 px y que el formulario respira en escritorio.

## 3. Pruebas y documentación

- [x] 3.1 Añadir `e2e/movement-dialog.spec.ts` con el alta en modal sin cambio de URL y la edición de tipo, importe, concepto y nota; verificar con `npx playwright test e2e/movement-dialog.spec.ts`.
- [x] 3.2 Actualizar `docs/desarrollo/mapa-diseno-codigo.md` y `docs/desarrollo/arquitectura.md` para reflejar que `/movimientos` crea y edita en modal y que `/movimientos/nuevo` sigue disponible como enlace directo.
- [x] 3.3 Registrar en `docs/desarrollo/desviaciones.md` que el diseño congelado no incluye el alta ni la edición completa en modal, con motivo y cierre.

## 4. Verificación de integración

- [x] 4.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` y comprobar que terminan sin errores.
- [x] 4.2 Ejecutar la suite E2E completa con `npm run e2e:worktree` y comprobar que pasan movimientos, cuentas, resumen, preguntas y accesibilidad.

## Workflow follow-up

- No abrir la PR hasta que la tarjeta «feat: creación del detalle de movimientos» (`hohywc5qk5sz`) esté mergeada; después, rebasar sobre `main`, repetir la verificación y abrir la PR.
- La PR #10 (`feat/detalle-de-movimientos`) sustituye la edición en línea por `MovementDetailDialog`; al rebasar, los conflictos previstos son solo `movements.tsx` (conservar el detalle y dejar el alta en modal) y `desviaciones.md` (renumerar esta sección después de la suya).
- Al rebasar, comprobar que el detalle de movimientos usa `MovementEditDialog` sin cambios y adaptar `e2e/movement-dialog.spec.ts`: la edición se abre desde el detalle, no desde un botón «Editar» de la tabla.
- Archivar con `openspec archive` solo cuando la persona usuaria lo pida explícitamente.
