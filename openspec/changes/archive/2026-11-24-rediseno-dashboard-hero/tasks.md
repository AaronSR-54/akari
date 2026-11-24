# Tasks

## 1. Dominio: movimientos y saldo diario del mes

- [x] 1.1 Implementar `currentMonthMovements(movements, currency, today, openingBalanceMinor)` en `packages/domain/src/accounts.ts`: todos los días del mes, ingresos, gastos, neto, saldo al cierre de cada día, marca `elapsed` y movimientos ordenados con tipo. Cubrir con `accounts.test.ts` días vacíos, signos, otra divisa, otro mes, días futuros y saldo acumulado, y comprobar que una nómina de fin de mes no se adelanta al saldo real.
- [x] 1.2 Mantener `monthExpenseEstimate` y cubrirlo con historial, sin historial (`null`) y mes cerrado.
- [x] 1.3 Calcular en `getOverview` la apertura del mes con el saldo de las cuentas incluidas al cierre del mes anterior y construir `month` solo con esas cuentas. Actualizar `services.test.ts` con saldo de apertura y saldo diario.

## 2. Design system: gráfica de saldo mensual

- [x] 2.1 Añadir `MonthBalance` en `packages/ui/src/month-balance.tsx`: serie desde el cierre del día 1, sin tramo previo de apertura, puntos por día, área ámbar, línea de tinta y sin etiqueta ni líneas de referencia visibles. Sin título ni pie visibles; exportarlo desde `packages/ui/src/index.ts`.
- [x] 2.2 Implementar el detalle por día: tooltip con movimientos y «Saldo tras el día», `clamp` horizontal, sin triángulo, `pointerdown`/`pointermove`, flechas, Inicio, Fin y Escape, límite a días transcurridos y región `aria-live`. Cubrir teclado, día sin movimientos y ausencia de textos de cabecera en `month-balance.test.tsx`.
- [x] 2.3 Incluir la gráfica en la prueba de accesibilidad y comprobar grupo con nombre, foco visible y contraste en ambos temas.

## 3. Dashboard web: hero de saldo y tarjeta de balance

- [x] 3.1 Reestructurar `OverviewBody` en `apps/web/src/components/pages/dashboard.tsx`: saldo total sin caja a la izquierda y `MonthBalance` a la derecha, fuera de tarjeta; retirar el gráfico semanal.
- [x] 3.2 Añadir la tarjeta «Balance del mes» bajo la gráfica, con su misma anchura y una sombra superior sutil, con neto firmado y coloreado (verde/rojo) y el saldo total estimado a fin de mes como única línea de pie; la gráfica ocupa el alto de su fila para que ambas columnas terminen a la misma altura; «Próximo pago» bajo el saldo y «Preguntas rápidas →» al pie de «Últimos movimientos».
- [x] 3.3 Formatear las etiquetas de día en `apps/web/src/lib/format.ts` (`formatWeekdayDate`, `formatWeekdayFullDate`) y construir el detalle diario con `formatMinor` firmado para ingresos y gastos.
- [x] 3.4 Actualizar `e2e/dashboard.spec.ts`: hero sin caja, detalle por teclado, actualización al registrar un gasto, tarjeta con saldo total estimado, ausencia del gráfico semanal, `prefers-reduced-motion` y responsive sin overflow.
- [x] 3.5 Actualizar `docs/desarrollo/mapa-diseno-codigo.md`, `docs/desarrollo/desviaciones.md` y `docs/desarrollo/puesta-en-marcha.md` para describir el saldo mensual, la tarjeta de balance, el diseño congelado y la demo determinista.
- [x] 3.6 Fijar la fecha del mock (domingo 29/11/2026) en `apps/web/src/lib/clock.ts`, sembrar tres meses de gastos y nóminas anteriores y subir `DEMO_SEED_VERSION` para refrescar demos antiguas. Verificar con `npm test` y con el E2E de refresco del demo.

## 4. Verificación integral

- [x] 4.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`; corregir cualquier fallo sin relajar reglas ni omitir pruebas.
- [x] 4.2 Ejecutar `npm run e2e` completo y comprobar que los flujos existentes de resumen, cuentas, movimientos, preguntas y accesibilidad siguen pasando con el nuevo dashboard.

## Workflow follow-up

- Revisar visualmente el dashboard en tema claro y oscuro y en 390/768/1440 px antes de archivar.
- Archivar el change conforme a `AGENTS.md`: commit en `feat/rediseno-dashboard-hero`, push y PR a `main` sin merge.
