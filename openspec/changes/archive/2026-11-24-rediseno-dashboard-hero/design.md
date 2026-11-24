# Design

## Context

El dashboard (`apps/web/src/components/pages/dashboard.tsx`) mantiene un hero con el saldo total a la izquierda. Hasta ahora la columna derecha mostraba una gráfica semanal de movimientos; la persona usuaria quiere ver la evolución del saldo durante el mes, con cada gasto bajando la línea y cada ingreso subiéndola, partiendo del saldo de cierre del mes anterior. El balance del mes vuelve a su tarjeta, justo debajo de la gráfica, con su misma anchura y una sombra superior sutil, y con el saldo total estimado a fin de mes como única línea de pie. La gráfica no lleva título, pie ni referencias visibles.

La presentación usa tokens de `packages/tokens` (superficies, tinta, ámbar, `motion-slow`) y el design system de `packages/ui`. La app móvil React Native aún no existe; este change implementa solo la web responsive. El diseño visual está congelado: no se tocan FigCraft, `design/` ni `docs/diseno/`; la divergencia con `W01` se registra en `docs/desarrollo/desviaciones.md`.

Restricciones: no hay estado global (IndexedDB es la fuente de verdad y `useLiveQuery` refresca la vista), el dashboard solo renderiza cuando `useOverview` devuelve datos, y las pruebas de espaciado de `apps/web/src/design-system.test.ts` rechazan valores arbitrarios.

## Goals / Non-Goals

**Goals:**

- Un hero editorial sin contenedor con el saldo total y su evolución mensual.
- Una serie diaria que arranca en el cierre del mes anterior como primer punto, seguido del día 1, con ingresos hacia arriba y gastos hacia abajo, y se calcula en dominio con pruebas.
- Detalle por día con puntero y teclado: movimientos con signo y saldo tras el día.
- La tarjeta de balance debajo de la gráfica, con el saldo total estimado a fin de mes.
- Una demo determinista con histórico suficiente para que la base y la proyección se vean iguales siempre.

**Non-Goals:**

- Implementación nativa móvil, backend, sincronización o presupuestos.
- Edición de FigCraft, `docs/diseno/` o las specs `diseno/*`.
- Convertir divisas o cambiar las reglas de agregación multidivisa.
- Introducir una librería de gráficos externa.
- Rediseñar las tarjetas de cuentas, movimientos o el banner más allá de su recolocación.

## Decisions

### 1. Movimientos y saldo diario en dominio

Se añade a `packages/domain/src/accounts.ts` una función pura:

```ts
currentMonthMovements(movements, currency, today, openingBalanceMinor = 0): {
  month: string;
  currency: string;
  daysInMonth: number;
  elapsedDays: number;
  openingBalanceMinor: number;
  expenseMinor: number;
  incomeMinor: number;
  netMinor: number;
  count: number;
  days: Array<{
    date: string;
    day: number;
    elapsed: boolean;
    expenseMinor: number;
    incomeMinor: number;
    netMinor: number;
    balanceMinor: number;   // apertura + neto acumulado
    count: number;
    movements: Array<{ id; concept; type; amountMinor }>;
  }>;
}
```

Recorre todos los días del mes, marca `elapsed` hasta hoy y calcula el saldo de cierre de cada día acumulando el neto sobre `openingBalanceMinor`. Solo cuenta la divisa de referencia y no convierte. Los movimientos de cada día se ordenan por `createdAt` para que el detalle sea estable.

`monthExpenseEstimate` sigue disponible en `month`, pero la tarjeta ya no muestra el desglose ni la estimación de gasto. `getOverview` calcula la apertura con el saldo de las cuentas incluidas en la divisa de referencia al cierre del mes anterior (`calculateAccountBalance(..., previousMonthEnd)`), y construye la serie solo con los movimientos de esas cuentas para que el último punto coincida con el saldo total mostrado. La tarjeta combina el neto del mes con el saldo total estimado a fin de mes que ya expone `projections`.

Alternativa descartada: calcular el saldo en el componente. Dejaría sin pruebas la apertura, los signos, los días transcurridos y la coherencia con el saldo total.

### 2. `MonthBalance`, gráfica de área sin textos de cabecera

Se añade `MonthBalance` en `packages/ui/src/month-balance.tsx`:

