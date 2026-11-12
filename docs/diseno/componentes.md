# Componentes · akari

Inventario de los componentes publicados en `akari.figcraft`. Cada ficha coincide con el nombre del set en el archivo y con la descripción visible en las propiedades del componente.

Convenciones:

- **Tamaño** en píxeles de página (1 unidad = 1 px).
- **Props** son las propiedades de variante del set. Las instancias no se separan: se cambia la prop y se sobreescriben textos.
- Todos los colores están enlazados a variables de `akari/semantic`; ninguna instancia lleva color local.
- Objetivo táctil mínimo: 44 × 44 px.

---

## 0. Marca

| Componente | Props | Tamaño | Uso |
| --- | --- | --- | --- |
| `Logo` | `Formato` = Expandido · Reducido; `Tamaño` = XL · M · L · S | 238×86 · 104×38 · 96×96 · 52×19 · 32×32 | Logotipo de akari. **Expandido** coloca el círculo ámbar como punto final tras «akari» (la i va sin punto); **Reducido** es el monograma «a» dentro del círculo. XL/M para portada y bienvenida, S para cabeceras y top bars, Reducido L/S para app icon, favicon y sidebar compacta. |

Reglas:

- El wordmark expandido usa la «ı» sin punto (U+0131): el círculo ámbar es el punto final de la marca, no el punto de la «i». No se tapa ningún punto con el círculo.
- El círculo es siempre `accent/default`; en el monograma la «a» va en `accent/ink`.
- No se separa el círculo del wordmark a mano: se usa una instancia de `Logo` y se cambia `Formato`/`Tamaño`.
- Espacio libre mínimo alrededor del logo: la altura del círculo. Tamaño mínimo del wordmark: 20 px; del monograma: 24 px.
- El monograma reducido tiene exportación PNG 512/32 y SVG para iconos de app y favicon.
- En fondos oscuros se usa la misma composición con `text/inverse`; el círculo mantiene `accent/default`.

---

## 1. Navegación

| Componente | Props | Tamaño | Uso |
| --- | --- | --- | --- |
| `TabBar` | `Activo` = Inicio · Movimientos · Grupos · Ajustes | 390 × 64 | Navegación principal móvil. Solo el destino activo va en píldora de tinta. |
| `TopBar` | `Tipo` = Principal · Detalle | 390 × 56 | Cabecera móvil. Detalle añade volver y título de pantalla. |
| `Sidebar` | `Activo` = Resumen · Movimientos · Grupos · Ajustes; `Vista` = Compacta · Expandida | 76 × 868 / 240 × 868 | Navegación principal de escritorio (≥ 1024 px). Arranca **compacta** (solo iconos) y se expande con hover o con el logo/chevron; el wordmark o el chevron del panel expandido la colapsan. Sombra `Elevation/1` e inset de 16 px en el shell. El botón de colapsar es un círculo de 32 px en `surface/sunken` con chevron de 16 px `text/secondary`. |
| `Header/Desktop` | `Activo` = Resumen · Movimientos · Grupos · Ajustes | 1200 × 72 | Cabecera web **alternativa** a la Sidebar: navegación centrada, solo el destino activo pintado, buscador y avisos sin fondo. Es transparente (sin relleno propio) y se usa en la variante W08. No sustituye a la Sidebar. |
| `Breadcrumbs` | `Nivel` = 2 · 3 | variable | Jerarquía web. El último nivel no es enlace. |

Reglas:

- Nunca dos navegaciones principales visibles a la vez (Sidebar + Header/Desktop son excluyentes; TabBar y Sidebar también).
- La Sidebar nunca toca los bordes: el shell reserva 16 px arriba, abajo e izquierda. Va compacta por defecto y el panel expandido flota sobre el contenido en implementación.
- En móvil, una pantalla interna usa `TopBar` con volver y **no** muestra TabBar.
- El estado activo es siempre tinta + texto papel; el resto, transparente.

---

## 2. Acciones

| Componente | Props | Tamaño | Uso |
| --- | --- | --- | --- |
| `Button/Primary` | `Estado` = Default · Hover · Focus · Pressed · Disabled · Loading | 176 × 48 (mín. 44) | Acción principal única por vista. Ámbar con texto de tinta. |
| `Button/Secondary` | `Estado` = Default · Hover · Focus · Pressed · Disabled · Loading | variable × 48 | Acción alternativa con borde. |
| `Button/Tertiary` | `Estado` = Default · Hover · Focus · Disabled | variable × 40 | Cancelar, limpiar, saltar. |
| `IconButton` | `Estado` = Default · Hover · Focus · Disabled | 44 × 44 | Acciones de cabecera o fila. |
| `Link` | `Estado` = Default · Hover · Focus | texto | Navegación secundaria y «ver todos». |
| `Fab` | `Estado` = Default · Hover · Pressed · Disabled | 56 × 56 | Alta rápida móvil; una por pantalla. |

Reglas:

- El ámbar es solo para la acción principal; las destructivas van en `status/danger` y no usan el primario.
- `Loading` conserva el ancho y sustituye la etiqueta por el indicador.
- Todo botón tiene foco visible con `focus/ring` de 2 px y separación de 2 px.

---

## 3. Formularios

