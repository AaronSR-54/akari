# Tasks

## 1. Base del monorepo

- [x] 1.1 Crear `package.json` raíz con workspaces `apps/*` y `packages/*`, scripts `dev`, `build`, `test`, `lint` y `typecheck`, sin mover `design/`, `docs/` ni `openspec/`. Verificación: `npm install` termina sin errores y `npm run typecheck` responde desde la raíz.
- [x] 1.2 Configurar TypeScript estricto, ESLint y Prettier compartidos, con `tsconfig.base.json` y configuración por paquete. Verificación: `npm run lint` pasa en el monorepo vacío y una violación de tipo de prueba falla el `typecheck`.
- [x] 1.3 Configurar Vitest, Testing Library y Playwright en la raíz, con un test de humo por capa. Verificación: `npm test` ejecuta los tests de humo y `npx playwright test --list` descubre el proyecto E2E.
- [x] 1.4 Crear los manifiestos de `packages/tokens`, `packages/ui`, `packages/domain` y `packages/data`, y el esqueleto de `apps/web` con Next.js App Router. Verificación: `npm run build` genera la app y cada paquete resuelve sus imports internos.

## 2. Tokens, tema y fundamentos

- [x] 2.1 Declarar en `packages/tokens` los primitivos, semánticos claro/oscuro, espaciado, radios, tamaños, bordes, movimiento y tipografía de `docs/diseno/fundamentos.md`. Verificación: un test compara valores y nombres contra las tablas de fundamentos y falla si falta o sobra un token.
- [x] 2.2 Generar desde la fuente única `tokens.css`, el preset de Tailwind y los tipos TS, y documentar el comando de generación. Verificación: regenerar produce los mismos artefactos y `npm run build -w packages/tokens` termina sin diferencias inesperadas.
- [x] 2.3 Implementar el proveedor de tema con `data-theme`, persistencia, preferencia del sistema y script sin destello. Verificación: test de integración alterna claro/oscuro, recarga y conserva la elección; sin elección sigue `prefers-color-scheme`.
- [x] 2.4 Cargar Inter autoalojada y exponer las escalas editorial y UI, incluidas cifras tabulares en importes. Verificación: un test comprueba `font-feature-settings` en importes y que los textos de producto usan utilidades de la escala.
- [x] 2.5 Crear los ocho iconos `Icon/*` como componentes SVG de 24 px y trazo 1,75, con nombre accesible obligatorio. Verificación: test de render y accesibilidad por icono; revisión visual contra `docs/diseno/fundamentos.md` §11.
- [x] 2.6 Añadir la prueba de paridad entre tokens generados y documentación, y registrarla en `docs/desarrollo/convenciones.md`. Verificación: la prueba falla al eliminar un token del código y pasa al restaurarlo.

## 3. Dominio y cálculos financieros

- [x] 3.1 Implementar el objeto de valor de dinero en unidad menor y divisa, con suma, resta, comparación y formato `es-ES`. Verificación: tests cubren signos, redondeo, ceros y formato sin coma flotante.
- [x] 3.2 Modelar cuentas, movimientos y sus validaciones, y calcular saldo real, saldo agregado por divisa y proyección de fin de mes. Verificación: tests de saldo, cuentas excluidas del total y proyección con ingresos/gastos recurrentes.
- [x] 3.3 Implementar recurrencias, próxima fecha, cuotas y estado de plazos (al día, atrasado, completado). Verificación: tests de avance de frecuencia, cuota vencida, progreso «x de y» y fin de plan.
- [x] 3.4 Implementar reparto grupal igualitario, porcentual y por cantidad fija, con resto determinista, y el algoritmo de liquidación que minimiza transferencias. Verificación: tests comprueban que la suma de partes iguala el total y que la liquidación salda todas las deudas.
- [x] 3.5 Implementar la conversión de divisa de un gasto guardando el tipo aplicado y sin recalcular deudas pasadas. Verificación: test cambia el tipo del día y comprueba que la deuda existente no cambia.
- [x] 3.6 Definir los puertos de repositorio y los casos de uso de cuentas, movimientos, grupos y ajustes, con errores de validación tipados. Verificación: tests de casos de uso sin navegador cubren éxito, validación y referencias inexistentes.

## 4. Persistencia local

- [x] 4.1 Crear el esquema Dexie v1 con las tablas del diseño y el ejecutor de migraciones versionadas. Verificación: test abre una base v1, migra a una v2 simulada y conserva los registros.
- [x] 4.2 Implementar los adaptadores de repositorio sobre Dexie, incluidas transacciones y borrado con integridad referencial. Verificación: tests de CRUD, recálculo de saldo y rechazo de movimientos con cuenta inexistente.
- [x] 4.3 Crear el seed de datos de ejemplo coherente para cuentas, movimientos, recurrencias, plazos y grupos. Verificación: test verifica totales, fechas y que los flujos core tienen datos suficientes.
- [x] 4.4 Implementar exportación e importación de copia local con versión de esquema, validación y aviso de que no está cifrada. Verificación: tests de ida y vuelta, archivo inválido rechazado sin alterar datos y metadatos de advertencia presentes.
- [x] 4.5 Implementar el reinicio del espacio local y el cambio entre vacío y datos de ejemplo con confirmación. Verificación: test comprueba que el reinicio deja el estado de primera apertura y no deja registros huérfanos.
- [x] 4.6 Detectar y comunicar errores de almacenamiento (cuota agotada, modo privado, IndexedDB no disponible). Verificación: tests simulan cada fallo y comprueban mensaje accionable y ausencia de guardado simulado.