```ts
{
  days: Array<{
    id: string;
    label: string;           // «jue 26 nov»
    balanceMinor: number;    // saldo al cierre del día
    total: string;           // saldo formateado
    items?: Array<{ id; label; value }>;
    ariaLabel: string;
  }>;
  openingBalanceMinor: number;
  elapsedDays: number;       // limita la serie y la interacción
  ariaLabel: string;
}
```

La serie empieza en `(x=0, cierre del mes anterior)` y sigue con un punto por día (`día 1` en `x = 1 / díasDelMes`) hasta hoy. El primer punto es interactivo y su detalle lo identifica como «Cierre del mes anterior»; no hay una etiqueta fija con la fecha. Con el mes completo el último punto cae en el borde derecho; si aún no ha terminado, el área ámbar se cierra al ancho completo de la columna para que su borde derecho coincida con el de la tarjeta. El eje Y se ajusta al mínimo y máximo de la serie con un 15 % de margen (o un margen mínimo si es plana). Se dibuja un área ámbar bajo la línea de tinta y el punto final con halo; el color no es el único canal, el detalle siempre muestra texto.

No hay título, pie ni referencia textual: la persona usuaria pidió quitar «Saldo del mes», «Día 29 de 30 · 11 movimientos» y «Base 1 nov · 13.726,00 €». La base no lleva ninguna marca visible. La etiqueta accesible del grupo conserva el nombre y las instrucciones de teclado, que no son texto visible.

Alternativa descartada: una barra de progreso por días o barras diarias. No mostraban la evolución del saldo ni hacían visibles los gastos hacia abajo.

### 3. Interacción por día con puntero, tacto y teclado

La gráfica es un contenedor `role="group"` enfocable con `tabIndex={0}` y `aria-label` con instrucciones.

- **Puntero y tacto:** `pointerdown`/`pointermove` convierten la posición X en el día del mes y la acotan a `[0, elapsedDays - 1]`. `pointerleave` oculta el detalle.
- **Teclado:** flechas, Inicio y Fin recorren los días transcurridos; Escape cierra el detalle. Al enfocar sin selección previa se muestra el último día.
- **Detalle:** tooltip oscuro con fecha, movimientos con signo y «Saldo tras el día». Se ancla al punto con `clamp` horizontal, sin triángulo de anclaje, y se coloca encima o debajo según el espacio. Su `z-index` lo mantiene por encima de la tarjeta.
- **Lectores de pantalla:** una región `aria-live="polite"` anuncia la descripción completa del día activo.

Los días futuros no se pueden seleccionar y el detalle es `pointer-events-none`, así que no bloquea la interacción con el resto.

### 4. Hero en dos bloques y tarjeta de balance debajo

`OverviewBody` queda así:

1. **Hero** `grid gap-x-6 gap-y-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]`: saldo total a la izquierda (etiqueta, importe grande y delta proyectado), sin borde ni fondo, y `MonthBalance` a la derecha, también fuera de cualquier tarjeta.
2. **Fila inferior**: «Próximo pago» bajo el saldo y la tarjeta «Balance del mes» bajo la gráfica. La gráfica ocupa todo el alto de su fila (`h-full`), de modo que si la columna del saldo crece, la gráfica crece con ella y ambas columnas terminan a la misma altura. La gráfica queda fuera de la tarjeta, con su misma anchura, y el área ámbar llega hasta el borde derecho de la columna y se prolonga por debajo del borde superior de la tarjeta en el mismo path (el SVG no recorta su desbordamiento), para que sus esquinas redondeadas la recorten sin un borde entre dos bloques; la tarjeta va por delante, sin borde superior, y una sombra superior sutil (`hero-card-shadow`) refuerza que la gráfica queda al fondo sin que una línea de 1 px las separe. La tarjeta muestra el neto con signo y color (verde positivo, rojo negativo) y, como única línea de pie, el saldo total estimado a fin de mes.
3. **Cuentas**, **banner de cuota** y **últimos movimientos** sin cambios estructurales; «Preguntas rápidas →» sigue al pie de la última tarjeta.

La tarjeta reutiliza `StatCard` con un `foot` de una sola línea: «Saldo total estimado a fin de mes» y el importe en `text/primary`. No se añade un componente nuevo.

Alternativa descartada: continuar el ámbar en el fondo de la tarjeta con un degradado o solapar la gráfica bajo las esquinas redondeadas. El degradado teñía toda la tarjeta y el solape dejaba un pico cuadrado de ámbar junto a la esquina; con el área cerrada al ancho completo y la tarjeta por delante con una sombra sutil, la unión queda limpia.

