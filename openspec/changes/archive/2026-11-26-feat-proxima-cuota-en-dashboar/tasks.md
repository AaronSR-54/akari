# Tasks

## 1. Dominio y datos del resumen

- [x] 1.1 Añadir los planes de plazos activos al tipo `Overview` y a `getOverview`, filtrando por cuentas activas, excluyendo planes completados y ordenando vencidos primero y luego por próximo vencimiento; verificar con `npm test --workspace @akari/domain` que las pruebas nuevas de orden y filtrado pasan.
- [x] 1.2 Cubrir en `packages/domain/src/services.test.ts` un resumen con un plan vencido y otro futuro, comprobando orden, exclusión del plan completado y campos de progreso/próxima cuota; verificar que la prueba falla sin el cambio y pasa con él.

## 2. Tarjeta de próximas cuotas

- [x] 2.1 Componer en el dashboard una única tarjeta «Próximas cuotas» bajo el panel de Cuentas, con los planes apilados en filas verticales separadas solo por espacio, sin líneas ni cajas independientes; verificar que `npm run typecheck` pasa y que la tarjeta no aparece sin planes activos.
- [x] 2.2 Convertir cada fila en un enlace con hover y foco visible hacia `/cuotas/<id>`; verificar que el E2E comprueba el `href`, el cambio de fondo al pasar el puntero y el anillo de foco.
- [x] 2.3 Mantener la tarjeta como información de solo lectura, sin botón de registrar; comprobar en el E2E que no hay acción de registro en el resumen.
- [x] 2.4 Limitar el banner de próximo pago a las recurrencias para no duplicar los planes de plazos; verificar en el demo que la cuota aparece solo en la tarjeta nueva.

## 3. Detalle del pago a plazos

- [x] 3.1 Añadir el hook `useInstallmentDetail` y la ruta `/cuotas/[id]`, con estado, progreso, importes pagado/pendiente, próxima cuota y calendario de cuotas; verificar con `npm run typecheck` y una prueba E2E que el plan de demo abre y muestra sus datos.
- [x] 3.2 Añadir la acción «Registrar cuota» al detalle con toast y actualización en vivo, el enlace a la cuenta y el estado de plan inexistente o completado; verificar en el E2E que el progreso avanza y que la última cuota oculta la acción.
- [x] 3.3 Documentar en `docs/desarrollo/arquitectura.md` la nueva ruta `/cuotas/[id]` y su relación con el detalle de cuenta; verificar que la ruta aparece en la tabla de rutas existente.

## 4. Pruebas de pantalla

- [x] 4.1 Extender el E2E del dashboard para comprobar las filas enlazadas, el hover y que no hay botón de registrar; verificar en los tres viewports.
- [x] 4.2 Añadir un E2E que abra el detalle desde el resumen, compruebe progreso y calendario, registre una cuota y confirme la actualización; verificar que pasa de forma estable.
- [x] 4.3 Ampliar el seed de demo con cuatro planes (dos vencidos, uno de hoy y uno futuro) y subir `DEMO_SEED_VERSION` para refrescar las demos existentes; verificar en el E2E que aparecen los cuatro en el orden esperado.

## 5. Verificación final

- [x] 5.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` en el worktree y corregir cualquier fallo.
- [x] 5.2 Ejecutar el E2E específico de próximas cuotas en móvil, tablet y escritorio; la suite E2E completa se omite por indicación del usuario.
