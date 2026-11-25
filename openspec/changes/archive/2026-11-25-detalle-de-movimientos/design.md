# Design

## Context

Ver `proposal.md` para el motivo. El estado actual que condiciona el diseño:

- `/movimientos` es una pantalla cliente que filtra y ordena en memoria y monta `MovementEditDialog` con el movimiento seleccionado; el botón «Editar» vive en la última columna de la tabla de escritorio y en cada tarjeta móvil.
- `MovementEditDialog` ya contiene el formulario de edición, la validación de importe y el borrado con deshacer; no depende de la tabla.
- `MovementRow` (en `packages/ui`) acepta `onClick` y renderiza un `button` con hover cuando se le pasa, y no puede importar Next.
- `Modal` usa `z-50`, foco atrapado y cierre con Escape; dos modales abiertas a la vez comparten atajo y trampa de foco, así que conviene no anidarlas.
- `MovementRepository` ya expone `get(id)`; no hace falta tocar `domain` ni `data`.
- El diseño visual está congelado y no incluye una modal de detalle de movimiento.

## Goals / Non-Goals

**Goals:**

- Un único lugar donde consultar, editar y eliminar un movimiento.
- Que toda la fila de las listas abra el detalle en una modal, sin cambiar de ruta.
- Quitar la edición en línea del listado sin perder ninguna capacidad (editar y eliminar siguen disponibles en el detalle).

**Non-Goals:**

- Cambiar el modelo de datos, los casos de uso o las migraciones.
- Añadir una ruta de detalle o enlaces profundos a un movimiento.
- Anidar modales: editar y confirmar el borrado sustituyen temporalmente a la modal de detalle.
- Tocar `docs/diseno/`, `design/` o `openspec/specs/diseno/*`.

## Decisions

### Reutilizar el diálogo de edición en el detalle

El detalle monta el mismo `MovementEditDialog` con un botón «Editar» y un botón «Eliminar» que abre el mismo flujo de borrado con deshacer.

- **Por qué:** ya existe, valida y confirma igual que hoy; evita una segunda superficie de edición y mantiene `updateMovement`/`deleteMovement` como única vía de escritura.
- **Alternativas descartadas:** formulario inline (duplica validación y estados) y ruta `/movimientos/[id]/editar` (más superficie y otra pantalla que el diseño no contempla).

### Detalle en modal, sin ruta

- La fila abre una modal de detalle en lugar de navegar. En escritorio la fila entera tiene `onClick`, cursor pointer y `hover:bg-surface-sunken`, y el concepto es un `button` enfocable para teclado; el manejador de la fila ignora los clics que nacen de un control para no abrir dos veces. En móvil, `MovementRow` recibe `onClick` y ya renderiza un `button` con hover.
- **Por qué:** el producto va hacia modales para crear, editar y detallar movimientos; el listado no pierde filtros ni posición al abrir y cerrar, y no hace falta una ruta nueva que el diseño no contempla.
- **Alternativas descartadas:** ruta `/movimientos/[id]` (navegación completa y fuera del patrón de modales que pide la tarjeta); `Link` de Next envolviendo la fila (ya no hay destino que enlazar).

### Una sola modal a la vez

- La modal de detalle no apila otras: al pulsar «Editar» se renderiza `MovementEditDialog` en su lugar y al cerrarlo vuelve el detalle con los datos refrescados por `useLiveQuery`. Al pulsar «Eliminar» se renderiza la confirmación en su lugar.
- **Por qué:** `Modal` atrapa el foco y escucha Escape en `document`; dos modales simultáneas cerrarían las dos con un solo Escape y competirían por el foco.
- **Alternativas descartadas:** anidar modales con `z-index` distinto (requiere tocar `packages/ui` y su trampa de foco, fuera de alcance) y cerrar el detalle para abrir la edición sin volver (peor continuidad).

### Lectura del movimiento y de sus vínculos

- `useMovement(id)` sobre `repositories.movements.get(id)`, con el mismo patrón `useLiveQuery` + `ready` que `useAccount`, para que la modal muestre siempre el dato vigente tras editar.
- Para el vínculo a un gasto grupal, `useGroupExpense(id)` resuelve `groupId` y permite enlazar a `/grupos/[groupId]`.
- Recurrencia y plan de plazos enlazan a `/cuentas/[accountId]`, donde ya se muestran ambos.
- **Por qué:** reutiliza repositorios existentes y mantiene la fuente de verdad en IndexedDB.

### Composición de la modal

- `MovementDetailDialog` recibe `movementId`, `open` y `onClose`, y monta un `Modal` con `max-w-xl`.
- El cuerpo usa `InfoRow` para tipo, importe con signo, divisa, fecha, categoría, cuenta, nota y creación, más un bloque de vínculos cuando existan; el pie ofrece «Eliminar» y «Editar», y el cierre es la ✕ de la cabecera.
- Si el movimiento desaparece mientras está abierta, un efecto cierra la modal.
- **Por qué:** reutiliza los componentes de presentación existentes y no introduce layout nuevo.

### Registrar la desviación de diseño

Al no existir la modal en el diseño congelado, se añade una entrada en `docs/desarrollo/desviaciones.md` que describa la superficie implementada, el motivo y el cierre (revisión de diseño si se reabre la fase).

## Risks / Trade-offs

- **Los filtros del listado se mantienen al abrir y cerrar la modal** (no hay navegación) → sin coste adicional.
- **La fila es un `button`, no un enlace** → no se puede abrir el movimiento en otra pestaña; a cambio, el detalle vive en la misma pantalla como pide el producto.
- **Una modal con el movimiento ya borrado** → un efecto la cierra cuando `useMovement` devuelve `null`, cubierto por escenario.
- **E2E actuales editan desde la tabla** → hay que reescribirlos para abrir la modal antes de editar; si no, fallan.
- **Cruce con la PR #5 (`feat/fix-select-box-nativo`)** → esa rama ya modifica `e2e/accounts-movements.spec.ts` y `e2e/a11y.spec.ts`, los mismos dos ficheros que tocaremos. Se mergea primero la #5 y se rebasa esta rama antes de abrir la PR. Para no añadir otro cruce, `movement-edit-dialog.tsx` se reutiliza sin cambios.
- **Cruce menor con `difuminar-fondo-modales`** en `docs/desarrollo/desviaciones.md` (ambos añaden una sección al final) → se resuelve al rebasar; no afecta a código.
- **La modal de detalle reutiliza `MovementEditDialog` sin modificarlo** → si otra tarea reescribe esa modal (crear/editar), habrá que ajustar solo el punto donde se monta.