### 5. Entrada animada sin recortes

`apps/web/app/globals.css` conserva `hero-chart-emerge` como una entrada por `transform: translateY(16px)` sin animar opacidad ni `clip-path`. El `clip-path` que usaba el gráfico anterior recortaba el punto final y hacía que el detalle pareciera roto. `@media (prefers-reduced-motion: reduce)` desactiva la animación y deja el estado final. La animación corre en el primer montaje con `animation-fill-mode: backwards`, de modo que al terminar no queda un `transform` que aísle la gráfica en su propio contexto de apilado y el detalle puede pintarse por encima de la tarjeta. `useLiveQuery` re-renderiza la misma instancia y no la reinicia.

### 6. Semántica del mes y estados

- El mes es el natural (`startOfMonth`/`getDaysInMonth`). La serie termina hoy y la base es el cierre del mes anterior.
- Sin movimientos: la línea se mantiene plana en el saldo de apertura y cada día indica «Sin movimientos».
- Sin cuentas: se conserva el `StatePage` existente y no se renderiza el hero.
- Con varias divisas: la gráfica usa la divisa de referencia y solo las cuentas incluidas; el saldo sigue listando todas.
- Sin proyección: la tarjeta omite el saldo total estimado y no inventa una cifra.

### 7. Accesibilidad y verificación

El grupo expone nombre, foco visible y navegación por teclado; el detalle es texto y no depende del color. Los tests cubren dominio (`currentMonthMovements`, `monthExpenseEstimate`), el componente (`MonthBalance` con teclado y estados), accesibilidad con `jest-axe`/axe en E2E y el flujo E2E del dashboard: hero sin caja, detalle por día, tarjeta de balance con saldo total estimado, ausencia del gráfico semanal y responsive a 390, 768 y 1440 px.

### 8. Mock determinista con histórico

La demo usa una fecha fija (`apps/web/src/lib/clock.ts`, domingo 29 de noviembre de 2026) y el seed recibe esa fecha al cargarse desde onboarding o ajustes. Para que la base y la proyección tengan sentido, el seed incluye gastos y nóminas del mes en curso y de los tres meses anteriores. `DEMO_SEED_VERSION` sube a 3 para refrescar demos antiguas al abrir la app. Los formularios usan la misma fecha por defecto, así que un gasto nuevo cae en el día visible y actualiza el saldo y el detalle. La fecha se puede sobrescribir con `NEXT_PUBLIC_AKARI_NOW` (ISO 8601).

## Risks / Trade-offs

- **El último punto no coincide con el saldo si hay movimientos futuros en el mes** → la serie termina hoy y no inventa días; el saldo total sigue siendo la fuente de verdad. Documentado.
- **La gráfica es difícil de acertar con el puntero** → área completa enfocable y navegación por teclado; prueba E2E en el extremo del mes.
- **El detalle tapa parte de la gráfica o se sale del módulo** → ancho fijo, `clamp` horizontal, colocación arriba/abajo según el espacio y capa superior a la tarjeta.
- **El saldo total estimado se lee como una promesa** → se etiqueta «Saldo total estimado a fin de mes» y se calcula con las recurrencias y cuotas pendientes del mes; sin proyección se omite.
- **Divisas y cuentas excluidas** → la serie solo suma cuentas incluidas de la divisa de referencia; el saldo y la tarjeta mantienen su comportamiento.
- **El cambio visual no está en Figma** → se documenta como desviación consciente en `docs/desarrollo/desviaciones.md`; el diseño está congelado. La tarjeta de balance con color y signo, y su continuidad con el área de la gráfica, también se registran ahí.
- **Reloj fijado en el mock** → la fecha es determinista para demos y pruebas, pero no refleja el día real; `NEXT_PUBLIC_AKARI_NOW` permite ajustarla.

## Migration Plan

No hay migración de datos ni cambios de esquema. `Overview` sustituye la serie semanal por `month` (movimientos y saldo diario); solo lo consume el dashboard. La demo antigua se refresca al subir `DEMO_SEED_VERSION`. Rollback: revertir el change; no quedan estructuras nuevas en IndexedDB.

## Open Questions

Ninguna que bloquee la implementación. La separación del detalle, el grosor de la línea y el tono de la base se ajustan en revisión visual con los tokens existentes.
