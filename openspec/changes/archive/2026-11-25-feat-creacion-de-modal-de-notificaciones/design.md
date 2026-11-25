# Design

## Context

- El shell web vive en `apps/web/src/components/shell/`. `AppShellInner` centraliza el estado del buscador y monta `SearchDialog`; la campana existe en `DesktopHeader` y `HeaderNav`.
- Los datos se leen con `useLiveQuery` desde IndexedDB. `upcomingPayments` ya calcula cuotas y suscripciones de gasto de los próximos 14 días, pero no conoce saldos, autoría ni liquidaciones.
- `Movement` no guarda quién lo creó. Las cuentas conjuntas tienen `members` y los grupos tienen sus propios `members`; el perfil local implícito es «Marta» (avatar del shell y miembro del grupo demo).
- `Settings` es un único registro con `theme`, `shellMode`, onboarding y demo; no guarda estado de lectura.
- `settleTransfer` registra una liquidación como `Transfer` con `status: 'settled'`; `computeSettlement` calcula las pendientes a partir de gastos y transferencias liquidadas.
- `SCHEMA_VERSION` es 2; el backup exporta todas las tablas y acepta versiones 1..N.
- El diseño visual está congelado; no se consultan ni modifican `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.

## Goals / Non-Goals

**Goals:**

- Un único selector de dominio produzca el feed completo (pagos, actividad conjunta y liquidaciones) con identificadores estables y estado de visto.
- Que el panel concentre la información y la acción: pulsar una fila paga o navega, sin botones redundantes.
- Que el indicador de la campana represente novedades reales y se limpie al abrir.

**Non-Goals:**

- Identidad de usuario real, autenticación o sincronización.
- Push, notificaciones nativas o campana en tablet/móvil.
- Atribuir movimientos de cuentas personales o de depósito.
- Rehacer el listado o el detalle de movimientos para mostrar el autor.

## Decisions

### 1. Autor del movimiento y migración v3

Se añade `memberId?: string | null` a `Movement` y `MovementInput`. `recordMovement` valida que el miembro pertenezca a `account.members` y guarda el autor; `updateMovement` permite cambiarlo o mantenerlo. `SCHEMA_VERSION` pasa a 3 con una migración que normaliza `memberId` a `null` en los movimientos existentes sin tocar índices ni borrar datos. El backup acepta copias 1..3 y exporta el campo nuevo.

- **Por qué:** sin autor no se puede cumplir «Ana añadió 50 €». Es un cambio aditivo y compatible con datos antiguos.
- **Alternativa descartada:** inferir el autor por el nombre del grupo o mostrar la actividad sin atribuir; no responde a lo pedido.
- **Formulario:** `MovementForm` muestra un selector de miembro solo cuando la cuenta tiene `members`, con el perfil actual si pertenece a la cuenta y, si no, el primer miembro. El campo viaja en el alta y la edición.

### 2. Selector de dominio `buildNotifications`

Nuevo `packages/domain/src/notifications.ts` con `buildNotifications(input)` puro:

- **Pagos:** envuelve `upcomingPayments`, resuelve la cuenta y calcula su saldo con `calculateAccountBalance`. Cada pago lleva saldo y cobertura (`cubre` o `faltan X`), estado y acción `pay-recurrence`/`pay-installment`.
- **Actividad conjunta:** movimientos de cuentas `joint` de los últimos 7 días, con el nombre del autor tomado de `account.members`; expresa «añadió» para ingresos y «gastó» para gastos. Excluye movimientos del perfil actual y de cuentas no conjuntas. Sin autor, muestra actividad genérica.
- **Liquidaciones:** para cada grupo donde el perfil actual es miembro, usa `computeSettlement` para pendientes (a favor y en contra) y las transferencias liquidadas recibidas en los últimos 7 días.
- **Identificadores:** incluyen la fecha o el importe relevante (`payment:recurrence:id:nextDate`, `joint-activity:movementId`, `settlement-pending:groupId:from:amount`, `settlement-received:transferId`) para que un pago nuevo o una liquidación distinta cuenten como novedad.
- **Salida:** `AppNotification` con `id`, `kind`, `tone`, `title`, `detail`, `status`, `amountMinor`, `currency`, `date`, `seen` y `action` discriminada, ordenada por fecha ascendente.

- **Por qué:** concentra reglas de negocio probables en dominio puro, deja la UI presentacional y evita duplicar cálculos de saldo.
- **Alternativa descartada:** calcular todo en el hook de web; dificultaría las pruebas y mezclaría formato con negocio.

### 3. Vistos persistidos en ajustes

`Settings.seenNotificationIds?: string[]`. Al abrir el panel, `AppShellInner` guarda los identificadores actuales (máximo 100, los más recientes) con `repositories.settings.update`. La campana cuenta `notifications.filter((n) => !n.seen).length`, así que el indicador desaparece al abrir y vuelve cuando aparece un identificador nuevo.

- **Por qué:** el usuario pide limpiar el aviso al abrir, sin perder la capacidad de avisar de novedades posteriores.
- **Alternativa descartada:** un booleano «leído» global; no permitiría distinguir avisos nuevos de los ya vistos.

### 4. Pagos accionables desde la fila

`payRecurrence(repositories, recurrenceId)` crea el movimiento de gasto con el importe y concepto de la recurrencia, la enlaza con `recurrenceId` y avanza `nextDate` con `addFrequency`; si supera `endDate`, elimina la recurrencia. Para cuotas se reutiliza `registerInstallment`. Ambas operaciones son transaccionales cuando el repositorio lo permite.

- **Por qué:** «que haga lo que tenga que hacer» implica que el pago avance de verdad la suscripción o el plan, no solo abrir un formulario.
- **Alternativa descartada:** enlazar a `/movimientos/nuevo`; no avanza la recurrencia ni la cuota y deja el aviso vivo.
- **Riesgo asumido:** el clic paga sin confirmación. Se compensa con un toast inmediato y con la actualización en vivo; no hay deshacer porque las mutaciones actuales tampoco lo ofrecen.

### 5. Panel desplegable con lista única por fecha

`NotificationsPanel` se renderiza anclado bajo la campana dentro de un contenedor relativo del header, sin backdrop ni bloqueo de página. Mide `28rem` de ancho (máximo del viewport menos márgenes), alto máximo de `100vh - 6rem` con scroll interno y una única lista ordenada por fecha ascendente (la ordena `buildNotifications`), sin secciones por tipo. Las cuotas llevan el fondo rojo y un icono de aviso; los próximos pagos recurrentes, fondo azul e icono de reloj; el resto de filas usa superficie neutra. Cada fila incluye icono centrado verticalmente, badge de estado, saldo (y cuánto falta si no cubre), importe a la derecha y una flecha. Cada fila es un `button` (pagos) o un `Link` (cuenta/grupo); no hay enlace «Pagar» separado. Al abrirse, una capa fija con `backdrop-blur-sm` difumina el resto de la página —el mismo efecto ligero que las modales— y el panel usa además superficie translúcida. Cierra con Escape, con la ✕ o con un clic fuera, devolviendo el foco a la campana.

- **Por qué:** una superficie única, legible y accionable; el componente sigue siendo probable con fixtures.
- **Accesibilidad:** la fila conserva nombre accesible completo; los botones deshabilitados mientras se registra el pago no pierden el foco.

### 6. Perfil actual compartido

`apps/web/src/lib/current-user.ts` exporta `CURRENT_USER = { name: 'Marta', initials: 'MR' }`. La sidebar deja de duplicar nombre e iniciales y el feed usa `CURRENT_USER.name` para resolver autoría y liquidaciones. No se introduce identidad persistida.

## Risks / Trade-offs

- **Pago con un solo clic** → toast inmediato y actualización en vivo; si se paga por error, el movimiento se puede eliminar desde el listado, pero la recurrencia ya habrá avanzado. Se documenta en la desviación.
- **Movimientos antiguos sin autor** → la migración deja `null` y el aviso muestra actividad genérica; no se inventa un autor.
- **La demo no tiene liquidaciones recibidas** → el demo sí muestra pendientes en contra («Debes X a Ana/Luis»); las recibidas se cubren con pruebas unitarias del selector.
- **`seenNotificationIds` puede crecer** → se recorta a los 100 identificadores más recientes.
- **Atribución limitada a cuentas conjuntas** → es el único caso en el que el formulario pide autor; el resto no se atribuye.
- **La migración v3 toca todos los movimientos** → solo añade `memberId: null` y no cambia índices; la prueba de migración verifica que se conservan los datos.

## Migration Plan

1. Publicar `SCHEMA_VERSION = 3` con la migración aditiva y verificar apertura desde una base v2.
2. Mantener compatibilidad de backup: importar copias v1/v2 sin `memberId` y exportar v3 con el campo.
3. Rollback: el campo es opcional y la app anterior lo ignora; no hay borrado de datos.

## Open Questions

Ninguna.
