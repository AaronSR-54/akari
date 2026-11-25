# Proposal

## Why

La gráfica de evolución del saldo del dashboard ocupa todo el ancho de su columna: el área ámbar arranca y termina pegada a los bordes y la línea es una polilínea con aristas vivas. Sin espacio lateral no se puede redondear el inicio del área, y la línea usa tinta, que cambia con el tema y no coincide con el acento mostaza del hero. La tarjeta `z69iv2q63eie` pide padding inline, extremos redondeados y una línea más suave; la persona responsable ha confirmado que la línea SHALL ser siempre mostaza en ambos modos, descartando el teñido rojo/verde por subidas y bajadas que también sugería la tarjeta.

## What Changes

- Separa el trazado y el área de los bordes laterales del bloque con un inset horizontal de 8 px, sin reducir el área interactiva ni alterar la altura de la gráfica.
- Redondea el área en ambos extremos, también cuando el mes está completo; desaparece la excepción que solo redondeaba el final en meses abiertos.
- Suaviza la línea continua con curvas, conservando el punto más alto en el borde superior y el recorrido diario por puntero y teclado.
- Fija el color de la línea en el acento mostaza (`--color-accent-default`) tanto en tema claro como en oscuro. No se aplica color por signo de movimiento.
- Cambia el fondo del panel de detalle que aparece al recorrer la gráfica: usa el mismo fondo que los bloques de cuenta del dashboard (`--color-surface-sunken`) en lugar del fondo invertido, con texto y borde que mantengan la legibilidad en ambos temas.
- Actualiza las pruebas unitarias y E2E, la spec de comportamiento y el registro de desviaciones.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `producto/dashboard-hero`: cambia la forma de los extremos del área y el color de la línea de la evolución del saldo.

## Impact

- `packages/ui/src/month-balance.tsx` y `packages/ui/src/month-balance.test.tsx`.
- `e2e/dashboard.spec.ts`.
- `openspec/specs/producto/dashboard-hero/spec.md` (sync al archivar).
- `docs/desarrollo/desviaciones.md`.
- Sin tokens nuevos: se reutiliza `--color-accent-default`. Sin cambios en datos, puertos ni APIs.
