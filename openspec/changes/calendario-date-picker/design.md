# Design

## Context

Ver `proposal.md` para el motivo. El estado actual que condiciona el diseño:

- `DateField` es hoy un `TextField` con `type="date"`; su `value` y `onChange` son los de un `<input>`, y los tres formularios guardan el valor crudo `YYYY-MM-DD`.
- `SelectControl` (`packages/ui/src/fields.tsx`) ya resuelve un panel propio con posición fija, ajuste al viewport, cierre por `pointerdown` fuera, Escape y devolución del foco. Esa lógica está embebida en el selector.
- `packages/ui` no depende de `date-fns`; sí de `@akari/domain`, que no expone utilidades de fecha de negocio reutilizables. `apps/web` sí usa `date-fns` con locale `es` para formatear.
- `Modal` (`packages/ui/src/feedback.tsx`) atrapa el foco, cierra con Escape escuchando en `document`, bloquea el scroll del fondo y lo devuelve al elemento previo. No contempla capas: dos modales abiertos registran dos listeners de Escape y uno cierra las dos.
- `BottomSheet` existe en `feedback.tsx` pero no se usa en ninguna pantalla y hoy solo es una `Modal` centrada con `max-w-sheet`; no se ancla al borde inferior.
- El diseño congelado define `Field/Date` como una caja de 48 px con icono de calendario y define `Bottom/Sheet` para móvil (360 de ancho, radio superior 24, `motion/slow`, `Elevation/3`), con la nota de que en web se sustituye por `Modal`. No define el panel mensual del calendario.
- `MovementEditDialog` ya es una `Modal`; el campo de fecha de ese formulario abriría la hoja dentro de un modal abierto.
- Los E2E actuales no rellenan fechas: los formularios arrancan con la fecha de hoy.

## Goals / Non-Goals

**Goals:**

- Un único campo de fecha con panel propio y la misma API funcional que el selector: `value` + `onValueChange`.
- Un único `Calendar` para escritorio y móvil: cambia el contenedor, no la rejilla ni su lógica.
- En móvil, una hoja inferior real y alineada con `Bottom/Sheet`, que conviva con un modal ya abierto sin cerrarlo.
- Mantener el formato de negocio `YYYY-MM-DD` como valor en los formularios y en el modelo, sin conversiones en las páginas.
- Reutilizar la mecánica de panel flotante del selector en lugar de duplicarla.

**Non-Goals:**

- Edición de la fecha como texto libre o con máscara.
- Límites `min`/`max`, selección de rangos, horas o zonas horarias.
- Selector rápido de mes y año, o vista anual.
- Arrastrar para cerrar, alturas intermedias (`detents`) o arrastre con gesto.
- Animar la entrada de la hoja: se comporta como el resto de modales, que no animan.
- Tocar `docs/diseno/`, `design/` o `openspec/specs/diseno/*`; la única desviación se anota en `docs/desarrollo/desviaciones.md`.

## Decisions

### Extraer el panel flotante del selector

Mover a `packages/ui/src/floating.ts` la lógica de posición que hoy vive en `SelectControl` (`SELECT_PANEL_*`, `useIsomorphicLayoutEffect`, resize/scroll, cierre por puntero) como un hook `useFloatingPanel({ open, anchorRef, panelRef, minWidth, maxHeight })`. `SelectControl` y el nuevo calendario lo consumen.

- **Por qué:** el calendario necesita exactamente el mismo comportamiento (posición fija, volteo hacia arriba, ajuste de ancho y cierre al pulsar fuera) y la spec prohíbe duplicar piezas equivalentes.
- **Alternativas descartadas:** copiar la lógica en el calendario (duplicación) y usar un `Popover` de una librería nueva (dependencia no justificada).

### Componente `Calendar` independiente del campo

`Calendar` en `packages/ui/src/calendar.tsx` recibe `value?: string`, `onSelect: (date: string) => void` y `labelledBy`, y dibuja solo la rejilla y su cabecera. Lo montan tanto el panel flotante de escritorio como la hoja inferior móvil; el calendario no conoce el formulario, el disparador ni el contenedor.

