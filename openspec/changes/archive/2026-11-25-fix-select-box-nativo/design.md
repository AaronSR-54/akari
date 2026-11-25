# Design

## Context

Ver `proposal.md` para el motivo. El estado actual que condiciona la solución:

- `SelectField` y `SelectPill` son `<select>` nativos. Los formularios que los usan viven en páginas y en `Modal`/`BottomSheet` (`packages/ui/src/feedback.tsx`), cuyo panel tiene `overflow-y-auto` y atrapa el tabulador dentro del diálogo.
- Las pruebas de componentes consultan `getByRole('combobox')` y las de E2E usan `selectOption`; ambas dependen hoy del control nativo.
- El diseño aprobado define `Select/Field` como caja de 48 px con chevron que gira en Abierto y estados Cerrado, Abierto y Error. Se implementa ese contrato; no se modifica el diseño.

## Goals / Non-Goals

**Goals:**

- Un único selector de opción única reutilizable por los campos de formulario y las píldoras de filtro.
- Panel dibujado en la aplicación, posicionado correctamente dentro de modales con scroll.
- Paridad funcional con el `<select>` nativo: teclado, búsqueda por letra, obligatoriedad, deshabilitado y error.
- Mantener la API de `SelectPill` y sustituir la de `SelectField` por una explícita de valor.

**Non-Goals:**

- Selector múltiple, buscador dentro del panel o grupos de opciones: no los necesita el producto hoy.
- Cambiar los tokens, el diseño de `Select/Field` o el tamaño de `SelectPill`.
- Tocar `Modal` o `BottomSheet` más allá de lo que exija el posicionamiento.

## Decisions

1. **Patrón ARIA de combobox de solo selección (APG).** El disparador es un `<button type="button">` con `role="combobox"`, `aria-expanded`, `aria-controls` y `aria-activedescendant`; el panel es un `role="listbox"` con `role="option"` e `aria-selected`. El foco nunca sale del disparador.
   - Alternativa descartada: mover el foco real a las opciones. Rompería el atrapado de tabulador del `Modal` y complicaría la devolución de foco.
   - Alternativa descartada: mantener un `<select>` oculto sincronizado con la UI. Duplica la semántica para lectores de pantalla y conserva el desplegable nativo como riesgo.

2. **Panel en el flujo del documento con `position: fixed`, sin portal.** Se mide el disparador con `getBoundingClientRect` al abrir y al hacer scroll o redimensionar. Al ser `fixed` no lo recorta el `overflow` del modal, y al no usar portal el panel permanece dentro del diálogo para `aria-modal` y para el atrapado de foco.
   - Alternativa descartada: `createPortal` a `document.body`. Con `aria-modal="true"` el contenido fuera del diálogo queda oculto para tecnologías de asistencia.
   - Alternativa descartada: `position: absolute` dentro de un contenedor relativo. El modal con scroll lo recortaría.

3. **Un núcleo con dos variantes visuales.** `SelectField` (caja de 48 px) y `SelectPill` (píldora de 32 px) comparten lógica; solo cambian las clases del disparador y el tamaño del icono. Evita dos implementaciones de teclado y accesibilidad.

4. **API controlada y explícita.** `SelectField` recibe `value: string`, `onValueChange(value)`, `options`, `label`, `help`, `error`, `required`, `disabled`, `name`, `id`, `className` y `containerClassName`. `SelectPill` conserva `ariaLabel`, `value`, `onChange(value)` y `options` para no tocar sus pantallas. El cambio de `SelectField` es **BREAKING** solo dentro de `packages/ui`/`apps/web`; se actualizan las doce llamadas.

5. **Nombre accesible mediante `<label htmlFor>`.** `button` es un elemento etiquetable, así que `FieldShell` sigue renderizando el `<label>` visible apuntando al `id` del disparador. No hace falta duplicar la etiqueta con `aria-labelledby` y se conserva la expectativa `getByRole('combobox', { name })`.

6. **Chevron propio y movimiento.** Se añade `IconChevronDown` al set de trazo existente y se rota con `transition-transform` y `motion-reduce:transition-none`. El estado abierto se comunica además con `aria-expanded`, no solo con el giro.

7. **Cierre y posicionamiento.** Se cierra al elegir, con Escape, con Tab, al pulsar fuera (evento `pointerdown` en documento) y al desmontar. Si no hay espacio debajo, el panel se abre encima del disparador; su altura máxima es la disponible en el viewport con scroll interno.

8. **Búsqueda por teclado.** Búfer de caracteres con reinicio a los 500 ms; compara sin distinguir mayúsculas ni acentos con el inicio de la etiqueta y mueve la opción activa sin seleccionar.

## Risks / Trade-offs

- [El panel `fixed` se desalinea si un ancestro cambia de tamaño sin emitir `scroll`/`resize`] → Se recalcula también al abrir, al cambiar el tamaño de la ventana y en `scroll` con captura; el panel se cierra si el disparador deja de estar visible.
- [Romper `onChange` de `SelectField` deja pantallas sin compilar] → El typecheck es la red: se actualizan las doce llamadas en el mismo cambio y las pruebas cubren `onValueChange`.
- [Los E2E dejan de funcionar con `selectOption`] → Se añade un helper `chooseOption` que abre por etiqueta y elige por rol de opción; se migran los diez usos.
- [Listas largas (cuentas, categorías) en pantallas pequeñas] → Altura máxima ligada al viewport y scroll interno del panel.
- [Accesibilidad del listbox en jsdom] → Las pruebas de teclado y axe cubren apertura, recorrido, selección, cierre y nombre accesible.

## Migration Plan

1. Añadir el selector y el icono en `packages/ui` con pruebas de estado y teclado.
2. Migrar `SelectField`/`SelectPill` y las pantallas de `apps/web`; el typecheck debe quedar limpio.
3. Migrar E2E y ejecutar `typecheck`, `lint`, `test`, `build` y `e2e`.
4. Rollback: al ser un cambio local de UI, revertir la rama restaura el `<select>` nativo sin migración de datos.
