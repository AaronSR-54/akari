# Tasks

## 1. Compositor global de movimientos

- [x] 1.1 Crear `MovementComposerProvider` y `useMovementComposer` en `apps/web/src/components/movement-composer.tsx`, con `open({ accountId? })` y un único `MovementDialog`; verificar que `npm run typecheck` compila el componente.
- [x] 1.2 Montar el provider en `AppShell` por encima de `AppShellInner`; verificar que el resumen y la barra móvil pueden abrir el modal sin errores en `npm run dev:worktree`.
- [x] 1.3 Migrar `/movimientos` del estado `creating` y su `MovementDialog` local a `useMovementComposer()`; verificar que el alta desde el listado sigue abriendo un solo diálogo y que la edición conserva `MovementEditDialog`.
- [x] 1.4 Exportar `ActionButton` desde `action-link.tsx` con las clases de `ActionLink`; verificar que `npm run lint` no detecta imports ni props sin usar.

## 2. Accesos migrados y ruta retirada

- [ ] 2.1 Cambiar los accesos del resumen (estado vacío, primeros pasos, píldora «Nuevo movimiento», pago recurrente) a `ActionButton` + `openMovement`; verificar en E2E que la URL no cambia y que el diálogo «Nuevo movimiento» aparece.
- [ ] 2.2 Cambiar la acción central de `MobileNav` y los accesos del detalle de cuenta y de preguntas rápidas al compositor; verificar que abren el modal y, cuando corresponde, con la cuenta preseleccionada.
- [x] 2.3 Eliminar `apps/web/app/(app)/movimientos/nuevo/page.tsx` y `apps/web/src/components/pages/new-movement.tsx`; verificar que `grep -rn "movimientos/nuevo" apps e2e` no devuelve referencias y que la URL muestra la página de no encontrado.
- [ ] 2.4 Actualizar `e2e/dashboard.spec.ts`, `e2e/shell.spec.ts` y `e2e/date-picker.spec.ts` para abrir el modal en lugar de navegar a la ruta; verificar que las pruebas afectadas pasan.
- [x] 2.5 Actualizar `docs/desarrollo/arquitectura.md`, `docs/desarrollo/mapa-diseno-codigo.md` y `docs/desarrollo/desviaciones.md` para reflejar el modal global y la retirada de la ruta; verificar que no quedan enlaces a `/movimientos/nuevo` en la documentación de desarrollo.

## 3. Marca en la modal de acceso

- [x] 3.1 Añadir `Logo` de `@akari/ui` en `CloudAuthDialog` antes de `CloudAuthForm`; verificar que la modal del onboarding muestra la marca y mantiene título, pestañas y formulario.
- [x] 3.2 Revisar `/entrar` y `CloudAuthForm` para no duplicar el logo dentro de la ruta; verificar que la ruta dedicada mantiene una sola marca y el formulario compartido.
- [x] 3.3 Actualizar `docs/desarrollo/nube-supabase.md` con la marca de la modal; verificar que la sección de onboarding y ajustes describe el comportamiento real.

## 4. Detalle de movimiento en modo lectura

- [x] 4.1 Añadir `disabled` a `SegmentedControl` en `packages/ui/src/segmented.tsx` y pasarlo desde `MovementForm`; verificar con una prueba de componente o E2E que el tipo no cambia en modo lectura.
- [x] 4.2 Añadir la prop `readOnly` a `MovementForm` y deshabilitar tipo, importe, cuenta, miembro, concepto, fecha, categoría, nota y repetición; verificar que no se puede guardar desde el modo lectura.
- [ ] 4.3 Sustituir la ficha de `MovementDetailDialog` por `MovementForm` en modo lectura, manteniendo «Eliminar» y «Editar» en el pie; verificar que Editar abre el formulario editable y que al guardar vuelve al detalle.
- [ ] 4.4 Actualizar las pruebas E2E de detalle y edición de movimiento para comprobar el modo lectura, el paso a edición y la persistencia; verificar que las pruebas afectadas pasan.

## 5. Acceso animado y Google

- [x] 5.1 Añadir `signInWithGoogle` al `CloudProvider` con intención `upload`/`download`, validación de propietario y elección explícita cuando hay datos locales sin cuenta; verificar que `npm run typecheck` compila.
- [x] 5.2 Reestructurar `CloudAuthForm` con pestañas animadas, `AnimatedHeight`, Google en ambos modos y alta en dos pasos con contraseña repetida; verificar con pruebas de componente que se muestran y cambian correctamente.
- [x] 5.3 Limpiar `/entrar`: quitar redirección inferior y aviso de cifrado, retirar la mención a Supabase de las ayudas y colocar «Continuar sin registrarte» siempre debajo del formulario.
- [x] 5.4 Quitar el check de sustitución y mover la decisión a un paso posterior al intento de inicio de sesión, con «Sincronizar» o «Usar los de la cuenta» y «Volver» a las credenciales; verificar con pruebas de componente.
- [x] 5.5 Quitar «Creando cuenta para…» del paso de contraseña del alta y bloquear el scroll de `/entrar` con `100dvh` y limpieza del `overflow` al desmontar; verificar que la tarjeta completa queda visible.
- [x] 5.6 Enrutar el alta desde `/entrar` a `/onboarding` y el inicio de sesión normal al resumen, con marcador persistente para el retorno de Google y excepción en el asistente; verificar con pruebas unitarias de `routeAfterAccess`.
- [x] 5.7 Hacer que «Continuar sin registrarte» compruebe IndexedDB y salte el onboarding cuando ya hay datos locales, marcándolo como completado; verificar con pruebas de `routeAfterSkip`.
- [ ] 5.8 Actualizar las pruebas E2E de acceso para cubrir Google, las opciones de alta, el selector de datos locales, el destino tras el alta y la salida sin cuenta con y sin datos; verificar que las pruebas afectadas pasan.

## 6. Verificación de integración

- [x] 6.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`; verificar que terminan sin errores.
- [x] 6.2 Revisar el cambio completo con `git diff` y confirmar que no se han tocado `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.

## Workflow follow-up

- Archivar el change cuando la revisión esté aprobada.
- Abrir la PR y mover las tarjetas a `DONE`.
