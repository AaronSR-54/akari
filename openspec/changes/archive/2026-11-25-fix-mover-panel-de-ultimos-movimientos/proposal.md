# Proposal

## Why

El resumen obliga a bajar hasta el final para ver los últimos movimientos y muestra la cuota vencida/próximo pago dos veces (tarjeta del hero + banner). La jerarquía pierde fuerza: lo cotidiano queda lejos del saldo y el aviso duplica ruido.

## What Changes

- Mover el panel «Últimos movimientos» dentro del hero, justo debajo del saldo total (fila 2, columna 1), frente a «Balance del mes».
- Recomponer el hero como retícula 2×2: `saldo | gráfico` / `últimos movimientos | balance`.
- Sacar «Próximo pago / Cuota vencida» del hero y unificar la tarjeta + banner actuales en un único panel de cuota debajo de «Cuentas».
- Orden final del resumen: hero (2×2), Cuentas, Cuota unificada.
- Conservar sin cambios de comportamiento: «Ver todos», «Preguntas rápidas →», «Pagar ahora», estados vacíos y navegación a detalle de cuenta.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `producto/dashboard-hero`: cambia la composición del hero (qué bloques lo forman, retícula 2×2 y qué queda fuera de él).
- `producto/finanzas-personales`: unifica la presentación de cuota vencida/próximo pago en un solo panel y fija el orden hero → cuentas → cuota.

## Impact

- Afectado: `apps/web/src/components/pages/dashboard.tsx` (orden y retícula, reutilizando `Card`, `StatCard`, `Banner`, `MovementRow` existentes).
- Tests: `e2e/dashboard.spec.ts` (selectores `data-hero`, orden y ausencia de duplicado).
- No cambia `packages/domain`, `packages/data`, tokens ni API: solo composición de pantalla.
