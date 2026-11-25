# Proposal

## Why

Los campos de opción única usan el `<select>` nativo: el chevron lo dibuja el sistema operativo y, al abrir, aparece el desplegable del navegador con un aspecto distinto en cada plataforma. Eso impide reproducir el `Select/Field` aprobado (caja de 48 px con chevron propio que gira en Abierto) y rompe la coherencia visual del resto de componentes.

## What Changes

- Se crea un selector de opción única propio en `packages/ui` que dibuja el disparador, el chevron y el panel de opciones dentro de la aplicación, sin desplegable nativo.
- `SelectField` y `SelectPill` pasan a usar ese selector y conservan sus etiquetas visibles, ayuda, error, obligatoriedad y estado deshabilitado.
- El disparador muestra un chevron propio que gira al abrir; el panel replica los estados Cerrado, Abierto y Error del diseño y respeta movimiento reducido.
- Se añade paridad de teclado y lector de pantalla: flechas, Home/End, Enter/Espacio, Escape, Tab, búsqueda por teclado y cierre al pulsar fuera, con foco visible y `aria-expanded`/`aria-activedescendant`.
- **BREAKING** (API interna de `packages/ui`): `SelectField` deja de recibir `onChange` con evento nativo y pasa a `onValueChange(value: string)`; se actualizan todas las pantallas que lo usan.
- Se actualizan las pruebas de componentes y E2E que hoy usan `selectOption` del navegador.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `producto/componentes`: se añade el comportamiento del selector de opción única con panel propio, sus estados y su navegación accesible.

## Impact

- `packages/ui/src/fields.tsx`: nuevo selector, `SelectField` y `SelectPill`.
- `packages/ui/src/icons.tsx`: icono de chevron hacia abajo.
- `packages/ui/src/fields.test.tsx` y `packages/ui/src/accessibility.test.tsx`: cobertura de estados, teclado y axe.
- Pantallas de `apps/web` que usan `SelectField`: `account-form`, `movement-form`, `movement-edit-dialog`, `group-form`, `group-expense-form`, `group-detail`.
- `e2e/*.spec.ts`: interacción con opciones mediante clic en lugar de `selectOption`.
- Sin cambios en `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`; el cambio implementa el `Select/Field` ya aprobado.
