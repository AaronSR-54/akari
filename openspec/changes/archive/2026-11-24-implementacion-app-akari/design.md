# Design

## Context

Ver `proposal.md` para la motivación. El repositorio contiene hoy diseño (`design/`), documentación (`docs/diseno/`) y specs (`openspec/specs/diseno/*`), sin código de producto ni configuración de build. Los fundamentos fijan tokens, tipografía, componentes y flujos; las specs `diseno/*` describen el archivo de Figma y no cambian en este cambio.

Restricciones que condicionan la implementación:

- La documentación de diseño es la fuente de verdad visual; el código debe poder rastrearse hasta ella.
- El canvas exige Next.js, React Native, Tailwind, arquitectura hexagonal y hooks headless.
- Esta fase es web-first, con datos locales reales y sin backend, autenticación, sincronización ni cifrado.
- El stack del repositorio es greenfield: no hay dependencias ni convenciones de código previas que preservar.

## Goals / Non-Goals

**Goals:**

- Un monorepo que albergue diseño, documentación, specs y código sin mover ni reescribir el trabajo de diseño existente.
- Una única fuente de tokens que genere CSS, configuración de Tailwind y tipos, de modo que diseño y código no diverjan.
- Una arquitectura hexagonal donde el dominio y los cálculos financieros sean puros y testeables, y la persistencia sea un adaptador sustituible.
- Componentes de UI sin acceso a datos y hooks headless que conecten casos de uso con las pantallas.
- Cobertura de los siete flujos aprobados en versión web, con estados de carga, vacío, error y datos insuficientes.

**Non-Goals:**

- App móvil React Native; se planifica en un cambio posterior. El monorepo deja sitio para `apps/mobile`, pero no se crea en este cambio.
- Backend, autenticación, sincronización, cifrado, pagos reales, push, widgets e invitaciones reales.
- Implementar las 27 pantallas del archivo; quedan fuera las superficies exclusivamente nativas (`M16`, `M15` como notificaciones del sistema) y las pantallas no incluidas en los flujos core (`M10`, `M14`, `M17`–`M19` se abordan como estados o fases posteriores cuando dependan de sync).
- Publicación en producción y elección de proveedor de hosting.

## Decisions

### 1. Estructura del monorepo

```
akari/
├── apps/
│   └── web/                 # Next.js (App Router), rutas y composición
├── packages/
│   ├── tokens/              # fuente única de tokens → CSS, Tailwind y tipos
│   ├── ui/                  # componentes React presentacionales
│   ├── domain/              # entidades, cálculos puros, puertos y casos de uso
│   └── data/                # adaptadores IndexedDB, migraciones, seed y copias
├── docs/
│   ├── diseno/              # se mantiene como fuente visual
│   └── desarrollo/          # arquitectura, puesta en marcha, convenciones y mapa
├── design/                  # archivos FigCraft/Figma
├── openspec/                # specs y cambios
└── package.json             # workspaces + scripts raíz
```

Se usa **npm workspaces** (sin herramienta extra de monorepo) para reducir dependencias y porque el repo no tiene necesidad de orquestación compleja. Alternativas descartadas: pnpm/turborepo (más potencia, más configuración para un solo equipo y una sola app) y repos separados (rompe la trazabilidad que motiva el cambio).

### 2. Stack de la app web

- **Next.js con App Router**, React y TypeScript en versiones estables al iniciar el apply.
- **Tailwind CSS** con tema derivado de `packages/tokens`; nada de estilos locales con colores literales.
- **Inter** autoalojada con `next/font`, `font-feature-settings: "tnum"` para importes.
- **date-fns** con locale `es` para fechas y recurrencias.
- **Dexie** como adaptador de IndexedDB: ofrece versionado de esquema y transacciones, que son requisitos de `producto/datos-locales`.
- **Vitest + Testing Library** para unidad y componentes; **Playwright + axe** para flujos end-to-end y accesibilidad.

No se añade librería de estado global: los hooks headless y el contexto de repositorios cubren el alcance local. Alternativa descartada: Redux/Zustand, que duplicaría el estado ya persistido.

### 3. Tokens: una fuente, tres salidas

`packages/tokens/src/tokens.ts` declara primitivos y semánticos con sus valores claro/oscuro. Un script de build genera:

1. `tokens.css` con variables CSS bajo `:root` y `[data-theme="dark"]`.
2. Un preset de Tailwind que expone `colors`, `spacing`, `radius`, `boxShadow`, `fontSize` y `transitionDuration` con nombres semánticos.
3. Tipos y mapas para los componentes que necesitan valores en TS (por ejemplo, tonos de badge).

