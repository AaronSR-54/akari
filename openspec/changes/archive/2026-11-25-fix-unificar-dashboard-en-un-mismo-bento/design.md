# Design

## Context

`DashboardScreen` renderiza el resumen dentro de un `Stack` (flex column). Sobre la sección de cuentas están el hero completo —saldo, gráfica del mes, últimos movimientos, balance del mes y accesos rápidos— con un `useLayoutEffect`/`ResizeObserver` que ajusta la altura de la gráfica para igualar los fondos de las dos columnas. Debajo, un `section aria-labelledby="cuentas"` contiene un `SectionHeader` («Cuentas» + «Gestionar cuentas») y una `Grid` de tres tarjetas de cuenta; después va el banner de la cuota. El enlace del encabezado apunta a `/cuentas/nueva`. El diseño visual está congelado, así que el cambio se registra como desviación sin editar `docs/diseno/`.

## Goals / Non-Goals

**Goals:**

- Que todas las cuentas se lean como un único panel del bento, no como tarjetas independientes.
- Mantener el encabezado de la sección con título y acción, con el mismo estilo que «Últimos movimientos».
- Mantener la agrupación semántica de las cuentas para lectores de pantalla.
- No alterar ni una línea del bloque situado sobre el encabezado.

**Non-Goals:**

- Reestructurar el hero en una rejilla CSS ni retirar el ajuste de altura de la gráfica.
- Añadir líneas divisorias, tablas ni cabeceras de columnas dentro del panel.
- Cambiar rutas, datos, tokens ni componentes de `packages/ui`.
- Modificar el diseño congelado ni FigCraft.

## Decisions

1. **`SectionHeader` dentro de la `Card`.** El usuario pide que la fila tenga título y botón de gestión como «Últimos movimientos»: título «Cuentas» y `Link` «Gestionar cuentas» a `/cuentas/nueva` con el mismo estilo que «Ver todos», ubicado dentro de la superficie del panel (no encima de ella) y separado del grid con `className="mb-4"`. Se mantiene `section aria-labelledby="cuentas"` para que el encabezado nombre la región. Alternativa descartada: dejar el encabezado fuera de la tarjeta — rompe la coherencia con los otros paneles del bento.

2. **Un único panel con bloques en columnas, separados por fondo.** Se conserva el `section w-full` y dentro se usa una sola superficie con la misma paleta que `AccountCard` (`Card` con borde y relleno). En su interior un `grid` con `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` reparte un bloque por cuenta: en escritorio quedan lado a lado y en móvil apilados. Cada bloque es un `Link` con `min-w-0`, `bg-surface-sunken`, `rounded-xl` y padding, sin bordes ni líneas: el contraste de fondo es el separador. Muestra nombre, badge, importe con `Amount`, «Saldo disponible», tipo y actualización. El grid acomoda cualquier número de cuentas pasando a nuevas líneas sin scroll ni ancho fijo. Alternativas descartadas: filas con cabecera de columnas (parecía una tabla), divisores verticales y líneas (el usuario los rechaza) y un componente nuevo en `packages/ui` (ampliaría el diff y exigiría tests en otro paquete).

3. **Tocar solo el bloque de cuentas.** El JSX, las clases y el JS del hero quedan byte a byte iguales; el diff se limita a un bloque de `dashboard.tsx`, las aserciones E2E, la spec y la nota de desviación.

## Risks / Trade-offs

- [El encabezado y su enlace conviven con el panel] → se comprueba en E2E que «Gestionar cuentas» es un enlace propio con `href="/cuentas/nueva"` y que no se anida dentro de los bloques de cuenta.
- [Muchas cuentas puedan desbordar o comprimir los bloques] → el grid pasa a nuevas líneas, sin scroll propio, con `min-w-0` y truncado de nombres; se verifica con una y con varias cuentas.
- [El diff toca un archivo con requisitos de geométrica estrictos] → al no modificar nada sobre el hero, las aserciones de la gráfica y el balance siguen siendo válidas.

## Migration Plan

Sin migración de datos ni despliegue especial. Se archive el change, se abra la PR y se ejecuten `typecheck`, `lint`, `test`, `build` y `e2e`. La reversión consiste en restaurar la `Grid` de `AccountCard` dentro del `section`.
