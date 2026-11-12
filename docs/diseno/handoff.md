# Handoff del diseño — akari

- **Cambio:** `diseno-app-akari` (F4 · prototipos y handoff)
- **Fecha:** 2026-11-12
- **Archivo Figma:** `akari` · https://www.figma.com/design/npwsfgd0s4n4UWszvg28wv/akari
- **fileKey:** `npwsfgd0s4n4UWszvg28wv`
- **Archivo FigCraft:** sesión online `akari` (documento `local`), copia nativa en `design/akari.figcraft`
- **Estado global:** F0–F4 aprobadas (12 nov 2026); v1.1 entregada con sidebar compacto y shell alternativo.

## 1. Estructura del archivo

| Página | Sección | Contenido |
| --- | --- | --- |
| `00-Portada` | — | Marca, metadatos, estado de revisión, changelog v0.1–v1.0 y páginas del archivo. |
| `01-Diseño` | `Fundamentos` | Dirección visual, paletas, contraste AA, theme sample, tipografía, tokens, iconografía y gráficos. |
| `01-Diseño` | `Componentes` | Navegación, acciones, formularios, datos, feedback y estados, más pruebas de composición. |
| `01-Diseño` | `Prototipos` | Siete flujos conectados con botón «Abrir prototipo», recorrido y estado por flujo. |
| `02-Pantallas` | `Móvil` | 19 pantallas `M01`–`M19` a 390 × 844. |
| `02-Pantallas` | `Web` | 8 pantallas `W01`–`W08` a 1440 × 900 (W07 es la prueba responsive de 768; W08 es la alternativa con header). |
| `02-Pantallas` | `Archivo` | Reservado para versiones descartadas y snapshots. |

Todo lo que se implementa vive en `01-Diseño ▸ Fundamentos` (tokens) y `Componentes` (piezas). Las pantallas no contienen estilos locales: consumen variables, estilos de texto e instancias.

## 2. Convención de nombres

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Pantalla | `[Plataforma]/[Flujo]/[Código] [Pantalla]` | `Móvil/Cuentas/M06 Alta de cuenta` |
| Componente | PascalCase con carpeta funcional | `Button/Primary`, `Field/Text`, `Account/Card` |
| Variante | `Propiedad=Valor` en español | `Estado=Default`, `Densidad=Compacta` |
| Token | kebab-case dentro de `akari/primitives` y `akari/semantic` | `surface/canvas`, `space/4`, `radius/xl` |
| Estilo de texto editorial | `Familia/Tamaño` | `Heading/XL`, `Body/M`, `Numeric/L` |
| Estilo de texto de producto | `UI/[tamaño]`, `UI/[tamaño] Strong`, `UI/[tamaño] Bold` | `UI/11`, `UI/12 Strong`, `UI/20 Bold` |
| Frame de apoyo | `Tipo/Propósito` | `Panel/Datos`, `Grid/Flujos`, `Badge/En revisión` |

Reglas: nada de `Frame 1`, `Rectangle 2` ni nombres genéricos; un frame de pantalla siempre declara plataforma, flujo y código.

## 3. Cómo usar Dev Mode

1. Abre `02-Pantallas` y selecciona una pantalla. El panel de propiedades muestra el nombre completo, el tamaño (390 × 844 o 1440 × 900) y las anotaciones.
2. **Colores:** todos los rellenos y trazos de producto están vinculados a `akari/semantic` (claro/oscuro). Cambiar el modo de la colección actualiza la pantalla sin editar capas.
3. **Tipografía:** todo el texto de producto usa la escala `UI/*`; los estilos editoriales (`Display/*`, `Heading/*`, `Body/*`, `Numeric/*`) quedan para portada, documentación y titulares grandes.
4. **Medidas:** espaciado, radios, tamaños de icono y movimiento están en `akari/primitives`. Los valores que ves en una pantalla son los tokens resueltos; si un valor no existe, se añade al sistema antes de usarlo.
5. **Componentes:** cualquier botón, campo, tarjeta o estado es una instancia. No hay copias separadas (detached) de componentes publicados.
6. **Anotaciones:** cada pantalla lleva cuatro notas por defecto —interacción, desarrollo, accesibilidad y contenido— con disparadores, navegación, validaciones, estados ocultos, origen de datos y reglas de negocio. Se ven en el panel de anotaciones y en la vista de handoff.
7. **Assets:** los 8 iconos `Icon/*` tienen exportación SVG 1×; los botones e instancias heredan sus assets del componente principal.

## 4. Prototipos

En `01-Diseño ▸ Prototipos` hay siete tarjetas. El botón «Abrir prototipo» navega a la primera pantalla del recorrido y el resto de saltos está en las acciones de cada pantalla.

| Flujo | Recorrido | Estado | Versión |
| --- | --- | --- | --- |
| 0 · Onboarding | `M01 → M02 → M04 → M05` | Aprobado | v1.0 |
| A · Alta de cuenta | `M06 → M05` | Aprobado | v1.0 |
| B · Registro de movimiento | `M05 → M09 → M08` | Aprobado | v1.0 |
| C · Gasto grupal | `M11 → M12 → M14` | Aprobado | v1.0 |
| D · Preguntas y detalle | `M13 → M08` | Aprobado | v1.0 |
| E · Resumen y cuentas (web) | `W01 → W02 → W03` | Aprobado | v1.0 |
| F · Grupos y ajustes (web) | `W04 → W05 → W06` | Aprobado | v1.0 |

