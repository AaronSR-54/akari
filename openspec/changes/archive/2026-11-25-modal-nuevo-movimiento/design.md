# Design

## Context

- `MovementForm` ya resuelve el alta y la edición completas en `/movimientos/nuevo`: tipo, importe, cuenta, concepto, fecha, categoría, nota y repetición opcional.
- `MovementEditDialog` es un diálogo reducido que duplica una parte del formulario y vive en `/movimientos`; el detalle de movimientos (change `detalle-de-movimientos`, en curso) lo reutiliza.
- `Modal` de `packages/ui` ya gestiona foco, `Escape`, clic fuera y bloqueo del scroll del documento.
- El diseño visual está congelado: `M09` describe una pantalla de alta y `W03` una edición en línea en la tabla.

## Goals / Non-Goals

**Goals:**

- Que crear y editar un movimiento ocurra en el mismo modal, con todos los campos y sin abandonar el listado.
- Una sola implementación del formulario, para que la página y el modal no diverjan.
- Mantener el borrado con deshacer y el resto de comportamiento actual.

**Non-Goals:**

- Migrar los accesos de resumen, detalle de cuenta y preguntas rápidas al modal: siguen enlazando a `/movimientos/nuevo` (tarjeta aparte).
- Cambiar el modelo, los casos de uso o los tokens.
- Rediseñar la anchura o el espaciado del modal; hay una tarjeta específica para la densidad de los modales de creación.

## Decisions

### Reutilizar `MovementForm` en página y modal

Se añaden props opcionales al formulario: `formId`, `showActions`, `framed`, `onSaved`, `onCancel` y `onSavingChange`.

- `framed={false}` evita una tarjeta dentro del panel del modal.
- `showActions={false}` mueve los botones al pie del modal, que los asocia con `form={formId}` y refleja el estado de guardado mediante `onSavingChange`.
- `onSaved` sustituye la navegación a `/movimientos` por el cierre del modal.

**Por qué:** es la única forma de que el modal tenga exactamente las funcionalidades de la ruta sin duplicar validación, estado ni casos de uso.

### Panel ancho para el formulario

`Modal` gana una prop `width` con dos variantes: `default` (440 px, el token `modal`) y `wide` (`max-w-2xl`, 672 px). El diálogo de movimiento usa `wide`; el resto de modales conserva el ancho actual.

**Por qué:** el formulario completo en 440 px queda demasiado agrupado y es más largo de lo que conviene; 512 px mantiene dos campos por fila en escritorio sin inventar un token nuevo ni tocar el diseño congelado. La densidad general del modal sigue pendiente en su propia tarjeta (`frt5y89ar8ic`).

### `MovementDialog` como única superficie

Un componente nuevo monta `Modal` + `MovementForm` y centraliza el título (`Nuevo movimiento` / `Editar movimiento`), el pie, el borrado con deshacer y el caso sin cuentas.

`MovementEditDialog` se conserva como envoltorio del diálogo nuevo, con la misma API (`movement`, `open`, `onClose`), para que el detalle de movimientos siga compilando cuando su rama se mergee antes que esta.

**Por qué:** el detalle y el listado usan la misma edición; conservar el envoltorio evita un cruce obligatorio en la rama de detalle y deja una sola implementación.

### Mantener la ruta `/movimientos/nuevo`

La ruta sigue existiendo tal cual para enlaces directos y para los accesos que aún no se migran. El modal y la página comparten formulario, así que no hay dos comportamientos.

**Por qué:** romper la ruta dejaría enlaces muertos en resumen, cuenta y preguntas, y complicaría el flujo B de los E2E sin beneficio.

### Registrar la desviación de diseño

El diseño congelado no contempla el alta en modal ni la edición completa en modal. Se anota en `docs/desarrollo/desviaciones.md` con motivo y cierre.

## Risks / Trade-offs

- **El modal es más largo que el diálogo anterior** → el panel ya limita a `90vh` y hace scroll; el formulario va en una columna y el pie queda siempre visible.
- **El formulario cambia de aspecto al pasar de página a modal** → a una columna y sin tarjeta; es el mismo contenido y la misma validación.
- **La rama de detalle quita los botones «Editar» del listado** → al rebasar, la edición del listado desaparece y el modal se abre desde el detalle; el envoltorio `MovementEditDialog` mantiene esa ruta sin cambios.
- **Los E2E actuales editan desde el listado** → se conservan los textos (`Editar movimiento`, `Guardar`, `Concepto`) para que sigan pasando, y se añade un spec propio del modal.