| Componente | Props | Tamaño | Uso |
| --- | --- | --- | --- |
| `Field/Text` | `Estado` = Default · Focus · Error · Disabled · Obligatorio | 320 × 72 | Texto de una línea con etiqueta, ayuda y error. |
| `Field/Textarea` | `Estado` = Normal · Error | 320 × 120 | Notas y descripciones con contador. |
| `Field/Date` | `Estado` = Normal · Error | 320 × 72 | Fecha `dd/mm/aaaa` con icono. |
| `Select/Field` | `Estado` = Cerrado · Abierto · Error · Vacío | 320 × 72 | Opción única. |
| `Search/Field` | `Estado` = Normal · Con texto | 320 × 44 | Búsqueda con limpiar. |
| `Amount/Input` | `Estado` = Normal · Foco | 320 × 72 | Importe con divisa y cifras tabulares. |
| `Switch` | `Estado` = Off · On · Disabled | 48 × 28 | Booleano de efecto inmediato. |
| `Checkbox` | `Estado` = Unchecked · Checked · Disabled | 20 × 20 + etiqueta | Selección múltiple o confirmación al enviar. |

Reglas:

- Etiqueta siempre visible; el placeholder no sustituye a la etiqueta.
- El error ocupa el espacio de la ayuda: el campo no cambia de alto al fallar.
- `Obligatorio` se marca con asterisco y texto accesible, no solo con color.
- El importe se alinea a la derecha y admite negativos solo si el tipo de movimiento lo permite.

---

## 4. Datos

| Componente | Props | Tamaño | Uso |
| --- | --- | --- | --- |
| `Account/Card` | `Densidad` = Cómoda · Compacta | 340 × variable | Saldo protagonista (32/24 px) y badge de estado. |
| `Movement/Row` | `Densidad` = Cómoda · Compacta | 360/332 × 64/52 | Concepto, meta, icono e importe en columna fija. |
| `Balance/Summary` | `Estado` = Normal · Alerta | 300 × variable | Saldo total, variación y pie; en Alerta el importe va en rojo. |
| `Badge` | `Tono` = Positivo · Negativo · Aviso · Neutro | variable × 24 | Estado legible sin depender del color. |
| `Progress/Installments` | `Estado` = Al día · Atrasado · Completado | 320 × variable | Plazos con «x de y» y pista de 8 px. |
| `Chart/Bars` | `Densidad` = Cómoda · Compacta | 320 × variable | Serie semanal; última barra en ámbar. |
| `Chart/Sparkline` | — | 96 × 32 | Microserie junto a una métrica. |

Reglas:

- Cifras tabulares (`tnum`) y signo explícito (`−`/`+`) en todo importe.
- El importe tiene ancho fijo y trunca con elipsis; nunca parte en dos líneas.
- El rojo solo para alertas y saldos negativos; un gasto normal va en tinta.
- Las listas se montan con instancias de `Movement/Row`; no se dibujan filas a mano.

---

## 5. Feedback y overlays

| Componente | Props | Tamaño | Uso |
| --- | --- | --- | --- |
| `Modal` | `Plataforma` = Móvil · Web | 320/440 × variable | Confirmaciones y decisiones que requieren contexto. |
| `Bottom/Sheet` | `Tipo` = Acciones · Filtros | 360 × variable | Acciones rápidas o filtros en móvil. |
| `Toast` | `Tono` = Éxito · Error · Info · Neutro | 320 × 59 | Confirmación efímera con «Deshacer»; 5 s, no bloquea. |
| `Banner` | `Tono` = Aviso · Error · Éxito · Info | 420 × variable | Aviso persistente dentro del contenido, con acción. |
| `Skeleton` | `Tipo` = Texto · Lista · Tarjeta | 320 × variable | Carga con la forma del contenido final. |
| `State/Page` | `Tipo` = Vacío · Error · Sin conexión · Éxito | 360 × variable | Estado completo con explicación y salida. |

Reglas:

- **Toda capa tiene salida:** el modal y la hoja se cierran con asa, botón o toque fuera; el estado siempre ofrece acción principal.
- El scrim va en `overlay/scrim`; nunca se simula con opacidad de la tarjeta.
- El toast no se usa para errores que requieren decisión: esos van a `Banner` o `State/Page`.
- Un estado nunca es solo un mensaje: incluye qué pasó, qué puede hacer la persona y el camino de recuperación.
- En web, el bottom sheet se sustituye por `Modal`; el banner y el toast se estiran al ancho del contenedor manteniendo el contenido a 420/320.

---

## 6. Iconos

| Componente | Tamaño | Uso |
| --- | --- | --- |
| `Icon/Home`, `Wallet`, `Arrows`, `Users`, `Add`, `Insights`, `Search`, `Sliders` | 24 × 24 | Trazo 1,75, unión redonda. Heredan `text/primary` o `text/inverse` según el fondo. |

Reglas: un icono nunca va solo si la acción no es evidente; se acompaña de etiqueta o `aria-label`. No se mezclan familias ni grosores.

---

## 7. Instancias y overrides

- Los textos se sobreescriben en la instancia; nunca se duplica el componente para cambiar una palabra.
- Al cambiar de variante se reaplica el ancho si la variante lo modifica (comportamiento del motor).
- Los colores no se sobreescriben a mano: si falta un tono, se añade un token semántico y se documenta.
- Los tamaños especiales (ancho de fila, alto de tarjeta) son overrides aceptados; se registran en la pantalla que los usa.