- **Por qué:** separa presentación y control de apertura, permite probar la rejilla aislada y garantiza que móvil y escritorio comparten exactamente la misma lógica de fechas y de teclado.
- **Alternativas descartadas:** un único componente monolítico `DatePicker` (más difícil de probar y de reutilizar), construir el calendario en `apps/web` (rompe la regla de componentes reutilizables) y un calendario distinto para móvil (dos comportamientos que se desincronizan).

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

### Cabecera, rejilla y acción «Hoy»

- Cabecera: flecha anterior, etiqueta `mes año` centrada en un `aria-live="polite"`, flecha siguiente.
- Rejilla: `role="grid"` con filas y celdas; cada día es un `button` de al menos 44×44 px con `aria-selected` en la fecha elegida y `aria-current="date"` en hoy.
- Pie: botón «Hoy» que selecciona la fecha de hoy, actualiza el mes visible y cierra el contenedor.
- Foco inicial al abrir: la fecha elegida; si no hay, hoy; si el mes visible no la contiene, el primer día disponible del mes.

- **Por qué:** cumple la spec de navegación y objetivos táctiles sin añadir controles que el alcance excluye.
- **Alternativas descartadas:** selector de mes y año en la cabecera (fuera de alcance por decisión del usuario) y «Hoy» que solo navega sin elegir (menos útil y con dos semánticas para el mismo botón).

### Teclado y foco en el calendario

- El disparador es un `button` con `aria-haspopup="dialog"`, `aria-expanded` y el texto de la fecha o «Elegir fecha» cuando está vacío.
- Al abrir, el foco entra en la celda activa del calendario y se aplica foco móvil (roving tabindex).
- Flechas mueven ±1 día y ±7 días, Inicio/Fin van al lunes/domingo de la semana, PageUp/PageDown cambian de mes, Enter o Espacio eligen, Escape cierra y devuelve el foco al disparador.
- Al cambiar de mes con las flechas de cabecera o PageUp/PageDown, el foco se mantiene en la misma posición relativa de la rejilla.

- **Por qué:** replica el patrón de diálogo del selector y evita el salto de foco al re-renderizar la rejilla.
- **Alternativas descartadas:** `role="dialog"` modal también en escritorio (bloquearía el formulario de fondo sin necesidad) y dejar el foco en el disparador mientras se navega la rejilla (dos focos activos).

### Hoja inferior real reutilizando `Modal`

`Modal` gana `placement?: 'center' | 'bottom'` (por defecto `center`, sin cambios para las modales actuales). `BottomSheet` pasa a usar `placement="bottom"`:

- El contenedor se alinea abajo (`items-end`), sin padding inferior, y el panel ocupa el ancho disponible hasta `max-w-sheet` (560 px) con `rounded-t-3xl`, borde solo arriba y `p-6` más `env(safe-area-inset-bottom)`.
- Mantiene el scrim con difuminado, `elevation-3`, `max-h-[90dvh]`, scroll interno, foco atrapado y retorno del foco que ya ofrece `Modal`.
- La hoja recibe `title={label}` del campo, así que anuncia «Fecha» y conserva la ✕ de cierre.

- **Por qué:** el diseño congelado ya define `Bottom/Sheet` para móvil, así que no es una desviación; reutilizar `Modal` evita duplicar scrim, scroll lock y trampa de foco; y `placement` deja intactas las modales de escritorio.
- **Alternativas descartadas:** un componente de hoja desde cero (duplica el comportamiento de `Modal`), `BottomSheet` solo con clases en `DateField` (mezcla presentación de overlay con el campo), hoja en todas las vistas (el diseño reserva la hoja para móvil) y animación de entrada con keyframes en `apps/web` (añade infraestructura de animación solo para esta pieza).

### Pila de overlays para Escape y trampa de foco

`packages/ui/src/overlay-stack.ts` mantiene una pila de identificadores de overlays abiertos y expone `pushOverlay`, `popOverlay`, `isTopOverlay` y un contador de bloqueo de scroll. `Modal` usa el identificador de `useId()`: registra la capa al abrir y solo atiende Escape y la trampa de Tab si es la capa superior.

- **Por qué:** en móvil la hoja de fecha se abre desde `MovementEditDialog`, que ya es una `Modal`; sin capas, Escape cerraría el diálogo de edición además de la hoja y la trampa de foco del padre competiría con la de la hoja.
- **Alternativas descartadas:** una hoja no modal (rompe el bloqueo de scroll y el foco; el patrón `Bottom/Sheet` del diseño es modal), cerrar el diálogo padre antes de abrir la hoja (pierde el formulario a medio rellenar) y `stopPropagation` desde la hoja (depende de dónde viva el listener y no arregla la trampa de Tab del padre).

