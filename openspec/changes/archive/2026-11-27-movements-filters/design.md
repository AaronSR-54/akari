# Design

## Context

La pantalla de Movimientos compone hoy cuatro controles de tipo con `SegmentedControl`, una cápsula de mes que solo decora y tres `SelectPill` (categoría, cuenta y orden). No existe filtro por fecha aunque el calendario y la hoja inferior móvil ya están publicados en `packages/ui`.

`useFloatingPanel` calcula la posición del panel con `position: fixed` y la recalcula en cada evento de scroll. `SelectControl` llama a `scrollIntoView` sobre la opción activa al abrirse, lo que puede arrastrar la página. `DateField` ya elige entre panel flotante y `BottomSheet` según `useMediaQuery(MOBILE_MEDIA_QUERY)`; los selectores no.

## Goals / Non-Goals

**Goals:**

- Una sola barra de filtros coherente, sin la cápsula de mes decorativa.
- Filtro de periodo con atajos y rango personalizado reutilizando el calendario publicado.
- Selectores con hoja inferior en móvil y panel anclado al disparador en escritorio.
- Cobertura unitaria de los componentes y E2E de la pantalla y del selector móvil.

**Non-Goals:**

- Persistir filtros en la URL, en IndexedDB o entre sesiones.
- Hacer sticky la barra de filtros.
- Cambiar el modelo de datos, los casos de uso o la paginación.
- Convertir otros listados o paneles en barras de filtros unificadas.

## Decisions

### 1. El tipo pasa a ser un `SelectPill`

`Todos`, `Gastos`, `Ingresos` y `Suscripciones` dejan de ocupar cuatro botones y se eligen desde un único selector con el mismo patrón que categoría, cuenta y orden. Se mantiene el valor `all` y los filtros actuales; solo cambia el control. Así la barra cabe en móvil sin scroll horizontal y todos los filtros comparten interacción.

Alternativa descartada: mantener el segmentado y envolverlo en un contenedor. No resuelve el ancho ni unifica el patrón de interacción.

### 2. `DateRangeField` reutilizable en `packages/ui`

Se añade un campo de rango con dos variantes visuales, `field` y `pill`, para formularios y barras de filtros. El disparador muestra la etiqueta del atajo activo o el rango formateado; sin valor muestra «Cualquier fecha» con color de texto secundario (no `placeholder`) para mantener el contraste AA en la píldora de 10 px.

El panel contiene:

- Atajos opcionales centrados (`label` + rango). Al elegir uno se comunica el valor y se cierra.
- Un `Calendar` en modo rango con los extremos y los días intermedios destacados.
- Un pie con el resumen del rango, «Limpiar» y «Aplicar».

En escritorio usa `useFloatingPanel`; en móvil usa la misma `BottomSheet` que `DateField`. El rango pendiente se inicializa desde el valor al abrir y solo se comunica al aplicar, de modo que cerrar sin aplicar conserva el valor anterior. La etiqueta del rango no repite el mes cuando los dos extremos caen en el mismo mes: `1–2 nov 2026`, `1–30 nov 2026`.

Alternativa descartada: dos `DateField` anidados (desde/hasta). Reutiliza el calendario, pero exige abrir dos hojas o paneles y complica el foco; un calendario de rango expresa mejor la selección.

### 3. El calendario gana un modo rango opcional

`Calendar` mantiene su API de fecha única y añade props opcionales de rango. Con `onRangeChange`, el clic en un día:

- Sin extremos o con el rango completo: inicia un nuevo rango.
- Con solo el inicio: cierra el rango; si el día es anterior, intercambia los extremos.

No se cierra al elegir día en modo rango; el cierre lo decide `DateRangeField` con «Aplicar» o el descarte. La vista de meses y años, el teclado y «Hoy» se conservan; «Hoy» fija ambos extremos en la fecha actual.

La banda de selección no redondea cada día: los extremos redondean solo su lado exterior y los días intermedios no redondean. En rangos de una o dos semanas, la banda cierra las esquinas al domingo y las vuelve a abrir el lunes. Si el rango ocupa más de dos semanas, los cortes entre semanas quedan rectos porque la banda continúa, y solo se redondean los extremos reales del rango.

La rejilla no fija un ancho mínimo por día: las siete columnas se reparten el ancho del panel, así que el calendario nunca provoca scroll horizontal aunque el panel sea estrecho. En móvil la hoja es más ancha y los objetivos táctiles crecen con ella.

