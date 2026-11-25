# Tasks

## 1. Identidad compartida y navegación

- [x] 1.1 Extraer `displayName`, `initials` y el subtítulo «Cuenta local» a un módulo de identidad en `apps/web/src/lib/` y consumirlo desde `sidebar.tsx`; verificar que `npm run typecheck` termina sin errores y que el shell sigue mostrando un único avatar por variante.
- [x] 1.2 Quitar «Ajustes» de `navItems` en `apps/web/src/components/nav.ts`, conservando `routeTitles['/ajustes']`; añadir en `sidebar.test.tsx` una aserción de que los enlaces de la navegación principal son solo Resumen, Movimientos y Grupos.

## 2. Acceso a ajustes desde el avatar

- [x] 2.1 Envolver el avatar en un `Link` a `/ajustes` con `aria-label="Ajustes"` y anillo de foco visible en `Sidebar`, `HeaderNav`, `TabletHeader` y `MobileTopBar`, sin cambiar el `role="img"` ni el tamaño de 40 px; verificar en `sidebar.test.tsx` que cada variante expone el enlace y conserva la imagen con nombre «Marta».
- [x] 2.2 Añadir en `e2e/shell.spec.ts` un caso que active el avatar en sidebar, en header, en tablet y en móvil, y compruebe que se abre `/ajustes`; verificar que pasa en ambos proyectos de Playwright.

## 3. Panel unificado y título

- [x] 3.1 Añadir una tarjeta «Perfil» en `apps/web/src/components/pages/settings.tsx` con el avatar y la identidad compartida, sin persistencia nueva; verificar en E2E que al entrar desde el avatar se ve la sección con el mismo nombre que en el shell.
- [x] 3.2 Cambiar `PageTitle` y `PageHeaderResponsive` de `/ajustes` a «Ajustes» con subtítulo sobre perfil y datos locales, y actualizar las aserciones de `e2e/shell.spec.ts` que esperaban «Datos y sincronización»; verificar `h1` único en escritorio, separación mínima en móvil y título de página correcto.

## 4. Documentación y verificación

- [x] 4.1 Registrar en `docs/desarrollo/desviaciones.md` la desviación respecto al diseño congelado (avatar como acceso y retirada de «Ajustes» de la nav) con su motivo; verificar que la entrada queda fuera de `docs/diseno/`.
- [x] 4.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run e2e:worktree`; verificar que los cinco comandos terminan sin errores y que el frontal de preview sigue accesible.

## 5. Afordancia y nombre editable

- [x] 5.1 Añadir `displayName?: string` a `Settings` con valor por defecto en `defaultSettings` y el caso de uso `updateProfileName` con validación de longitud en `packages/domain/src/services.ts`; verificar con tests de dominio y de repositorio que el nombre válido persiste y que el vacío o demasiado largo se rechaza sin alterar los ajustes.
- [x] 5.2 Sustituir las constantes por `defaultProfile` y `initialsFromName` en `apps/web/src/lib/profile.ts`, pasar `displayName` desde `AppShell` a las cuatro variantes del shell y añadir el hover con `title="Ajustes"` en los enlaces del avatar; verificar `npm run typecheck` y los tests unitarios del shell.
- [x] 5.3 Añadir en `/ajustes` un botón «Editar» que abra un modal con `TextField` para guardar el nombre mediante el caso de uso, con mensaje de éxito y de error; verificar en E2E que el cambio se ve en el panel y en el avatar y persiste tras recargar.
- [x] 5.4 Actualizar la entrada 21 de `docs/desarrollo/desviaciones.md` con la afordancia y la edición del nombre, y ejecutar `openspec validate user-button-settings`; verificar que no aparecen cambios en `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
- [x] 5.5 Repetir la verificación completa (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run e2e:worktree`) y confirmar que el frontal de revisión sigue accesible.

## Workflow follow-up

- Archivar el change y abrir la PR siguiendo el flujo de `AGENTS.md`; no mergear la PR.
