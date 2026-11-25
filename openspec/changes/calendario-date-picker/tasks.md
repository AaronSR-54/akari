# Tasks

## 1. Panel flotante compartido

- [ ] 1.1 Extraer de `SelectControl` a `packages/ui/src/floating.ts` el hook `useFloatingPanel` con la posición, el volteo, el ancho mínimo, la altura máxima y el cierre por puntero fuera; `SelectControl` lo consume sin cambios de comportamiento y `npm test --workspace @akari/ui` sigue en verde.
- [ ] 1.2 Verificar con `fields.test.tsx` que el selector conserva apertura, cierre con Escape, cierre fuera y foco al disparador tras la extracción.

## 2. Utilidades de fecha de negocio

- [ ] 2.1 Crear `packages/ui/src/dates.ts` con `parseBusinessDate`, `toBusinessKey`, `todayBusinessKey`, `formatBusinessDate`, `addDays`, `addMonths`, `startOfMonthGrid` y `monthLabel`; las pruebas cubren `YYYY-MM-DD`, cambio de mes y año, y formato `dd MMM yyyy` en español.
- [ ] 2.2 Añadir una prueba de regresión de husos horarios: una fecha `YYYY-MM-DD` se parsea y se vuelve a serializar igual con `TZ=Europe/Madrid` y `TZ=America/Los_Angeles`, y `formatBusinessDate` no usa `toISOString`.

## 3. Componente `Calendar`

- [ ] 3.1 Crear `packages/ui/src/calendar.tsx` con cabecera `mes año`, flechas anterior/siguiente, rejilla de 6×7 empezando en lunes, días contiguos no seleccionables, fecha elegida, hoy y acción «Hoy»; se exporta desde `packages/ui/src/index.ts` y la prueba comprueba la rejilla del mes y los días fuera de mes.
- [ ] 3.2 Implementar la selección y la navegación: un clic elige y comunica una sola vez, las flechas de cabecera cambian de mes conservando la selección y «Hoy» selecciona la fecha actual y cambia al mes visible; la prueba cubre cada caso.
- [ ] 3.3 Implementar el teclado y la semántica accesible (`role="grid"`, `aria-selected`, `aria-current="date"`, roving tabindex, flechas ±1/±7 días, Inicio/Fin, PageUp/PageDown, Enter/Espacio, Escape) y verificarla con `userEvent` en `calendar.test.tsx`.

## 4. `DateField` con panel propio

- [ ] 4.1 Reescribir `DateField` en `packages/ui/src/fields.tsx` con la API `value` + `onValueChange`, disparador `button` con `aria-haspopup="dialog"`, `aria-expanded`, fecha formateada o «Elegir fecha», y panel flotante con `Calendar`; se elimina el `input type="date"`.
- [ ] 4.2 Actualizar `packages/ui/src/fields.test.tsx`: `DateField` ya no es un `input` nativo, muestra la fecha formateada, abre y cierra el panel, elige un día, conserva el valor al cancelar y mantiene error, obligatoriedad y deshabilitado.
- [ ] 4.3 Verificar el foco y la accesibilidad del campo compuesto: al abrir el foco entra en la rejilla, al cerrar vuelve al disparador y `accessibility.test.tsx` sigue pasando con el campo incluido.

## 5. Formularios web

- [ ] 5.1 Migrar `apps/web/src/components/forms/movement-form.tsx` y `apps/web/src/components/movement-edit-dialog.tsx` a `value`/`onValueChange`; `npm run typecheck` pasa y el alta y la edición guardan la fecha elegida.
- [ ] 5.2 Migrar `apps/web/src/components/forms/group-expense-form.tsx` a `value`/`onValueChange`; el resumen del reparto sigue mostrando la fecha con `formatLongDate`.
- [ ] 5.3 Añadir cobertura E2E de la fecha en `e2e/accounts-movements.spec.ts` (alta y edición de movimiento) y `e2e/groups.spec.ts` (gasto grupal): abrir el calendario, elegir otro día y comprobar la fecha guardada, sin usar el selector nativo.

## 6. Documentación y verificación de integración

- [ ] 6.1 Anotar en `docs/desarrollo/desviaciones.md` que el `Field/Date` del diseño congelado pasa a abrir un panel mensual propio y que la fecha visible usa `dd MMM yyyy`; sin tocar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
- [ ] 6.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e:worktree` y dejar las cinco verificaciones en verde.

## Workflow follow-up

- Revisar los artefactos con la persona responsable y aplicar el change cuando lo pida.
- Archivar el change, abrir la PR con `node scripts/kan-sync.mjs pr-body calendario-date-picker` y mover la tarjeta con `done`.
