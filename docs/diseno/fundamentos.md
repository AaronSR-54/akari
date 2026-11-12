# Fundamentos del diseño de akari

- **Cambio:** `diseno-app-akari`
- **Fase:** F0 — Fundamentos
- **Fecha:** 2026-11-11
- **Archivo:** `/home/aaronsr/Projects/akari/akari.figcraft` (copia local de la sesión FigCraft)
- **Referencia Figma:** https://www.figma.com/design/npwsfgd0s4n4UWszvg28wv/akari
- **Dónde vive en el archivo:** página `01-Diseño` → sección `Fundamentos` → paneles `Dirección visual`, paletas, `Contraste AA`, `Theme sample`, `Tipografía`, `Tokens`, `Iconografía` y `Gráficos`.

Este documento fija los fundamentos que consumen los componentes y las pantallas. Si un valor no está aquí, no debe usarse: se añade al sistema primero.

## 1. Dirección visual: «luz cálida»

Akari trata el dinero como algo cotidiano y tranquilo, no como un panel de trading. La interfaz se apoya en papel cálido, tinta profunda y un ámbar que marca lo importante sin gritar.

- **Papel cálido** para fondos y superficies; nunca blanco puro en áreas grandes.
- **Tinta** para texto y estructura; el contraste alto es la norma.
- **Ámbar** para la acción principal, el FAB, el foco y los datos destacados; la tinta estructura y marca la navegación activa. No es decoración.
- **Verde y rojo** solo para estado (positivo/negativo), siempre acompañados de texto o icono.
- **Números primero:** importes con cifras tabulares, alineados a la derecha y sin separadores inventados.

### Referencia de estilo: Aurex Living

