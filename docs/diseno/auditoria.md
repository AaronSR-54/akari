# Auditoría del design file de akari

- **Archivo:** akari
- **URL:** https://www.figma.com/design/npwsfgd0s4n4UWszvg28wv/akari
- **fileKey:** `npwsfgd0s4n4UWszvg28wv`
- **Fecha:** 2026-11-11
- **Sesión Figma:** `59d406ed-013d-48c0-8435-8e645fd7f495`

## Inventario inicial

| Elemento | Hallazgo |
| --- | --- |
| Páginas | 1 (`Page 1`) |
| Nodos en la página | 1 frame vacío `Frame 1` de 731×645 |
| Colecciones de variables | 0 |
| Variables locales | 0 |
| Estilos de texto | 0 |
| Estilos de efecto | 0 |
| Estilos de pintura | 0 |
| Componentes y component sets | 0 |
| Instancias | 0 |
| Librerías añadidas | Team library, Material 3, Simple Design System, iOS/iPadOS 26, watchOS 26, visionOS 26, macOS 26, iOS/iPadOS 27, macOS 27 |
| Búsquedas en librerías | `button`, `input`, `surface`, `space`, `heading`: sin resultados |

## Decisión

1. **Se reutiliza:** nada del contenido actual; el archivo no tiene design system previo.
2. **Se extiende:** no aplica.
3. **Se archiva como duplicado:** no hay duplicados. El `Frame 1` vacío se elimina y su espacio lo ocupa la portada.
4. **Se construye:** un design system propio de akari dentro del archivo, con fundamentos en la sección `Fundamentos` de `01-Diseño` y componentes en la sección `Componentes` de la misma página.
5. **Librerías de comunidad:** no se adoptan Material 3, Simple Design System ni los kits de Apple porque la dirección visual de akari es propia y mezclar kits rompería la consistencia de tokens. La team library no devolvió activos para las consultas realizadas.

## Consecuencia para el plan

No hay migración ni consolidación pendiente. La F0 parte de cero y puede definir los tokens sin conflictos. Cualquier activo que se cree queda registrado en el changelog de la portada.

## Auditoría final (F4 · 12 nov 2026)

Alcance: `01-Diseño ▸ Componentes` y `02-Pantallas` (móvil y web). La portada y los paneles de fundamentos se excluyen del cierre de estilos porque muestran especímenes de la escala a propósito.

| Hallazgo | Evidencia | Corrección aplicada | Resultado |
| --- | --- | --- | --- |
| Colores literales en pantallas y componentes | 1.568 rellenos/trazos sólidos sin variable en 28 raíces (26 pantallas + Componentes + Iconografía) | Vinculación masiva a `akari/semantic` agrupada por campo y variable | 0 colores literales de producto; solo quedan los trazos de sistema de los component sets (`#9747FF`) |
| Texto sin estilo | 1.269 capas de texto sin `styles.text` | Escala `UI/*` de 32 estilos + aplicación agrupada por tamaño y peso | 0 textos sin estilo; tamaños y pesos conservados |
| Token ausente para navegación inactiva | `#4A4239` (ink-700) usado en 35 capas sin alias semántico | Nuevo `text/tertiary` (#4A4239 / #C9BFAF) | Los literales pasan a variable y el token queda documentado |
| Rojos y grises fuera de token | `#B3261E` (8 textos) y `#E9DFCE` (4 iconos del widget) | Sustituidos por `status/danger-text` y `surface/sunken` | Contraste AA y coherencia con el sistema |
| Nombres de pantalla fuera de convención | 26 frames `Mxx · Nombre` / `Wxx · Nombre` | Renombrados a `[Plataforma]/[Flujo]/[Código] [Pantalla]` | Convención única; el código sigue visible en la etiqueta del frame |
| Nombre genérico | `Frame 1` en la prueba de reuso web | Renombrado a `Prueba/Web · reuso de componentes` | Sin nombres genéricos |
| Componentes separados (detached) | 0 instancias sin `mainComponent`; 16 sets y 8 iconos con instancias | Sin acción | No hay copias separadas que justificar |
| Iconos sin exportación | 8 componentes `Icon/*` sin ajustes de exportación | Exportación SVG 1× añadida | Assets listos para implementación |
| Pantallas sin anotaciones | 0 anotaciones al iniciar F4 | 108 anotaciones en 26 pantallas (interacción, desarrollo, accesibilidad, contenido) | Cada pantalla documenta disparadores, validaciones, estados ocultos, datos y reglas |
| Prototipo no navegable | `Prototipos` era un placeholder | Sección con 7 flujos, recorrido, versión, estado y botón «Abrir prototipo» | Flujos A–F conectados a su primera pantalla |

### Accesibilidad (6.5)

| Comprobación | Resultado |
| --- | --- |
| Contraste AA de texto normal | Pares principales registrados en `fundamentos.md`; el cambio de rojo literal a `status/danger-text` y el nuevo `text/tertiary` cumplen AA (9,69:1 y 8,84:1 sobre `surface/default` y `surface/canvas`). |
| Objetivos táctiles en móvil | Botones 44–48 px, icon buttons 44 px, filas 56 px; los chips y campos conservan ≥44 px. |
| Foco visible | Los sets de acciones y formularios incluyen variante `Estado=Focus` con anillo `focus/ring` de 2 px; W03 documenta el recorrido de teclado. |
| Etiquetas y jerarquía | Campos con etiqueta visible, ayuda y error; títulos de pantalla y secciones con jerarquía en las anotaciones. |
| Segundo canal | Badges con texto, plazos con «2 de 12», gráficos con etiqueta y valor, estados con palabra además del color. |

### Hallazgos abiertos

- `devStatus` no se aplica todavía: las secciones `Móvil` y `Web` se marcarán como *Ready for dev* cuando el usuario apruebe F1–F4 (tareas 3.8, 4.13, 5.10 y 6.8).
- La red de amistades no se dibuja; queda justificada en `cobertura.md` como cambio posterior.
- La conversión de divisas se documenta como regla en M11/W04, no como pantalla propia.

