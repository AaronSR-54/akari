# Tasks

## 1. Preparación y archivo destino

- [x] 1.1 Obtener del usuario la URL del design file de akari o, si no la aporta, crear un Design file nuevo; registrar el `fileKey` en la portada y verificar que `create_session` y una lectura de metadatos funcionan sobre él.
- [x] 1.2 Cargar las skills `figma-use` y `figma-generate-design` antes de cualquier llamada a `use_figma`; verificar que se aplican sus reglas de creación de variables, componentes y pantallas.
- [x] 1.3 Auditar el archivo con `get_metadata` y `search_design_system`: inventariar páginas, variables, estilos, componentes y librerías existentes, y decidir por escrito qué se reutiliza, se extiende y se archiva como duplicado.
- [x] 1.4 Crear la estructura de tres páginas `00-Portada`, `01-Diseño` y `02-Pantallas`, con secciones internas `Fundamentos`, `Componentes`, `Prototipos` y `Móvil`, `Web`, `Archivo`; añadir portada con estado de revisión, changelog inicial y enlaces, y verificar orden, secciones y enlaces funcionando.

## 2. F0 — Fundamentos

- [x] 2.1 Definir la dirección visual inicial y la paleta primitiva (neutros cálidos, tinta, acento ámbar, semánticos positivo/negativo); verificar contraste AA de cada par texto/fondo y registrarlo en la página de fundamentos.
- [x] 2.2 Crear la colección de variables con capa primitiva y semántica y modos claro/oscuro (`surface`, `text-primary`, `border-subtle`, `danger`, `positive`, etc.); verificar que un componente de muestra cambia de tema sin edición manual.
- [x] 2.3 Crear los estilos de texto y la escala tipográfica con familia, tamaños, pesos, alturas de línea y numerales tabulares; verificar la jerarquía con una muestra de título, cuerpo, etiqueta e importe.
- [x] 2.4 Crear tokens de espaciado, radios, elevación, duración de movimiento y grid de layout; verificar que una muestra de tarjeta y botón se compone solo con esos tokens.
- [x] 2.5 Definir el set de iconografía y la paleta semántica de gráficos con segundo canal; verificar que las series se distinguen en claro y oscuro sin depender solo del color.
- [x] 2.6 Escribir `docs/diseno/fundamentos.md` con tokens, modos, escala y reglas de uso; verificar que cada token documentado existe con el mismo nombre en las variables de Figma.
- [x] 2.7 Presentar F0 al usuario y registrar la aprobación o los cambios en el changelog antes de empezar componentes; verificar que no queda ningún fundamento marcado como borrador al cerrar la fase.

## 3. F1 — Componentes

- [x] 3.1 Crear navegación (tab bar, top bar, sidebar web, migas) con variantes de plataforma y estado; verificar que se reutiliza en tres pantallas de prueba sin copias.
- [x] 3.2 Crear acciones (botones primario/secundario/terciario, icon button, enlace, FAB) con tamaños y estados default/hover/focus/pressed/disabled/loading; verificar foco visible y objetivo táctil de 44 px.
- [x] 3.3 Crear formularios (input, textarea, select, búsqueda, importe con divisa, fecha, switch, checkbox) con estados de error, ayuda, obligatorio y disabled; verificar un formulario de alta de cuenta completo solo con instancias.
- [x] 3.4 Crear componentes de datos (tarjeta de cuenta, fila de movimiento, resumen de saldo, badge, progreso de plazos, gráficos) con variantes de densidad y estado; verificar que los importes largos y negativos se truncan o ajustan sin romper el layout.
- [x] 3.5 Crear feedback y overlays (modal, bottom sheet, toast, banner, skeleton, vacío, error, sin conexión, éxito) con variantes móvil y web; verificar que cada estado cubre acción principal y recuperación.
- [x] 3.6 Documentar cada componente publicado con propósito, cuándo usarlo, cuándo no y variantes; verificar que la descripción es visible desde las propiedades del componente y que no quedan instancias separadas.
- [x] 3.7 Escribir `docs/diseno/componentes.md` con el inventario y la API de props/variantes; verificar que coincide con los componentes publicados en Figma.
- [ ] 3.8 Presentar F1 al usuario y registrar la aprobación; verificar que la auditoría de variables y componentes separados queda sin hallazgos bloqueantes.

## 4. F2 — Pantallas móvil

