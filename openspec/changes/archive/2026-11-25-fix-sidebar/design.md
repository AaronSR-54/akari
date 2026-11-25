# Design

## Context

Ver `proposal.md` para la motivación. `Sidebar` es hoy un elemento flex con `transition-[width]` que pasa de 76 px a 240 px: al expandirse empuja el contenido. El diseño congelado (`docs/diseno/componentes.md`, `docs/diseno/flujos-web.md`) describe el panel expandido como flotante sobre el contenido y la navegación como fija durante el scroll; la spec `producto/shell-web` recoge ambos comportamientos. La fase de diseño está cerrada, así que cualquier separación visual se registra en `docs/desarrollo/desviaciones.md` y no se reescriben los documentos de diseño.

La unificación de tamaños afecta a cuatro componentes presentacionales en un único fichero (`sidebar.tsx`) y a las pruebas E2E del shell. No hay cambios de datos, puertos ni dependencias.

## Goals / Non-Goals

**Goals:**

- Que la expansión de la sidebar no desplace ni redimensione el área de contenido.
- Que la sidebar permanezca fija y superpuesta con el inset de 16 px del shell.
- Que logo, ítems de navegación y avatar tengan las mismas dimensiones en sidebar, header superior, tablet y móvil.
- Cubrir el comportamiento con pruebas unitarias y E2E.

**Non-Goals:**

- Cambiar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
- Cambiar el comportamiento de fijación (pinned), el foco dentro de la sidebar ni los atajos de teclado.
- Revisar colores, sombras, radios ni el botón de colapsar.
- Añadir persistencia de la preferencia de expansión.

## Decisions

### 1. Panel superpuesto con espacio reservado

La sidebar se posiciona con `fixed left-4 top-4 z-40` y mantiene `h-[calc(100vh-2rem)]`. El flex del shell reserva un hueco mediante un divisor `hidden shrink-0 lg:block` cuyo ancho es 76 px en reposo y 240 px cuando la navegación está fijada abierta. El estado `pinned` sube a `AppShell` para que el spacer y la sidebar compartan la misma fuente de verdad. La expansión transitoria por hover o foco no cambia la reserva: el panel flota con `elevation-3` y un velo `bg-overlay-scrim/20` sobre el contenido; la expansión fijada usa `elevation-1`, sin velo, y ensancha la reserva para que el contenido se vea entero.

- **Alternativa descartada:** mantener la sidebar `sticky` dentro del flex y dibujar un panel hijo en `absolute`. Obliga a duplicar el estado compacto y el expandido, y `position: sticky` depende de la altura del contenedor padre.
- **Alternativa descartada:** envolver la sidebar en un contenedor `relative` con ancho fijo. Añade anidamiento sin ventajas frente a `fixed`, y el shell ya garantiza el inset de 16 px.

`z-40` sitúa el panel por encima de `DesktopHeader` (`z-20`), del velo (`z-30`) y de las barras tablet/móvil (`z-30`, ocultas en `lg`), por lo que el panel flotante tapa la esquina superior izquierda de la cabecera sin dejar ver contenido por debajo. El velo es `pointer-events-none` para no bloquear la interacción con el contenido mientras el panel está abierto por hover.

### 2. Escala de tamaños compartida

Se eliminan los valores dispares y se usan los mismos en todas las variantes:

| Elemento | Valor unificado | Aplica a |
| --- | --- | --- |
| Logotipo expandido | M (32 px) | Sidebar expandida, `HeaderNav`, `TabletHeader`, `MobileTopBar` |
| Ítems de navegación | h-11 (44 px) | Sidebar (compacta y expandida), `HeaderNav`, `TabletHeader` |
| Avatar | md (40 px) | Sidebar, `HeaderNav`, `TabletHeader`, `MobileTopBar` |

La sidebar compacta conserva `format="initial"`, cuyo glifo mide 32 px, por lo que coincide con el tamaño M del logotipo expandido. La barra inferior móvil mantiene sus destinos con `min-h-11`: cumplen el objetivo táctil y no hay avatar que ajustar.

- **Alternativa descartada:** igualar todo al header (logo S de 20 px) deja el logotipo demasiado pequeño en la sidebar expandida.
- **Alternativa descartada:** igualar todo a la sidebar (ítems h-10 de 40 px) se queda por debajo del objetivo táctil de 44 px de `producto/componentes`.

La elección intermedia toma el logotipo de la sidebar y la altura de ítems del header. El ajuste a 32 px se aplica en `apps/web` con un contenedor `scale-[0.8]` alrededor del `Logo`: los worktrees resuelven `@akari/ui` contra el checkout principal, así que tocar el paquete no afectaría al front de este worktree.

### 3. Trazabilidad de la desviación

El diseño congelado reserva el logo S para cabeceras y el logo M para la sidebar expandida, y no especifica la altura unificada de los ítems. La implementación se aparta de esa combinación; se documenta con una entrada nueva en `docs/desarrollo/desviaciones.md` y se dejan `docs/diseno/` y `design/` intactos.

### 4. Verificación del comportamiento

Las pruebas unitarias existentes solo cubren `DesktopHeader`. La superposición y los tamaños se validan mejor en E2E con `boundingBox()` y estilos computados:

- ancho de la sidebar 76 px en reposo y 240 px al hacer hover;
- posición y ancho del contenido idénticos antes y después del hover;
- altura de 44 px en los enlaces de navegación de sidebar y header;
- avatar de 40 × 40 px en las variantes de escritorio;
- `data-expanded` y el foco dentro de la sidebar siguen funcionando.

## Risks / Trade-offs

- **[El panel flotante tapa controles de la cabecera]** → es el comportamiento previsto; el velo y la sombra refuerzan la capa superior, y el control permite colapsarlo.
- **[Fijar el panel cambia el ancho del contenido]** → es lo pedido: el spacer pasa a 240 px y se retira el velo; no se añade persistencia y el chevron lo deshace.
- **[`fixed` depende del viewport]** → `left-4`/`top-4` reproducen el inset de 16 px del shell y la altura `calc(100vh-2rem)` conserva el margen inferior.
- **[Logo M en la cabecera puede reducir espacio para los enlaces]** → la cabecera usa flex con truncado; se comprueba ausencia de desbordamiento horizontal en el E2E de shell.
- **[Cambio visual respecto al diseño aprobado]** → queda registrado en `desviaciones.md`; solo se puede cerrar si se reabre la fase de diseño.

## Migration Plan

No hay migración de datos ni de esquema. El despliegue es el habitual de la app web; la reversión consiste en revertir el commit del change. Las tarjetas y la rama se gestionan con el flujo de claim/archivo de `AGENTS.md`.

## Open Questions

Ninguna.
