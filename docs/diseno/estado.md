# Estado de implementación del diseño

- **Cambio:** `diseno-app-akari` (archivado el 2026-11-12 en `openspec/changes/archive/2026-11-12-diseno-app-akari`)
- **Fecha:** 2026-11-12
- **Fase actual:** F4 · Prototipos y handoff (aprobada el 12 nov 2026; cambio listo para archivar)
- **Archivo Figma original:** https://www.figma.com/design/npwsfgd0s4n4UWszvg28wv/akari
- **fileKey Figma:** `npwsfgd0s4n4UWszvg28wv`
- **Archivo FigCraft local:** `design/akari.figcraft`
- **Sesión FigCraft activa:** online, host `192.168.1.77:47900`, archivo `local`, documento `akari`
- **Enlace de invitación de la sesión:** `figcraft://join?host=192.168.1.77:47900&file=local&token=local-baf98987b0e`
- **Nota:** el código de sesión es de un solo uso; si el host cambia o la sesión cae, se pide uno nuevo. No se reutiliza el anterior.

## Referencia de estilo

La estructura de componentes sigue **Aurex Living · Real Estate Dashboard** (Orbix Studio): lienzo cálido con tarjetas blancas, navegación flotante tipo píldora, acción principal en ámbar, controles redondos, métricas bento con números grandes y sparklines finas. Se mantienen íntegros los fundamentos de akari: papel cálido, tinta, ámbar, Inter y la escala tipográfica.

## Progreso

| Tarea | Estado |
| --- | --- |
| 1.1 Archivo y sesión | Completada |
| 1.2 Skills de Figma | Completada |
| 1.3 Auditoría | Completada (`docs/diseno/auditoria.md`) |
| 1.4 Páginas, portada y enlaces | Completada |
| 2.1 Dirección visual y paleta | Completada |
| 2.2 Variables y modos | Completada |
| 2.3 Tipografía | Completada (escala editorial + escala UI en F4) |
| 2.4 Espaciado, radios, elevación, grid y movimiento | Completada |
| 2.5 Iconografía y gráficos con segundo canal | Completada |
| 2.6 `docs/diseno/fundamentos.md` | Completada |
| 2.7 Aprobación de F0 | Completada (aprobada el 11 nov 2026) |
| 3.1 Navegación | Completada y reestilizada (Aurex) |
| 3.2 Acciones | Completada y reestilizada (Aurex) |
| 3.3 Formularios | Completada |
| 3.4 Datos | Completada |
| 3.5 Feedback y overlays | Completada |
| 3.6 Descripciones de componentes | Completada |
| 3.7 `docs/diseno/componentes.md` | Completada |
| 3.8 Aprobación de F1 | Completada (aprobada el 12 nov 2026) |
| 4.1–4.12 Pantallas móviles, estados y prototipos | Completadas: 19 pantallas `M01`–`M19` |
| 4.13 Aprobación de F2 | Completada (aprobada el 12 nov 2026) |
| 5.1–5.9 Pantallas web, accesibilidad y prototipos | Completadas: 7 pantallas `W01`–`W07` |
| 5.10 Aprobación de F3 | Completada (aprobada el 12 nov 2026) |
| 6.1 Matriz de cobertura | Completada: `docs/diseno/cobertura.md` |
| 6.2 Anotaciones de comportamiento | Completada: 119 anotaciones en 27 pantallas |
| 6.3 Portada, changelog y estado por flujo | Completada: v0.8–v1.0, prototipos con versión y estado |
| 6.4 Auditoría Dev Mode | Completada: 1.568 vinculaciones de color, 1.269 textos con estilo, 0 detached, iconos SVG |
| 6.5 Auditoría de accesibilidad | Completada y registrada en `auditoria.md` |
| 6.6 `docs/diseno/handoff.md` | Completada |
| 6.7 Verificación integral | Completada: 27 pantallas, 7 flujos, matriz sin huérfanos |
| 6.8 Aprobación final de F4 | Completada (aprobada el 12 nov 2026); `readyForDev` aplicado a Componentes, Móvil y Web |

## Estado en FigCraft

- `00-Portada`: portada, estado de revisión (F0–F4 «Aprobada»), changelog v0.1–v1.3 y páginas del archivo.
- `01-Diseño ▸ Fundamentos`: dirección visual, paletas, contraste AA, theme sample, tipografía, tokens, iconografía y gráficos.
- `01-Diseño ▸ Componentes`: navegación, acciones, formularios, datos, feedback y estados, más pruebas de composición.
- `01-Diseño ▸ Prototipos`: siete flujos conectados con recorrido, versión, estado y botón «Abrir prototipo».
- `02-Pantallas ▸ Móvil`: 19 pantallas `M01`–`M19` a 390 × 844.
- `02-Pantallas ▸ Web`: 7 pantallas `W01`–`W07` a 1440 × 900 (W07 verifica 768).
- `02-Pantallas ▸ Archivo`: reservado para versiones descartadas.

