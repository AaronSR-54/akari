# Tasks

## 1. Tokens con canales alfa

- [x] 1.1 Emitir `--color-<token>-rgb` por tema en `packages/tokens/scripts/generate.ts` y mapear el preset a `rgb(var(--color-<token>-rgb) / <alpha-value>)`; verificar que `npm run build -w @akari/tokens` regenera `generated/` con ambos valores.
- [x] 1.2 Añadir en `packages/tokens/src/tokens.test.ts` una prueba de que los canales RGB corresponden al hexadecimal de cada color semántico y verificar con `npm test -w @akari/tokens`.

## 2. Scrim y bloqueo de scroll

- [x] 2.1 Aplicar en `packages/ui/src/feedback.tsx` la atenuación real del scrim con `overlay/scrim` al 50 % y desenfoque de fondo; verificar en `npm test -w @akari/ui` que el scrim conserva las clases y el clic fuera sigue cerrando.
- [x] 2.2 Bloquear el scroll en `body` y `html` guardando y restaurando ambos valores, incluido el caso de overlays superpuestos; verificar con una prueba de `feedback.test.tsx` que `overflow` pasa a `hidden` al abrir y se restaura al cerrar.
- [x] 2.3 Añadir en E2E la comprobación de scrim atenuado/difuminado y de `window.scrollY` constante ante la rueda con un modal abierto; verificar con `npx playwright test` sobre el spec correspondiente.

## 3. Documentación y verificación

- [x] 3.1 Registrar en `docs/desarrollo/desviaciones.md` que el desenfoque del fondo no está definido en el diseño congelado y que lo introduce esta tarjeta; verificar que la entrada cita el change y el motivo.
- [x] 3.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y la suite E2E con un solo worker (el título intermitente se sigue en la tarjeta `qc3mdwfjlcwa`, ajena a este change); verificar que los cinco terminan sin errores.
- [x] 3.3 Revisar `git status` y confirmar que no se incluyen `docs/diseno/`, `design/`, `openspec/specs/diseno/*` ni `.env`.

## Workflow follow-up

- Archivar el change con `openspec archive` tras la revisión.
- Abrir la PR con `node scripts/kan-sync.mjs pr-body difuminar-fondo-modales` como borrador y `gh pr create --base main`.
- Cerrar el seguimiento con `node scripts/kan-sync.mjs done difuminar-fondo-modales --pr <url>`.