Para presentar: selecciona una pantalla y usa **Shift + Space** (o `proto.present`). El prototipo arranca en la pantalla indicada; el resto de transiciones son `onClick` con transición instantánea o dissolve de 200 ms. La tab bar móvil y la sidebar web navegan entre raíces (Inicio/Movimientos/Grupos/Ajustes y Resumen/Movimientos/Grupos/Ajustes), así que cualquier flujo se puede recorrer sin volver al índice. El estado de revisión de cada flujo se actualiza en la tarjeta y en el changelog de la portada.

## 5. Trazabilidad

- **Matriz de cobertura:** `docs/diseno/cobertura.md` relaciona cada funcionalidad del canvas con pantallas móvil/web, estados y justificaciones de exclusión.
- **Flujos móvil:** `docs/diseno/flujos-movil.md` (inventario, navegación y estados).
- **Flujos web:** `docs/diseno/flujos-web.md` (shell, densidades y diferencias).
- **Componentes:** `docs/diseno/componentes.md` (inventario y API de props/variantes).
- **Fundamentos:** `docs/diseno/fundamentos.md` (tokens, contraste, tipografía, iconografía y reglas).

## 6. Estado de revisión

| Fase | Estado | Evidencia |
| --- | --- | --- |
| F0 · Fundamentos | Aprobada (11 nov 2026) | Changelog v0.3 y `fundamentos.md`. |
| F1 · Componentes | Aprobada (12 nov 2026) | Changelog v0.5–v0.7, `componentes.md` y auditoría sin hallazgos bloqueantes (tarea 3.8). |
| F2 · Móvil | Aprobada (12 nov 2026) | 19 pantallas, anotaciones y flujos 0–D (tarea 4.13). |
| F3 · Web | Aprobada (12 nov 2026) | 7 pantallas, accesibilidad y flujos E–F (tarea 5.10). |
| F4 · Handoff | Aprobada (12 nov 2026) | Prototipos, anotaciones, matriz, auditoría y este documento (tarea 6.8). |

Las secciones `Componentes`, `Móvil` y `Web` están marcadas como *Ready for dev* desde el 12 nov 2026; el changelog v1.0 registra la aprobación final de F1–F4 y v1.1 la iteración de sidebar y shell. Las specs principales viven en `openspec/specs/diseno/*` y el cambio quedó archivado en `openspec/changes/archive/2026-11-12-diseno-app-akari`.

### Iteración v1.1 · sidebar compacto y shell alternativo

- `Sidebar` añade la propiedad `Vista` (`Compacta` 76 px / `Expandida` 240 px) para los cuatro destinos. Arranca compacta, se expande con hover o chevron y se colapsa con el wordmark o el chevron del panel expandido.
- Sombra reducida a `Elevation/1` y inset de 16 px en los cuatro bordes del shell.
- `W08` demuestra el shell alternativo con `Header/Desktop` transparente en lugar de sidebar; los tabs navegan a W01/W03/W04/W06.

## 7. Auditoría aplicada en F4

| Hallazgo | Corrección |
| --- | --- |
| Colores literales en pantallas y componentes | 1.568 rellenos/trazos vinculados a variables semánticas; quedan solo los trazos de sistema de los component sets (`#9747FF`). |
| Texto sin estilo | 1.269 capas de texto vinculadas a la escala `UI/*`; 0 textos sin estilo en producto. |
| Nombres de pantalla fuera de convención | 27 frames renombrados a `[Plataforma]/[Flujo]/[Código] [Pantalla]`. |
| `Frame 1` genérico | Renombrado a `Prueba/Web · reuso de componentes`. |
| Falta de `text/tertiary` | Token semántico añadido (ink-700 / dark-muted) y documentado. |
| Literales `#B3261E` y `#E9DFCE` | Sustituidos por `status/danger-text` y `surface/sunken`. |
| Iconos sin exportación | SVG 1× añadido a los 8 `Icon/*`. |
| Sin anotaciones | 119 anotaciones en 27 pantallas (interacción, desarrollo, accesibilidad, contenido). |
| Sin prototipos navegables | Sección `Prototipos` con 7 flujos y botones de entrada. |

Alcance conocido: la red de amistades no se dibuja (exclusión justificada en la matriz) y la conversión de divisas se documenta como regla en M11/W04. En M06, el botón disabled navega en el prototipo para demostrar el retorno; en producción permanece deshabilitado.

## 8. Qué necesita una persona nueva para trabajar

1. Abrir el archivo y leer `00-Portada` (estado y versión).
2. Leer `01-Diseño ▸ Fundamentos ▸ Tipografía` y `Tokens` antes de tocar una pantalla.
3. Localizar el componente en `01-Diseño ▸ Componentes` o en la instancia de la pantalla (Dev Mode → Go to main component).
4. Consultar la anotación de la pantalla y la fila de `cobertura.md`.
5. Si el requisito no aparece en la matriz, no se diseña: se añade primero al canvas o al cambio de OpenSpec.
