# Tasks

## 1. Lectura de un movimiento y sus vínculos

- [x] 1.1 Añadir `useMovement(id)` en `apps/web/src/components/hooks.ts` sobre `repositories.movements.get(id)`, con el patrón `useLiveQuery` + `ready` de `useAccount`, y verificar con `npm run typecheck`.
- [x] 1.2 Añadir `useGroupExpense(id)` sobre `repositories.groupExpenses.get(id)` para resolver el grupo de un movimiento enlazado y verificar con `npm run typecheck`.

## 2. Modal de detalle

- [x] 2.1 Crear `apps/web/src/components/movement-detail-dialog.tsx` con `Modal`, `movementId`, `open` y `onClose`, y verificar con `npm run typecheck`.
- [x] 2.2 Mostrar en la modal tipo, importe con signo, divisa, fecha, categoría, cuenta, nota, creación y vínculos a cuenta o grupo cuando existan, y verificar abriendo el detalle de un movimiento de ejemplo.
- [x] 2.3 Añadir las acciones «Editar» y «Eliminar» (cierre con la ✕ de la cabecera) sustituyendo la modal de detalle por la de edición o la de confirmación (sin apilar modales), reutilizando `MovementEditDialog` y el borrado con deshacer, y verificar que al guardar se ven los datos actualizados y al eliminar se cierra con opción de deshacer.
- [x] 2.4 Cerrar la modal si el movimiento deja de existir mientras está abierta, y verificar eliminándolo desde la propia modal sin dejar una superficie bloqueada.
- [x] 2.5 Registrar la desviación en `docs/desarrollo/desviaciones.md` (modal no incluida en el diseño congelado) y verificar que la entrada describe superficie, motivo, consecuencia y cierre.

## 3. Filas seleccionables y retirada de la edición en línea

- [x] 3.1 En `apps/web/src/components/pages/movements.tsx`, quitar la columna «Acciones», los botones «Editar» de tabla y móvil y el montaje de `MovementEditDialog`, y verificar que no queda ninguna referencia al diálogo en el archivo.
- [x] 3.2 Hacer que toda la fila abra la modal: `onClick` en la fila de escritorio con cursor pointer y fondo al hover, concepto como botón enfocable, y `MovementRow` con `onClick` en móvil; verificar que se abre el movimiento correcto desde cualquier celda.
- [x] 3.3 Abrir la modal desde los `MovementRow` de «Últimos movimientos» de `dashboard.tsx` y `account-detail.tsx`, y verificar que desde ambas listas se abre el movimiento correcto.
- [x] 3.4 Comprobar que `docs/desarrollo/arquitectura.md` no anuncia una ruta de detalle de movimiento (la modal no añade ruta) y que el listado sigue documentado.

## 4. Pruebas

- [x] 4.1 Actualizar `e2e/accounts-movements.spec.ts` para editar abriendo la modal de detalle y comprobar que la tabla ya no muestra «Editar», y verificar con `npm run e2e -- accounts-movements`.
- [x] 4.2 Añadir un E2E del detalle: abrir la modal desde el listado y desde una celda, ver datos, editar, cerrar y comprobar el cambio en la lista, y verificar con `npm run e2e`.
- [x] 4.3 Añadir un E2E de eliminación desde la modal con deshacer y comprobar que el movimiento reaparece en el listado, y verificar con `npm run e2e`.
- [x] 4.4 Añadir una prueba de accesibilidad con la modal de detalle abierta y verificar que la auditoría pasa.

## 5. Verificación de integración

- [x] 5.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` y comprobar que terminan sin errores, salvo el fallo preexistente de `scripts/config.test.mjs` (symlink `/private/var` de macOS) que queda fuera de este change y arregla otra rama.
- [x] 5.2 Ejecutar `npm run e2e` completo y comprobar que pasan las suites de movimientos, cuentas, dashboard y accesibilidad.

## Workflow follow-up

- En el cuerpo de la PR, avisar del cruce con la PR #5 (`feat/fix-select-box-nativo`) en `e2e/accounts-movements.spec.ts` y `e2e/a11y.spec.ts`, e indicar que se mergea primero la #5 y se rebasa esta rama.
- Dejar el mismo aviso de orden de merge como comentario en la tarjeta del tablero.
- Archivar el change con `openspec archive` y sincronizar la spec `producto/finanzas-personales`.
- Abrir la PR con `node scripts/kan-sync.mjs pr-body detalle-de-movimientos` y `gh pr create --base main`.
- Marcar la tarjeta como `DONE` con `node scripts/kan-sync.mjs done detalle-de-movimientos --pr <url>`.
