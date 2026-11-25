# Design

## Context

Ver `proposal.md` para el porqué. Estado actual en `apps/web/src/components/pages/dashboard.tsx` (`OverviewBody`): hero en retícula de 2 columnas con `data-hero="balance"`, `data-hero="month"`, `data-hero="month-summary"`, `data-hero="upcoming"`; debajo, sección Cuentas, `Banner` condicional de cuota y sección «Últimos movimientos» al final. `upcoming` viene de `useOverview()` sin cambios de cálculo en este change.

## Goals / Non-Goals

**Goals:**

- Hero 2×2 con saldo, gráfica, últimos movimientos y balance, con el orden pedido y apilado móvil.
- Un solo panel de cuota debajo de Cuentas, sin duplicar tarjeta + banner.

**Non-Goals:**

- No cambiar cálculo de `upcoming`, proyecciones ni saldos (`packages/domain`, `packages/data` intactos).
- No crear componentes nuevos ni tocar tokens, FigCraft o `docs/diseno/`.
- No cambiar filtros, detalle de cuenta ni preguntas rápidas.

## Decisions

- **Últimos movimientos entra al hero tal cual.** Se traslada la `Card` existente con `SectionHeader`, lista `MovementRow`, estado vacío, «Ver todos» y «Preguntas rápidas →» con `data-hero="recent"`. Alternativa de reescribir la lista en otro componente: descartada, duplica código sin aporte.
- **Hero en dos columnas independientes.** La sección usa `flex-col` en móvil y `lg:flex-row` con dos envoltorios `contents` → `lg:flex lg:flex-1 lg:flex-col`: izquierda saldo + últimos con `lg:gap-6`, derecha gráfica + balance unidos. En móvil los envoltorios se disuelven (`contents`) y el orden visual se fija con `order`: saldo, gráfica, últimos, balance. El orden de lectura para lectores de pantalla sigue el DOM (saldo, últimos, gráfica, balance), coherente por bloques aunque no idéntico al visual. Alternativa de retícula 2×2: descartada, acoplaba las filas y dejaba huecos en diagonal imposibles de repartir.
- **Saldo sin proyección e importe grande.** Se elimina la línea de proyección del bloque de saldo (duplicaba el pie de la tarjeta de balance); el importe usa `text-ui-52-bold` directo, porque las clases de texto de los tokens son CSS plano sin variantes responsive (`sm:` sobre ellas no genera nada).
- **Balance compacto en la columna derecha.** La tarjeta ocupa solo su contenido; la unión gráfica-tarjeta se mantiene (sin borde superior, sombra superior). La gráfica ocupa el alto restante (`lg:flex-1` con mínimo `lg:min-h-80`) para que ambas columnas terminen a la misma altura de contenido. Alternativa de tarjeta estirada con contenido repartido: descartada, dejaba un borde grande con hueco.
- **Escala de la gráfica sin aire superior.** En `MonthBalance` el máximo mapea a y=0 (antes y=6 de 38) y el mínimo conserva su colchón; el área sigue bajando a 46 para la unión con la tarjeta. Alternativa de mantener el colchón simétrico: descartada, el pico quedaba flotando.
- **Unión gráfica→Últimos en móvil.** En <1024px la tarjeta de Últimos pierde el borde superior y gana sombra superior (`.hero-recent-union`, aplicada solo bajo media query en `globals.css`) y se pega a la gráfica sin margen; la caja del gráfico es `flex-col` y la raíz de `MonthBalance` lleva `flex-1` para que el svg la llene y el ámbar llegue hasta la tarjeta. En desktop la tarjeta es normal. Alternativa de revertir con utilidades `lg:`: descartada, pelea de cascada con la clase custom.
- **Saldo centrado en móvil.** `items-center text-center` en base y `lg:items-start lg:text-left` en desktop (utilidades core, sin problema de responsive).
- **Cuota unificada = `Banner` existente.** Se elimina el `StatCard` `data-hero="upcoming"` del hero y se conserva un único `Banner` (tono `error`/`warning`, título, importe, fecha y acción «Pagar ahora») situado tras la sección Cuentas. Alternativa de quedarnos con `StatCard` ampliado: descartada porque el `Banner` ya combina tono, mensaje y CTA sin añadir props.
- **Orden de lectura y responsive.** En `lg` dos columnas independientes; en móvil apilado en orden visual saldo → gráfica → últimos → balance → cuentas → cuota (con `order`, el DOM agrupa por columnas). La lectura para lectores de pantalla sigue el DOM y es coherente por bloques.
- **Selectores para E2E.** Se añade `data-hero="recent"` al panel movido y se retira `data-hero="upcoming"`; la cuota unificada queda identificable por su texto actual («La cuota está vencida» / «La cuota vence pronto»).

## Risks / Trade-offs

- [Alturas con datos distintos a la demo] → la gráfica (`flex-1` con mínimo) absorbe la diferencia y los fondos quedan igualados; con otra cantidad de movimientos puede quedar un desnivel leve.
- [E2E existentes atan `data-hero="upcoming"` y geometrías] → actualizar `e2e/dashboard.spec.ts` en el mismo change.
- [Conflicto con otros changes que toquen `dashboard.tsx`] → cambio localizado en un solo fichero de pantalla; rebasar sobre `main` antes de archivar.

## Migration Plan

Sin migración de datos. Despliegue como cambio UI normal; rollback revertiendo el commit de `dashboard.tsx` + E2E.

## Open Questions

Ninguna que bloquee specs o tareas.