- [x] 4.1 Diseñar onboarding y acceso a datos: primera apertura, creación de base local, elección de ubicación, contraseña, desbloqueo, error de contraseña y activación de sincronización; verificar los estados de éxito y error.
- [x] 4.2 Diseñar cuentas: resumen con saldo total, alta con tipo personal/conjunta/depósito, saldo obligatorio, TAE condicional y detalle con saldo real frente a estimado; verificar que el formulario bloquea el guardado sin saldo.
- [x] 4.3 Diseñar movimientos, suscripciones, ingresos periódicos y pagos a plazos: alta, edición, detalle, frecuencia y seguimiento de cuotas pagadas y pendientes; verificar que un movimiento periódico y uno único se distinguen visualmente.
- [x] 4.4 Diseñar gastos grupales: creación de grupo, participantes, gasto sin cuenta, reparto por porcentaje/proporción/cantidad fija, quién paga a quién y a qué cuenta, y conversión de divisas; verificar que el reparto siempre cuadra con el total.
- [x] 4.5 Diseñar el dashboard bento y las preguntas rápidas (mayor gasto del mes, gastos evitables) con resultado y contexto; verificar el estado vacío cuando no hay datos suficientes.
- [x] 4.6 Diseñar compartición y red social: miembros y permisos de cuentas conjuntas, invitaciones pendientes, amistades y cuentas en común; verificar que se distingue una invitación pendiente de una amistad.
- [x] 4.7 Diseñar notificaciones de próximos pagos, acceso rápido para añadir gasto y previsualización de widgets Android/iOS; verificar que cada superficie indica su plataforma y limitación.
- [x] 4.8 Diseñar ajustes de datos y sincronización: ubicación local, nube, contraseña, estado de sincronización, conflicto y modo sin conexión; verificar que el estado sin conexión indica qué acciones siguen disponibles.
- [x] 4.9 Definir navegación y ergonomía móvil: tab bar, comportamiento de volver, deep links desde notificación, safe areas y alcance con una mano; verificar en 390×844 y 360×800.
- [x] 4.10 Añadir estados de carga, vacío, error, sin conexión, éxito y datos parciales a cada pantalla que aplique, con anotaciones de comportamiento; verificar que ninguna pantalla queda solo en estado feliz.
- [x] 4.11 Conectar el prototipo móvil de alta de cuenta, registro de movimiento, gasto grupal y dashboard; verificar que los cuatro flujos se completan de principio a fin.
- [x] 4.12 Escribir `docs/diseno/flujos-movil.md` con inventario de pantallas, estados y enlaces al prototipo; verificar que cada funcionalidad del canvas tiene al menos una pantalla asociada.
- [ ] 4.13 Presentar F2 al usuario y registrar la aprobación de los flujos móviles antes de adaptar web; verificar que los cambios solicitados quedan aplicados y anotados.

## 5. F3 — Pantallas web

- [x] 5.1 Diseñar el shell responsive: navegación lateral en escritorio, top bar en tablet/móvil, breakpoints 768/1024/1440, migas y enlaces profundos; verificar que el contenido no se estira en exceso en 1440.
- [x] 5.2 Diseñar el resumen multi-cuenta y el detalle de cuenta en web con vista comparativa, filtros y evolución; verificar que se ven saldos y tipos sin abrir cada cuenta.
- [x] 5.3 Diseñar movimientos en web con tabla, filtros, ordenación, edición en línea y estados vacío/error; verificar que una acción frecuente se puede completar sin salir de la vista.
- [x] 5.4 Diseñar gastos grupales en web con reparto por participante, liquidación y destino de pago en una sola vista; verificar que el total y las deudas cuadran.
- [x] 5.5 Diseñar el dashboard web bento y las preguntas rápidas con mayor densidad que móvil; verificar que reutiliza los mismos componentes y tokens.
- [x] 5.6 Diseñar compartición, red social y ajustes de datos/sincronización en web; verificar paridad con móvil salvo las superficies nativas documentadas.
- [x] 5.7 Verificar accesibilidad web: recorrido solo con teclado, orden de foco, foco visible, jerarquía de encabezados y contraste; registrar hallazgos y corregirlos.
- [x] 5.8 Escribir `docs/diseno/flujos-web.md` con diferencias de layout, navegación, densidad y capacidades respecto a móvil; verificar que cada diferencia está anotada también en la pantalla correspondiente.
- [x] 5.9 Conectar el prototipo web de alta de cuenta, registro de movimiento, gasto grupal y dashboard; verificar el recorrido en escritorio y en una resolución responsive.
- [ ] 5.10 Presentar F3 al usuario y registrar la aprobación de la paridad web; verificar que no quedan pantallas web con estilos locales ni componentes duplicados.

## 6. F4 — Prototipos y handoff

- [ ] 6.1 Crear la matriz de cobertura en `docs/diseno/cobertura.md` que relacione cada funcionalidad del canvas con pantallas móvil, web y estados; verificar que no hay funcionalidades sin pantalla ni pantallas sin requisito.
- [ ] 6.2 Completar las anotaciones de todas las pantallas interactivas: disparadores, navegación, validaciones, estados no visibles, origen de datos y reglas de negocio; verificar que un formulario y una pantalla con estados ocultos están documentados.
- [ ] 6.3 Actualizar portada y changelog con enlaces a prototipos, estado borrador/en revisión/aprobado y versión de cada flujo; verificar que un flujo aprobado tiene evidencia y entrada de changelog.
- [ ] 6.4 Auditar Dev Mode: variables vinculadas, cero estilos locales, cero componentes separados sin justificar, iconos y assets exportables, y nombres según la convención; registrar y corregir hallazgos.
- [ ] 6.5 Auditar accesibilidad final: contraste AA, objetivos de 44 px en móvil, foco visible, etiquetas y segundo canal en gráficos; registrar y corregir hallazgos.
- [ ] 6.6 Escribir `docs/diseno/handoff.md` con `fileKey`, estructura de páginas y secciones, convención de nombres, cómo usar Dev Mode y enlaces a prototipos y matriz; verificar que una persona nueva puede localizar un componente y una pantalla siguiendo solo el documento.
- [ ] 6.7 Verificación integral: recorrer los prototipos móvil y web completos, comprobar la matriz de cobertura contra el canvas y confirmar que tokens, componentes y pantallas están sincronizados; registrar el resultado.
- [ ] 6.8 Presentar F4 al usuario y obtener la aprobación final del diseño; verificar que todos los flujos quedan marcados como aprobados y que el changelog refleja la versión entregada.

## Workflow follow-up

- Archivar el cambio cuando la revisión de diseño esté aprobada y las specs principales se hayan sincronizado.
- Verificar el resultado archivado y dejar constancia del `fileKey` y de los enlaces de prototipo para los cambios de implementación posteriores.