La estructura de componentes sigue la referencia [Aurex Living — Real Estate Dashboard](https://me.muz.li/orbix-studio/aurex-living-real-estate-dashboard-ui-design-2), adaptada a nuestros tokens:

- **Lienzo cálido + tarjetas blancas.** El fondo es `surface/canvas`; las tarjetas son `surface/default` con radio 20 y sombra suave.
- **Navegación flotante tipo píldora.** Tab bar, top bar y sidebar son piezas blancas elevadas; el destino activo es una píldora de tinta con texto papel.
- **Acción principal en ámbar.** El botón primario mantiene `accent/default` con `accent/ink`; la tinta se reserva para la navegación activa, el texto y los iconos.
- **Controles redondos.** Botones y chips a `radius/full`; icon buttons circulares de 44 px con sombra de elevación 1.
- **Métricas bento.** Etiqueta pequeña en `text/secondary`, importe grande con cifras tabulares y sparkline de barras finas; una sola idea por tarjeta.
- **Jerarquía silenciosa.** Bordes de 1 px, sombras de baja opacidad y mucho aire; nada compite con el número.

Lo que **no** se copia: la paleta fría y las fotos de inmuebles. Akari mantiene papel cálido, tinta y ámbar, y sustituye la fotografía por datos y estados.


## 2. Capas de tokens

| Colección | Modos | Contenido | Uso |
| --- | --- | --- | --- |
| `akari/primitives` | `Value` | 44 colores + 31 números | Solo para construir la capa semántica y documentar. |
| `akari/semantic` | `Light`, `Dark` | 35 colores con alias por modo | Todo lo que usan componentes y pantallas. |

Regla: **la UI de producto solo consume `akari/semantic` y los estilos**. Los primitivos no se vinculan a capas de pantalla.

Los colores semánticos son alias a primitivos. Cambiar un primitivo actualiza ambos modos; cambiar un alias solo afecta al modo correspondiente.

## 3. Primitivos de color

| Token | Valor | Uso previsto |
| --- | --- | --- |
| `color/paper-50` | `#FFFDF8` | Superficie elevada en claro |
| `color/paper-100` | `#F7F2E9` | Lienzo cálido |
| `color/paper-200` | `#EFE7D8` | Superficie hundida / pista de barras |
| `color/paper-300` | `#E6DDCE` | Bordes sutiles |
| `color/paper-400` | `#CFC3B0` | Bordes fuertes |
| `color/ink-300` | `#9A9083` | Texto deshabilitado |
| `color/ink-500` | `#6B6257` | Texto secundario |
| `color/ink-700` | `#4A4239` | Texto terciario / ejes |
| `color/ink-900` | `#1F1B16` | Texto principal, scrim |
| `color/amber-50` | `#FBF1DF` | Ámbar muy suave |
| `color/amber-100` | `#F5E6CC` | Fondo de acento |
| `color/amber-300` | `#E8A33D` | Acento / acción principal |
| `color/amber-500` | `#C9821F` | Acento en texto sobre papel |
| `color/amber-700` | `#8A5A12` | Acento fuerte / warning-text |
| `color/amber-900` | `#5C3B08` | Texto sobre ámbar |
| `color/amber-ink` | `#5C3B08` | Tinta de botón ámbar (mismo valor que amber-900) |
| `color/positive-50` | `#E6F3EC` | Fondo de estado positivo |
| `color/positive-600` | `#2F7D5A` | Estado positivo |
| `color/positive-700` | `#246247` | Texto positivo |
| `color/danger-50` | `#F9E7E4` | Fondo de error |
| `color/danger-600` | `#B5453A` | Error / negativo |
| `color/danger-700` | `#8F352C` | Texto de error |
| `color/info-50` | `#E8F0F7` | Fondo informativo |
| `color/info-600` | `#2F6690` | Informativo / serie 1 |
| `color/night-950` | `#14110D` | Lienzo oscuro |
| `color/night-900` | `#1E1A15` | Superficie oscura |
| `color/night-800` | `#27221C` | Superficie elevada oscura |
| `color/night-700` | `#3A332A` | Borde oscuro |
| `color/night-600` | `#52483C` | Borde fuerte oscuro |
| `color/night-500` | `#7A6F60` | Texto deshabilitado oscuro |
| `color/dark-text` | `#F7F2E9` | Texto principal oscuro |
| `color/dark-muted` | `#C9BFAF` | Texto secundario oscuro |
| `color/dark-accent` | `#F0B45A` | Acento oscuro |
| `color/dark-positive` | `#6FC59C` | Positivo oscuro |
| `color/dark-danger` | `#E58C82` | Negativo oscuro |
| `color/dark-info` | `#7FB3D5` | Informativo oscuro |
| `color/dark-amber-text` | `#F7C97E` | Texto ámbar oscuro |
| `color/dark-amber-soft` | `#3A2A12` | Fondo ámbar oscuro |
| `color/dark-positive-text` | `#A6E3C4` | Texto positivo oscuro |
| `color/dark-positive-soft` | `#173126` | Fondo positivo oscuro |
| `color/dark-danger-text` | `#F2B4AD` | Texto de error oscuro |
| `color/dark-danger-soft` | `#3A1C18` | Fondo de error oscuro |
| `color/dark-info-text` | `#B3D4EA` | Texto informativo oscuro |
| `color/dark-info-soft` | `#172A38` | Fondo informativo oscuro |

## 4. Primitivos numéricos

| Grupo | Tokens |
| --- | --- |
| Espaciado | `space/0` 0 · `space/1` 4 · `space/2` 8 · `space/3` 12 · `space/4` 16 · `space/5` 20 · `space/6` 24 · `space/8` 32 · `space/10` 40 · `space/12` 48 · `space/16` 64 · `space/20` 80 · `space/24` 96 |
| Radios | `radius/none` 0 · `radius/sm` 6 · `radius/md` 10 · `radius/lg` 14 · `radius/xl` 20 · `radius/full` 999 |
| Tamaños | `size/icon-sm` 16 · `size/icon-md` 20 · `size/icon-lg` 24 · `size/touch-min` 44 · `size/control-sm` 36 · `size/control-md` 44 · `size/control-lg` 52 |
| Bordes | `border/width-1` 1 · `border/width-2` 2 |
| Movimiento | `motion/fast` 120 · `motion/base` 180 · `motion/slow` 280 (ms) |

La escala de espaciado es de 4 px. Las pantallas no usan valores fuera de esta tabla; si hace falta un valor nuevo, se añade como token.

## 5. Tokens semánticos de color

| Token | Light | Dark |
| --- | --- | --- |
| `surface/canvas` | #F7F2E9 | #14110D |
| `surface/default` | #FFFDF8 | #1E1A15 |
| `surface/raised` | #FFFDF8 | #27221C |
| `surface/sunken` | #EFE7D8 | #14110D |
| `surface/inverse` | #1F1B16 | #FFFDF8 |
| `text/primary` | #1F1B16 | #F7F2E9 |
| `text/secondary` | #6B6257 | #C9BFAF |
| `text/tertiary` | #4A4239 | #C9BFAF |
| `text/disabled` | #9A9083 | #7A6F60 |
| `text/placeholder` | #9A9083 | #7A6F60 |
| `text/inverse` | #FFFDF8 | #1F1B16 |
| `border/subtle` | #E6DDCE | #3A332A |
| `border/strong` | #CFC3B0 | #52483C |
| `accent/default` | #E8A33D | #F0B45A |
| `accent/strong` | #8A5A12 | #F7C97E |
| `accent/soft` | #F5E6CC | #3A2A12 |
| `accent/ink` | #5C3B08 | #14110D |
| `status/positive` | #2F7D5A | #6FC59C |
| `status/positive-text` | #246247 | #A6E3C4 |
| `status/positive-soft` | #E6F3EC | #173126 |
| `status/danger` | #B5453A | #E58C82 |
| `status/danger-text` | #8F352C | #F2B4AD |
| `status/danger-soft` | #F9E7E4 | #3A1C18 |
| `status/info` | #2F6690 | #7FB3D5 |
| `status/info-text` | #2F6690 | #B3D4EA |
| `status/info-soft` | #E8F0F7 | #172A38 |
| `status/warning` | #C9821F | #F0B45A |
| `status/warning-text` | #8A5A12 | #F7C97E |
| `status/warning-soft` | #F5E6CC | #3A2A12 |
| `focus/ring` | #8A5A12 | #F7C97E |
| `overlay/scrim` | #1F1B16 | #14110D |
| `data/1` | #2F6690 | #7FB3D5 |
| `data/2` | #C9821F | #F0B45A |
| `data/3` | #2F7D5A | #6FC59C |
| `data/4` | #B5453A | #E58C82 |
| `data/5` | #6B6257 | #C9BFAF |

Notas de uso:

- `overlay/scrim` se aplica con opacidad 40–60 % en la implementación; el token guarda el color base.
- `text/disabled` no se usa para texto que deba leerse; si el contenido importa, no está deshabilitado.
- `text/placeholder` comparte valor con `text/disabled` en ambos modos, pero se aplica al texto de ejemplo de un campo vacío; nunca sustituye a una etiqueta.
- `text/tertiary` se usa en etiquetas de navegación inactivas, ejes y metadatos sobre `surface/default`; en oscuro comparte valor con `text/secondary` porque la jerarquía se marca con tamaño y peso, no con otro gris.
- En modo oscuro `surface/canvas` y `surface/sunken` comparten valor: la separación se hace con borde y elevación, no con otro negro.
- `accent/ink` es el único texto permitido sobre `accent/default`.

## 6. Contraste verificado (WCAG AA)

| Par | Colores | Ratio | Resultado |
| --- | --- | --- | --- |
| text/primary · surface/default (claro) | #1F1B16 / #FFFDF8 | 16,84:1 | AA texto |
| text/secondary · surface/default (claro) | #6B6257 / #FFFDF8 | 5,89:1 | AA texto |
| text/tertiary · surface/default (claro) | #4A4239 / #FFFDF8 | 9,69:1 | AA texto |
| text/tertiary · surface/canvas (claro) | #4A4239 / #F7F2E9 | 8,84:1 | AA texto |
| text/primary · surface/canvas (claro) | #1F1B16 / #F7F2E9 | 15,35:1 | AA texto |
| text/secondary · surface/canvas (claro) | #6B6257 / #F7F2E9 | 5,37:1 | AA texto |
| accent/ink · accent/default (claro) | #5C3B08 / #E8A33D | 4,67:1 | AA texto |
| positive-text · positive-soft (claro) | #246247 / #E6F3EC | 6,32:1 | AA texto |
| danger-text · danger-soft (claro) | #8F352C / #F9E7E4 | 6,48:1 | AA texto |
| info-text · info-soft (claro) | #2F6690 / #E8F0F7 | 5,33:1 | AA texto |
| text/primary · surface/default (oscuro) | #F7F2E9 / #1E1A15 | 15,52:1 | AA texto |
| text/secondary · surface/default (oscuro) | #C9BFAF / #1E1A15 | 9,52:1 | AA texto |
| accent/ink · accent/default (oscuro) | #14110D / #F0B45A | 10,20:1 | AA texto |
| accent/strong · accent/soft (oscuro) | #F7C97E / #3A2A12 | 8,96:1 | AA texto |
| positive-text · positive-soft (oscuro) | #A6E3C4 / #173126 | 9,58:1 | AA texto |
| danger-text · danger-soft (oscuro) | #F2B4AD / #3A1C18 | 8,76:1 | AA texto |
| info-text · info-soft (oscuro) | #B3D4EA / #172A38 | 9,49:1 | AA texto |

Regla: texto normal ≥ 4,5:1; texto grande (≥ 24 px o ≥ 19 px bold) y elementos de UI ≥ 3:1. Los pares de la tabla cumplen AA para texto normal salvo que se indique lo contrario.

## 7. Tipografía

Familia única: **Inter**. El archivo tiene dos escalas complementarias: la **editorial** (17 estilos, portada, documentación y titulares) y la **UI compacta** (32 estilos, todo el producto móvil y web).

### Escala editorial (17 estilos)

| Estilo | Tamaño / línea | Peso | Uso |
| --- | --- | --- | --- |
| `Display/XL` | 92 / auto, -3 px | Bold | Portada y hero editorial |
| `Display/L` | 56 / auto, -1,5 px | Bold | Hero de web |
| `Heading/XXL` | 34 / auto | Bold | Título de sección |
| `Heading/XL` | 26 / auto | Bold | Título de pantalla |
| `Heading/L` | 22 / auto | Bold | Encabezado de bloque |
| `Heading/M` | 20 / auto | Bold | Título de tarjeta grande |
| `Heading/S` | 18 / auto | SemiBold | Título de tarjeta |
| `Body/L` | 17 / 26 | Regular | Cuerpo principal |
| `Body/M` | 15 / 22 | Regular | Cuerpo secundario |
| `Body/S` | 13 / 19 | Regular | Apoyo, notas y descripciones |
| `Label/M` | 13 / auto | SemiBold | Botones, campos y etiquetas |
| `Label/S` | 12 / auto | SemiBold | Badges y tabs |
| `Caption` | 11 / 16 | Regular | Metadatos y ayudas |
| `Numeric/XL` | 30 / auto | Bold | Importe destacado |
| `Numeric/L` | 24 / auto | Bold | Saldo de tarjeta |
| `Numeric/M` | 18 / auto | SemiBold | Importe de fila |
| `Numeric/S` | 14 / auto | SemiBold | Importe secundario |

### Escala UI compacta (32 estilos)

La interfaz de producto se dibuja densa (móvil 390 px). Para que cada texto tenga estilo sin cambiar tamaños ni romper layouts, F4 añadió una escala de producto con línea automática y tres pesos. Nombres: `UI/[tamaño]` para Regular, `UI/[tamaño] Strong` para SemiBold y `UI/[tamaño] Bold` para Bold.

| Tamaño | Regular | SemiBold | Bold | Uso típico |
| --- | --- | --- | --- | --- |
| 8 | `UI/8` | `UI/8 Strong` | — | Etiquetas de eje y micro-metadatos |
| 9 | `UI/9` | `UI/9 Strong` | — | Tab bar, badges y overline |
| 10 | `UI/10` | `UI/10 Strong` | — | Metadatos, fechas y ayudas |
| 11 | `UI/11` | `UI/11 Strong` | — | Cuerpo de apoyo y etiquetas de campo |
| 12 | `UI/12` | `UI/12 Strong` | — | Cuerpo compacto y nombres de fila |
| 13 | `UI/13` | `UI/13 Strong` | — | Cuerpo y títulos de tarjeta pequeños |
| 14 | `UI/14` | `UI/14 Strong` | `UI/14 Bold` | Botones, chips e importes de fila |
| 15 | — | `UI/15 Strong` | — | Subtítulos de apoyo |
| 16 | — | `UI/16 Strong` | `UI/16 Bold` | Título de pantalla interna |
| 17 | — | `UI/17 Strong` | — | Subtítulo de sección |
| 18 | — | — | `UI/18 Bold` | Título de pantalla y wordmark pequeño |
| 19 | — | — | `UI/19 Bold` | Saludo y título de bloque |
| 20 | — | `UI/20 Strong` | `UI/20 Bold` | Título de página y KPI |
| 22 | — | — | `UI/22 Bold` | Titular de sección |
| 24 | — | — | `UI/24 Bold` | Importe grande |
| 26 | — | — | `UI/26 Bold` | Titular de onboarding |
| 28 | — | — | `UI/28 Bold` | Importe de resumen |
| 30 | — | — | `UI/30 Bold` | Importe destacado |
| 32 | — | — | `UI/32 Bold` | Importe hero |
| 40 | — | — | `UI/40 Bold` | Wordmark de portada móvil |
| 44 | — | — | `UI/44 Bold` | Cifra editorial |
| 52 | — | — | `UI/52 Bold` | Reloj de estado en el widget |

Reglas:

- Los cuatro estilos `Numeric/*` usan la feature `tnum` (cifras tabulares) para que los importes no bailen al actualizar.
- Un importe nunca se parte en dos líneas: se trunca con elipsis o se reduce al siguiente estilo, en ese orden.
- No se usan tamaños sueltos. Todo texto de producto usa un estilo `UI/*`; la portada y la documentación usan la escala editorial.
- El español necesita acentos y ñ: no se reduce el tracking por debajo de lo definido en `Display/*`.


## 8. Elevación

| Estilo | Sombra | Uso |
| --- | --- | --- |
| `Elevation/1` | 0 1 3 rgba(31,27,22,6 %) | Bordes, separadores y tarjetas en reposo |
| `Elevation/2` | 0 4 12 rgba(31,27,22,10 %) | Tarjeta activa, popover pequeño |
| `Elevation/3` | 0 12 32 rgba(31,27,22,14 %) | Modal, bottom sheet, menú flotante |

En modo oscuro la sombra no basta: todo elemento elevado añade `border/subtle` y una superficie más clara (`surface/raised`).

## 9. Grid y layout

| Estilo | Columnas | Gutter | Margen |
| --- | --- | --- | --- |
| `Grid/Mobile 4col` | 4 | 16 | 24 |
| `Grid/Web 12col` | 12 | 24 | 72 |

- Móvil de referencia: 390 × 844. Comprobar también 360 × 800.
- Web: contenido centrado con ancho máximo 1296; en 1440 no se estira más.
- Los frames de pantalla usan el grid correspondiente; el contenido nunca se pega al borde.

## 10. Movimiento

| Token | Duración | Uso |
| --- | --- | --- |
| `motion/fast` | 120 ms | Hover, foco, cambios de color |
| `motion/base` | 180 ms | Aparición de menús, expandir/colapsar |
| `motion/slow` | 280 ms | Bottom sheet, transición de pantalla |

- Solo se animan opacidad y transformaciones; nunca `width`/`height` en listas largas.
- Con `prefers-reduced-motion` las duraciones pasan a 0 y se conserva el cambio de estado.
- El movimiento no es la única señal de un cambio: siempre hay un cambio de color, texto o posición final.

## 11. Iconografía

Set base en el panel `Iconografía`, como componentes `Icon/*`:

| Componente | Uso |
| --- | --- |
| `Icon/Home` | Inicio / dashboard |
| `Icon/Wallet` | Cuentas y saldos |
| `Icon/Arrows` | Movimientos, ingresos y gastos |
| `Icon/Users` | Grupos y gastos compartidos |
| `Icon/Add` | Acción principal de creación |
| `Icon/Insights` | Análisis y preguntas rápidas |
| `Icon/Search` | Búsqueda y filtros |
| `Icon/Sliders` | Ajustes, datos y sincronización |

Reglas:

- Lienzo de 24 × 24, trazo 1,75, extremos y uniones redondeados, sin relleno.
- Tamaños permitidos: 16, 20 y 24 px (`size/icon-*`). El icono no cambia de grosor al escalar.
- Color heredado de `text/primary`, `text/secondary` o `accent/strong`; nunca un color decorativo.
- El objetivo táctil lo aporta el contenedor (mínimo 44 × 44). Un icono de 24 px no es un botón por sí mismo.
- Todo icono con acción lleva etiqueta visible o nombre accesible; no se usa como única señal.

## 12. Gráficos y series

Cinco series con color + segundo canal:

| Serie | Token | Marcador |
| --- | --- | --- |
| 1 | `data/1` | Círculo |
| 2 | `data/2` | Cuadrado |
| 3 | `data/3` | Triángulo |
| 4 | `data/4` | Rombo |
| 5 | `data/5` | Anillo |

- El marcador (forma) y la etiqueta directa con el valor son el segundo canal; la serie se identifica sin ver el color.
- El color de cada serie cambia con el modo mediante `data/1…data/5`; no se fijan colores locales en las barras.
- Orden fijo de series: no se reordena la leyenda entre pantallas.
- Las barras parten de una pista `border/subtle` y llevan el valor en `Numeric/S` con cifras tabulares.
- En modo oscuro se comprueba que las cinco series siguen distinguiéndose (panel `Gráficos`, tarjeta oscura).

## 13. Formularios

Componentes del panel `Formularios`, todos con etiqueta visible, ayuda debajo y estados Normal/Foco/Error/Deshabilitado cuando aplica:

| Componente | Forma | Notas |
| --- | --- | --- |
| `Field/Text` | Caja 48 px, radio 14 | Variantes Default, Focus, Error, Disabled y Obligatorio (etiqueta con `*`) |
| `Field/Textarea` | Caja 110 px, radio 14 | Normal y Error; el texto crece hacia abajo y el contador va en la ayuda |
| `Field/Date` | Caja 48 px con icono de calendario | Normal y Error; formato `dd mmm aaaa` |
| `Select/Field` | Caja 48 px con chevron | Cerrado, Abierto y Error; el chevron gira en Abierto |
| `Search/Field` | Píldora 44 px | Vacío (con atajo `⌘K`) y Con texto |
| `Amount/Input` | Caja 64 px | Normal y Foco; símbolo delante y `Numeric` tabular |
| `Switch` | Píldora 48 × 28 | Off, On y Disabled; On usa `surface/inverse` |
| `Checkbox` | Caja 20 px, radio 6 | Unchecked, Checked y Disabled; el check va en `text/inverse` |

Reglas:

- La etiqueta siempre está visible; el placeholder solo ayuda a rellenar y nunca la sustituye.
- El error se escribe bajo el campo con `status/danger-text` y se anuncia también en texto; el borde rojo es un refuerzo, no la única señal.
- El foco es un anillo de 2 px `focus/ring` por fuera de la caja; no se recorta ni se elimina.
- Los campos obligatorios llevan `*` en la etiqueta cuando el formulario mezcla obligatorios y opcionales. Si todos lo son, basta una nota al pie.
- Un campo deshabilitado conserva su valor legible, pero usa `surface/sunken`, `text/disabled` y no responde a foco.
- El ancho del campo lo marca la columna; en formularios de una columna, 324 px de contenido dentro de una tarjeta de 380 px con padding 28.
- El importe usa `Numeric` con `tnum` y el símbolo de divisa delante, sin separadores inventados.
- Las acciones van en una fila al pie: primaria en ámbar a la derecha y secundaria a la izquierda; nunca dos ámbar en el mismo formulario.

## 14. Datos

Componentes del panel `Datos`, pensados para listas y resúmenes:

| Componente | Variantes | Notas |
| --- | --- | --- |
| `Account/Card` | Cómoda · Compacta | Saldo 32/24 px con cifras tabulares; badge de estado en la cabecera |
| `Movement/Row` | Cómoda · Compacta | 64/52 px de alto; icono 36/28; importe 14/13 con ancho fijo |
| `Balance/Summary` | Normal · Alerta | Saldo 30 px; en Alerta el importe y el pie van en `status/danger-text` |
| `Badge` | Positivo · Negativo · Aviso · Neutro | Píldora de 24 px; siempre con texto, nunca solo color |
| `Progress/Installments` | Al día · Atrasado · Completado | Pista de 8 px y valor «3 de 12»; el estado también va escrito |
| `Chart/Bars` | Cómoda · Compacta | 7 barras, la última en ámbar; etiquetas de día debajo |
| `Chart/Sparkline` | — | 7 barras de 3 px de radio para acompañar una métrica |

Reglas:

- **El importe manda.** Cifras tabulares (`tnum`), signo explícito `−`/`+` y alineación a la derecha. Un gasto normal va en `text/primary`; el rojo se reserva a alertas y saldos negativos.
- **Nunca dos líneas.** La columna de importe tiene ancho fijo (110 px en la fila cómoda, 100 px en la compacta) y el texto se trunca con elipsis antes de romper la fila.
- **Números largos.** Primero se reduce al estilo numérico inferior; si aun así no cabe, se usa notación compacta (`−12,3 M €`). El truncado con elipsis es el último recurso y está verificado con `−12.345.678,90 €`.
- **Densidad.** Cómoda para listas principales y detalle; Compacta para resúmenes y paneles densos. La compacta no baja de 44 px de objetivo táctil.
- **Badges con texto.** El tono acompaña, no sustituye: «Al día», «Vencido», «Previsto» o «Sin estado» se leen sin ver el color.
- **Progreso con contexto.** Siempre hay valor (`3 de 12`) y una frase que explica qué falta o qué se ha pagado; el color de la barra solo refuerza.
- **Gráficos sobrios.** Una sola serie destacada en ámbar; el resto en tinta. Sin rejillas decorativas ni ejes dobles. La forma y la etiqueta son el segundo canal.

## 15. Feedback y estados

Capas y estados del panel `Feedback y estados`:

| Componente | Variantes | Medida |
| --- | --- | --- |
| `Modal` | Móvil · Web | 320 / 440 de ancho, radio 24 |
| `Bottom/Sheet` | Acciones · Filtros | 360 de ancho, radio superior 24 |
| `Toast` | Éxito · Error · Info · Neutro | 320 × 59 |
| `Banner` | Aviso · Error · Éxito · Info | 420 de ancho |
| `Skeleton` | Texto · Lista · Tarjeta | 320 de ancho |
| `State/Page` | Vacío · Error · Sin conexión · Éxito | 360 de ancho, radio 20 |

Reglas:

- **Toda interrupción tiene salida.** Modal y hoja cierran con botón, asa o toque fuera; el scrim va en `overlay/scrim`, nunca en la opacidad de la tarjeta.
- **Una decisión, un modal.** El modal resume el contexto (importe, fecha, cuenta) antes de la acción; la acción principal es ámbar y la secundaria se queda en terciaria.
- **El toast confirma, no decide.** Dura 5 s, ofrece «Deshacer» cuando la acción es reversible y no bloquea la pantalla.
- **El banner informa y acompaña.** Persiste dentro del contenido, tiene título, explicación y una única acción. No se usa para confirmar algo puntual.
- **El estado explica y reencamina.** `State/Page` incluye icono, qué pasó, qué puede hacer la persona y una acción principal; el error y la falta de conexión añaden una salida secundaria (soporte, datos guardados).
- **La carga conserva la forma.** `Skeleton` replica la estructura final (texto, lista o tarjeta) y no se mantiene más de 3 s sin un mensaje de progreso.
- **Plataforma.** En web el bottom sheet se sustituye por `Modal`; toast y banner se estiran al contenedor manteniendo su contenido a 320/420.
- **Nada de estados felices solos.** Toda pantalla con datos remotos define carga, vacío, error y sin conexión antes de considerarse terminada.

## 16. Reglas de composición

1. **Fondo → superficie → contenido.** Lienzo `surface/canvas`, tarjeta `surface/default`, elevación con `surface/raised`.
2. **Una acción principal por vista.** La principal va en ámbar (`accent/default` con `accent/ink`); la tinta marca navegación activa, texto e iconos. Si hay dos ámbar compitiendo, uno deja de ser acento.
3. **Espaciado en múltiplos de 4.** Dentro de un componente se usan `space/1…space/4`; entre bloques, `space/6…space/12`.
4. **Radios por función.** `radius/sm` para chips pequeños, `radius/md` para controles compactos, `radius/lg` para bloques internos, `radius/xl` (20) para tarjetas y `radius/full` para píldoras, botones, icon buttons y avatares.
5. **Bordes antes que sombras en reposo.** `border/subtle` separa; la sombra aparece al elevar o interactuar.
6. **Estados con texto.** Éxito, error y aviso llevan texto además de color e icono.
7. **Foco visible.** Anillo de 2 px con `focus/ring` y separación de 2 px; nunca se elimina el foco del navegador sin sustituirlo.
8. **Nada hardcodeado.** Colores, radios, espaciados, sombras y tipografía salen de variables o estilos del archivo.
9. **Tarjetas bento.** Una métrica por tarjeta: etiqueta 11 px, importe 26–32 px, contexto 10–11 px y, si aporta, sparkline. No se apilan tres cifras en la misma tarjeta.
10. **Navegación flotante.** Las piezas de navegación se separan del borde con `space/3` y flotan con `Elevation/2`; el destino activo es una píldora de tinta, no un fondo ámbar. En escritorio conviven dos shells: la **sidebar** (principal) y un **header superior** (alternativa). En el header la navegación va centrada, solo el destino activo se pinta, y el contenedor, la barra y los iconos de acción van transparentes.

## 17. Correspondencia con el archivo

| Concepto | Nombre exacto en FigCraft |
| --- | --- |
| Colección primitiva | `akari/primitives` (modo `Value`) |
| Colección semántica | `akari/semantic` (modos `Light` y `Dark`) |
| Colores primitivos | `color/<nombre>` |
| Números primitivos | `space/*`, `radius/*`, `size/*`, `border/*`, `motion/*` |
| Colores semánticos | `surface/*`, `text/*`, `border/*`, `accent/*`, `status/*`, `focus/*`, `overlay/*`, `data/*` |
| Estilos de texto | Editorial: `Display/*`, `Heading/*`, `Body/*`, `Label/*`, `Caption`, `Numeric/*`. Producto: `UI/[tamaño]`, `UI/[tamaño] Strong`, `UI/[tamaño] Bold` |
| Elevación | `Elevation/1`, `Elevation/2`, `Elevation/3` |
| Grid | `Grid/Mobile 4col`, `Grid/Web 12col` |
| Iconos | componentes `Icon/Home`, `Icon/Wallet`, `Icon/Arrows`, `Icon/Users`, `Icon/Add`, `Icon/Insights`, `Icon/Search`, `Icon/Sliders` |
| Formularios | `Field/Text`, `Field/Textarea`, `Field/Date`, `Select/Field`, `Search/Field`, `Amount/Input`, `Switch`, `Checkbox` |
| Datos | `Account/Card`, `Movement/Row`, `Balance/Summary`, `Badge`, `Progress/Installments`, `Chart/Bars`, `Chart/Sparkline` |
| Feedback | `Modal`, `Bottom/Sheet`, `Toast`, `Banner`, `Skeleton`, `State/Page` |

Verificación de cierre de F0:

- [x] Cada token de esta tabla existe con el mismo nombre en `variable.list`.
- [x] Los 49 estilos de texto (17 editoriales + 32 de producto), 3 de elevación y 2 de grid existen en `style.list`.
- [x] La muestra de tema cambia entre claro y oscuro sin editar colores a mano.
- [x] La muestra de gráficos usa `data/1…data/5` y distingue las series por forma y etiqueta.
- [x] El contraste de los pares principales está registrado y cumple AA.
