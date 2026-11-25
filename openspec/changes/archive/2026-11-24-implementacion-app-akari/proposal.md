# Proposal

## Why

El diseño de akari está aprobado y documentado (F0–F4, iteraciones v1.1–v1.4), pero sigue viviendo solo en FigCraft, `docs/diseno/` y las specs de diseño. Sin código de producto, el contrato visual no se puede validar en ejecución, las decisiones de tokens y componentes no tienen una implementación de referencia y cada pantalla futura corre el riesgo de reinterpretar el diseño a mano. Este cambio convierte ese contrato en una aplicación web real, dentro del mismo repositorio, para que diseño, documentación, specs y código evolucionen juntos.

## What Changes

- Convertir el repositorio en un **monorepo** con `apps/web` (Next.js), `packages/tokens`, `packages/ui`, `packages/domain` y `packages/data`, conservando `design/`, `docs/` y `openspec/` en la raíz.
- Implementar los **fundamentos visuales** de `docs/diseno/fundamentos.md` como tokens reales (CSS variables + preset de Tailwind), con temas claro/oscuro, tipografía Inter, escala UI/editorial, espaciado, radios, elevación, iconografía y movimiento reducido.
- Construir la **librería de componentes** del design system en React con las variantes y estados documentados en `docs/diseno/componentes.md`, incluyendo accesibilidad (foco visible, 44 px, etiquetas) y sin valores hardcodeados.
- Implementar el **shell web** de `docs/diseno/flujos-web.md`: sidebar compacta/expandible, header superior alternativo, breakpoints, deep links y atajos de teclado.
- Implementar los **flujos core** en web con datos locales reales: onboarding local, alta y detalle de cuentas, movimientos y suscripciones, plazos, dashboard y preguntas rápidas, gasto grupal y liquidación, y ajustes de datos. Se reutilizan los patrones de `M06`/`M09` dentro del shell web.
- Crear una **capa de dominio y datos local-first** (arquitectura hexagonal, hooks headless) con persistencia en el navegador, migraciones y datos de ejemplo; sin backend, autenticación, sincronización ni cifrado en esta fase.
- Reorganizar la **documentación** para que acompañe al código: `docs/diseno/` se mantiene como fuente de verdad visual y se añade `docs/desarrollo/` (arquitectura, puesta en marcha, convenciones y mapa diseño→código), con el `README.md` actualizado al monorepo.
- **BREAKING (organización del repo)**: la raíz deja de ser solo un proyecto de diseño; aparecen workspaces de código y scripts de build/test. No se elimina ni se reescribe el diseño existente.
- **Fuera de alcance**: implementación móvil React Native, backend, autenticación, sincronización en tiempo real, cifrado de la base local, pagos reales, push y widgets nativos. La app móvil se planifica en un cambio posterior reutilizando `packages/tokens` y `packages/ui`.

## Capabilities

### New Capabilities

- `producto/fundaciones-ui`: tokens, theming claro/oscuro, tipografía, layout, iconografía y movimiento implementados en código con paridad respecto a los fundamentos de diseño.
- `producto/componentes`: librería de componentes React reutilizables con variantes, estados y accesibilidad equivalentes al design system de Figma.
- `producto/shell-web`: navegación y estructura responsive de la aplicación web, incluidos sidebar, header alternativo, breakpoints, deep links y atajos.
- `producto/finanzas-personales`: cuentas personales/conjuntas/de depósito, movimientos, suscripciones, ingresos periódicos, plazos, dashboard y preguntas rápidas sobre datos locales.
- `producto/gastos-grupales`: grupos, gasto compartido con reparto editable, liquidación entre participantes y reglas de cuenta de cobro.
- `producto/datos-locales`: persistencia local-first, inicialización del espacio de datos, migraciones, datos de ejemplo y comportamiento sin conexión.

### Modified Capabilities

- Ninguna. Las specs `diseno/*` siguen describiendo el archivo de Figma y el contrato visual; este cambio las consume como fuente, no las reescribe.

## Impact

- **Código nuevo**: `apps/web`, `packages/tokens`, `packages/ui`, `packages/domain`, `packages/data`, configuración de workspaces, TypeScript, lint, test y build.
- **Documentación**: nuevo `docs/desarrollo/`; actualización de `README.md`, `docs/diseno/estado.md` (siguiente paso y desviaciones) y enlaces desde `docs/diseno/handoff.md` al mapa de implementación.
- **Specs**: seis capacidades nuevas bajo `openspec/specs/producto/*`; las specs `diseno/*` no cambian.
- **Dependencias**: Next.js, React, Tailwind CSS, TypeScript, una capa de persistencia local (IndexedDB) y utilidades de test. La elección concreta se fija en `design.md`.
- **Datos**: se persisten cuentas, movimientos y grupos en el navegador; no hay servicios remotos ni credenciales.
- **Riesgos**: desviación deliberada del diseño al no implementar cifrado ni sincronización todavía (se documenta en `docs/desarrollo/` y en el diseño del cambio); alcance amplio de pantallas que se acota a los flujos core y deja el resto como fases posteriores.
