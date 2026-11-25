# Design

## Context

Ver `proposal.md` para la motivación. El saludo del resumen se publica hoy en dos sitios a la vez: `PageHeaderResponsive` lo renderiza en el contenido y, vía contexto `PageTitleContext`, lo replica `DesktopHeader` en escritorio (modo sidebar) con su `meta` debajo. `PageHeader` ya tiene `hideTitleAtLg` para no duplicar el `h1` en escritorio; no existe hoy una forma de ocultar solo el bloque de título en móvil sin perder las `actions`. La fecha y el recuento de cuentas ya se calculan en `dashboard.tsx` (`formatFullDate()`, `overview.accounts.length`) y el helper `plural` ya está disponible en el mismo archivo.

## Goals / Non-Goals

**Goals:**

- Reutilizar el contexto existente para que `DesktopHeader` y `document.title` sigan recibiendo el saludo sin lógica nueva por pantalla.
- Hacer el cambio gradual: dashboard primero, resto de pantallas después de revisar el frontal.
- Mantener los selectores y la semántica del hero (`data-hero`, `aria-labelledby`) intactos.

**Non-Goals:**

- Cambiar `formatFullDate` ni añadir formateadores nuevos.
- Tocar `domain`, `data`, `tokens` ni el modelo de dinero/fechas.
- Modificar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*` (diseño congelado).
- Rediseñar `DesktopHeader`, `HeaderNav`, `TabletHeader` ni `MobileTopBar`.

## Decisions

**1. El saludo deja de pasar `meta` en el dashboard.** `DesktopHeader` ya centra verticalmente su contenido con `justify-center`; al quitar el subtítulo, el `h1` queda centrado en la barra de 72 px sin cambiar CSS. Alternativa descartada: ajustar paddings o altura de la cabecera, que afectaría a todas las pantallas y al requisito de separación mínima de 24 px con el contenido.

**2. Ocultar el encabezado en móvil desde `apps/web`, sin tocar `packages/ui`.** En los worktrees `node_modules` apunta al checkout principal, así que `@akari/ui` se resuelve contra `main` (tarjeta `n2o41aqe20y8`): una prop nueva en `PageHeader` no llegaría a la web. El dashboard envuelve `PageHeaderResponsive` en un `div` con `hidden md:block`, de modo que el saludo no se renderiza visualmente en móvil pero el componente sigue montado y publica el título en `PageTitleContext` para `DesktopHeader`. En el estado vacío, las `actions` se extraen a una variable y se pintan además en un bloque `md:hidden` para que sigan accesibles en móvil. Alternativa descartada: parchear el symlink de `node_modules`, que dejaría la preview y los tests dependientes de un cambio local no versionado. Resultado: el saludo se ve en tablet (contenido) y en escritorio (`DesktopHeader`), y no se ve en móvil.

**3. La fecha y el recuento viven en el cuerpo.** La fecha se concatena al rótulo existente de `Saldo total`; el recuento se concatena al `title` del `SectionHeader` de cuentas usando `plural` para singular/plural. Alternativa descartada: mantenerlos como subtítulo en el contenido, que es justo lo que el usuario considera redundante en móvil.

**4. El estado vacío sigue el mismo patrón.** Se conservan sus `actions` en móvil y se mueve el aviso «datos en este dispositivo» a la descripción del `StatePage`; el texto «Aún no hay cuentas» se retira por redundante con el propio estado vacío.

**5. Pruebas.** `seedDemo` deja de comprobar el saludo (oculto en móvil) y espera el hero del resumen, presente en todos los viewports. Se añaden aserciones E2E para el `h1` sin subtítulo en escritorio, la ausencia del encabezado en móvil y las dos etiquetas nuevas. Se actualizan los tests que buscaban el encabezado «Cuentas» con match exacto.

## Risks / Trade-offs

- [El helper `seedDemo` falla en mobile-web] → cambiar la espera por `[data-hero="balance"]`, que está en los tres viewports.
- [En móvil el resumen se queda sin `h1` visible] → decisión explícita del usuario; el `h1` sigue existiendo en tablet y en la cabecera fija de escritorio, y las secciones del cuerpo conservan sus `h2`.
- [El match exacto de «Cuentas» en E2E deja de coincidir] → usar un matcher por prefijo y añadir la comprobación del recuento.
- [El título del documento podría cambiar] → `PageTitle` sigue fijando `Resumen · akari`; `PageHeaderResponsive` solo alimenta el contexto de la cabecera, no `document.title`.
- [El wrapper `hidden md:block` añade un nivel al `Stack`] → el `div` oculto no ocupa hueco ni genera gap en móvil, y el `<header>` interno conserva su composición en `md` y `lg`.
- [Las acciones del estado vacío se renderizan en dos sitios] → se comparten desde una sola variable y solo una de las dos copias es visible en cada breakpoint.

## Migration Plan

Sin migración de datos: es un cambio solo de presentación. Despliegue directo; rollback consiste en revertir el commit del change.

## Open Questions

- El alcance concreto del resto de pantallas se definirá después de revisar el frontal del dashboard; no altera las specs ni el enfoque aquí descritos.
