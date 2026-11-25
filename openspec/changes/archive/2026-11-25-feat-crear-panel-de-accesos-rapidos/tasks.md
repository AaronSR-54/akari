# Tasks

## 1. Panel de accesos rápidos en el hero

- [x] 1.1 Confirmar las rutas de «Nuevo movimiento» y «Nueva cuenta» contra `nav.ts` y las rutas de `apps/web`, añadir la sección «Accesos rápidos» (`Card` + `SectionHeader`) en la columna izquierda del hero entre el saldo y Últimos con los tres atajos, con `data-hero="quick"`, y reordenar los `order` en móvil (saldo 1, accesos 2, gráfica 3, últimos 4, balance 5); verificar visualmente en captura de 390px y 1440px que el panel queda bajo el saldo.
- [x] 1.2 Quitar el enlace «Preguntas rápidas →» del panel de Últimos (conservar «Ver todos») y actualizar la spec si difiere; verificar con `grep` que `/preguntas` aparece una sola vez en el dashboard.

## 2. E2E y verificaciones

- [x] 2.1 Añadir aserciones E2E (el panel existe bajo el saldo en ambas vistas, orden móvil correcto, sin segundo enlace a preguntas) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 3. Panel bajo el balance con botones redondos

- [x] 3.1 Mover la sección de accesos a la columna derecha tras el balance (orden móvil 1–5: saldo, gráfica, últimos, balance, accesos) y convertir los atajos en botones redondos solo-icono con etiqueta inline al hover/foco; verificar visualmente en capturas de 390px y 1440px.
- [x] 3.2 Actualizar aserciones E2E (posición del panel y nombres de enlaces) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 4. Columnas siempre igualadas en desktop

- [x] 4.1 Fijar la altura de la gráfica por medición de la columna izquierda en desktop (mínimo 160px, limpiar en móvil) sin tocar Últimos, y notarlo en diseño y spec; verificar en captura de 1440px.
- [x] 4.2 Reintroducir la aserción E2E de fondos igualados (≤2px) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 5. Accesos de nuevo en panel

- [x] 5.1 Envolver la fila de botones en `Card` + `SectionHeader` manteniendo posición, botones y hover; verificar visualmente en capturas de 390px y 1440px.
- [x] 5.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 6. Título del balance con formato de panel

- [x] 6.1 Cambiar la etiqueta «Balance del mes» a `SectionHeader` dentro de `Card` (mismo formato que «Accesos rápidos»), sin tocar valor ni pie; verificar visualmente en captura de 1440px.
- [x] 6.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 7. Gap único entre paneles en desktop

- [x] 7.1 Unificar a 16px (`gap-4`, la separación de cuentas) los huecos entre paneles/secciones en desktop —columnas del hero, columna izquierda, balance→accesos y hero→cuentas— y el `sideGap` de la medición de la gráfica; móvil intacto; verificar midiendo huecos y fondos en captura de 1440px.
- [x] 7.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 8. Eje central móvil y accesos expandidos

- [x] 8.1 Añadir FAB «Añadir movimiento» centrado en `MobileNav` y convertir el panel en 3 píldoras expandidas en una línea (4º círculo solo en desktop con `max-md:hidden`); verificar en capturas de 390px y 1440px.
- [x] 8.2 Actualizar E2E (visibilidad por viewport, FAB, una sola línea) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 9. Círculos con hover en desktop

- [x] 9.1 Restaurar la fila de 4 círculos con expansión en hover y tonos diferenciados solo en desktop (`hidden md:flex`), dejando las 3 píldoras solo en móvil (`md:hidden`); verificar en captura de 1440px, con y sin hover.
- [x] 9.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 10. Tonos distintivos en móvil

- [x] 10.1 Aplicar a las 3 píldoras los mismos tonos de desktop (cuenta y exportar claras con borde, preguntas hundida); verificar en captura de 390px.
- [x] 10.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 11. Píldoras a todo el ancho en móvil

- [x] 11.1 Repartir todo el ancho entre las 3 píldoras (`flex-auto`, sin truncar); verificar en captura de 390px.
- [x] 11.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 12. Accesos sin caja a todo el ancho

- [x] 12.1 Quitar `Card` y título (fila directa sobre el lienzo con `aria-label`), repartir los círculos en desktop (`justify-between`) y mantener píldoras a todo el ancho en móvil; verificar fondos igualados y capturas de 390px y 1440px.
- [x] 12.2 Actualizar E2E (nombre accesible en vez de texto visible) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 13. Píldoras siempre expandidas en desktop

- [x] 13.1 Sustituir los círculos por una sola fila de píldoras `flex-auto` (nuevo acento solo en desktop, mismos tonos y orden) sin huecos; verificar en capturas de 390px y 1440px.
- [x] 13.2 Extender el E2E (fila completa también en desktop) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 14. Preguntas sin relleno

- [x] 14.1 Quitar el fondo a la píldora de preguntas (fantasma, fundida con el lienzo); verificar en capturas de 390px y 1440px.
- [x] 14.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 15. Preguntas con fondo oscuro

- [x] 15.1 Dar a la píldora de preguntas el tono oscuro (`bg-text-primary`, como las pestañas activas); verificar en capturas de 390px y 1440px.
- [x] 15.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 16. Final de la gráfica redondeado

- [x] 16.1 Redondear la esquina superior del final del área en `MonthBalance` solo con mes abierto (radio del panel), con tests unitarios del trazado en ambos casos; verificar en captura en oscuro.
- [x] 16.2 Re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.
