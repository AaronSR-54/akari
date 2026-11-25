# Proposal

## Why

El shell ya muestra un botón de avisos con campana en escritorio, pero hoy no hace nada: la persona no tiene un lugar donde ver de una vez las cuotas vencidas, los próximos pagos, la actividad de sus cuentas conjuntas ni las liquidaciones pendientes. La spec de finanzas personales promete que esos pagos «aparecen en los avisos», y esa superficie todavía no existe. El resumen solo enseña el primer aviso en un banner, así que el resto queda oculto.

## What Changes

- Nuevo **panel desplegable de avisos**, anclado a la campana del shell, tanto en la variante sidebar (`DesktopHeader`) como en la variante header (`HeaderNav`), con una **única lista cronológica ordenada por fecha** y sin secciones por tipo:
  - **Pagos próximos**: cuotas de planes vencidas o que vencen en 14 días y suscripciones de gasto con próximo cargo en ese plazo, con concepto, importe, cuenta, fecha, estado y **saldo disponible de la cuenta**, e indicación de cuánto falta cuando no lo cubre.
  - **Cuentas compartidas**: movimientos recientes de cuentas conjuntas con **autor** («Ana añadió 50 €», «Luis gastó 60 €»), concepto, cuenta y fecha.
  - **Liquidaciones**: pendientes y recibidas que afectan a la persona actual (perfil «Marta»), indicando contraparte, grupo y sentido («Debes 30 € a Ana», «Ana te debe 30 €», «Has recibido 10 € de Ana»).
- **Los movimientos pasan a guardar su autor** (`memberId`) cuando la cuenta es conjunta. El alta y la edición muestran un selector de miembro para esas cuentas; la migración v3 conserva todos los datos y el backup sigue siendo compatible.
- **Toda la fila de la notificación es la acción**, sin botón «Pagar» aparte:
  - pago recurrente → registra el gasto y avanza la próxima fecha;
  - cuota de plazo → registra la cuota y avanza el plan;
  - actividad conjunta → abre el detalle de la cuenta;
  - liquidación → abre el grupo para revisarla o liquidarla.
- **Indicador de nuevas**: la campana cuenta solo las notificaciones no vistas; al abrir el panel con pendientes se marcan como vistas y el indicador desaparece. Si aparece una notificación nueva después, vuelve a mostrarse. El estado se guarda en ajustes (`seenNotificationIds`), acotado para no crecer sin límite. Las cuotas pendientes se marcan con fondo rojo e icono de aviso; los próximos pagos recurrentes, con fondo azul e icono de reloj.
- El feed se calcula en vivo desde IndexedDB; al pagar, registrar actividad o liquidar, el panel y el indicador se actualizan solos.

**Fuera de alcance:** no se añade la campana a tablet ni móvil, no hay push ni notificaciones del sistema, no se avisa de la actividad de cuentas personales o depósitos, y no se añade un sistema de identidad: «Marta» sigue siendo el perfil local implícito.

## Capabilities

### New Capabilities

- `producto/avisos`: panel desplegable de avisos de pagos, actividad de cuentas conjuntas y liquidaciones, con cobertura de saldo, acciones por fila e indicador de no vistas.

### Modified Capabilities

- `producto/finanzas-personales`: el registro de movimientos incorpora el autor opcional en cuentas conjuntas y el selector de miembro correspondiente.

## Impact

- **Modelo y datos:** `Movement.memberId` opcional, `MovementInput` y validación de pertenencia; `Settings.seenNotificationIds`; `SCHEMA_VERSION` 3 y migración que conserva datos; seed con autores en los movimientos conjuntos.
- **Dominio:** nuevo selector `buildNotifications` (pagos con cobertura, actividad conjunta y liquidaciones), caso de uso `payRecurrence` y pruebas unitarias.
- **Componentes:** `NotificationsPanel` (desplegable anclado a la campana, lista única y filas accionables); `app-shell.tsx` comparte el feed, el contador y las acciones; `sidebar.tsx` conecta la campana y el indicador; `movement-form.tsx` añade el selector de autor y admite importe/concepto precargados desde la URL.
- **UI:** se reutilizan `Modal` con ancho ampliado, `Badge`, `Amount`, `Icon` y `IconButton`; sin cambios en `packages/ui`.
- **Pruebas:** unitarias del selector, migración, autor y `payRecurrence`; pruebas del panel; E2E de pagos, actividad conjunta, liquidaciones, limpieza del indicador, estado vacío y accesibilidad.
- **Documentación:** `docs/desarrollo/arquitectura.md` y `docs/desarrollo/desviaciones.md` (§7).
- **Sin cambios** en `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
