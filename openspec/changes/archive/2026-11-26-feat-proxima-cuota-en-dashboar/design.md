# Design

## Context

Ver `proposal.md` para la motivación. El resumen ya recibe `Overview` desde `getOverview`, que carga cuentas, movimientos, recurrencias y planes. El detalle de cuenta ya usa `ProgressInstallments`, `installmentProgress`, `installmentStatus` y `nextInstallment`, y `registerInstallment` registra la cuota en una transacción. El dashboard hoy solo pinta un `Banner` con `upcoming[0]`, que mezcla cuotas y pagos recurrentes.

## Goals / Non-Goals

**Goals:**

- Llevar al resumen la información de plazos con los mismos cálculos que el detalle de cuenta.
- Evitar una consulta o suscripción adicional desde el dashboard.
- Mantener una sola fuente de datos y una sola tarjeta para las cuotas.

**Non-Goals:**

- Crear, editar o eliminar planes desde el resumen.
- Cambiar el panel global de avisos.
- Convertir importes entre divisas.
- Cambiar el esquema de IndexedDB.

## Decisions

### Exponer los planes activos en `Overview`

`getOverview` ya carga `installments`; se añade `installments` al tipo `Overview` con los planes de cuentas activas que todavía tienen cuotas pendientes, ordenados por vencimiento (vencidos primero y después por `nextInstallment.dueDate`). Así el dashboard consume un único resultado y las pruebas del caso de uso cubren el filtrado y el orden.

Alternativa descartada: usar `useInstallments` en el dashboard. Añade otra suscripción a IndexedDB y duplica la lógica de filtrado que ya vive en el caso de uso.

### Reutilizar `ProgressInstallments`

La tarjeta usa el componente existente, que ya expone `role="progressbar"`, `aria-valuenow`, el estado escrito y el pie con las cuotas restantes. No se crea otra barra ni se modifica su API; solo se le pasa `remainingLabel` con el importe pendiente.

### Tarjeta bajo Cuentas

Se renderiza una única `Card` con `SectionHeader` «Próximas cuotas» justo después de la sección de cuentas. Los planes se apilan en una lista vertical, cada uno en su fila y separados solo por espacio, sin líneas ni cajas independientes. Cada fila muestra:

- concepto y `Badge` de estado (`Atrasado` / `Al día`);
- `ProgressInstallments` con progreso y cuotas/importe restantes;
- importe y fecha de la próxima cuota.

Cada fila es un enlace con hover y foco visible hacia `/cuotas/<id>`. La tarjeta no incluye el botón de registrar: el registro vive en el detalle del plan. La tarjeta no se renderiza si no hay planes activos. El orden y el filtrado vienen de `getOverview`.

### Detalle del pago a plazos

Se añade la ruta `/cuotas/[id]`, que carga el plan por id con un hook `useInstallmentDetail` (plan + cuenta) y muestra:

- estado, barra de progreso, importe pagado y pendiente;
- próxima cuota con importe y fecha;
- calendario completo de cuotas con estado Pagada, Vencida o Pendiente;
- enlace a la cuenta y acción «Registrar cuota» con toast, usando `registerInstallment`.

Si el plan no existe, se muestra el estado vacío con vuelta al resumen. Si está completado, se oculta la acción y se muestra el aviso de plan completado. El detalle de la cuenta mantiene su propio registro para no romper el flujo existente.

### Separar el aviso recurrente de las cuotas

El `Banner` actual se limita al primer `upcoming` de tipo `recurrence`, de modo que las suscripciones siguen teniendo su aviso y las cuotas viven solo en la nueva tarjeta. No se duplica ningún plan.

### Divisa y formato

Cada plan usa su propia divisa con `formatMinor`; los importes no se suman ni se convierten. Las fechas de negocio se formatean con los helpers existentes (`formatDayMonth` / `formatShortDate`).

## Risks / Trade-offs

- [La tarjeta no permite actuar] → es deliberado: cada fila abre el detalle del plan, donde se ve el calendario y se registra la cuota; el resumen solo informa del progreso y la fecha.
- [Duplicar el registro en dos sitios] → el detalle del plan y el de la cuenta comparten el mismo caso de uso `registerInstallment`; no hay lógica de negocio duplicada.
- [Planes vencidos muy antiguos dominan la tarjeta] → el orden los pone primero, que es justo lo que necesita ver la persona; se mantiene la lista completa de planes activos.
- [La tarjeta crece con muchos planes] → se apilan filas sin scroll propio; en móvil ocupan todo el ancho y no desbordan.
- [Datos de demo] → el seed incluye cuatro planes (vencidos, de hoy y futuro) y sube `DEMO_SEED_VERSION`, así que el E2E comprueba orden, progreso y fecha sin crear datos nuevos y las demos antiguas se refrescan solas.

## Migration Plan

No hay migración de datos ni cambios de esquema. El cambio es aditivo y se puede revertir eliminando la tarjeta y el campo de `Overview`.
