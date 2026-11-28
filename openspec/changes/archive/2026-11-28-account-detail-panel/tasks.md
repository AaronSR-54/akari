# Tasks

## 1. Casos de uso de plazos y recurrencias

- [x] 1.1 Añadir `createInstallmentPlan` en `packages/domain/src/services.ts` con validación de cuenta, concepto, importe positivo, cuotas enteras ≥ 2, primera fecha y frecuencia, usando la divisa de la cuenta; verificar con `npm run typecheck`.
- [x] 1.2 Añadir `createRecurrence` en `packages/domain/src/services.ts` con validación de cuenta, tipo, importe positivo, concepto, categoría, frecuencia, próxima fecha y fin opcional posterior; verificar con `npm run typecheck`.
- [x] 1.3 Cubrir ambos casos de uso en `packages/domain/src/services.test.ts` (persistencia, divisa de la cuenta, plan sin movimientos y errores de validación) y verificar con `npm test -- packages/domain/src/services.test.ts`.

## 2. Alta de cuenta en modal

- [x] 2.1 Extender `AccountForm` con `formId`, `showActions`, `framed` y `onCancel` para poder montarlo dentro de un modal sin duplicar botones ni tarjeta.
- [x] 2.2 Crear `AccountDialog` con `Modal`, pie «Cancelar»/«Guardar cuenta» y navegación al detalle al guardar; verificar que el formulario conserva las validaciones actuales.
- [x] 2.3 Eliminar `apps/web/app/(app)/cuentas/nueva/page.tsx` y sustituir todos los enlaces de alta por el modal en `dashboard.tsx`, `movement-dialog.tsx` y `new-movement.tsx`, incluido el estado vacío y los primeros pasos.
- [x] 2.4 Quitar el enlace «Gestionar cuentas» del panel de cuentas del resumen y convertir la píldora «Nueva cuenta» en un botón que abre el modal.
- [x] 2.5 Actualizar `e2e/accounts-movements.spec.ts`, `e2e/dashboard.spec.ts` y `e2e/movement-dialog.spec.ts` para el alta en modal y la ausencia de `/cuentas/nueva`; dejar los specs listos sin ejecutarlos hasta que se pida el E2E.

## 3. Selector y cabecera del panel

- [x] 3.1 Crear `AccountMenu` con chevron junto al nombre, panel de tarjetas de cuenta en una columna en escritorio, hoja inferior en móvil, versión reducida de `AccountCard`, marca de la cuenta activa y acción «Nueva cuenta», reutilizando la tarjeta del resumen.
- [x] 3.2 Rehacer la cabecera de `account-detail.tsx`: nombre con chevron y sin breadcrumb ni barra de tipo, divisa y actualización; sin acciones de editar, añadir o eliminar, y navegación entre cuentas por `router.push`.
- [x] 3.3 Sustituir las tarjetas de resumen por una única cifra de saldo actual con su etiqueta debajo y retirar el estimado y los movimientos del mes.
- [x] 3.4 Reemplazar «Evolución del mes» por el balance del mes con `MonthBalance` y la base del cierre anterior, mostrando neto y estimado de la cuenta; verificar con `npm run typecheck`.
- [x] 3.5 Añadir el primer bloque de `e2e/account-detail-panel.spec.ts` con cambio de cuenta en escritorio y móvil, ausencia de acciones de cabecera y presencia del balance; dejar el spec listo para el E2E.

## 4. Paneles y altas del detalle

- [x] 4.1 Mejorar «Detalles de la cuenta» con «Editar» en la cabecera y mover a `AccountEditScreen` el borrado con confirmación, retirándolo del detalle.
- [x] 4.2 Añadir el subtítulo de movimientos del mes a «Últimos movimientos» y el alta con `MovementDialog` y cuenta preseleccionada, con botón en el pie en móvil.
- [x] 4.3 Crear `InstallmentPlanForm` e `InstallmentPlanDialog` conectados a `createInstallmentPlan`, y añadir «Añadir plazo» al panel de plazos reutilizando `ProgressInstallments` y la próxima cuota del resumen.
- [x] 4.4 Crear `RecurrenceForm` y `RecurrenceDialog` conectados a `createRecurrence`, y añadir «Añadir recurrente» al panel de recurrentes con su estado vacío.
- [x] 4.5 Ampliar `e2e/account-detail-panel.spec.ts` para añadir movimiento, plazo y recurrencia desde el detalle y para editar y eliminar una cuenta; dejar el spec listo para el E2E.
- [x] 4.6 Componer la pantalla con el scroll en la raíz de la aplicación y sin padding superior: saldo y columna izquierda (gráfica, balance y detalles) fijos, columna derecha debajo del saldo y desplazable sin overflow propio (movimientos, próximas cuotas y recurrentes); la gráfica se ajusta con un máximo para no crecer.

## 5. Documentación

- [x] 5.1 Actualizar `docs/desarrollo/arquitectura.md` (sin `/cuentas/nueva`), `mapa-diseno-codigo.md` (M06 y flujo A por modal) y `desviaciones.md` (enlaces y panel de cuenta); verificar que no se editan `docs/diseno/` ni `design/`.

## 6. Verificación integral

- [x] 6.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` y corregir cualquier fallo.
- [x] 6.2 Revisar el diff completo contra los specs y confirmar que no se incluyen `docs/diseno/`, `design/` ni artefactos ignorados.

## Workflow follow-up

- Ejecutar `npm run e2e:worktree` cuando la persona lo pida y revisar el resultado.
- Archivar el change y abrir la PR solo cuando se solicite explícitamente.
