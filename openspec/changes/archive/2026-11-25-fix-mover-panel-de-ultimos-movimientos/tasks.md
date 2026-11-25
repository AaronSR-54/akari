# Tasks

## 1. Hero 2×2 en `dashboard.tsx`

- [x] 1.1 Mover la `Card` de «Últimos movimientos» al hero (`lg:col-start-1 lg:row-start-2`, `data-hero="recent"`) con el saldo anclado abajo (`justify-end`) para pegarlo a Últimos, manteniendo `MovementRow`, estado vacío y enlaces, y verificar que el orden DOM es saldo → gráfica → últimos → balance.
- [x] 1.2 Fijar la retícula del hero 50/50 (`lg:grid-cols-2`: saldo | gráfica / últimos | balance) con gráfico más alto (`lg:min-h-64`), balance repartido (`justify-between`) y apilado móvil en ese orden con alturas `h-full`, y verificar sin desbordamiento a 390/768/1440 y sin saltos con `prefers-reduced-motion`.
- [x] 1.3 Conservar «Ver todos» a `/movimientos` y «Preguntas rápidas →» a `/preguntas` dentro del panel movido, y verificar ambos enlaces visibles más el vacío «Todavía no hay movimientos» cuando no hay datos.

## 2. Cuota unificada debajo de Cuentas

- [x] 2.1 Eliminar el `StatCard` `data-hero="upcoming"` del hero y dejar un único `Banner` de cuota tras la sección Cuentas, y verificar que con cuota vencida y con próximo pago solo hay un panel (sin tarjeta duplicada).
- [x] 2.2 Mantener título, importe, fecha y acción «Pagar ahora» con tonos `error`/`warning`, y verificar texto + color + CTA en ambos estados y ausencia de `data-hero="upcoming"`.

## 3. E2E y verificación del proyecto

- [x] 3.1 Actualizar `e2e/dashboard.spec.ts` al nuevo orden (saldo, gráfica, `data-hero="recent"`, `month-summary`, cuentas, cuota) y a la ausencia de duplicados, y verificar con `npm run e2e:worktree`.
- [x] 3.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`, y verificar que los cuatro pasan sin errores.

## 4. Balance compacto y gráfico más alto

- [x] 4.1 Hacer que la tarjeta de balance ocupe solo su contenido (`self-start`, sin `justify-between`) y subir el gráfico a `lg:min-h-80`, actualizando spec (`Columnas equilibradas`) y diseño, y verificar visualmente que el balance no deja hueco con borde y el gráfico compensa la columna.
- [x] 4.2 Ajustar `e2e/dashboard.spec.ts` (balance pegado a su contenido bajo la gráfica, sin exigir igual altura con Últimos) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 5. Saldo sin proyección e importe mayor

- [x] 5.1 Quitar la línea de proyección del bloque de saldo (la estimación sigue en la tarjeta de balance), subir el importe a `text-ui-52-bold`, pasar el hero a dos columnas independientes con aire (`lg:gap-6`) entre saldo y Últimos, y actualizar spec y diseño; verificar visualmente columnas igualadas y aire correcto.
- [x] 5.2 Ajustar `e2e/dashboard.spec.ts` (sin línea de proyección en el hero, importe a 52px en desktop, aire saldo→Últimos y columnas con igual contenido) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 6. Fondos de columna alineados

- [x] 6.1 Hacer que el gráfico absorba la altura restante (`lg:flex-1` con mínimo `lg:min-h-80`) para que ambas columnas terminen a la misma altura, y actualizar spec y diseño.
- [x] 6.2 Ajustar `e2e/dashboard.spec.ts` (diferencia de fondos ≤8px) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 7. Pico de la gráfica a alto completo

- [x] 7.1 Cambiar la escala de `MonthBalance` para que el máximo toque siempre el borde superior (mínimo con colchón), con aserción unitaria y escenario en la spec; verificar en captura que el pico llega arriba.
- [x] 7.2 Añadir aserción E2E (la línea toca el borde superior) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 8. Tablet y móvil: unión con Últimos y saldo centrado

- [x] 8.1 Unir la gráfica con el panel de Últimos en <1024px (sin separación, tarjeta por delante) y centrar el saldo en móvil, con escenario en la spec y nota en diseño; verificar en capturas de 390px y 768px.
- [x] 8.2 Añadir aserciones E2E por viewport (unión y centrado en móvil, tarjeta normal y saldo a la izquierda en desktop) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.

## 9. Unión sin franja en móvil

- [x] 9.1 Hacer que el svg llene la caja del gráfico en móvil (`flex` + `flex-1`) para que el ámbar llegue hasta el panel de Últimos, y notarlo en diseño; verificar en captura de 390px que no hay franja.
- [x] 9.2 Añadir aserción E2E (el svg llena la caja en móvil) y re-ejecutar `dashboard.spec.ts`, `typecheck`, `lint`, `test` y `build` hasta que todo pase.
