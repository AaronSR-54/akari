# Tasks

## 1. Trazado del gráfico

- [x] 1.1 Aplicar un inset lateral de 8 px a la capa visual del SVG en `packages/ui/src/month-balance.tsx`, manteniendo el grupo interactivo a ancho completo; verificar que el contenedor del SVG conserva las clases `inset-y-0`, `left-2` y `right-2` y que las pruebas de recorrido por teclado siguen pasando.
- [x] 1.2 Redondear el área en ambos extremos con curvas cuadráticas también con el mes completo, eliminando la excepción `elapsed < totalDays`; actualizar las pruebas de `month-balance.test.tsx` para verificar que el path contiene curvas en los lados izquierdo y derecho tanto en mes abierto como completo.
- [x] 1.3 Suavizar la línea con curvas cúbicas que pasan por todos los puntos y limitan sus ordenadas de control al viewBox; actualizar la prueba «el punto más alto toca el borde superior» y verificar que una serie de tres o más puntos usa curvas sin salirse del área.

## 2. Color de la línea y panel de detalle

- [x] 2.1 Fijar el trazo de la línea a `var(--color-accent-default)` en lugar de tinta; verificar con una prueba unitaria el atributo `stroke` y con E2E que el color calculado es el mismo en tema claro y oscuro.
- [x] 2.2 Cambiar el panel de detalle a `bg-surface-sunken` con texto principal y secundario, punta del mismo fondo y `border-border-subtle`; verificar con pruebas unitarias sus clases y que no queden referencias a `text-inverse` en el panel.

## 3. Integración, documentación y verificación

- [x] 3.1 Actualizar `e2e/dashboard.spec.ts` para comprobar el inset horizontal del SVG y el fondo del panel de detalle frente al bloque de cuenta; verificar con `npm run e2e:worktree`.
- [x] 3.2 Registrar la desviación visual en `docs/desarrollo/desviaciones.md` sin tocar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`; verificar con `git status` que esos caminos no aparecen en el diff.
- [x] 3.3 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` y verificar que los cuatro terminan sin errores.

## 4. Ajustes finales solicitados

- [x] 4.1 Mapear las x de la serie al rango entre las tangentes de las esquinas redondeadas y ajustar el recorrido por puntero; verificado con las pruebas del trazo y con captura en el dev server.
- [x] 4.2 Ampliar y jerarquizar el panel de detalle (`w-64`, `rounded-xl`, textos `text-ui-11`/`text-ui-12`, «y N más») y dar al punto activo un borde `ring-surface-sunken`; verificado con `month-balance.test.tsx` y en el navegador.

## Workflow follow-up

- Archivar el change y sincronizar `openspec/specs/producto/dashboard-hero/spec.md`.
- Abrir la PR con `node scripts/kan-sync.mjs pr-body <change-id>` como borrador.
- Mover las tarjetas a `DONE` con `node scripts/kan-sync.mjs done <change-id> --pr <url>` y limpiar el claim tras la revisión.
