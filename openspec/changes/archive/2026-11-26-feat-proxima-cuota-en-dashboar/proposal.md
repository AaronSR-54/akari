# Proposal

## Why

Hoy el dashboard solo muestra un aviso genérico con el siguiente pago cuando cae dentro de 14 días. Quien tiene compras a plazos no ve allí cuánto lleva pagado, cuántas cuotas le quedan ni cuándo vence la siguiente, así que tiene que entrar cuenta por cuenta. El detalle de cuenta ya tiene una barra de progreso reutilizable; falta llevar ese contexto al resumen.

## What Changes

- Añadir bajo el panel de Cuentas una tarjeta «Próximas cuotas» que lista los planes de plazos activos en filas verticales dentro de una única tarjeta, sin cajas separadas.
- Cada fila muestra concepto, estado (al día o atrasado), barra de progreso «x de y», número e importe de cuotas pendientes, e importe y fecha de la próxima cuota.
- Cada fila muestra hover y es un enlace al detalle del plan en `/cuotas/<id>`.
- Crear la página de detalle del pago a plazos con progreso, importes, próxima cuota, calendario de cuotas y acción de registrar; en el resumen no se registra nada.
- Ordenar los planes con cuotas vencidas primero y, después, por fecha de próximo vencimiento ascendente.
- Mantener el aviso de próximo pago recurrente para suscripciones, excluyendo de él los planes de plazos para no duplicar información.
- Exponer los planes activos en el resultado de `getOverview` para que el dashboard no consulte repositorios adicionales.
- Reutilizar el componente visual `ProgressInstallments` existente en lugar de crear otra barra.
- Ocultar la tarjeta cuando no hay planes activos y no inventar métricas sin datos.

Fuera de alcance: registrar, editar o crear planes desde el dashboard, convertir divisas y cambiar el funcionamiento del panel de avisos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `producto/dashboard-hero`: el resumen incorpora la tarjeta «Próximas cuotas» bajo Cuentas y ajusta la regla de no duplicar la cuota.
- `producto/finanzas-personales`: el requisito de pagos a plazos concreta el contenido y las acciones del panel unificado de cuotas en el resumen.

## Impact

- `packages/domain`: `Overview` y `getOverview` incluyen los planes activos; pruebas del caso de uso.
- `apps/web`: el dashboard compone la tarjeta con filas enlazadas; nueva ruta `/cuotas/[id]` y hook de detalle del plan; el detalle de la cuenta conserva también el registro de cuotas.
- `packages/ui`: se reutiliza `ProgressInstallments`; sin cambios de API salvo los ajustes visuales mínimos que requiera la tarjeta.
- Pruebas: unitarias de dominio y UI, y E2E del dashboard con el seed de demo.