### Elegir contenedor con `useMediaQuery`

`packages/ui/src/media.ts` expone `useMediaQuery(query)` sobre `useSyncExternalStore`, con `matchMedia`, suscripción a `change` y `getServerSnapshot = () => false`. `DateField` usa `useMediaQuery('(max-width: 767px)')` para elegir hoja inferior o panel flotante.

- **Por qué:** el panel solo se monta tras pulsar el campo, así que el HTML servido nunca lo contiene y no hay desajuste de hidratación; el corte en 768 px coincide con el breakpoint `md` que ya usan la shell y la navegación móvil.
- **Alternativas descartadas:** renderizar ambos contenedores y alternarlos con `hidden`/`md:hidden` (dos calendarios en el DOM, ids y roles duplicados y dos gestiones de foco), decidir con `window.innerWidth` en render (rompe en servidor) y hoja en todas las vistas (el diseño la limita a móvil).

### API de `DateField` y migración de formularios

```ts
type DateFieldProps = {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  help?: string;
  error?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};
```

Los tres formularios pasan de `onChange={(event) => setDate(event.target.value)}` a `onValueChange={setDate}`, y `required` se traduce a `aria-required` en el disparador. La validación sigue en los casos de uso (`ValidationError`); los formularios ya usan `noValidate`. El campo no reenvía atributos de `<input>`: al ser un botón, solo expone `name`, `required`, `disabled` y las props de estado que usa la librería.

- **Por qué:** mantiene el contrato de campos controlados que ya usan `SelectField` y `AmountField`, y evita exponer un evento sintético que ya no existe.
- **Alternativas descartadas:** mantener `onChange` con un objeto falso con `target.value` (mentira de tipo y confuso) y duplicar `DateField` en `apps/web` (rompe la regla de librería única).

## Risks / Trade-offs

- [Pérdida de la validación nativa `required` del navegador] → los formularios usan `noValidate` y validan en `domain/services`; el disparador expone `aria-required` y el error en texto.
- [Pérdida de pegar o escribir una fecha] → decisión explícita del alcance; se puede añadir edición de texto en otro change sin cambiar la spec del panel.
- [Desplazamiento de un día por husos horarios] → todas las conversiones pasan por `dates.ts` y nunca por `toISOString()` ni por `new Date('YYYY-MM-DD')`; se prueba con una fecha de madrugada.
- [Escape o Tab afectando al modal padre] → pila de overlays con prueba de dos modales y de hoja dentro de diálogo.
- [Scroll de fondo desbloqueado al cerrar en orden distinto del de apertura] → el bloqueo se cuenta en la pila y solo se libera cuando no queda ninguna capa.
- [Hoja recortada por el `backdrop-filter` del overlay padre] → la hoja se renderiza dentro del mismo árbol que el diálogo, sin portal; se verifica en el diálogo de edición a 390×844 y con el teclado del formulario cerrado.
- [Desajuste de `matchMedia` en servidor] → `useSyncExternalStore` con snapshot de servidor `false` y montaje del contenedor solo al abrir.
- [Regresión en los tres formularios al cambiar la API] → adaptación mecánica cubierta por `typecheck`, pruebas de componentes y E2E de alta, edición y gasto grupal en escritorio y móvil.

## Migration Plan

1. Extraer el panel flotante y verificar que el selector sigue pasando sus pruebas.
2. Publicar `dates.ts` y `Calendar` con sus pruebas.
3. Añadir `placement` a `Modal`, anclar `BottomSheet` y crear la pila de overlays; las pruebas de `feedback` cubren hojas anidadas, Escape y scroll.
4. Cambiar `DateField` con `useMediaQuery` y su prueba en `fields.test.tsx`.
5. Migrar los tres formularios y añadir E2E de fecha en escritorio y móvil, incluido el caso anidado.
6. Anotar la desviación visual del panel mensual en `docs/desarrollo/desviaciones.md`.

Sin migración de datos: los valores guardados no cambian y no hay rollback especial (revertir la rama restaura el input nativo).
