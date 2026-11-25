# Tasks

## 1. Sidebar superpuesta

- [x] 1.1 Posicionar `Sidebar` como panel fijo (`fixed left-4 top-4 z-40`) y reservar 76 px en el flex de `app-shell.tsx`; verificar que el ancho y la posición de `main` no cambian al pasar de compacta a expandida.
- [x] 1.2 Añadir a `e2e/shell.spec.ts` una prueba que mida la sidebar en 76 px y 240 px y confirme que el contenido no se desplaza con el hover; verificar que pasa con `npm run e2e:worktree`.
- [x] 1.3 Verificar que las pruebas E2E existentes de navegación fija al hacer scroll y de expansión por foco siguen pasando con `npm run e2e:worktree`.

## 2. Tamaños unificados de navegación

- [x] 2.1 Igualar el logotipo expandido a M (40 px) en `Sidebar`, `HeaderNav`, `TabletHeader` y `MobileTopBar`; verificar en E2E que el glifo mide 40 px en escritorio.
- [x] 2.2 Igualar los ítems de navegación a h-11 (44 px) y el avatar a md (40 px) en sidebar, header y tablet, conservando `min-h-11` en la barra inferior móvil; verificar en E2E que no aparece desbordamiento horizontal a 1280 px.
- [x] 2.3 Actualizar `sidebar.test.tsx` para cubrir los tamaños unificados y verificar que pasa con `npm test`.

## 3. Documentación y verificación de integración

- [x] 3.1 Registrar la desviación visual en `docs/desarrollo/desviaciones.md` y verificar con `git status` que no se tocan `docs/diseno/`, `design/` ni `openspec/specs/diseno/`.
- [x] 3.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`, y verificar que todos pasan sin errores.
- [x] 3.3 Ejecutar la suite completa de `npm run e2e:worktree` y verificar que pasa.

## 4. Panel flotante con sombra y sidebar fijada

- [x] 4.1 Añadir sombra `elevation-3` y velo `bg-overlay-scrim/20` solo cuando el panel flota por hover o foco; verificar en E2E que el velo aparece al hacer hover y desaparece al colapsar.
- [x] 4.2 Elevar el estado `pinned` a `app-shell.tsx` y hacer que el spacer reserve 240 px cuando la sidebar esté fijada abierta, sin velo; verificar en E2E que el contenido se ensancha y se desplaza 164 px al fijar.
- [x] 4.3 Actualizar `sidebar.test.tsx` para las nuevas props de `Sidebar` y verificar que `npm test` pasa.

## 5. Ajuste fino del logotipo

- [x] 5.1 Reducir el logotipo de navegación de 40 px a 32 px con un contenedor `scale-[0.8]` en `sidebar.tsx` (los worktrees resuelven `@akari/ui` contra `main`) y verificar en E2E que mide 32 px en sidebar y header y que `npm test` pasa.

## Workflow follow-up

- Archivar el change en la rama `feat/fix-sidebar` y abrir la PR contra `main` siguiendo `AGENTS.md`.
- Mover las tarjetas `c085qqmjex7u` y `s2du40zg6zju` a `DONE` con `node scripts/kan-sync.mjs done fix-sidebar --pr <url>`.
