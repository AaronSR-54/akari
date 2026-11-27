# Tasks

## 1. Escala tipográfica de la tabla

- [x] 1.1 Subir la cabecera a `text-ui-11-strong` y su fila a `h-11`, manteniendo el borde inferior y el color secundario
- [x] 1.2 Subir fecha, categoría y cuenta a `text-ui-13`, conservando el color secundario y la alineación de cada columna
- [x] 1.3 Subir concepto e importe a `text-ui-14-strong`, manteniendo la negrita, el formato firmado y el ancho de la columna de importe
- [x] 1.4 Subir las filas a `h-16` y el pie (rango y paginación) a `text-ui-11` / `text-ui-11-strong`
- [x] 1.5 Verificar que las columnas fijas (categoría 170 px, cuenta 190 px, importe 120 px) no parten los textos de ejemplo ni desbordan la tarjeta
- [x] 1.6 Quitar el alto fijo del pie de la tabla (`h-10` → `py-2`) para que la paginación y sus botones no queden pegados al borde inferior de la tarjeta

## 2. Pruebas

- [x] 2.1 Añadir en `e2e/accounts-movements.spec.ts` una comprobación de cabecera 11 px, celdas secundarias 13 px, concepto 14 px y filas de 64 px en escritorio y tablet, y ausencia de tabla en móvil
- [x] 2.2 Añadir al mismo test que el botón «Siguiente» deja al menos 8 px hasta el borde inferior de la tarjeta
- [x] 2.3 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`
- [ ] 2.4 Ejecutar `npm run e2e:worktree` cuando se pida (el E2E se deja para el final)

## 3. Revisión visual

- [ ] 3.1 Revisar la pantalla con `npm run preview:worktree` en 1440, 900 y 390 px y confirmar la densidad (10 filas visibles en 1440×900) y la coherencia con la lista móvil
- [ ] 3.2 Detener el frontal con `npm run preview:worktree:stop` antes de archivar

## Workflow follow-up

- Archivar el change en la rama `movements-table-size`, commitear solo su alcance y abrir la PR con `node scripts/kan-sync.mjs pr-body movements-table-size`.
- Mover la tarjeta a `DONE` con `node scripts/kan-sync.mjs done movements-table-size --pr <url>` sin hacer merge.
