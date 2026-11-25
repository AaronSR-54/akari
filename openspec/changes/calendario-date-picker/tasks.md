# Tasks

## 1. Panel flotante compartido

- [x] 1.1 Extraer de `SelectControl` a `packages/ui/src/floating.ts` el hook `useFloatingPanel` con la posición, el volteo, el ancho mínimo, la altura máxima y el cierre por puntero fuera; `SelectControl` lo consume sin cambios de comportamiento y `npm test --workspace @akari/ui` sigue en verde.
- [x] 1.2 Verificar con `fields.test.tsx` que el selector conserva apertura, cierre con Escape, cierre fuera y foco al disparador tras la extracción.

## 2. Utilidades de fecha de negocio

- [x] 2.1 Crear `packages/ui/src/dates.ts` con `parseBusinessDate`, `toBusinessKey`, `todayBusinessKey`, `formatBusinessDate`, `addDays`, `addMonths`, `startOfMonthGrid` y `monthLabel`; las pruebas cubren `YYYY-MM-DD`, cambio de mes y año, y formato `dd MMM yyyy` en español.
- [x] 2.2 Añadir una prueba de regresión de husos horarios: una fecha `YYYY-MM-DD` se parsea y se vuelve a serializar igual con `TZ=Europe/Madrid` y `TZ=America/Los_Angeles`, y `formatBusinessDate` no usa `toISOString`.

## 3. Componente `Calendar`

- [x] 3.1 Crear `packages/ui/src/calendar.tsx` con cabecera `mes año`, flechas anterior/siguiente, rejilla de 6×7 empezando en lunes, días contiguos no seleccionables, fecha elegida, hoy y acción «Hoy»; se exporta desde `packages/ui/src/index.ts` y la prueba comprueba la rejilla del mes y los días fuera de mes.
- [x] 3.2 Implementar la selección y la navegación: un clic elige y comunica una sola vez, las flechas de cabecera cambian de mes conservando la selección y «Hoy» selecciona la fecha actual y cambia al mes visible; la prueba cubre cada caso.
- [x] 3.3 Implementar el teclado y la semántica accesible (`role="grid"`, `aria-selected`, `aria-current="date"`, roving tabindex, flechas ±1/±7 días, Inicio/Fin, PageUp/PageDown, Enter/Espacio, Escape) y verificarla con `userEvent` en `calendar.test.tsx`.

## 4. Hoja inferior y pila de overlays

- [x] 4.1 Crear `packages/ui/src/overlay-stack.ts` con registro, desapilado y consulta de la capa superior más un contador de bloqueo de scroll; `Modal` lo usa para atender Escape y la trampa de Tab solo cuando es la capa superior, y `feedback.test.tsx` comprueba que con dos modales Escape cierra solo el superior y que el scroll sigue bloqueado hasta cerrar el último.
- [x] 4.2 Añadir `placement?: 'center' | 'bottom'` a `Modal`, sin cambios para las modales actuales, y anclar `BottomSheet` abajo con `rounded-t-3xl`, borde superior, `max-w-sheet`, `max-h-[90dvh]` y `env(safe-area-inset-bottom)`; `feedback.test.tsx` verifica la hoja abierta, el cierre por scrim y Escape, y el foco devuelto al disparador.

## 5. `DateField` con panel propio y hoja móvil

- [x] 5.1 Crear `packages/ui/src/media.ts` con `useMediaQuery` sobre `useSyncExternalStore` y snapshot de servidor `false`; la prueba cubre el valor inicial, el cambio de `matchMedia` y la baja de la suscripción.
- [x] 5.2 Reescribir `DateField` en `packages/ui/src/fields.tsx` con la API `value` + `onValueChange`, disparador `button` con `aria-haspopup="dialog"`, `aria-expanded`, fecha formateada o «Elegir fecha», panel flotante en tablet/escritorio con `Calendar` y `BottomSheet` con el mismo `Calendar` en `(max-width: 767px)`; se elimina el `input type="date"`.
- [x] 5.3 Actualizar `packages/ui/src/fields.test.tsx` con `matchMedia` simulado: en escritorio abre el panel flotante y no la hoja, en móvil abre la hoja inferior con el calendario, elegir cierra y comunica una vez, cancelar conserva la fecha, y se mantienen error, obligatoriedad y deshabilitado.
- [x] 5.4 Verificar foco y accesibilidad del campo compuesto: al abrir el foco entra en la rejilla, al cerrar vuelve al disparador y `accessibility.test.tsx` sigue pasando con el campo incluido.

## 6. Formularios web

- [x] 6.1 Migrar `apps/web/src/components/forms/movement-form.tsx` y `apps/web/src/components/movement-edit-dialog.tsx` a `value`/`onValueChange`; `npm run typecheck` pasa y el alta y la edición guardan la fecha elegida.
- [x] 6.2 Migrar `apps/web/src/components/forms/group-expense-form.tsx` a `value`/`onValueChange`; el resumen del reparto sigue mostrando la fecha con `formatLongDate`.
- [x] 6.3 Añadir cobertura E2E de escritorio en `e2e/accounts-movements.spec.ts` (alta y edición de movimiento) y `e2e/groups.spec.ts` (gasto grupal): abrir el calendario, elegir otro día y comprobar la fecha guardada, sin el selector nativo.
- [x] 6.4 Añadir cobertura E2E móvil a 390 px: la hoja inferior abre y elige fecha en el alta de movimiento, el gasto grupal y, dentro del diálogo de edición, Escape cierra solo la hoja y el diálogo sigue abierto.

## 7. Documentación y verificación de integración

- [x] 7.1 Anotar en `docs/desarrollo/desviaciones.md` que el `Field/Date` del diseño congelado pasa a abrir un panel mensual propio y que la fecha visible usa `dd MMM yyyy`; dejar constancia de que la hoja inferior móvil usa el `Bottom/Sheet` ya definido y no es una desviación; sin tocar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
- [x] 7.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e:worktree` y dejar las cinco verificaciones en verde.

## Workflow follow-up

- Revisar los artefactos con la persona responsable y aplicar el change cuando lo pida.
- Archivar el change, abrir la PR con `node scripts/kan-sync.mjs pr-body calendario-date-picker` y mover la tarjeta con `done`.
