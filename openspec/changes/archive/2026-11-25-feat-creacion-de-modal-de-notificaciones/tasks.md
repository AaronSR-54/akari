# Tasks

## 1. Autor del movimiento y migración

- [x] 1.1 Añadir `memberId` opcional a `Movement` y `MovementInput`, guardarlo en `recordMovement` y `updateMovement` y rechazar miembros que no pertenecen a la cuenta; verificar con pruebas de `services.test.ts` y `npm run typecheck`.
- [x] 1.2 Subir `SCHEMA_VERSION` a 3 con una migración que normalice `memberId` a `null` sin cambiar índices ni borrar datos; verificar con la prueba de migración desde una base v2.
- [x] 1.3 Añadir autor a los movimientos de la cuenta conjunta del seed demo y comprobar que el backup exporta e importa el campo sin romper copias antiguas; verificar con `npm test -- seed` y `npm test -- backup`.
- [x] 1.4 Crear `apps/web/src/lib/current-user.ts` con el perfil «Marta», usarlo en la sidebar y añadir a `MovementForm` el selector de miembro cuando la cuenta tiene miembros (también al editar); verificar con `npm run typecheck` y una prueba del formulario.

## 2. Feed de avisos en dominio

- [x] 2.1 Crear `packages/domain/src/notifications.ts` con los tipos `AppNotification` y `buildNotifications`, los avisos de pagos con saldo y cobertura, y exportarlo desde `index.ts`; verificar con pruebas unitarias de pagos cubiertos, sin saldo, vencidos y fuera de plazo.
- [x] 2.2 Añadir al selector la actividad de cuentas conjuntas de los últimos 7 días con autor y dirección, excluyendo cuentas no conjuntas y movimientos del perfil actual; verificar con pruebas de ingreso, gasto y movimiento sin autor.
- [x] 2.3 Añadir las liquidaciones pendientes a favor y en contra y las recibidas en los últimos 7 días, resolviendo el perfil actual por nombre; verificar con pruebas de cada dirección y de grupos ajenos.
- [x] 2.4 Implementar `payRecurrence` con transacción, movimiento enlazado y avance de `nextDate` (eliminando la recurrencia si supera `endDate`); verificar con pruebas de avance y fin de recurrencia.

## 3. Hook, estado de vistos y acciones del shell

- [x] 3.1 Añadir `useNotifications()` leyendo cuentas, movimientos, recurrencias, planes, grupos, gastos y transferencias, y `Settings.seenNotificationIds`; verificar con `npm run typecheck` y que el resumen conserva su banner.
- [x] 3.2 Marcar como vistos los identificadores al abrir la bandeja con un máximo de 100, calcular el contador solo con los no vistos y comprobar en la campana que el indicador desaparece al abrir y vuelve con un aviso nuevo.
- [x] 3.3 Añadir una acción de shell que pague recurrencias y cuotas con `payRecurrence`/`registerInstallment`, navegue a cuenta o grupo y muestre toast de éxito o error; verificar con `npm run typecheck` y la prueba del panel.

## 4. Modal amplia y accionable

- [x] 4.1 Rediseñar `notifications-dialog.tsx` con un panel desplegable anclado a la campana, una única lista ordenada por fecha sin secciones, filas con icono de categoría, estado, saldo/cobertura, importe y flecha, y carga/vacío; verificar con `npm run typecheck`.
- [x] 4.2 Hacer accionable toda la fila: botones para pagos y enlaces para cuenta/grupo, sin botón «Pagar» separado, con estado ocupado para evitar dobles pagos; verificar con una prueba de interacción.
- [x] 4.3 Actualizar `notifications-panel.test.tsx` con fixtures de las tres secciones, cobertura, atribución, liquidaciones, acciones, carga, vacío y accesibilidad; verificar con `npm test -- notifications-dialog`.
- [x] 4.4 Actualizar `sidebar.test.tsx` para comprobar que la campana indica solo avisos no vistos y dispara la apertura; verificar con `npm test -- sidebar`.

## 5. Documentación

- [x] 5.1 Actualizar `docs/desarrollo/arquitectura.md` con el autor del movimiento, el selector de avisos y el estado de vistos; verificar que sigue el flujo de datos existente.
- [x] 5.2 Actualizar `docs/desarrollo/desviaciones.md` (§7) para registrar la bandeja ampliada, el pago directo sin confirmación, el estado de vistos y la atribución limitada a cuentas conjuntas; verificar el formato diseño/motivo/consecuencia/cierre.

## 6. E2E y verificación

- [x] 6.1 En `e2e/shell.spec.ts`, comprobar que la campana muestra 6 avisos nuevos, que al abrir la modal el indicador desaparece, que el desplegable se ancla a la campana, que los avisos van en una única lista por fecha y que no existe un botón «Pagar» separado; verificar con `npx playwright test e2e/shell.spec.ts`.
- [x] 6.2 Pagar una suscripción pulsando su fila, comprobar que se registra el movimiento, que la próxima fecha avanza y que el aviso se actualiza; verificar con `npx playwright test e2e/shell.spec.ts`.
- [x] 6.3 Comprobar la sección de cuentas compartidas con autor («Ana gastó dinero», «Luis añadió dinero») y que al pulsar se abre la cuenta conjunta; verificar con Playwright.
- [x] 6.4 Comprobar la sección de liquidaciones con «Debes 30,00 € a Ana» y que al pulsar se abre el grupo; verificar con Playwright.
- [x] 6.5 Mantener el caso sin avisos con `startEmpty` y añadir la auditoría de accesibilidad con la bandeja abierta; verificar con Playwright y axe.
- [x] 6.6 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npx playwright test` completos y comprobar que terminan sin errores (salvo el fallo intermitente preexistente del título en tablet, que se repite para confirmar).

## Workflow follow-up

- Archivar el change, sincronizar `producto/avisos` y `producto/finanzas-personales` y abrir la PR cuando la persona usuaria lo pida explícitamente.
