# Proposal

## Why

Akari es un proyecto greenfield y su producto ya está esbozado en `docs/Esqueleto - Ideas varias.canvas`: gestión de cuentas personales y conjuntas, gastos grupales proporcionales, compartición social, datos cifrados y experiencia mobile-first. Implementar directamente en código sin una base visual acordada produciría inconsistencia entre móvil y web, retrabajo en cada pantalla y decisiones de UX tomadas a mitad de la implementación.

Diseñar primero en Figma permite validar la arquitectura visual, los flujos y los estados de la interfaz antes de escribir código, y deja un contrato reutilizable (tokens y componentes) para los cambios de implementación posteriores.

## What Changes

- Crear en el design file de Figma de akari un **design system** con tokens de color, tipografía, espaciado, radios, elevación y iconografía, publicados como variables y estilos reutilizables (nada hardcodeado).
- Construir una **librería de componentes** reutilizables con variantes y estados: navegación, botones, campos, listas, tarjetas de cuenta, movimientos, gráficos, modales, hojas, banners y estados vacíos/error/carga.
- Diseñar los **flujos y pantallas móviles** (mobile-first) que cubren el alcance del canvas: onboarding, cuentas, detalle de cuenta, movimientos, suscripciones e ingresos periódicos, gastos grupales, dashboard con preguntas rápidas (shortQuestions), compartición de cuentas, notificaciones y ajustes de datos/sincronización.
- Diseñar las **adaptaciones web responsive** de esos mismos flujos, reutilizando el design system y documentando las diferencias de layout.
- Documentar el **handoff**: organización de páginas, convención de nombres, anotaciones de comportamiento, estados interactivos y prototipo navegable para los flujos clave.
- **Fuera de alcance**: implementación en Next.js/React Native, backend, sincronización SQL, cifrado, autenticación, widgets nativos y cualquier cambio de código de producto. Esos entregables se planificarán en cambios posteriores.

## Capabilities

### New Capabilities

- `diseno/design-system`: fundamentos visuales y librería de componentes reutilizables de akari, con tokens como variables de Figma, variantes, estados y reglas de uso.
- `diseno/pantallas-movil`: flujos y pantallas mobile-first de la app, incluyendo estados de carga, vacío, error y casos límite.
- `diseno/pantallas-web`: adaptación responsive de los flujos aprobados para web, reutilizando el design system y documentando diferencias de layout.
- `diseno/handoff`: organización, nomenclatura, anotaciones y prototipo que hacen el diseño consumible por implementación.

### Modified Capabilities

- Ninguna. El proyecto no tiene specs principales todavía.

## Impact

- **Archivo Figma**: design file de akari (el `fileKey` se confirmará al inicio del apply; si el archivo ya contiene un design system, se reutilizará y extenderá en lugar de duplicarlo).
- **Documentación**: `docs/` y artefactos del cambio; no se toca código de producto.
- **Dependencias**: Figma MCP/plugin para escribir en el archivo; el canvas `docs/Esqueleto - Ideas varias.canvas` como fuente de alcance.
- **Riesgos**: alcance amplio para una sola fase de diseño; se mitiga con un orden por flujos y con la regla de no diseñar pantallas sin requisito trazable. La ausencia del enlace del archivo al planificar se resuelve como entrada obligatoria del apply.
