# Flujos web · akari

Pantallas de escritorio dibujadas en `02-Pantallas → Web`. Todas miden **1440 × 900** salvo la hoja responsive de 768 px, y usan la `Sidebar` compacta como navegación principal; `W08` demuestra la alternativa con header superior transparente.

## 1. Shell responsive

| Ancho | Navegación | Contenido | Densidad |
| --- | --- | --- | --- |
| ≥ 1024 px | `Sidebar` compacta de 76 px con inset de 16 px; hover o chevron la expande a 240 px | 1316 px útiles con 32 px de margen | Cómoda; 3 columnas de tarjetas |
| 768–1023 px | `Header/Desktop` transparente o barra superior; sin sidebar | 720 px útiles en 2 columnas | Media; tablas con scroll horizontal |
| < 768 px | `TopBar` + `TabBar` móvil | 100 % con 20 px | Compacta; una columna |

La sidebar arranca **compacta** (solo iconos) y se expande con hover o con el chevron; el wordmark o el chevron del panel expandido la colapsan. Usa `Elevation/1` (sombra suave) y nunca toca los bordes de la pantalla: el shell reserva 16 px arriba, abajo e izquierda. En producción, el panel expandido flota sobre el contenido.

El `Header/Desktop` es una **alternativa** a la sidebar, no un reemplazo: se usa cuando el producto se embebe o cuando la navegación lateral no cabe. Es transparente (sin relleno propio) y se apoya en `surface/canvas`; `W08` muestra esta variante.

## 2. Inventario de pantallas

| # | Pantalla | Función | Componentes | Estados |
| --- | --- | --- | --- | --- |
| W01 | Resumen multi-cuenta | KPIs, cuentas, últimos movimientos y aviso de pago | `Sidebar`, `Balance/Summary`, tarjetas bento, `Account/Card`, `Movement/Row`, `Chart/Bars`, `Banner` | Normal, carga, vacío |
| W02 | Detalle de cuenta | Saldo real frente a estimado, evolución, plazos y datos | `Account/Card`, `Chart/Bars`, `Progress/Installments`, `Movement/Row` | Normal, alerta |
| W03 | Movimientos | Tabla con búsqueda, filtros, ordenación y paginación | `Search/Field` equivalente, chips, tabla, `Button/*` | Con datos, filtro vacío, error |
| W04 | Gasto grupal | Gasto, reparto por persona y resumen en una sola vista | Chips de reparto, listas, `Button/Primary` | Reparto válido, descuadre |
| W05 | Preguntas rápidas | Bento de preguntas con respuesta y contexto | chips, `Chart/Bars`, tarjetas bento | Con datos, sin datos suficientes |
| W06 | Datos y sincronización | Ubicación, nube, contraseña, conflictos y copia | filas de ajuste, `Banner`, `Button/Primary` | Sin conexión, conflicto |
| W07 | Tablet 768 | Demostración del shell responsive | barra superior, KPIs 2 × 2, cuentas | Responsive |
| W08 | Resumen con header superior | Alternativa de shell con navegación centrada y header transparente | `Header/Desktop`, mismas tarjetas que W01 | Normal |

## 3. Diferencias respecto a móvil

- **Navegación:** sidebar compacta que se expande (hover/chevron); en móvil, tab bar. El destino activo se marca igual (tinta + papel). `W08` demuestra la alternativa de header superior.
- **Densidad:** tablas y tres columnas en escritorio; en móvil, listas y una columna. Los mismos componentes cambian de densidad, no de lenguaje.
- **Acciones:** en web la acción principal vive en la cabecera de la página; en móvil, en la parte inferior al alcance del pulgar.
- **Edición:** la tabla de movimientos permite edición en línea y ordenación; en móvil se entra al detalle.
- **Teclado:** atajos `⌘K` para buscar, `Esc` para cerrar overlays, `Tab` con foco visible de 2 px.
- **Preguntas rápidas:** en web se muestran cuatro preguntas y la respuesta completa; en móvil, una pregunta a la vez con chips.
- **Paginación:** en web se pagina la tabla; en móvil se carga por scroll.

Nada de esto duplica componentes: son las mismas variantes con distinto ancho y densidad.

## 4. Accesibilidad (auditoría 5.7)

- **Contraste:** texto principal y secundario cumplen AA sobre `surface/canvas` y `surface/default`. El placeholder se ha alineado con `text/secondary` para no bajar de 4,5:1.
- **Foco:** todos los controles tienen anillo `focus/ring` de 2 px con 2 px de separación; el orden de tabulación sigue cabecera → contenido → acciones → paginación.
- **Jerarquía:** un `h1` por pantalla (título de página), secciones en `h2` y componentes con etiqueta propia.
- **Objetivos:** 44 px mínimos en móvil; en web los icon buttons mantienen 40–44 px y las filas de tabla 56 px.
- **Segundo canal:** badges con texto, plazos con «x de y», gráficos con etiqueta y valor; el color nunca es el único portador.
- **Hallazgos corregidos:** anchos de columna de la tabla, truncado de importes largos, foco en enlaces terciarios y contraste del placeholder.

## 5. Prototipo

La sección `01-Diseño → Prototipos` incluye dos tarjetas web con botón «Abrir prototipo» y navegación real a la primera pantalla:

| Flujo | Recorrido | Versión / estado |
| --- | --- | --- |
| E · Resumen y cuentas | `W01 → W02 → W03` | v1.0 · Aprobado |
| F · Grupos y ajustes | `W04 → W05 → W06` | v1.0 · Aprobado |

Los recorridos web completos son: resumen → detalle de cuenta → movimientos → gasto grupal → preguntas. Las interacciones están en `01-Diseño → Prototipos` y se documentan en `docs/diseno/handoff.md`.