Los componentes solo consumen nombres semánticos (`surface/default`, `text/primary`, `accent/default`), nunca primitivos ni hex. Una prueba compara el catálogo generado con las tablas de `docs/diseno/fundamentos.md` para detectar tokens añadidos o perdidos.

Alternativa descartada: escribir los tokens directamente en `tailwind.config`. Generaría dos fuentes de verdad y no permitiría validar paridad.

### 4. Tema y shell

- El tema se aplica con `data-theme` en `<html>`; un script inline mínimo lee la preferencia guardada antes del primer pintado para evitar destellos.
- Sin preferencia explícita se usa `prefers-color-scheme`.
- El shell tiene dos modos (`sidebar` y `header`) sobre las mismas rutas. El modo se guarda en ajustes y se expone como conmutador de demostración; no duplica páginas.
- La sidebar se expande con hover **y** con foco/click, para que la navegación sea operable por teclado. El panel expandido flota sobre el contenido, como indica el diseño.
- Por debajo de 1024 px se usa barra superior; por debajo de 768 px, barra inferior y una columna.

### 5. Arquitectura hexagonal y hooks headless

- `packages/domain` no importa React, Next ni Dexie. Contiene entidades, objetos de valor, cálculos (saldos, proyecciones, reparto, liquidación, cuotas) y las interfaces de repositorio (puertos).
- `packages/data` implementa los puertos con Dexie, define el esquema versionado, las migraciones, el seed y la exportación/importación.
- `apps/web` crea una instancia de los adaptadores, la inyecta por contexto y expone hooks headless (`useAccounts`, `useAccount`, `useMovements`, `useGroups`, `useGroupSettlement`, `useDashboard`, `useSettings`, `useOnboarding`). Los hooks devuelven datos, estado y acciones; no rendering.
- `packages/ui` es presentacional: recibe props y emite callbacks. No importa `packages/data` ni `packages/domain` salvo tipos de vista.

Esta separación permite testear los cálculos sin navegador y sustituir IndexedDB por SQLite en la futura app móvil sin tocar el dominio.

### 6. Modelo de datos

Todos los importes se guardan como **enteros en la unidad menor** de su divisa, con el código ISO de divisa. No se usa coma flotante para dinero.

| Entidad | Campos principales |
| --- | --- |
| `Account` | `id`, `name`, `type` (`personal`/`joint`/`deposit`), `currency`, `initialBalanceMinor`, `taeBps?`, `includeInTotal`, `members?`, `archivedAt?` |
| `Movement` | `id`, `accountId`, `type` (`expense`/`income`), `amountMinor`, `currency`, `date`, `concept`, `category`, `recurrenceId?`, `installmentPlanId?`, `groupExpenseId?`, `note?` |
| `Recurrence` | `id`, `accountId`, `type`, `amountMinor`, `concept`, `frequency`, `nextDate`, `endDate?` |
| `InstallmentPlan` | `id`, `accountId`, `totalMinor`, `installments`, `paidInstallments`, `firstDueDate`, `frequency`, `status` |
| `Group` | `id`, `name`, `currency`, `members[{id,name,role}]`, `createdAt` |
| `GroupExpense` | `id`, `groupId`, `payerMemberId`, `amountMinor`, `currency`, `exchangeRate?`, `accountId?`, `splitMode`, `shares[{memberId,amountMinor}]`, `date`, `concept` |
| `Transfer` | `id`, `groupId`, `fromMemberId`, `toMemberId`, `amountMinor`, `status` (`pending`/`settled`), `settledAt?` |
| `Settings` | `theme`, `shellMode`, `onboardingCompleted`, `demoLoaded` |

Reglas: el saldo de una cuenta es `initial + ingresos − gastos`; las proyecciones suman recurrencias e ingresos previstos y restan cuotas próximas; los totales agregados se agrupan por divisa y no se convierten entre divisas para el dashboard. El reparto grupal usa división entera y asigna el resto de forma determinista y visible. La conversión de un gasto guarda el tipo aplicado y no se recalcula después.

Preguntas rápidas: «mayor gasto del mes» devuelve el movimiento de gasto de mayor importe del periodo; «gastos evitables» suma las suscripciones activas y los movimientos de las categorías `Ocio` y `Compras`, se presenta como estimación y explica qué incluye. Si no hay datos suficientes para una pregunta, se muestra el estado informativo, nunca una cifra inventada.

### 7. Rutas y cobertura de flujos

