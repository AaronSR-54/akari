# Design

## Context

Ver `proposal.md` para el motivo. El estado actual que condiciona el diseño:

- `DateField` es hoy un `TextField` con `type="date"`; su `value` y `onChange` son los de un `<input>`, y los tres formularios guardan el valor crudo `YYYY-MM-DD`.
- `SelectControl` (`packages/ui/src/fields.tsx`) ya resuelve un panel propio con posición fija, ajuste al viewport, cierre por `pointerdown` fuera, Escape y devolución del foco. Esa lógica está embebida en el selector.
- `packages/ui` no depende de `date-fns`; sí de `@akari/domain`, que no expone utilidades de fecha de negocio reutilizables. `apps/web` sí usa `date-fns` con locale `es` para formatear.
- El diseño congelado define `Field/Date` como una caja de 48 px con icono de calendario; no define el panel mensual. La spec `producto/componentes` ya admite paneles dibujados por la aplicación para el selector de opción única.
- Los E2E actuales no rellenan fechas: los formularios arrancan con la fecha de hoy.

## Goals / Non-Goals

**Goals:**

- Un único campo de fecha con panel propio y la misma API funcional que el selector: `value` + `onValueChange`.
- Mantener el formato de negocio `YYYY-MM-DD` como valor en los formularios y en el modelo, sin conversiones en las páginas.
- Reutilizar la mecánica de panel flotante del selector en lugar de duplicarla.

**Non-Goals:**

- Edición de la fecha como texto libre o con máscara.
- Límites `min`/`max`, selección de rangos, horas o zonas horarias.
- Selector rápido de mes y año, o vista anual.
- Tocar `docs/diseno/`, `design/` o `openspec/specs/diseno/*`; la diferencia se anota en `docs/desarrollo/desviaciones.md`.

## Decisions

### Extraer el panel flotante del selector

Mover a `packages/ui/src/floating.ts` la lógica de posición que hoy vive en `SelectControl` (`SELECT_PANEL_*`, `useIsomorphicLayoutEffect`, resize/scroll, cierre por puntero) como un hook `useFloatingPanel({ open, anchorRef, panelRef, minWidth, maxHeight })`. `SelectControl` y el nuevo calendario lo consumen.

- **Por qué:** el calendario necesita exactamente el mismo comportamiento (posición fija, volteo hacia arriba, ajuste de ancho y cierre al pulsar fuera) y la spec prohíbe duplicar piezas equivalentes.
- **Alternativas descartadas:** copiar la lógica en el calendario (duplicación) y usar un `Popover` de una librería nueva (dependencia no justificada).

### Componente `Calendar` independiente del campo

`Calendar` en `packages/ui/src/calendar.tsx` recibe `value?: string`, `onSelect: (date: string) => void` y `labelledBy`, y dibuja solo la rejilla y su cabecera. El `DateField` lo monta dentro del panel flotante; el calendario no conoce el formulario ni el disparador.

- **Por qué:** separa presentación y control de apertura, permite probar la rejilla aislada y deja la puerta abierta a usarla en un futuro selector de rango sin rehacerla.
- **Alternativas descartadas:** un único componente monolítico `DatePicker` (más difícil de probar y de reutilizar) y construir el calendario en `apps/web` (rompe la regla de componentes reutilizables en `packages/ui`).

### Fechas de negocio sin dependencias nuevas

`packages/ui/src/dates.ts` con utilidades puras sobre `Date` local e `Intl`:

- `parseBusinessDate('YYYY-MM-DD')` construye la fecha con `new Date(year, month - 1, day)`, nunca con el constructor de cadena (que interpreta UTC y desplaza el día).
- `formatBusinessDate` usa `Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })` y normaliza el resultado a `dd MMM yyyy` en minúsculas.
- `todayBusinessKey`, `addDays`, `addMonths`, `startOfMonthGrid` y `monthLabel` completan lo que necesita la rejilla.

- **Por qué:** evita añadir `date-fns` a `ui` y elimina el riesgo clásico de que `YYYY-MM-DD` se muestre un día antes.
- **Alternativas descartadas:** importar `date-fns` en `ui` (dependencia nueva solo para formatear y sumar meses) y usar `toISOString()` (desplaza el día en husos al oeste de UTC).

### Rejilla mensual con semana que empieza en lunes

La rejilla se calcula con 6 filas × 7 columnas empezando en lunes, coherente con el locale `es-ES`, y rellena con días de los meses contiguos marcados como fuera de mes y no seleccionables. Las cabeceras de columna son `L M X J V S D` con nombre accesible completo.