Los días de los meses contiguos dejan de estar deshabilitados: se muestran atenuados, se pueden elegir y la selección usa su fecha real. La cabecera no salta de mes al pulsarlos, para no romper la selección de un rango que cruza el cambio de mes; las flechas mueven **desde el mes visible** (no desde el día activo), así que al volver al mes del día contiguo elegido ese extremo aparece marcado. El color atenuado solo se aplica a los días contiguos sin selección ni banda: un extremo o un día incluido usa el color de acento, con contraste suficiente.

Alternativa descartada: un `RangeCalendar` separado. Duplicaría la rejilla, la navegación y las pruebas del calendario.

### 4. Periodo junto al resumen y ordenación en la barra

La barra conserva una cápsula de ordenación independiente con fecha e importe. El periodo sale de la barra: `movements.tsx` calcula sus atajos con `appNow()` y `date-fns` (este mes, mes anterior, últimos 30 días) y renderiza un `DateRangeField` propio junto al recuento de movimientos, en una fila encima del buscador y con el mismo ancho que el buscador (`md:w-72`, `w-full` en móvil) para que su borde derecho coincida. El resumen deja de duplicar la etiqueta del periodo: la muestra el propio control.

El filtro compara `movement.date` como fecha de negocio `YYYY-MM-DD` con `start` y `end`, ambos incluidos. El valor inicial es un rango vacío para conservar el comportamiento actual de mostrar todos los movimientos. La barra alinea el grupo de filtros a la derecha y el botón «Limpiar filtros» desaparece de la barra: solo se ofrece en el estado vacío, porque cada control tiene su propia opción de reinicio.

El panel de periodo se compacta solo para este listado: `Calendar` acepta `showToday` y `DateRangeField` acepta `showToday`/`showHint`, ambos por defecto en `true` para no cambiar el campo de fecha ni otros usos. En movimientos se pasan a `false`, así que el panel no muestra el botón «Hoy» ni la pista del rango pendiente. Las acciones Aplicar y Limpiar viven en un pie fijo fuera del área con scroll (`flex min-h-0 flex-col` + cuerpo `overflow-y-auto`), de modo que siempre se ven sin desplazar el panel, incluso cuando los atajos ocupan dos filas.

### 5. Hoja inferior compartida por todos los selectores

`SelectControl` usa `useMediaQuery(MOBILE_MEDIA_QUERY)`. En móvil no monta el panel flotante: monta una `BottomSheet` con el título del selector y una lista de opciones con objetivos táctiles de al menos 44 px. La opción seleccionada recibe el foco inicial; al elegir se cierra y el foco vuelve al disparador mediante el ciclo de vida de `Modal`. En escritorio se mantiene el panel actual.

### 6. Panel anclado al documento durante el scroll

Dos cambios concretos:

- `SelectControl` deja de usar `scrollIntoView`; ajusta el `scrollTop` del panel para mantener visible la opción activa sin mover la página.
- `useFloatingPanel` guarda la posición calculada al abrir y le aplica el desplazamiento de la página. El panel se mueve con el contenido desde su posición inicial, no se queda sticky en el viewport y el scroll interno del panel tampoco lo desplaza.

No se usa `position: absolute`: el panel debe seguir funcionando dentro de contenedores con scroll y cerca de los bordes del viewport.

## Risks / Trade-offs

- [El modo rango amplía una API muy probada] → Mantener la fecha única como comportamiento por defecto y cubrir ambos modos en `calendar.test.tsx`.
- [La hoja inferior cambia el DOM del selector en móvil y puede romper pruebas que buscan `listbox`] → Conservar `role="listbox"` y `role="option"` dentro de la hoja y actualizar los E2E que usaban el segmentado.
- [El panel flotante se desplaza fuera del viewport al hacer scroll] → Es el comportamiento pedido: queda anclado al documento y no se queda sticky; al volver a la posición inicial reaparece y se cierra al pulsar fuera.
- [Rango personalizado vacío] → «Aplicar» permanece deshabilitado hasta tener ambos extremos y el texto explica qué falta.

## Migration Plan

No hay migración de datos. El cambio es de interfaz y componentes: se publica con la rama `movements-filters` y se revierte restaurando los componentes y la pantalla anteriores. No se toca `SCHEMA_VERSION`.
