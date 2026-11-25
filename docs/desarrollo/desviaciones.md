# Desviaciones y alcance diferido

Este documento registra las diferencias entre el diseño aprobado (`docs/diseno/`) y la implementación web actual. Ninguna desviación cambia el diseño: son fases posteriores o límites explícitos de esta entrega.

## 1. Cifrado y contraseña local

- **Diseño:** la base local se cifra con una contraseña (M02/M03) y no hay recuperación remota.
- **Implementación:** IndexedDB sin cifrado y sin pantalla de contraseña.
- **Motivo:** esta fase prioriza validar el producto y los flujos con datos locales reales; el cifrado exige un cambio propio con migración de datos y revisión de seguridad.
- **Consecuencia:** no introduzcas datos personales sensibles reales. La exportación se advierte como no cifrada.
- **Cierre:** un cambio futuro deberá migrar el esquema, añadir desbloqueo y actualizar las specs `producto/datos-locales` y `diseno/pantallas-movil`.

## 2. Sincronización

- **Diseño:** nube opcional, tiempo real, conflictos y modo sin conexión (M04, M17, W06).
- **Implementación:** solo local. No hay cuentas de usuario, servidor, cola de subida ni resolución de conflictos.
- **Consecuencia:** la app funciona sin conexión por definición; el estado «sin conexión» de `StatePage` existe como componente, pero no se muestra un banner de sincronización porque no hay sincronización que mostrar.
- **Cierre:** cambio propio de backend/sync; requiere definir identidad, permisos remotos y conflictos.

## 3. App móvil

- **Diseño:** 19 pantallas móviles, widgets y notificaciones nativas (M01–M19).
- **Implementación:** web responsive hasta 390 px. No hay `apps/mobile` ni React Native en este cambio.
- **Consecuencia:** la navegación móvil web reutiliza TabBar inferior, pero no hay notificaciones del sistema ni widgets.
- **Cierre:** cambio posterior con `apps/mobile`, reutilizando `packages/tokens`, `packages/ui` y `packages/domain`.

## 4. Invitaciones y permisos remotos

- **Diseño:** invitaciones pendientes y roles Admin/Editor/Lectora en cuentas conjuntas (M14).
- **Implementación:** los grupos tienen miembros y roles locales; no hay invitaciones ni verificación de identidad.
- **Consecuencia:** cualquier persona con acceso al navegador puede cambiar roles desde la administración local. No se comparte información entre dispositivos.
- **Cierre:** llega con backend/sync.

## 5. Divisas

- **Diseño:** gasto grupal con conversión a la divisa de cobro usando el tipo del día.
- **Implementación:** el tipo de cambio se introduce manualmente al crear el gasto y se guarda con él; no se consulta un proveedor de tipos. Los totales del dashboard se agrupan por divisa y no se convierten.
- **Consecuencia:** no hay tipos en vivo ni suma multdivisa automática.
- **Cierre:** integrar un proveedor de tipos si el producto lo requiere; la spec ya exige conservar el tipo aplicado.

## 6. Copia de seguridad

- **Diseño:** exportación de copia cifrada (M17/W06).
- **Implementación:** JSON legible, con `schemaVersion` y advertencia de que no está cifrado. Importación validada y atómica.
- **Consecuencia:** el archivo debe tratarse como sensible.
- **Cierre:** el cifrado de la copia se añadirá con el cifrado local.

## 7. Notificaciones y avisos

- **Diseño:** bandeja de avisos (M15) y notificaciones push.
- **Implementación:** banner de próximo pago/cuota vencida en el resumen y recurrencias visibles en el detalle de cuenta. Sin bandeja ni push.
- **Cierre:** app móvil + backend de notificaciones.

## 8. Fechas

- **Diseño:** formato `dd mmm aaaa`.
- **Implementación:** campos `type="date"` nativos; el navegador decide el formato de entrada. Las fechas mostradas en listas y detalles usan `date-fns` con locale `es`.
- **Consecuencia:** el control de entrada puede verse en formato del sistema operativo.
- **Cierre:** sustituir por un date picker propio si se exige paridad exacta.

## 9. Iconos

