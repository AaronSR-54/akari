# Design

## Context

Ver `proposal.md` para la motivación. `MonthBalance` (`packages/ui/src/month-balance.tsx`) es el único componente de la gráfica del dashboard: dibuja un `svg` con `viewBox 0 0 100 38` y `preserveAspectRatio="none"`, un área ámbar y una línea; el grupo interactivo ocupa todo el ancho y el panel de detalle aparece bajo el puntero. El radio del panel de balance es de unas 3,2 unidades del viewBox y el área actualmente llega a los bordes. Los bloques de cuenta del dashboard usan `bg-surface-sunken`. El diseño visual está congelado: no se tocan FigCraft, `design/` ni `docs/diseno/`.

## Goals / Non-Goals

**Goals:**

- Separar el trazado y el área de los bordes laterales sin cambiar el alto ni el área interactiva.
- Obtener un área con extremos redondeados estables y una línea continua suave que no pierda el máximo ni inventa valores.
- Unificar la línea con el acento mostaza del área en ambos temas.
- Integrar el panel de detalle con el fondo de los bloques de cuenta del dashboard.

**Non-Goals:**

- No cambiar tokens, motores de gráficos ni dependencias.
- No teñir la línea según el signo del movimiento ni introducir un nuevo significado de color.
- No modificar el cálculo de saldos, la selección por teclado ni la composición responsive del dashboard.
- No abrir ni actualizar el diseño congelado.

## Decisions

1. **Inset lateral en la capa visual, no en el viewBox.** La capa absoluta que contiene el SVG pasa de `inset-0` a `inset-y-0 left-2 right-2` (8 px por lado). El `role="group"` conserva todo el ancho, por lo que el foco y el recorrido por puntero no se reducen.
   - Alternativa descartada: desplazar las coordenadas x dentro del viewBox. Cambiaría la escala y rompería la correspondencia con el panel de balance y las pruebas de altura.

2. **Área redondeada en los cuatro extremos con un único path.** Se construye el relleno con curvas cuadráticas en las esquinas superior e inferior de cada lado, con el radio ya usado en el final (3,2 unidades). Se elimina la condición `elapsed < totalDays`: el mismo trazado aplica con el mes abierto y completo.
   - Alternativa descartada: `border-radius` CSS sobre un rectángulo; el borde superior del área sigue la serie, no es recto.

3. **Suavizado cúbico tipo Catmull-Rom con tensión 0,12 y trazo entre tangentes.** Las x de la serie se mapean al rango `[radio, 100 − radio]` del viewBox, así la curva arranca y termina donde empiezan las esquinas redondeadas del área en lugar de tocar los bordes. Las ordenadas de control se limitan a `0…38` y, con uno o dos puntos, se conserva el trazado recto. El recorrido por puntero usa ese mismo rango para que el día señalado coincida con el punto dibujado.
   - Alternativa descartada: curvas cuadráticas por puntos medios, que no pasan exactamente por el cierre del mes anterior ni por el punto más alto.

4. **Línea en `--color-accent-default`.** Se sustituye `var(--color-text-primary)` por `var(--color-accent-default)`, el mismo token que ya tiñe el degradado del área. Ambos temas quedan coherentes sin tokens nuevos. Se descarta explícitamente el rojo/verde por subidas y bajadas sugerido en la tarjeta: la persona responsable prefirió mostaza siempre.

5. **Panel de detalle sobre `surface-sunken`.** Se sustituye `bg-surface-inverse`/`text-text-inverse` por `bg-surface-sunken`, `text-text-primary` y `text-text-secondary`. Se añade `border-border-subtle` porque en tema oscuro `surface-canvas` y `surface-sunken` comparten valor y hace falta un borde para separar el panel. La línea divisoria del saldo pasa de `border-text-inverse/20` a `border-border-subtle`. El panel pasa a `w-64`, `rounded-xl` y `p-3`, con fecha y saldo en `text-ui-11-strong`/`text-ui-12-strong`, movimientos en `text-ui-11` y aviso «y N más» al recortar la lista; el punto activo usa `ring-surface-sunken` para llevar el mismo color del panel en su borde. El panel de `MonthBalance` no lleva punta, así que no hay punta que recolorear (la punta de `ChartArea` queda fuera del alcance).
   - Alternativa descartada: `surface-raised`; el requisito es igualar el fondo de los bloques de cuenta.

6. **Verificación en dos niveles.** Pruebas unitarias sobre la geometría del path y las clases del panel; E2E sobre el inset medido del SVG y el color/fondo calculados en el dashboard. Se actualizan las aserciones antiguas que daban por recto el inicio del área o por tinta la línea.

## Risks / Trade-offs

- [El suavizado puede desplazar el máximo] → las curvas pasan por los puntos y las ordenadas de control se limitan a `0…38`; se conserva la prueba «el punto más alto toca el borde superior».
- [El inset separa el punto del cursor] → el grupo interactivo mantiene todo el ancho; con 8 px la desviación es inferior a un día en los anchos soportados.
- [El panel puede confundirse con el fondo en tema oscuro] → borde `border-border-subtle` y sombra `shadow-elevation-2` existente.
- [Contraste del texto del panel] → se usan tokens de texto principal y secundario en lugar de invertidos; se revisa en ambos temas.

## Migration Plan

Sin migración de datos ni cambios de API. Se aplica en un único componente, se verifican tipos, lint, pruebas y build, y se documenta la desviación visual en `docs/desarrollo/desviaciones.md`. La reversión es revertir el commit del change.

## Open Questions

_Ninguna: el color de la línea y el panel de hover fueron confirmados por la persona usuaria._
