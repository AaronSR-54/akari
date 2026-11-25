# Design

## Context

Ver `proposal.md` (Why). Estado actual: el hero compone dos columnas (`contents` → `lg:flex-col`); la izquierda lleva saldo (`data-hero="balance"`, `order-1`) y Últimos (`data-hero="recent"`, `order-3`), la derecha gráfica (`order-2`) y balance (`order-4`). El único acceso a preguntas rápidas es un enlace a pie del panel de Últimos. Existen `Card`, `SectionHeader` y `ActionLink` en `@akari/ui` y las rutas `/movimientos/nuevo`, `/cuentas/nueva` (verificar exactitud) y `/preguntas`.

## Goals / Non-Goals

**Goals:**
- Panel visible junto al saldo sin romper la unión gráfica→tarjeta ni el equilibrio de columnas.
- Cero duplicados: preguntas rápidas vive solo en el nuevo panel.

**Non-Goals:**
- Nuevas rutas, cambios de modelo o de `packages/domain`/`data`.
- Reordenación personalizable o analítica de uso de los atajos.
- Nuevos componentes en `packages/ui` salvo que la composición lo exija.

## Decisions

- **Final del área redondeado como el panel (solo si el mes sigue abierto).** En `MonthBalance`, cuando `elapsed < totalDays` el relleno se extiende en plano hasta x=100 y la esquina superior del final se cierra con `Q` de radio 3.2 (≈20px = `rounded-xl` a tamaño desktop, proporcional al reescalar). El inicio se deja recto y con el mes completo no cambia nada. Tests unitarios del `d` del área en ambos casos.
- **Sin caja, píldoras siempre expandidas a todo el ancho.** Los accesos van directos sobre el lienzo (`section` con `aria-label`, sin `Card` ni título visible) en una sola fila `flex-auto`: 4 píldoras en desktop (nuevo acento; cuenta y exportar claras con borde; preguntas oscura (`bg-text-primary`, como las pestañas activas), a la derecha) y 3 en móvil (nuevo oculto, «Preguntas» corto). Sin huecos: las píldoras absorben todo el sobrante sin truncar.
- **Añadir movimiento = eje central de la barra móvil.** `MobileNav` parte las 4 pestañas en 2+2 con un FAB circular `h-14` elevado (`-translate-y-3`, `bg-accent-default`) entre Movimientos y Grupos; `aria-current` cuando se está en `/movimientos/nuevo`. Solo existe bajo 768px (`md:hidden`); en desktop el atajo sigue en el panel y en la cabecera de Movimientos.
- **DOM: saldo, últimos, gráfica, balance, accesos; orden móvil 1–5 en ese orden.** La gráfica recupera `order-2` y Últimos `order-3`; el panel queda `order-5` con `mt-5` en móvil y `lg:mt-4` en desktop (la columna derecha no tiene gap). Alternativa de panel bajo el saldo: descartada, el usuario lo quiere bajo el balance.
- **El enlace «Preguntas rápidas →» sale de Últimos.** Se conserva «Ver todos»; así se cumple el requisito de no duplicar.
- **Regla de gaps (desktop): todo hueco entre paneles y secciones = 16px (`gap-4`).** Es la separación de las tarjetas de cuentas (`Grid gap-4`) y se extiende al hero (entre columnas, columna izquierda, balance→accesos) y al hueco hero→cuentas (`Stack` con `lg:gap-4`); el `sideGap` de la medición de la gráfica usa el mismo valor. Excepciones con motivo: gráfica↔balance van unidas (0) y título de sección→contenido mantiene 10px (`mt-2.5`). En móvil no cambia nada.
- **La gráfica tiene altura adaptativa por medición.** Un efecto en el dashboard mide en desktop la columna izquierda y fija la altura de la gráfica (columna − balance − accesos − gap, mínimo 160px), con `ResizeObserver` para fuentes y re-renderizados; en móvil se limpia el valor. La columna izquierda reparte el hueco sobrante como aire (`justify-between`): el panel de Últimos no cambia de tamaño y los fondos quedan siempre igualados. Alternativa solo-CSS (`flex-1` en la columna corta): descartada, solo sabe crecer la columna corta y el usuario vetó estirar Últimos; CSS no puede encoger al hermano para igualar.

## Risks / Trade-offs

- [Huecos dispares entre paneles] → regla única desktop: 16px (`gap-4`) en hero, secciones y tarjetas de cuentas; verificar en captura desktop y con la aserción E2E existente.
- [Ruta de «Nueva cuenta» distinta de la supuesta] → confirmar contra `nav.ts`/rutas antes de implementar; el task lo incluye.
- [Cuatro atajos + cabecera estrechan el aire `lg:gap-4`] → se mantiene la regla de 16px; si el panel queda pegado, se ajusta espaciado sin tocar la spec.

## Open Questions

Ninguna: el contenido (3 atajos) y la posición los fijó el usuario.
