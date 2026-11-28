# Proposal

## Why

El detalle de cuenta actual está pensado como una ficha de consulta: no permite cambiar de cuenta sin volver al resumen, duplica cifras que ya viven en el balance y reparte las acciones entre la cabecera y los paneles. Además, el alta de cuenta es la única alta que sigue siendo una ruta completa cuando el resto de altas ya son modales, y los planes de plazos y las recurrentes solo se pueden registrar o pagar, no crear.

## What Changes

- **Panel de cuenta con selector.** `/cuentas/[id]` pasa a ser el panel de cuentas: el segmento «Cuentas» del breadcrumb es un selector de cuentas (desplegable en escritorio, modal en móvil) que navega a la cuenta elegida sin volver al resumen.
- **Cabecera simplificada.** Se eliminan las acciones «Editar», «Añadir movimiento» y «Eliminar» de la cabecera. «Editar» se integra en el panel «Detalles de la cuenta»; «Eliminar» se mueve dentro de la pantalla de edición con confirmación.
- **Resumen depurado.** Se retira la tarjeta «Saldo estimado a fin de mes» (ya vive en el balance) y la tarjeta «Movimientos del mes»; queda el saldo real como única cifra destacada.
- **Balance del mes completo.** La tarjeta «Evolución del mes» se sustituye por el componente de balance del dashboard: evolución diaria del saldo de la cuenta, base del cierre anterior, balance neto del mes y saldo estimado a fin de mes.
- **Últimos movimientos con subtítulo y alta.** El dato de «Movimientos del mes» pasa a subtítulo del panel («N movimientos este mes · ±X % frente al anterior»). El alta de movimiento abre el modal existente con la cuenta preseleccionada; en móvil el botón vive en el pie del panel.
- **Plazos y recurrentes con alta.** Ambos paneles reutilizan el diseño de progreso del dashboard y añaden un botón para crear un plan de plazos o una recurrencia en un modal, con sus casos de uso y validaciones.
- **Alta de cuenta en modal.** Se elimina la ruta `/cuentas/nueva`. Todos los accesos («Nueva cuenta» del resumen, estados vacíos, selector de cuentas y avisos de «sin cuentas» en movimientos) abren un modal de alta reutilizando `AccountForm`.
- **Resumen sin enlace redundante.** El panel de cuentas del dashboard deja de mostrar «Gestionar cuentas»: cada bloque abre su cuenta y el selector vive en el detalle. La píldora «Nueva cuenta» abre el modal de alta.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `producto/finanzas-personales`: el detalle de cuenta se convierte en panel con selector, se simplifican sus cifras y acciones, y se añaden las altas de cuenta, plan de plazos y recurrencia mediante modales; el borrado se traslada a la edición.
- `producto/dashboard-hero`: el panel de cuentas pierde el enlace «Gestionar cuentas» y los accesos al alta siguen funcionando mediante modal.
- `producto/accesos-rapidos`: la píldora «Nueva cuenta» abre el modal de alta en lugar de navegar a una ruta.

## Impact

- `apps/web/app/(app)/cuentas/nueva/page.tsx`: se elimina.
- `apps/web/src/components/pages/account-detail.tsx`: rediseño completo.
- `apps/web/src/components/pages/account-edit.tsx`: asume el borrado con confirmación.
- `apps/web/src/components/pages/dashboard.tsx`, `movement-dialog.tsx`, `new-movement.tsx`: accesos de alta por modal.
- Nuevos componentes web: selector de cuentas, modal de alta de cuenta, formularios y modales de plan de plazos y recurrencia, subtítulo del panel de movimientos.
- `packages/domain/src/services.ts`: casos de uso `createInstallmentPlan` y `createRecurrence` con validaciones y pruebas; sin cambios de modelo ni migraciones.
- `packages/ui`: se reutilizan `MonthBalance`, `ProgressInstallments`, `SelectPill`, `Modal` y los campos existentes; sin componentes nuevos obligatorios.
- `docs/desarrollo/arquitectura.md`, `mapa-diseno-codigo.md` y `desviaciones.md`: rutas y correspondencias.
- E2E: `accounts-movements`, `dashboard`, `movement-dialog` y un spec nuevo del panel de cuenta.
