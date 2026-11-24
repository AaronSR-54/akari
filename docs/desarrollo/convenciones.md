# Convenciones de desarrollo

## Idioma

- Producto, documentación y textos de interfaz: español.
- Código, nombres de variables, tipos y commits: inglés técnico cuando no haya término de dominio claro; el dominio usa nombres en inglés (`Account`, `Movement`, `Group`).
- Las specs mantienen las palabras `SHALL`/`MUST` y los encabezados estructurales en inglés.

## Tokens y estilos

- No se escriben colores, espaciados, radios, sombras ni duraciones literales en componentes o pantallas.
- La única fuente es `packages/tokens/src/tokens.ts`; `generated/` no se edita a mano.
- Los componentes usan nombres semánticos (`bg-surface-default`, `text-text-primary`, `bg-accent-default`).
- Texto de producto: utilidades `.text-ui-*`; titulares y documentación: `.text-heading-*`, `.text-display-*`, `.text-body-*`. Importes: `.font-tabular` o estilos `Numeric/*`.
- **Prueba de paridad:** `packages/tokens/src/tokens.test.ts` compara tokens, colores, escala tipográfica, elevaciones y grids con las tablas de `docs/diseno/fundamentos.md`. Si se añade o elimina un token, actualiza el documento y la fuente; la prueba debe pasar.
- Para cambiar un token: edita `tokens.ts`, ejecuta `npm run build -w @akari/tokens`, actualiza la tabla correspondiente de `fundamentos.md` y ejecuta `npm test`.

## Dinero y fechas

- Importes como enteros en la unidad menor (`minor`) y código ISO de divisa. Usa `money`, `add`, `subtract`, `formatMinor` del dominio.
- No uses `Number` con decimales para sumar dinero.
- Fechas de negocio en `YYYY-MM-DD`; fechas técnicas en ISO 8601. Para mostrar, `date-fns` con locale `es`.
- Los totales multdivisa se agrupan por divisa; no se convierten para el dashboard.

## Arquitectura

- `packages/domain` no importa React, Next ni Dexie. Cálculos y validaciones viven ahí.
- `packages/data` implementa puertos; no contiene JSX.
- `packages/ui` es presentacional; no importa `data` ni Next.
- `apps/web` compone rutas, shell y hooks headless.
- Un caso de uso nuevo se añade a `domain/src/services.ts` con `ValidationError`/`NotFoundError` y una prueba.

## Componentes

- Cada componente reutilizable vive en `packages/ui/src`; las pantallas no dibujan botones, campos o filas equivalentes.
- Todo control interactivo tiene foco visible, nombre accesible y objetivo táctil de 44 × 44 px.
- Los formularios muestran etiqueta visible, ayuda o error en texto, y anuncian el error con `role="alert"`.
- Los overlays cierran con Escape, botón o scrim y devuelven el foco al control de origen.
- Los importes usan cifras tabulares, signo explícito y ancho fijo; nunca se parten en dos líneas.

## Rutas y estado

- Rutas estables y títulos de página (`PageTitle`). Los deep links deben cargar el recurso y marcar la sección.
- No se añade estado global: la base local es la fuente de verdad y `useLiveQuery` refresca las vistas.
- Las mutaciones muestran un toast de confirmación; los errores de validación se muestran en el campo o en un banner.

## Pruebas

- Unidad de dominio: saldos, proyecciones, reparto, liquidación, cuotas, conversión y validaciones.
- Componentes: variantes, teclado, foco, errores y axe.
- Datos: CRUD, integridad, migraciones, seed, copia y errores de cuota.
- E2E: flujos 0, A, B, C, D, E y F; responsive 1440/900/390; axe en claro y oscuro.
- Toda tarea de implementación incluye su prueba o verificación observable. No se considera terminada una pantalla con solo el estado feliz.

## Git y cambios

- Commits convencionales (`feat`, `fix`, `docs`, `spec`, `chore`).
- Un cambio de comportamiento actualiza la spec `producto/*` correspondiente; un cambio visual actualiza `docs/diseno/`.
- Las desviaciones temporales se registran en `docs/desarrollo/desviaciones.md`.
- No se edita `generated/` ni se commitea `.next/`, `coverage/`, `playwright-report/` o `test-results/`.

## Lista de comprobación antes de una PR

- [ ] `npm run typecheck`, `npm run lint`, `npm test` y `npm run build` pasan.
- [ ] La prueba de paridad de tokens pasa y `fundamentos.md` está actualizado si cambió un token.
- [ ] `npm run e2e` pasa en los tres proyectos.
- [ ] La pantalla nueva está en `mapa-diseno-codigo.md` con su spec y prueba.
- [ ] No hay colores, medidas ni textos hardcodeados fuera de tokens o contenido.
- [ ] La documentación de diseño no se ha reescrito sin un cambio de diseño aprobado.
