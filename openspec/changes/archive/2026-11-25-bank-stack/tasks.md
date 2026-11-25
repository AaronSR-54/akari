# Tasks

## 1. Catálogo y dominio

- [x] 1.1 Crear `packages/domain/src/banks.ts` con `BankId`, `Bank` y `bankCatalog` para `bbva`, `santander`, `caixabank`, `sabadell`, `bankinter`, `unicaja`, `ibercaja`, `abanca`, `kutxabank`, `cash` y `other`; verificar con una prueba que los ids son únicos, los nombres no están vacíos y las opciones especiales están presentes.
- [x] 1.2 Añadir `bankId` opcional a `Account` y `AccountInput` y validarlo en `createAccount`/`updateAccount`; verificar con pruebas que un banco del catálogo se guarda, un id desconocido lanza `ValidationError` y la ausencia del campo sigue siendo válida.

## 2. Persistencia y migración

- [x] 2.1 Subir `SCHEMA_VERSION` a 3 con `bankId` en el índice de `accounts` y un `upgrade` que no reescriba filas; verificar con `migration.test.ts` que una base v2 poblada conserva todas sus cuentas y movimientos.
- [x] 2.2 Normalizar a `other` los valores de `bankId` no reconocidos en `validateBackup` y en los casos de uso; verificar con una prueba de copia que contiene un `bankId` inesperado.
- [x] 2.3 Asignar bancos del catálogo a las cuentas del seed de ejemplo; verificar con la prueba de seed que los saldos y agregados no cambian.

## 3. Iconos SVG

- [x] 3.1 Descargar los SVG de los nueve bancos a `apps/web/public/banks/<id>.svg` y comprobar que no incluyen `<script>`, `foreignObject` ni referencias externas; verificar que cada id del catálogo tiene su archivo y que los SVG renderizan dentro de un contenedor de 24 px.
- [x] 3.2 Documentar en `docs/desarrollo/iconos-bancos.md` la URL de origen, la licencia y la atribución requerida de cada archivo; verificar que no queda ningún SVG sin entrada documentada.

## 4. Formulario de cuenta

- [x] 4.1 Añadir el componente `BankIcon` en `apps/web` y un selector de banco en `account-form.tsx` alimentado por `bankCatalog`; verificar con E2E que elegir un banco al crear y editar una cuenta persiste tras recargar.
- [x] 4.2 Verificar con E2E que guardar sin banco o elegir «Sin banco / Otro» deja la cuenta sin entidad y mantiene el icono genérico en sus movimientos.

## 5. Icono del banco en movimientos

- [x] 5.1 Extender `MovementRow` en `@akari/ui` con una prop `icon?: ReactNode` opcional que conserva `IconArrows` por defecto; verificar con pruebas de componente que el tamaño, el nombre accesible y la accesibilidad no se regresan.
- [x] 5.2 Pasar `BankIcon` desde el resumen, el detalle de cuenta y el listado de movimientos en escritorio y móvil; verificar con E2E que cada fila muestra el banco de su cuenta origen y que el cambio de banco se refleja sin editar movimientos.
- [x] 5.3 Mostrar el icono en `MovementDetailDialog` y ocultarlo cuando el listado esté filtrado por cuenta; verificar con E2E ambos caminos de apertura del detalle.

## 6. Documentación y verificación

- [x] 6.1 Reemplazar en `AGENTS.md` la sección de diseño congelado por la instrucción de que el código es la fuente de verdad visual y Figma no bloquea, y actualizar `docs/desarrollo/arquitectura.md`; verificar que no se modifica `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
- [x] 6.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e`; verificar que todas las verificaciones terminan sin errores y registrar los resultados.

## Workflow follow-up

- Archivar el change, abrir la PR y mover la tarjeta `68jidm1vqesc` a `DONE` con la URL de la PR; la revisión y el merge quedan en manos de una persona.
