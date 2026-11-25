# Design

## Context

Las cuentas se crean con nombre, tipo, divisa y saldo inicial (`packages/domain/src/types.ts`) y los movimientos no guardan entidad bancaria: `MovementRow` (`packages/ui/src/data-display.tsx`) dibuja siempre `IconArrows`. El esquema Dexie está en la versión 2 (`packages/data/src/db.ts`) y las copias JSON se validan en `packages/data/src/backup.ts`. La resolución de iconos debe hacerse desde la cuenta origen del movimiento, sin tocar cada movimiento. Ver `proposal.md` para la motivación y las specs para el comportamiento exigido.

El diseño visual ya no se toma del archivo Figma: el código es la fuente de verdad y Figma no bloquea la implementación. `AGENTS.md` se actualiza en este change para reflejarlo.

## Goals / Non-Goals

**Goals:**

- Un único catálogo de bancos compartido por dominio, datos e interfaz, con identificadores estables.
- Iconos de banco locales, sin peticiones de red en tiempo de ejecución.
- Asociación opcional que no obliga a migrar cuentas ni movimientos existentes.
- Sustituir el icono genérico por el del banco en todas las listas y en el detalle, respetando el contexto de filtro por cuenta.

**Non-Goals:**

- Open banking, credenciales, sincronización, cifrado ni llamadas a APIs de entidades.
- Editar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`: quedan como referencia histórica, no como entrable bloqueante.
- Rediseñar las pantallas: solo se cambia el icono de la fila y se añade un campo al formulario existente.
- Soportar entidades fuera del catálogo con logo propio: «Otro» usa el icono genérico.

## Decisions

### 1. Catálogo en dominio, iconos en la capa web

`packages/domain` expone `BankId` (unión de identificadores literales), el tipo `Bank` y `bankCatalog` (id, nombre y, si aplica, `icon: 'cash' | 'other'`). Es datos inmutables y puros: ni React ni Next ni rutas de archivos. `Account.bankId?: BankId | null` y `AccountInput.bankId?: BankId | null` se añaden como campos opcionales.

`apps/web` es el único lugar que conoce los archivos de iconos y traduce `BankId` a un nodo React (`BankIcon`). `packages/ui` solo acepta un `icon?: ReactNode` opcional en `MovementRow` y mantiene `IconArrows` por defecto. Alternativa descartada: poner los iconos y el componente en `@akari/ui`, que acoplaría la librería a la ruta pública de la app web y complicaría la futura app móvil.

Catálogo inicial: `bbva`, `santander`, `caixabank`, `sabadell`, `bankinter`, `unicaja`, `ibercaja`, `abanca`, `kutxabank`, `imagin`, `revolut`, `pibank`, `trade-republic`, más `cash` (Efectivo) y `other` (Sin banco / Otro). Añadir otra entidad es una entrada nueva en `bankCatalog`, su icono de app y su prueba de paridad.

### 2. Iconos de app móvil versionados y recortados en círculo

Los logotipos alargados no encajan en un distintivo circular, así que se usan los iconos oficiales de las apps móviles: se consulta la iTunes Search API (App Store de España), se toma `artworkUrl512` de la app de cada banco, se convierte a PNG de 256 × 256 px y se guarda en `apps/web/public/banks/<id>.png`. `docs/desarrollo/iconos-bancos.md` registra la app de origen y su enlace. No se hotlinkea: la app solo sirve sus propios archivos y no hay peticiones de red en tiempo de ejecución.

`BankIcon` dibuja cada imagen con `object-cover` dentro de un contenedor `rounded-full overflow-hidden` y un fondo de respaldo de los tokens; `Efectivo` y `Sin banco / Otro` usan el mismo contenedor circular con un distintivo generado. Alternativa descartada: recortar los logotipos de escritorio, que quedaban ilegibles al reducirlos a 20–24 px.

### 3. Migración v3 sin reescritura de datos

`SCHEMA_VERSION` pasa a 3. La definición de tablas añade `bankId` al índice de `accounts`; el `upgrade` no modifica filas: las cuentas antiguas se leen con `bankId` ausente y se tratan como `other`. La copia/importación JSON sigue siendo compatible: `bankId` desconocido se normaliza a `other` en la validación para no romper copias de versiones futuras o anteriores. `createAccount`/`updateAccount` validan que el valor pertenezca a `bankCatalog` y lanzan `ValidationError` si no.

### 4. Resolución del icono en la capa web

Cada pantalla que dibuja `MovementRow` resuelve el banco de la cuenta origen con el `Account` que ya tiene a mano (o con `useAccounts()` en el resumen) y pasa el nodo `BankIcon` al componente. El detalle recibe un flag `showBankIcon`: es `false` cuando el listado está filtrado por cuenta, para no repetir una información ya visible en el filtro. Los movimientos no se modifican: cambiar el banco de la cuenta cambia todos sus iconos de inmediato.

Alternativa descartada: guardar el `bankId` en cada `Movement`. Duplicaría datos y dejaría iconos desactualizados al editar la cuenta.

### 5. `AGENTS.md`: código como fuente de verdad

Se sustituye la sección «Diseño congelado» por una instrucción de que el código manda en lo visual, que Figma/`docs/diseno/` son referencia histórica y no bloquean, y que las herramientas de diseño solo se usan si la persona lo pide explícitamente. Se mantiene sin cambios `openspec/specs/diseno/*`, que seguirá siendo el contrato histórico hasta un change separado.

## Risks / Trade-offs

- **Licencias y marcas de los logos** → se registran fuente y licencia por archivo; los que requieren atribución llevan la nota en la documentación; si una licencia resulta incompatible se sustituye por un distintivo generado en código.
- **Iconos de app con marcas registradas o cambios de arte** → se documenta la app de origen, se sirven archivos locales y se sustituyen por un distintivo generado si una licencia lo exigiera.
- **Cuentas antiguas sin banco** → tratamiento uniforme como `other`; ninguna mutación automática de datos, así que no hay pérdida posible.
- **Copias con `bankId` inesperado** → normalización a `other` en `validateBackup` y en los casos de uso, con prueba específica.
- **Propagación del icono por varias pantallas** → un único componente `BankIcon` y una sola firma extendida de `MovementRow`; se cubre con E2E en resumen, cuenta, movimientos y detalle.
- **Fichero `AGENTS.md` compartido** → se toca en una sola rama y se coordina el merge con otros changes; `kan-sync check` avisará al proponer la PR.

## Migration Plan

1. Añadir el catálogo y el campo opcional en dominio, con pruebas puras.
2. Subir la versión de esquema a 3 y normalizar `bankId` en copias/casos de uso, con prueba de migración sin pérdida.
3. Descargar y validar los iconos de app, y documentar su origen.
4. Añadir `BankIcon` y el campo en el formulario de cuenta.
5. Propagar el icono a resumen, detalle de cuenta, listado y detalle de movimiento, con E2E.
6. Actualizar `AGENTS.md` y `docs/desarrollo/`.
7. Verificar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e`. La reversión es `git revert` del change: la migración no destruye datos, así que volver a la versión 2 deja las columnas extra ignoradas.

## Open Questions

Ninguna: el catálogo inicial, las opciones especiales y las superficies quedan fijadas en las specs; las entidades nuevas se añaden después ampliando el catálogo.
