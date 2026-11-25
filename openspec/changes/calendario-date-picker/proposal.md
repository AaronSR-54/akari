# Proposal

## Why

Los campos de fecha de la app usan el `<input type="date">` nativo, así que su aspecto y su comportamiento dependen del navegador y del sistema: el icono, el panel, el formato visible y la navegación cambian entre Chrome, Safari y Firefox, y no siguen el lenguaje visual de Akari. El selector de opción única ya resolvió el mismo problema con un panel propio; el campo de fecha es la última pieza de formulario que sigue delegando en la interfaz del navegador.

## What Changes

- Nuevo componente `Calendar` en `packages/ui`: rejilla mensual dibujada por la aplicación, con cabecera de mes y año, flechas de mes anterior y siguiente, y acción «Hoy».
- `DateField` pasa a ser un control propio: un disparador con la fecha formateada (`dd MMM yyyy`, en español) y un icono de calendario que abre el panel del `Calendar`, sin `input type="date"` nativo.
- **BREAKING** (interna de `@akari/ui`): `DateField` deja de aceptar los atributos de `<input>` y pasa a `value` + `onValueChange` con la fecha de negocio `YYYY-MM-DD`, igual que `SelectField` con `value` + `onValueChange`.
- El panel es operable con ratón, toque y teclado: flechas para moverse por días y semanas, PageUp/PageDown para cambiar de mes, Inicio/Fin de semana, Enter para elegir, Escape para cerrar y devolver el foco al disparador.
- Se migran los tres formularios que usan fecha: alta de movimiento, edición de movimiento y gasto grupal.
- Se registra en `docs/desarrollo/desviaciones.md` la diferencia respecto al diseño congelado (el diseño solo define `Field/Date` como caja con icono de calendario; el panel mensual es una decisión técnica).

## Capabilities

### New Capabilities

### Modified Capabilities

- `producto/componentes`: se añade el requisito de campo de fecha con calendario propio, sin selector nativo del navegador, con formato localizado y navegación por teclado y lector de pantalla.

## Impact

- `packages/ui/src/fields.tsx`: `DateField` cambia de API y de implementación.
- `packages/ui/src/calendar.tsx` (nuevo): componente de rejilla mensual y sus utilidades de fecha.
- `packages/ui/src/index.ts`: exporta `Calendar` y los tipos nuevos.
- `packages/ui/src/fields.test.tsx` y una prueba nueva del calendario: apertura, elección, cierre sin cambios, teclado, mes anterior/siguiente y «Hoy».
- `apps/web/src/components/forms/movement-form.tsx`, `apps/web/src/components/movement-edit-dialog.tsx` y `apps/web/src/components/forms/group-expense-form.tsx`: adaptan el campo a `value`/`onValueChange`.
- `e2e/accounts-movements.spec.ts` y `e2e/groups.spec.ts` (o el E2E que cubra cada formulario): el flujo de elegir fecha deja de depender del control nativo.
- Sin cambios en `domain`, `data`, `tokens` ni en los datos almacenados. `packages/ui` no gana dependencias: el calendario trabaja con `Date` nativo e `Intl.DateTimeFormat` con locale `es` para formatear la fecha visible.
