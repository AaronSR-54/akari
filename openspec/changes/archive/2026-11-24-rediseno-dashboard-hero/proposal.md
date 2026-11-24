# Proposal

## Why

El resumen abre con una fila de tarjetas que encierra el saldo total en una caja más, y la gráfica semanal anterior no respondía a la pregunta que importa al planificar: cómo evoluciona el saldo a lo largo del mes. La persona usuaria quiere un hero editorial donde el saldo y su evolución compartan protagonismo, con cada gasto bajando la línea y cada ingreso subiéndola, y una tarjeta de balance del mes con el saldo total estimado a fin de mes.

## What Changes

- **Hero con saldo editorial:** saldo total agregado por divisa y proyección de fin de mes sobre el lienzo, sin caja, junto a la gráfica de evolución del saldo del mes, también fuera de tarjeta y con la tarjeta de balance justo debajo.
- **Saldo del mes con base real:** la serie parte del saldo de cierre del mes anterior (la base a día 1) y termina en el saldo actual. Los ingresos suben la línea y los gastos la bajan; solo suma las cuentas incluidas en el saldo total y nunca convierte divisas.
- **Detalle diario:** la gráfica permite recorrer con el puntero o el teclado cada día transcurrido y ver sus movimientos con signo y el saldo tras ese día. Los días futuros no se pueden seleccionar.
- **Balance del mes en tarjeta:** bajo la gráfica, una tarjeta muestra «Balance del mes» con el neto, signo explícito y color (verde positivo, rojo negativo) y el saldo total estimado a fin de mes como única línea de pie. La tarjeta va justo debajo de la gráfica, con su misma anchura y una sombra superior sutil, y la gráfica ocupa el alto disponible para que ambas columnas del hero terminen a la misma altura.
- **Proyección de cierre:** el saldo total estimado sale de `overview.projections` (recurrencias y cuotas pendientes del mes). Sin proyección para la divisa de referencia, la línea se omite.
- **Datos:** `currentMonthMovements` devuelve ingresos, gastos, neto y saldo por día; `Overview` expone la evolución del mes y la proyección de fin de mes. La apertura se calcula con el saldo de las cuentas incluidas al cierre del mes anterior.
- **Retirada del gráfico semanal:** desaparece `ChartArea` del dashboard y la serie semanal; «Preguntas rápidas» sigue al pie de «Últimos movimientos».
- **Demo reproducible:** fecha fija al domingo 29 de noviembre de 2026 y tres meses de historial con sus nóminas; `DEMO_SEED_VERSION` sube para refrescar demos antiguas.
- **Accesibilidad:** la gráfica es un grupo enfocable con flechas, Inicio, Fin y Escape, y una región viva que anuncia el día activo.
- **Fuera de alcance:** implementación móvil React Native, backend, nuevas divisas, presupuestos y cualquier cambio en FigCraft, `design/` o `docs/diseno/` (el diseño está congelado).

## Capabilities

### New Capabilities

- `producto/dashboard-hero`: presentación editorial del saldo total y de la evolución del saldo mensual, con detalle diario, tarjeta de balance y saldo total estimado.

### Modified Capabilities

- Ninguna. `producto/finanzas-personales` sigue describiendo el dashboard y sus métricas; este change añade una capacidad de presentación específica para el hero.

## Impact

- **Código:** `apps/web/src/components/pages/dashboard.tsx`, nuevo `packages/ui/src/month-balance.tsx` con sus pruebas, `packages/domain/src/accounts.ts` y `services.ts` (movimientos diarios del mes, saldo de apertura y proyección), `apps/web/src/lib/format.ts` para etiquetas de día y `packages/data/src/seed.ts` para el histórico de la demo.
- **Pruebas:** unitarias de dominio para los movimientos y el saldo diario, pruebas de `packages/ui` para la gráfica y su navegación por teclado, y E2E del dashboard para el hero, el detalle diario, la tarjeta de balance con saldo total estimado, la ausencia del gráfico semanal y la respuesta responsive.
- **Documentación:** `docs/desarrollo/desviaciones.md`, `docs/desarrollo/mapa-diseno-codigo.md` y `docs/desarrollo/puesta-en-marcha.md` para registrar la divergencia con `W01`, la trazabilidad y la demo determinista.
- **Riesgo resuelto:** la gráfica depende del saldo de apertura; los movimientos futuros dentro del mes no cuentan como saldo real ni se dibujan, y solo entran en la previsión de fin de mes. La serie no inventa días futuros.
