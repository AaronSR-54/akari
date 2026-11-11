# Estado de implementación del diseño

- **Cambio:** `diseno-app-akari`
- **Fecha:** 2026-11-11
- **Archivo Figma original:** https://www.figma.com/design/npwsfgd0s4n4UWszvg28wv/akari
- **fileKey Figma:** `npwsfgd0s4n4UWszvg28wv`
- **Archivo FigCraft local:** `/home/aaronsr/Projects/akari/akari.figcraft`
- **Sesión FigCraft activa:** online, host `omarchy.tail3a89a3.ts.net:47901` (Tailscale), archivo `355f2b6dfe607ece`
- **Enlace de invitación:** `figcraft://join?host=omarchy.tail3a89a3.ts.net:47901&file=355f2b6dfe607ece&token=fkKMoMyTy6b79BWfMrCSTQ`

## Referencia de estilo

La estructura de componentes sigue **Aurex Living — Real Estate Dashboard** (Orbix Studio): lienzo cálido con tarjetas blancas, navegación flotante tipo píldora, acción principal en ámbar, controles redondos, métricas bento con números grandes y sparklines finas. Se mantienen íntegros los fundamentos de akari: papel cálido, tinta, ámbar, Inter y la escala tipográfica.

Cambios aplicados en el restyle:

- Tab bar, top bar y sidebar flotantes, con el destino activo en píldora de tinta.
- Header superior de escritorio como alternativa a la sidebar: navegación centrada, solo el destino activo pintado en tinta y acciones (buscar, avisos) sin fondo; el contenedor y la barra van transparentes. La sidebar sigue siendo la opción principal.
- Botones primarios en ámbar (`accent/default` + `accent/ink`), secundarios blancos y terciarios de texto; todos a `radius/full`.
- Icon buttons circulares de 44 px con `Elevation/1`; FAB ámbar de 56 px con `Elevation/2`.
- Tarjetas de métrica con etiqueta, importe tabular y sparkline, radio 20.
- Pantallas de prueba reconstruidas con el nuevo lenguaje.

## Progreso

| Tarea | Estado |
| --- | --- |
| 1.1 Archivo y sesión | Completada |
| 1.2 Skills de Figma | Completada |
| 1.3 Auditoría | Completada (`docs/diseno/auditoria.md`) |
| 1.4 Páginas, portada y enlaces | Completada |
| 2.1 Dirección visual y paleta | Completada |
| 2.2 Variables y modos | Completada |
| 2.3 Tipografía | Completada |
| 2.4 Espaciado, radios, elevación, grid y movimiento | Completada |
| 2.5 Iconografía y gráficos con segundo canal | Completada |
| 2.6 `docs/diseno/fundamentos.md` | Completada |
| 2.7 Aprobación de F0 | Completada (aprobada el 11 nov 2026) |
| 3.1 Navegación | Completada y reestilizada (Aurex) |
| 3.2 Acciones | Completada y reestilizada (Aurex) |
| 3.3 Formularios | Completada: campo, textarea, fecha, select, búsqueda, importe, switch y checkbox; alta de cuenta con variante de error |
| 3.4 Datos | Completada: tarjeta de cuenta, fila de movimiento, resumen de saldo, badge, progreso y gráficos; truncado verificado |
| 3.5 Feedback y overlays | Completada: modal (móvil/web), bottom sheet (acciones/filtros), toast (4), banner (4), skeleton (3) y estados (vacío, error, sin conexión, éxito) |
| 3.6 Descripciones de componentes | Completada: 98 variantes con propósito, uso y contraindicaciones en sus propiedades |
| 3.7 `docs/diseno/componentes.md` | Completada: inventario y API de props |
| 3.8 Aprobación de F1 | Presentada, pendiente de confirmación del usuario |
| 4.1–6.8 | Pendientes |

## Estado en FigCraft

El archivo vive en una sesión online por Tailscale para que el host y el agente trabajen sobre el mismo documento. Contenido actual:

- `00-Portada`: portada, estado de revisión (F0 «Aprobada», F1 «En revisión») y changelog con v0.1–v0.7.
- `01-Diseño` → `Fundamentos`:
  - Dirección visual, neutros cálidos, ámbar, semánticos y modo oscuro.
  - Tabla de contraste AA.
  - `Theme sample` con tarjeta clara y oscura usando las mismas variables semánticas.
  - `Tipografía`: 17 estilos y muestras con metadatos.
  - `Tokens`: espaciado, radios, elevación y movimiento.
  - `Iconografía`: 8 componentes `Icon/*` (24 px, trazo 1,75).
  - `Gráficos`: leyenda `data/1…data/5` y tarjetas clara/oscura con marcador de forma como segundo canal.
- `01-Diseño` → `Componentes`:
  - `Navegación`: TabBar (4), TopBar (2), Sidebar (3), Breadcrumbs (2) y Header/Desktop (4, alternativa a la sidebar).
  - `Acciones`: Button/Primary (6), Secondary (6), Tertiary (4), IconButton (4), Link (3) y Fab (4).
  - `Formularios`: Field/Text (5), Field/Textarea (2), Field/Date (2), Select/Field (3), Search/Field (2), Amount/Input (2), Switch (3) y Checkbox (3), más dos tarjetas de alta de cuenta (normal y error) montadas solo con instancias.
  - `Datos`: Account/Card (2 densidades), Movement/Row (2), Balance/Summary (2 estados), Badge (4 tonos), Progress/Installments (3 estados), Chart/Bars (2 densidades) y Chart/Sparkline; listas de movimientos cómoda y compacta montadas con instancias.
  - `Feedback y estados`: Modal (Móvil/Web), Bottom/Sheet (Acciones/Filtros), Toast (4 tonos), Banner (4 tonos), Skeleton (Texto/Lista/Tarjeta) y State/Page (Vacío, Error, Sin conexión, Éxito).
- `01-Diseño` → `Prototipos` y `02-Pantallas` → `Móvil`, `Web` y `Archivo`: placeholders.

## Sistema creado

- **Variables:** 110 en dos colecciones.
  - `akari/primitives`: 44 colores + 31 números (`space/*`, `radius/*`, `size/*`, `border/*`, `motion/*`).
  - `akari/semantic`: 35 colores con modos `Light` y `Dark` (`text/placeholder` se añadió para el texto de ejemplo).
- **Estilos:** 17 de texto (`Display/*`, `Heading/*`, `Body/*`, `Label/*`, `Caption`, `Numeric/*`), 3 de elevación y 2 de grid.
- **Componentes:** 8 iconos base, 5 sets de navegación, 6 sets de acciones, 8 sets de formulario, 6 sets de datos (más `Chart/Sparkline`) y 6 sets de feedback.
- **Documentación:** `docs/diseno/fundamentos.md` con tokens, contraste, tipografía, iconografía, gráficos, formularios, datos, feedback y reglas de composición; `docs/diseno/componentes.md` con el inventario y la API de props.

Ajuste de accesibilidad aplicado: `color/amber-ink` pasó de `#6B4408` a `#5C3B08` para que el texto de botón sobre `accent/default` cumpla AA (4,67:1) y no solo AA de texto grande.

## Siguiente paso

F1 cerrada a falta de aprobación; continúa F2 — Pantallas móvil:

1. 4.1 Onboarding y acceso a datos.
2. 4.2 Cuentas y saldos.
3. 4.3 Movimientos, suscripciones y plazos.
4. 4.4–4.10 Resto de superficies, estados y navegación.
5. 4.11–4.13 Prototipo, documentación y aprobación.

## Nota sobre Figma

El plan Starter sigue limitando Figma a 20 llamadas MCP de lectura al mes, 3 páginas y 1 modo de variables. FigCraft es el entorno de diseño activo.
