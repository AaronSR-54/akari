# Tasks

## 1. Calendario con selección de rango

- [x] 1.1 Añadir a `Calendar` un modo rango opcional basado en `range` y `onRangeChange`: primer clic inicia, segundo cierra, los extremos invertidos se reordenan y los días intermedios se destacan; la fecha única conserva su comportamiento. Verificar con `packages/ui/src/calendar.test.tsx`: rango completo, reordenación y regresión del modo único.
- [x] 1.2 Añadir en `packages/ui/src/dates.ts` un formateador de rango legible (`1–30 nov 2026`, `Cualquier fecha` cuando está vacío) y cubrirlo en `packages/ui/src/dates.test.ts`.

## 2. Campo de rango de fechas reutilizable

- [x] 2.1 Implementar `DateRangeField` en `packages/ui/src/fields.tsx` con variantes `field` y `pill`, valor controlado, atajos opcionales, resumen del rango y acciones «Limpiar»/«Aplicar»; la acción de aplicar permanece deshabilitada hasta tener ambos extremos. Verificar con `packages/ui/src/fields.test.tsx` los atajos, el rango personalizado y el cierre sin aplicar.
- [x] 2.2 Hacer que `DateRangeField` use `BottomSheet` en móvil y `useFloatingPanel` en escritorio, devolviendo el foco al disparador al cerrar. Verificar con una prueba de móvil en `fields.test.tsx` equivalente a la del `DateField`.
- [x] 2.3 Exportar el campo y el formateador desde `@akari/ui` y comprobar que `npm run typecheck -w @akari/ui` pasa.

## 3. Selectores adaptados a móvil y anclaje estable

- [x] 3.1 En `SelectControl`, montar una `BottomSheet` con `role="listbox"`/`role="option"` y objetivos táctiles de 44 px cuando `useMediaQuery(MOBILE_MEDIA_QUERY)` sea cierto, manteniendo el panel flotante en escritorio y el foco inicial en la opción seleccionada. Verificar con `fields.test.tsx` que en móvil aparece la hoja, se elige una opción y se cierra; en escritorio sigue el panel.
- [x] 3.2 Sustituir `scrollIntoView` por un ajuste del `scrollTop` del panel y hacer que `useFloatingPanel` mantenga el panel anclado al documento: al hacer scroll se desplaza con la página desde su posición inicial, no se queda sticky y no mueve la página al abrir o recorrer opciones. Verificar con `floating.test.tsx` que el scroll de página desplaza el panel y el scroll interno no.
- [x] 3.3 Añadir un E2E en `e2e/accounts-movements.spec.ts` que, en escritorio, abra un selector, haga scroll en la página y compruebe que el panel se desplaza con el contenido en lugar de quedarse fijo en el viewport.

## 4. Barra de filtros unificada de movimientos

- [x] 4.1 Sustituir el `SegmentedControl` de tipo por un `SelectPill` «Tipo», retirar la cápsula del mes, alinear el grupo de filtros a la derecha y agrupar búsqueda, tipo, categoría, cuenta y ordenación en una sola barra responsive. Verificar que los filtros siguen funcionando en `e2e/accounts-movements.spec.ts` tras adaptar la selección de tipo.
- [x] 4.2 Mover el periodo a un `DateRangeField` junto al resumen del listado, con atajos calculados desde `appNow()` y centrados; aplicar el rango por `movement.date` con extremos incluidos y reiniciar la paginación al cambiar. Verificar con E2E: «Este mes», «Mes anterior», rango personalizado, rango sin resultados y «Limpiar filtros» desde el estado vacío.
- [x] 4.3 Hacer que `HeadingMeta` muestre el recuento y el periodo activo en lugar del mes fijo, y actualizar `hasFilters` para incluir el periodo. Verificar con E2E que el recuento y la etiqueta cambian al filtrar.
- [x] 4.4 Dibujar el rango como una banda continua: extremos redondeados por fuera, días intermedios sin redondeo y, en rangos de más de dos semanas, cortes semanales rectos para que la banda parezca continuar. Verificar con `calendar.test.tsx` la clase de redondeo del inicio, el fin, los bordes de semana y los cortes en rangos largos.
- [x] 4.5 Retirar el botón «Limpiar filtros» de la barra y conservarlo solo en el estado vacío. Verificar que el estado vacío sigue ofreciendo la limpieza y que la barra no duplica la acción.
- [x] 4.6 Dejar la cápsula de ordenación solo con fecha e importe, sin periodo ni calendario, y colocar el calendario junto al resumen. Verificar que abrir la cápsula no muestra calendario y que el periodo se controla desde su botón junto al recuento.

## 5. Integración y verificación

- [x] 5.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` en el worktree y corregir cualquier regresión.
- [x] 5.2 Ejecutar `npm run e2e:worktree` con los proyectos desktop, tablet y mobile-web y confirmar que la hoja inferior y la barra de filtros no introducen violaciones de accesibilidad.

## Workflow follow-up

- Archivar el change cuando la revisión esté aprobada.
- Abrir la PR y mover las tarjetas a `DONE` solo tras la petición explícita de la persona usuaria.
- Limpiar el worktree cuando la PR esté mergeada.