## 5. Componentes base y formularios

- [x] 5.1 Implementar `Button/Primary`, `Button/Secondary`, `Button/Tertiary`, `IconButton`, `Link` y `Fab` con todos sus estados y foco visible. Verificación: tests de variantes, teclado, estado loading y objetivo táctil de 44 px.
- [x] 5.2 Implementar `Field/Text`, `Field/Textarea`, `Field/Date`, `Select/Field`, `Search/Field`, `Amount/Input`, `Switch` y `Checkbox` con etiqueta visible, ayuda y error en texto. Verificación: tests de validación, obligatoriedad, altura estable al fallar y anuncio accesible del error.
- [x] 5.3 Implementar `Logo` expandido y reducido con tamaños XL/M/L/S, usando la «ı» sin punto y el círculo ámbar como punto final. Verificación: test de variantes y revisión visual contra `docs/diseno/componentes.md` §0; assets de app/favicon exportados si están disponibles.
- [x] 5.4 Crear primitivas de composición (tarjeta, pilas, rejillas y contenedores) que solo consuman tokens. Verificación: test de estilos comprueba que no hay colores, espaciados ni radios literales.

## 6. Componentes de datos y feedback

- [x] 6.1 Implementar `Account/Card`, `Movement/Row`, `Balance/Summary`, `Badge`, `Progress/Installments`, `Chart/Bars` y `Chart/Sparkline`. Verificación: tests de densidades, importes largos, signos, estados y segundo canal de las series.
- [x] 6.2 Implementar `Modal`, el sustituto web de `Bottom/Sheet`, `Toast` y `Banner` con cierre, foco atrapado y retorno de foco. Verificación: tests de teclado, Escape, toque fuera, duración del toast y scrim propio.
- [x] 6.3 Implementar `Skeleton` y `State/Page` para carga, vacío, error, sin conexión y datos insuficientes. Verificación: tests de cada tipo y de la acción principal disponible.
- [x] 6.4 Revisar la librería completa con axe y corregir hallazgos de etiquetas, contraste, foco y roles. Verificación: `npm test` de componentes y el chequeo axe pasan sin violaciones graves.

## 7. Shell web y navegación

- [x] 7.1 Implementar el layout principal con sidebar compacta y expandida (hover, foco y click), inset de 16 px, sombra `Elevation/1` y destino activo en tinta. Verificación: tests de estado activo, expansión por teclado y cierre del panel.
- [x] 7.2 Implementar el modo de shell con `Header/Desktop` alternativo sobre las mismas rutas y persistir la elección. Verificación: test navega las mismas rutas en ambos modos y comprueba que no hay dos navegaciones principales visibles.
- [x] 7.3 Implementar los breakpoints de 1024 y 768 px, la barra superior de tablet y la barra inferior móvil. Verificación: tests E2E en 1440, 900, 768 y 390 px sin desbordamiento horizontal ni pérdida de contenido.
- [x] 7.4 Definir rutas, títulos de página, deep links, migas y página no encontrada. Verificación: tests de navegación directa a cuenta y grupo, título correcto y retorno al listado.
- [x] 7.5 Implementar atajos de teclado `⌘K`/`Ctrl+K`, `Esc` y navegación con foco visible, con ayuda visible. Verificación: test E2E de apertura de búsqueda, cierre de overlay y retorno de foco.
- [x] 7.6 Conectar estados globales de carga, error y vacío del shell sin desmontar la navegación. Verificación: tests con datos demorados y error forzado comprueban esqueleto, reintento y navegación operativa.

## 8. Onboarding y ajustes

- [x] 8.1 Implementar `/onboarding` para primera apertura, elección entre vacío y datos de ejemplo, y finalización sin servicios remotos. Verificación: test E2E completa la primera apertura y las aperturas posteriores no repiten el onboarding.
- [x] 8.2 Implementar `/ajustes` con tema, modo de shell, estado del almacenamiento, exportación/importación, datos de ejemplo y reinicio con confirmación. Verificación: test E2E por cada acción y comprobación de persistencia tras recargar.
- [x] 8.3 Mostrar y documentar en la propia UI la advertencia de copia sin cifrar y la limitación de sincronización de esta fase. Verificación: test comprueba el aviso antes de exportar y el enlace a `docs/desarrollo/desviaciones.md`.

## 9. Cuentas y movimientos