- **Diseño:** ocho iconos `Icon/*` exportados en SVG desde FigCraft.
- **Implementación:** componentes SVG con la geometría documentada (24 × 24, trazo 1,75, extremos redondeados).
- **Consecuencia:** si el SVG original difiere en algún trazo, prevalece la geometría documentada hasta una revisión visual conjunta.
- **Cierre:** sustituir los paths por los SVG exportados cuando estén disponibles.

## 10. Autenticación y backend

- **Diseño:** el canvas menciona autenticación y sincronización; F3/F4 no diseñan pantallas de login.
- **Implementación:** no hay login, sesión, API ni pagos. Todo es local.
- **Cierre:** cambio de backend con su propio diseño y specs.

## 11. Pantallas no incluidas en esta entrega

Quedan fuera, además de las superficies nativas: la creación de planes de plazos desde la UI (se muestran y registran cuotas sobre planes existentes), la bandeja de avisos, la gestión de invitaciones y la red de amistades. La app móvil las abordará junto con su cambio de implementación.

## 12. Hero del resumen (change `rediseno-dashboard-hero`)

- **Diseño:** `W01` abre con tres `StatCard` y muestra «Gastos por semana» como gráfico de barras en la columna derecha.
- **Implementación:** el saldo total sigue sobre el lienzo, sin caja, a la izquierda, y a la derecha la evolución del saldo durante el mes, también fuera de tarjeta, empezando en el cierre del mes anterior como primer punto, seguido del día 1; el detalle identifica ese cierre y no hay una etiqueta fija con la fecha. Cada ingreso sube la línea y cada gasto la baja; la gráfica no lleva título, pie ni referencias visibles, y permite recorrer cada día con el puntero o el teclado para ver sus movimientos y el saldo tras ese día. Debajo, «Balance del mes» muestra el neto con signo y color (verde positivo, rojo negativo) y el saldo total estimado a fin de mes como única línea de pie. La gráfica ocupa el alto de su fila, así que crece con la columna del saldo y ambas columnas terminan a la misma altura; la tarjeta va justo debajo, con su misma anchura, sin borde superior y con una sombra superior sutil, y el área ámbar llega hasta el borde derecho de la columna y se prolonga bajo las esquinas redondeadas de la tarjeta para que la unión no deje un corte. «Próximo pago» queda bajo el saldo y «Preguntas rápidas» al pie de «Últimos movimientos». Se han retirado el gráfico semanal y el `ChartArea` del resumen.
- **Motivo:** el saldo y su evolución mensual responden mejor a la planificación que un neto semanal; los gastos hacia abajo y los ingresos hacia arriba hacen legible el efecto de cada movimiento, y el saldo total estimado añade contexto sin competir con el hero.
- **Consecuencia:** la composición actual no coincide con el frame `W01` aprobado. El diseño está congelado: no se han modificado FigCraft, `design/` ni `docs/diseno/`, y la desviación queda registrada aquí.
- **Mock determinista:** la app de demo usa el 29/11/2026 como fecha fija y siembra tres meses de historial para que la base y la proyección se vean siempre iguales. No es el comportamiento de producción: el reloj se puede ajustar con `NEXT_PUBLIC_AKARI_NOW` y está documentado en `puesta-en-marcha.md`.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/dashboard-hero`.

## 13. Cómo registrar una desviación nueva

1. Describe el comportamiento diseñado y el implementado.
2. Indica el motivo, la consecuencia para la persona usuaria y el cambio que la cerrará.
3. Enlaza la spec afectada.
4. Si la desviación cambia el comportamiento esperado, actualiza la spec `producto/*` en el mismo cambio; si solo es una fase, mantén la spec y anota aquí el aplazamiento.

## 14. Desenfoque del fondo en overlays (change `difuminar-fondo-modales`)

- **Diseño:** el scrim de modales y hojas se define solo por color (`overlay/scrim`) con opacidad 40–60 %; no se especifica desenfoque.
- **Implementación:** el scrim atenúa el fondo con `overlay/scrim` al 50 % y añade `backdrop-filter: blur(4px)`.
- **Motivo:** la tarjeta `wgqrx4qnq4ed` pide difuminar el fondo al abrir las modales.
- **Consecuencia:** el fondo se ve desenfocado, un efecto que el diseño congelado no recoge.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la spec afectada es `producto/componentes`.

## 15. Título en la cabecera sidebar (change `fix-mover-el-titulo-de-la-pagina-al-header-cuando-estamos-en-al-vista-sidebar`)

- **Diseño:** la cabecera de la variante sidebar no muestra el título; el H1 y el subtítulo viven solo en el contenido.
- **Implementación:** `DesktopHeader` muestra el título como único `h1` y su subtítulo (`meta`) debajo en escritorio; el `PageHeader` del contenido oculta ambos en `lg` con `hideTitleAtLg`.
- **Motivo:** la tarjeta `vg0xdmgej32g` pide mover el título a la cabecera en vista sidebar; el usuario amplió el alcance para incluir también el subtítulo (fecha y número de cuentas del resumen).
- **Consecuencia:** título y subtítulo permanecen fijos arriba en escritorio; en tablet/móvil y variante `header` siguen en el contenido.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/shell-web`.

## 16. Detalle de movimiento en modal (change `detalle-de-movimientos`)

- **Diseño:** no existe un detalle de movimiento en el diseño congelado; la consulta y la edición de un movimiento viven en la tabla de `W03`, con un botón «Editar» por fila.
- **Implementación:** al seleccionar cualquier fila de movimientos (listado, resumen o detalle de cuenta) se abre una modal con concepto, tipo, importe con signo, divisa, fecha, categoría, cuenta, nota, vínculos y fecha de creación. La modal ofrece «Editar» y «Eliminar», y se cierra con la ✕ de la cabecera; la tabla de `W03` deja de mostrar botones de edición y la columna «Acciones». No hay ruta de detalle.
- **Motivo:** la tarjeta pide un detalle por movimiento y retirar la edición de las tablas; el producto tiende a resolver crear, editar y detallar en modales, y el diseño no contempla esa superficie.
- **Consecuencia:** la tabla de movimientos difiere del frame aprobado (sin columna «Acciones») y aparece una modal no diseñada. El diseño está congelado: no se han modificado FigCraft, `design/` ni `docs/diseno/`, y la desviación queda registrada aquí.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/finanzas-personales`.

## 17. Fila de cuentas sin encabezado en el resumen (change `fix-unificar-dashboard-en-un-mismo-bento`)

- **Diseño:** `W01` presenta las cuentas como una sección con el encabezado «Cuentas» y el enlace «Gestionar cuentas» sobre la fila de tarjetas.
- **Implementación:** el encabezado «Cuentas» con el enlace «Gestionar cuentas» a `/cuentas/nueva` vive dentro de la tarjeta, con el mismo estilo que «Ver todos» en Últimos movimientos. Todas las cuentas se presentan como bloques dentro de un único panel que ocupa todo el ancho del contenido. Los bloques se reparten lado a lado en escritorio y se apilan en móvil, sin tabla ni líneas divisorias: se distinguen por un fondo `surface-sunken` con esquinas redondeadas y espaciado entre ellos. El panel crece con el número de cuentas sin scroll propio.
- **Motivo:** la tarjeta `xrngfyh3kjnb` pide unificar el dashboard en un mismo bento; el usuario pidió que todas las cuentas compartan un solo panel responsive y, después, que la fila conserve un título y un botón de gestión como «Últimos movimientos».
- **Consecuencia:** el hero —saldo, gráfica del mes, últimos movimientos, balance del mes, accesos rápidos y el ajuste de altura de la gráfica— queda intacto; solo cambia la fila de cuentas.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/dashboard-hero`.

## 18. Sidebar superpuesta y tamaños unificados (change `fix-sidebar`)

- **Diseño:** la `Sidebar` compacta de 76 px se expande a 240 px con hover o chevron y el panel expandido flota sobre el contenido; el `Header/Desktop` usa el logotipo S en cabeceras mientras la sidebar expandida usa el M, y no se fija una altura común de ítems ni un tamaño de avatar compartido entre variantes.
- **Implementación:** la sidebar es un panel `fixed` con inset de 16 px y el shell reserva 76 px en el flujo, de modo que la expansión no redimensiona ni desplaza el contenido. El logotipo expandido mide 32 px (M), los ítems de navegación 44 px (h-11) y el avatar 40 px (md) en sidebar, header, tablet y móvil; la barra inferior móvil conserva objetivos táctiles de `min-h-11`.
- **Motivo:** las tarjetas `c085qqmjex7u` y `s2du40zg6zju` piden que el hover se solape sobre el contenido y que se unifiquen los tamaños entre sidebar y header; el usuario eligió un término medio: conservar el logotipo de la sidebar y adoptar la altura de ítems del header.
- **Consecuencia:** el logotipo de las cabeceras es mayor que en el frame aprobado y los ítems de la sidebar y la navegación tablet son más altos; al expandirse, el panel tapa la esquina superior izquierda de la cabecera. El diseño está congelado: no se han modificado FigCraft, `design/` ni `docs/diseno/`, y la desviación queda registrada aquí.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/shell-web`.

## 19. Alta y edición de movimientos en modal (change `modal-nuevo-movimiento`)

- **Diseño:** `M09` plantea el alta como pantalla propia y `W03` describe la edición en línea desde la tabla de movimientos.
- **Implementación:** el alta desde `/movimientos` y la edición de un movimiento abren un modal con el formulario completo de `M09` (tipo, importe, cuenta, concepto, fecha, categoría y nota, y repetición al crear) en un panel ancho de 672 px, mayor que el token de 440 px. La ruta `/movimientos/nuevo` sigue existiendo como enlace directo para resumen, cuentas y preguntas. La edición conserva el borrado con deshacer.
- **Motivo:** evitar salir del listado y unificar alta y edición en una sola superficie; el diálogo anterior no permitía cambiar cuenta, tipo ni nota.
- **Consecuencia:** la composición no coincide con `M09`/`W03` aprobados. El diseño está congelado: no se han modificado FigCraft, `design/` ni `docs/diseno/`.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/finanzas-personales`.

## 20. Gráfica del resumen con padding y línea mostaza (change `fix-grafico-con-padding-inline`)

- **Diseño:** la evolución del saldo del `W01` usa tinta para la línea y un área ámbar que llega hasta los bordes de la columna y se recorta en las esquinas de la tarjeta de balance; el detalle diario aparece sobre un panel de fondo invertido.
- **Implementación:** el trazado y el área dejan 8 px a cada lado del bloque, el área redondea sus cuatro esquinas tanto con el mes abierto como con el completo, y la línea es una curva suave en el acento mostaza (`--color-accent-default`) en ambos temas que arranca y termina en las tangentes de las esquinas redondeadas. El panel de detalle usa el mismo fondo `surface-sunken` que los bloques de cuenta del dashboard, con borde sutil, tipografía reforzada y el borde del punto activo del mismo color.
- **Motivo:** la tarjeta `z69iv2q63eie` pide padding inline, extremos redondeados y una línea más suave; la persona responsable confirmó que la línea SHALL ser siempre mostaza y descartó el rojo/verde por signo que la tarjeta también sugería, además de pedir que el panel de detalle comparte el fondo de las tarjetas de cuenta.
- **Consecuencia:** el área ya no se prolonga bajo las esquinas de la tarjeta de balance, la línea cambia de color respecto al frame aprobado y el detalle deja de ser un panel oscuro. El diseño está congelado: no se han modificado FigCraft, `design/` ni `docs/diseno/`.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/dashboard-hero`.

## 21. Perfil y ajustes unificados en el avatar (change `user-button-settings`)

- **Diseño:** `W06` vive en `/ajustes` bajo el título «Datos y sincronización» y la navegación principal incluye «Ajustes» como cuarto destino junto a Resumen, Movimientos y Grupos; el avatar de identidad es decorativo.
- **Implementación:** el avatar es un enlace a `/ajustes` en sidebar, header, tablet y móvil, con padding ligero, cambio de fondo al pasar el puntero y tooltip «Ajustes»; la navegación principal queda en tres destinos; `/ajustes` añade una tarjeta «Perfil» con la identidad compartida y un editor de nombre persistido en los ajustes locales, y pasa a titularse «Ajustes» con un subtítulo sobre perfil y datos locales; el saludo del resumen usa también el nombre guardado. La foto sigue siendo una representación por iniciales.
- **Motivo:** la tarjeta `syq5yifbebmi` pide mover el acceso al panel de ajustes al botón del usuario; el usuario pidió unificar perfil y ajustes en una sola superficie, añadir una afordancia visual al avatar y permitir editar el nombre (sin foto).
- **Consecuencia:** desaparece el destino «Ajustes» de la barra de navegación, cambia el título de la pantalla y el nombre editable se refleja también en las iniciales del avatar, respecto al frame aprobado. El diseño está congelado: no se han modificado FigCraft, `design/` ni `docs/diseno/`.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/shell-web`.

## 22. Headings del resumen (change `headings-desktop-mobile`)

- **Diseño:** el saludo con el nombre guardado y su subtítulo con la fecha y el número de cuentas viven en el encabezado del contenido; en modo sidebar ambos se trasladan a la cabecera fija `DesktopHeader`, y en móvil el encabezado del contenido sigue visible.
- **Implementación:** el saludo se muestra solo, sin subtítulo, como único `h1` centrado en la cabecera fija de escritorio; en tablet sigue en el contenido y en móvil no se renderiza. La fecha se integra en la etiqueta del saldo («Saldo total · domingo, 29 de noviembre») y el recuento en el encabezado del panel («Cuentas · 3 cuentas en este dispositivo»), con la misma tipografía para ambas líneas (`text-ui-13-strong` y `text-text-primary`): etiqueta en negrita y dato en cursiva con peso normal, tanto en «Saldo total · fecha» como en «Cuentas · recuento». Los encabezados «Últimos movimientos» y «Balance del mes» comparten el mismo tamaño, color y peso de etiqueta. El estado vacío aplica el mismo patrón y traslada el aviso de datos locales al cuerpo.
- **Motivo:** la tarjeta `wgfq78hd5m3m` pide modificar los headings en desktop y mobile; el saludo con subtítulo se percibe demasiado arriba en escritorio y redundante en móvil.
- **Consecuencia:** en móvil el resumen no tiene un `h1` visible; la información que aportaba el subtítulo sigue disponible en el cuerpo. El diseño está congelado: no se han modificado FigCraft, `design/` ni `docs/diseno/`, y la desviación queda registrada aquí.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/shell-web` y `producto/dashboard-hero`.

**Extensión al resto de pantallas (mismo change).** Las páginas que siguen en la barra de navegación —Resumen, Movimientos y Grupos— dejan de mostrar su título en el contenido en móvil, porque la navegación ya nombra el destino; sus acciones se mantienen visibles en un bloque propio. Las pantallas a las que se entra desde otro sitio (cuentas, grupos, formularios, Preguntas rápidas y, desde `user-button-settings`, Ajustes a través del avatar) conservan el título en todos los breakpoints. En todas ellas el subtítulo desaparece de la cabecera y su información pasa al cuerpo con el mismo estilo: etiqueta en negrita y dato en cursiva con peso normal. El texto sobre perfil y datos locales de Ajustes se mantiene en el cuerpo junto al banner informativo.

## 23. Punto del logotipo en la línea base y favicon compacto (change `logo-dot-favicon`)

- **Diseño:** `docs/diseno/componentes.md` §0 describe el círculo ámbar como «punto final» tras la marca sin fijar su altura, y reserva el monograma reducido «a» para app icon y favicon.
- **Implementación:** el círculo de `Logo` (`initial` y `expanded`) se dibuja con `items-baseline` y un ajuste visual de `translate-y-[1px]`, de modo que actúa como punto final de frase sobre la línea base; el alto del logotipo no cambia (32 px en navegación). El favicon (`apps/web/app/icon.svg`) pasa a ser el icono compacto sin fondo: trazo de la «ı» con color adaptativo a claro/oscuro y círculo ámbar a su derecha.
- **Motivo:** las tarjetas `vnvtvx5wa8wv` y `d3hgfwy1ldfw` piden alinear el punto con el texto a nivel de línea base y llevar el icono compacto al favicon; el usuario confirmó la posición a la derecha y apoyada en la base.
- **Consecuencia:** el círculo ya no flota por encima de la base y el favicon deja de ser el monograma «a». El diseño está congelado: no se han modificado FigCraft, `design/` ni `docs/diseno/`.
- **Cierre:** solo si la persona usuaria reabre la fase de diseño; hasta entonces la implementación se mantiene y la trazabilidad vive en `producto/componentes`.