## Sistema creado

- **Variables:** 111 en dos colecciones.
  - `akari/primitives`: 44 colores + 31 números (`space/*`, `radius/*`, `size/*`, `border/*`, `motion/*`).
  - `akari/semantic`: 36 colores con modos `Light` y `Dark` (incluye `text/tertiary` añadido en F4).
- **Estilos:** 49 de texto (17 editoriales + 32 `UI/*`), 3 de elevación y 2 de grid.
- **Componentes:** 8 iconos base, 5 sets de navegación, 6 sets de acciones, 8 sets de formulario, 6 sets de datos, 6 sets de feedback y 1 set `Logo` (5 variantes).
- **Pantallas:** 27 (19 móvil + 8 web) con 119 anotaciones.
- **Prototipos:** 7 flujos navegables (0–F).
- **Documentación:** `fundamentos.md`, `componentes.md`, `flujos-movil.md`, `flujos-web.md`, `cobertura.md`, `handoff.md` y `auditoria.md`.

## Cambios aplicados en F4

1. **Prototipos:** se sustituyó el placeholder por siete tarjetas de flujo con botón de entrada y navegación real a la primera pantalla.
2. **Anotaciones:** cuatro notas por pantalla (interacción, desarrollo, accesibilidad y contenido) con disparadores, validaciones, estados ocultos, origen de datos y reglas de negocio.
3. **Tokens:** `text/tertiary` añadido; `#B3261E` y `#E9DFCE` sustituidos por tokens semánticos.
4. **Vinculación:** 1.568 rellenos y trazos de producto vinculados a variables; 0 colores literales fuera del chrome de los component sets.
5. **Tipografía:** escala `UI/*` de 32 estilos aplicada a 1.269 textos; 0 textos sin estilo.
6. **Nombres:** 27 pantallas renombradas a `[Plataforma]/[Flujo]/[Código] [Pantalla]`; `Frame 1` renombrado.
7. **Assets:** exportación SVG 1× en los 8 iconos.
8. **Portada y changelog:** v0.8 (F2), v0.9 (F3), v1.0 (F4) y v1.1 (iteración de sidebar/shell); fecha 12 nov 2026; enlaces a los prototipos desde la sección.

## Iteración v1.1 · sidebar compacto y shell alternativo

Aprobada la F4, se añadió una iteración de navegación web registrada como v1.1:

1. `Sidebar` pasa a tener dos propiedades: `Activo` (Resumen/Movimientos/Grupos/Ajustes) y `Vista` (Compacta 76 px / Expandida 240 px).
2. La sidebar arranca compacta, se expande con hover o con el chevron y se colapsa con el wordmark o el chevron del panel expandido.
3. Sombra reducida a `Elevation/1`; inset de 16 px en los cuatro bordes del shell.
4. Nueva `W08 · Resumen con header superior`: alternativa transparente con `Header/Desktop` y tabs navegables.
5. 27 pantallas y 119 anotaciones; changelog v1.1 en la portada.

## Iteración v1.2 · Marca

- Nuevo componente `Logo` en `01-Diseño → Componentes → Panel/Marca`.
- `Formato=Expandido`: wordmark «akari» con i sin punto y el círculo ámbar como **punto final**. `Formato=Reducido`: círculo ámbar con la «a» dentro.
- Tamaños XL (92 px), M (40 px) y S (20 px) para el expandido; L (96 px) y S (32 px) para el monograma.
- Aplicado en portada, M01, M03, M16, `Header/Desktop`, `TopBar`, `Sidebar` expandida y sidebar compacta.
- El monograma L tiene exportación PNG 512/32 y SVG para app icon y favicon.
- Changelog v1.2.

## Iteración v1.3 · Botón de colapsar

- El botón de colapsar de la sidebar expandida pasa de un chevron suelto a un círculo de 32 px con `surface/sunken` y un **doble chevron** de 12 × 10 px `text/secondary`, sin sombra.
- Se aplica a las cuatro variantes `Activo=...` en `Vista=Expandida`.
- Changelog v1.3.

## Siguiente paso

1. Abrir el cambio de implementación (Next.js/React Native) usando `handoff.md` y `cobertura.md` como contrato.
2. Consumir las specs principales en `openspec/specs/diseno/*` y mantener el archivo como fuente de verdad visual.
3. Registrar en el nuevo cambio cualquier desviación de tokens, componentes o flujos; si cambia un flujo aprobado, actualizar el changelog del archivo y la matriz.

## Nota sobre Figma

El plan Starter sigue limitando Figma a 20 llamadas MCP de lectura al mes, 3 páginas y 1 modo de variables. FigCraft es el entorno de diseño activo.