- **Por qué:** es la convención del producto y del diseño (fechas en español) y mantiene el panel con altura estable al cambiar de mes.
- **Alternativas descartadas:** depender de `Intl.Locale.weekInfo` (soporte irregular) y mostrar solo las semanas del mes (la altura del panel saltaría entre meses).

### Panel: cabecera, rejilla y acción «Hoy»

- Cabecera: flecha anterior, etiqueta `mes año` centrada en un `aria-live="polite"`, flecha siguiente.
- Rejilla: `role="grid"` con filas y celdas; cada día es un `button` de al menos 44×44 px con `aria-selected` en la fecha elegida y `aria-current="date"` en hoy.
- Pie: botón «Hoy» que selecciona la fecha de hoy, actualiza el mes visible y cierra el panel.
- Foco inicial al abrir: la fecha elegida; si no hay, hoy; si el mes visible no la contiene, el primer día disponible del mes.

- **Por qué:** cumple la spec de navegación y objetivos táctiles sin añadir controles que el alcance excluye.
- **Alternativas descartadas:** selector de mes y año en la cabecera (fuera de alcance por decisión del usuario) y «Hoy» que solo navega sin elegir (menos útil y con dos semánticas para el mismo botón).

### Teclado y foco

- El disparador es un `button` con `aria-haspopup="dialog"`, `aria-expanded` y el texto de la fecha o «Elegir fecha» cuando está vacío.
- El panel es un `dialog` no modal etiquetado; al abrir recibe el foco la celda activa y se aplica foco móvil (roving tabindex).
- Flechas mueven ±1 día y ±7 días, Inicio/Fin van al lunes/domingo de la semana, PageUp/PageDown cambian de mes, Enter o Espacio eligen, Escape cierra y devuelve el foco al disparador.
- Al cambiar de mes con las flechas de cabecera o PageUp/PageDown, el foco se mantiene en la misma posición relativa de la rejilla.

- **Por qué:** replica el patrón de diálogo no modal del selector y evita el salto de foco al re-renderizar la rejilla.
- **Alternativas descartadas:** `role="dialog"` modal con trampa de foco (bloquearía el formulario de fondo sin ser lo que pide la tarjeta).

### API de `DateField` y migración de formularios

```ts
type DateFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type' | 'value' | 'onChange'> & {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  help?: string;
  error?: string;
  id?: string;
};
```

Los tres formularios pasan de `onChange={(event) => setDate(event.target.value)}` a `onValueChange={setDate}`, y `required` se traduce a `aria-required` en el disparador. La validación sigue en los casos de uso (`ValidationError`); el formulario ya usa `noValidate`.

- **Por qué:** mantiene el contrato de campos controlados que ya usan `SelectField` y `AmountField`, y evita exponer un evento sintético que ya no existe.
- **Alternativas descartadas:** mantener `onChange` con un objeto falso con `target.value` (mentira de tipo y confuso) y duplicar `DateField` en `apps/web` (rompe la regla de librería única).

## Risks / Trade-offs

- [Pérdida de la validación nativa `required` del navegador] → los formularios usan `noValidate` y validan en `domain/services`; el disparador expone `aria-required` y el error en texto.
- [Pérdida de pegar o escribir una fecha] → decisión explícita del alcance; se puede añadir edición de texto en otro change sin cambiar la spec del panel.
- [Desplazamiento de un día por husos horarios] → todas las conversiones pasan por `dates.ts` y nunca por `toISOString()` ni por `new Date('YYYY-MM-DD')`; se prueba con una fecha de madrugada.
- [Panel recortado en pantallas bajas o dentro de modales] → se reutiliza el panel flotante del selector con volteo y altura máxima; se verifica en el diálogo de edición a 390 px de alto.
- [Regresión en los tres formularios al cambiar la API] → adaptación mecánica cubierta por `typecheck`, pruebas de componentes y E2E de alta, edición y gasto grupal.

## Migration Plan

1. Extraer el panel flotante y verificar que el selector sigue pasando sus pruebas.
2. Publicar `Calendar` y `dates.ts` con sus pruebas.
3. Cambiar `DateField` y su prueba en `fields.test.tsx`.
4. Migrar los tres formularios y añadir E2E de fecha.
5. Anotar la desviación visual en `docs/desarrollo/desviaciones.md`.

Sin migración de datos: los valores guardados no cambian y no hay rollback especial (revertir la rama restaura el input nativo).