| Ruta | Pantalla de referencia | Flujo |
| --- | --- | --- |
| `/onboarding` | `M01`–`M04` adaptadas | 0 · Onboarding local |
| `/` | `W01` | E · Resumen |
| `/cuentas/nueva` | `M06` reutilizada en web | A · Alta de cuenta |
| `/cuentas/[id]` | `W02` | E · Detalle |
| `/movimientos` | `W03` | B/E · Movimientos |
| `/movimientos/nuevo` | `M09` reutilizada en web | B · Registro |
| `/grupos` | índice de grupos | C/F · Grupos |
| `/grupos/[id]` | `W04` + `M12` | C · Gasto y liquidación |
| `/preguntas` | `W05` | D · Preguntas |
| `/ajustes` | `W06` | F · Datos |
| `not-found` | — | Ruta inexistente |

`W07` se valida como comportamiento responsive del shell, no como ruta propia. `W08` se valida con el modo `header` del mismo shell.

### 8. Documentación junto al código

`docs/diseno/` no se mueve: sigue siendo la fuente visual. Se añade `docs/desarrollo/` con:

- `arquitectura.md`: paquetes, dependencias permitidas y flujo de datos.
- `puesta-en-marcha.md`: requisitos, instalación, scripts y datos de ejemplo.
- `convenciones.md`: nombres, tokens, pruebas y reglas de PR.
- `mapa-diseno-codigo.md`: tabla pantalla → ruta → componentes → spec.
- `desviaciones.md`: cifrado, contraseña, sincronización y app móvil diferidos; exportación sin cifrar.

El `README.md` raíz pasa a describir el monorepo y enlaza diseño, specs y documentación de desarrollo. Las specs `producto/*` son el contrato de comportamiento; `docs/diseno/*` sigue siendo el contrato visual.

### 9. Estados y errores

Cada ruta define carga, vacío, error y datos insuficientes con componentes de `packages/ui` (`Skeleton`, `State/Page`, `Banner`, `Toast`). Los errores de persistencia se capturan en los hooks y se traducen a mensajes accionables. No se muestra un estado feliz vacío como si hubiera datos.

### 10. Pruebas

- Unidad de dominio: saldos, proyecciones, reparto con restos, liquidación, cuotas y conversión.
- Componentes: variantes, teclado, foco, errores de formulario y contraste de tokens.
- Integración de datos: migraciones, seed, exportación/importación y cuota agotada simulada.
- E2E: onboarding → cuenta → movimiento → resumen; gasto grupal → liquidación; preguntas; ajustes y reinicio. Cada flujo core recorre también un estado vacío o de error.

## Risks / Trade-offs

- **Alcance amplio para un cambio** → se implementan fundaciones y flujos core; el resto de pantallas y la app móvil quedan como fases posteriores con sus propias specs.
- **Deriva entre Figma y código** → tokens generados desde una fuente única, prueba de paridad contra `fundamentos.md` y mapa pantalla→ruta→componente.
- **Sin cifrado ni contraseña** → se registra como desviación explícita; no se deben introducir datos reales sensibles en esta fase; la exportación advierte que no está cifrada. El cambio futuro de cifrado deberá migrar el esquema.
- **IndexedDB no disponible o cuota agotada** → estados de error y exportación; nunca se simula un guardado exitoso.
- **Sidebar solo con hover** → se añade expansión por foco y click para teclado y táctil.
- **Divisas múltiples** → los totales se agrupan por divisa; no se inventa un tipo de cambio para el dashboard.
- **Iconos sin SVG exportado accesible** → se reconstruyen con la geometría documentada (24 px, trazo 1,75) y se anota la desviación si no coincide con el archivo.
- **Exceso de abstracción hexagonal para una app local** → se limita a cuatro paquetes y puertos pequeños; si una capa no aporta, el código de la app puede consumir casos de uso directamente.

## Migration Plan

1. Añadir configuración raíz de workspaces, TypeScript, lint y scripts, sin tocar `design/`, `docs/` ni `openspec/`.
2. Crear `packages/tokens`, `packages/ui`, `packages/domain` y `packages/data` con sus pruebas.
3. Crear `apps/web` con shell, rutas y datos de ejemplo; verificar los flujos core en local.
4. Añadir `docs/desarrollo/`, actualizar `README.md` y enlazar el mapa de implementación desde `docs/diseno/estado.md`.
5. Rollback: al no haber backend ni migración de datos externos, revertir el commit deja el repositorio en su estado de diseño; los datos locales de prueba se pueden borrar desde ajustes.

## Open Questions

- Proveedor de despliegue y dominio: se decide al publicar; no afecta a specs ni a la descomposición de tareas.
- Momento de introducir cifrado y sincronización: requiere un cambio propio con migración de datos y revisión de seguridad.
