# Tasks

## 1. Alineación del círculo en `Logo`

- [x] 1.1 Apoyar el círculo en la línea base como punto final en los formatos `initial` y `expanded` de `packages/ui/src/logo.tsx` (`items-baseline` con `translate-y-[1px]` de ajuste visual en el círculo); verificado con `npx vitest run packages/ui/src/logo.test.tsx`.
- [x] 1.2 Ampliar `packages/ui/src/logo.test.tsx` para comprobar que el círculo conserva `bg-accent-default`, sigue a la derecha del glifo y usa la alineación de línea base en ambos formatos, sin `items-start`, `items-end`, `mt-[0.18em]` ni `-translate-y-1/2`; verificado con `npx vitest run packages/ui/src/logo.test.tsx`.

## 2. Favicon con el icono compacto

- [x] 2.1 Reemplazar `apps/web/app/icon.svg` por el icono compacto sin fondo y en grande (trazo 20×64, círculo r=11): trazo de la «ı» con color adaptativo (`prefers-color-scheme`) y círculo ámbar a su derecha y 1 unidad bajo su línea base, con `viewBox="0 0 96 96"` y `aria-label="akari"`; verificado inspeccionando el SVG servido en el frontal.
- [x] 2.2 Crear `apps/web/src/favicon.test.ts` que lea `app/icon.svg` y verifique que contiene el trazo y el círculo ámbar, que no hay rectángulo de fondo, que la base del círculo queda 1 unidad bajo la base del trazo y a su derecha, y que ya no aparece el monograma «a»; verificado con `npx vitest run apps/web/src/favicon.test.ts`.

## 3. Verificación en navegador, documentación y cierre

- [x] 3.1 Añadir en `e2e/shell.spec.ts` una comprobación de que, en la sidebar colapsada a 1440 px, el centro del círculo queda por debajo del centro del glifo, a su derecha y con la base coincidiendo con la del glifo, y de que el logotipo sigue midiendo 32 px; verificado con `npm run e2e:worktree`.
- [x] 3.2 Registrar en `docs/desarrollo/desviaciones.md` la nueva altura del círculo y el favicon compacto, con motivo y consecuencia, sin tocar `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`; verificado con `git diff --name-only`.
- [ ] 3.3 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e:worktree`; verificado con que los cinco comandos terminan sin errores. (Pendiente: solo falla `e2e/a11y.spec.ts` «la modal de detalle», un contraste en botones deshabilitados ajeno al change e inestable entre pasadas; merece tarjeta propia.)

## Workflow follow-up

- Ejecutar `npm run preview:worktree:stop` y archivar el change cuando la revisión lo permita.
- Abrir la PR con `node scripts/kan-sync.mjs pr-body logo-dot-favicon` como borrador y `gh pr create --base main`, sin mergear.
- Ejecutar `node scripts/kan-sync.mjs done logo-dot-favicon --pr <url>` para mover las dos tarjetas a `DONE`.