- [x] 9.1 Implementar `/cuentas/nueva` y la edición de cuenta con nombre, tipo, divisa, saldo inicial obligatorio y TAE condicional. Verificación: tests de validación (saldo vacío/cero, tipo depósito) y de recálculo tras editar.
- [x] 9.2 Implementar el resumen de cuentas en `/` con saldo agregado por divisa, comparación con el mes anterior y aviso de pago próximo. Verificación: tests de agregados, cuentas excluidas y estado vacío.
- [x] 9.3 Implementar `/cuentas/[id]` con saldo real, estimado, evolución y movimientos, incluido el estado sin movimientos. Verificación: test de navegación desde el resumen, alerta de estimado negativo y acción de añadir movimiento.
- [x] 9.4 Implementar `/movimientos` con búsqueda, filtros, ordenación, paginación en escritorio y carga por scroll en móvil. Verificación: tests de filtros combinados, página vacía con limpiar filtros y conservación de filtros al paginar.
- [x] 9.5 Implementar `/movimientos/nuevo` y la edición en línea con gasto/ingreso, importe, fecha, cuenta, concepto y repetición. Verificación: tests de guardado, actualización de saldo, validación de importe y creación de recurrencia.
- [x] 9.6 Mostrar planes de plazos y sus cuotas en el detalle de cuenta, con progreso, vencimiento y registro de cuota. Verificación: test de cuota vencida, progreso «x de y» y actualización del saldo al registrar el pago.

## 10. Dashboard, detalle y preguntas rápidas

- [x] 10.1 Implementar las tarjetas bento del resumen con una métrica por tarjeta, contexto y microserie cuando aporte. Verificación: test de contenido, formato de importes y ausencia de más de una métrica principal por tarjeta.
- [x] 10.2 Implementar las preguntas rápidas de `/preguntas` con las reglas de mayor gasto y gastos evitables, y el estado de datos insuficientes. Verificación: tests con datos de ejemplo, sin datos y con una sola categoría; cada respuesta muestra periodo y contexto.
- [x] 10.3 Conectar el acceso a preguntas desde el resumen y desde las tarjetas, con navegación de vuelta. Verificación: test E2E del flujo D (`resumen → preguntas → detalle`) y regreso al punto de origen.

## 11. Gastos grupales y liquidación

- [x] 11.1 Implementar `/grupos` con creación de grupo, divisa, miembros y roles locales. Verificación: tests de creación, bloqueo con menos de dos miembros y cambio de rol solo por administración.
- [x] 11.2 Implementar `/grupos/[id]` con gasto nuevo, selección de pagador, cuenta opcional y reparto igualitario, porcentual o fijo. Verificación: tests de descuadre, suma al 100 %, resto visible y guardado del gasto.
- [x] 11.3 Implementar historial de gastos con estado pendiente/saldado, filtros y total pendiente. Verificación: tests de filtros, estado vacío y actualización al liquidar.
- [x] 11.4 Implementar la liquidación con transferencias pendientes/saldadas, cuenta de cobro y grupo saldado. Verificación: tests del algoritmo, marcado de transferencia y conservación del historial.
- [x] 11.5 Implementar la conversión de divisa en el gasto grupal con tipo aplicado visible y detalle del importe original. Verificación: test de divisa distinta, tipo guardado y no recalculado tras cambiar el tipo del día.
- [x] 11.6 Verificar el flujo C completo en E2E (`grupo → gasto → liquidación`) y los estados de error de reparto. Verificación: `npx playwright test` del flujo C pasa en escritorio y móvil web.

## 12. Documentación, trazabilidad y verificación integral

- [x] 12.1 Crear `docs/desarrollo/arquitectura.md`, `puesta-en-marcha.md`, `convenciones.md`, `mapa-diseno-codigo.md` y `desviaciones.md` con el contenido definido en `design.md`. Verificación: los comandos documentados se ejecutan desde una copia limpia y los enlaces internos resuelven.
- [x] 12.2 Actualizar `README.md` al monorepo y enlazar desde `docs/diseno/estado.md` y `docs/diseno/handoff.md` el mapa de implementación y las desviaciones. Verificación: revisión de enlaces y de que la documentación de diseño existente no se ha reescrito.
- [x] 12.3 Completar la matriz de trazabilidad requisito→ruta→componente→prueba para las seis capacidades `producto/*`. Verificación: no hay requisito sin ruta o prueba asociada ni ruta core sin spec.
- [x] 12.4 Ejecutar la suite completa de unidad, componentes e integración con cobertura de dominio. Verificación: `npm test` pasa y los cálculos financieros alcanzan la cobertura acordada en `convenciones.md`.
- [x] 12.5 Ejecutar los flujos E2E core (0, A, B, C, D, E, F) y la auditoría axe en claro y oscuro. Verificación: `npx playwright test` pasa y no hay violaciones graves de accesibilidad.
- [x] 12.6 Ejecutar `npm run lint`, `npm run typecheck` y `npm run build` en el monorepo. Verificación: los tres comandos terminan sin errores y el build de producción sirve `/`, `/movimientos`, `/grupos`, `/preguntas` y `/ajustes`.

## Workflow follow-up

- Revisar el resultado con la persona usuaria y ajustar las desviaciones documentadas si cambia el alcance.
- Archivar el cambio cuando la revisión esté aprobada; el archivado moverá las specs `producto/*` a `openspec/specs/`.
