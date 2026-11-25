# Design

## Context

El shell ya tiene cuatro variantes (`Sidebar`, `HeaderNav`, `TabletHeader`, `MobileTopBar`) que dibujan el avatar con las constantes `initials = 'MR'` y `displayName = 'Marta'` definidas en `sidebar.tsx`. La ruta `/ajustes` existe y concentra tema, almacenamiento, copia/restauración y reinicio, pero el título es «Datos y sincronización» y la identidad no aparece en la pantalla. La navegación principal incluye «Ajustes» como un destino más en `navItems`. El diseño visual está congelado: no se editan `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`; la desviación se documenta en `docs/desarrollo/desviaciones.md`.

## Goals / Non-Goals

**Goals:**

- Un único punto de entrada a perfil y ajustes: el avatar.
- Misma identidad en el shell y en el panel, sin duplicar constantes.
- Navegación principal sin el destino «Ajustes» en ninguna variante.
- Título y subtítulo coherentes con el nuevo acceso.

**Non-Goals:**

- No se añaden autenticación, nube ni cifrado.
- No se almacena ninguna imagen: la foto del perfil sigue siendo una representación por iniciales.
- No se crea una entidad de dominio ni una migración de esquema de Dexie.
- No se rediseñan componentes de `@akari/ui` ni se modifica el diseño congelado.
- No se altera el comportamiento de datos locales, copia ni reinicio.

## Decisions

- **Enlace directo en lugar de menú desplegable.** El avatar se envuelve en un `<Link href="/ajustes">` con `aria-label="Ajustes"` en las cuatro variantes. Se descarta un menú desplegable porque añadiría una superficie nueva al diseño congelado y no aporta opciones que hoy no existan. El `Avatar` conserva su `role="img"` y su nombre accesible (`Marta`) para no romper las comprobaciones de identidad única y tamaño.
- **Fuente única de identidad.** Se extraen `displayName`, `initials` y el subtítulo («Cuenta local») a un módulo pequeño en `apps/web/src/lib/` y se consume desde `sidebar.tsx` y desde la pantalla de ajustes. Alternativa descartada: duplicar las constantes en `settings.tsx`, que dejaría dos fuentes divergentes.
- **Sección de perfil dentro de `/ajustes`.** Se añade una tarjeta de perfil encima del bloque de ajustes existente con el avatar y la identidad compartida. Se reutilizan `Card` y `Avatar` de `@akari/ui`; no se introduce un nuevo componente de dominio.
- **Retirada de `navItems` y conservación de `routeTitles`.** Se elimina la entrada «Ajustes» de la navegación principal, pero se mantiene el mapeo de la ruta para los enlaces directos. Así los deep links siguen teniendo título sin que la barra muestre un destino duplicado.
- **Cambio de título.** `PageTitle` y `PageHeaderResponsive` pasan a «Ajustes» con un subtítulo que menciona perfil y datos locales; se actualizan los E2E que esperaban «Datos y sincronización».
- **Afordancia visual.** Los enlaces del avatar añaden `p-1`, `hover:bg-surface-sunken` con transición corta y `title="Ajustes"`, además del anillo de foco ya existente. El padding da aire al fondo al pasar el puntero sin cambiar el tamaño de 40 px del avatar ni provocar desbordamiento en la barra móvil. Se descarta un menú o un icono nuevo porque el diseño está congelado; el cambio se registra como desviación.
- **Nombre editable como campo opcional.** `Settings` incorpora `displayName?: string` con valor por defecto «Marta» en `defaultSettings`. Así las bases ya creadas heredan el nombre sin necesidad de subir `SCHEMA_VERSION` ni escribir una migración. El caso de uso `updateProfileName` normaliza (recorta y valida longitud) antes de llamar al repositorio, y devuelve `ValidationError` si el nombre no es válido.
- **Propagación del nombre al shell.** `AppShell` lee los ajustes y pasa `displayName` a las cuatro variantes como prop opcional; cada variante calcula las iniciales a partir del nombre con un helper compartido. El saludo del resumen lee `useSettings()` directamente porque ya es una pantalla conectada a datos. Se prefiere una prop en las variantes del shell antes que llamar a `useSettings()` dentro de cada una para mantener los componentes presentacionales y sus pruebas unitarias simples.

## Risks / Trade-offs

- [Riesgo] Los selectores E2E buscan el avatar por `role="img"` dentro de un enlace con nombre propio → Mitigación: mantener `Avatar` sin cambios y usar `aria-label="Ajustes"` en el enlace; los selectores de imagen siguen resolviendo y los de enlace «Ajustes» siguen encontrando el acceso.
- [Riesgo] El cambio de título rompe aserciones de cabecera y deep links → Mitigación: actualizar `e2e/shell.spec.ts` y comprobar `document.title` y `h1` único en escritorio y móvil.
- [Riesgo] La sidebar compacta pierde el nombre accesible al ocultar el texto → Mitigación: el `aria-label` del enlace está presente tanto expandida como compacta; se añade anillo de foco visible.
- [Riesgo] El nombre editado cambia las iniciales del avatar y rompe selectores que esperaban «MR» → Mitigación: las pruebas buscan el avatar por nombre accesible, no por iniciales; se añade una prueba del helper de iniciales.
- [Riesgo] Instalaciones antiguas sin `displayName` → Mitigación: `defaultSettings` aporta el valor por defecto al leer, sin migración ni pérdida de ajustes.
- [Riesgo] La edición de la foto queda fuera de alcance y puede generar expectativas → Mitigación: el panel indica explícitamente que la foto se representa con iniciales y no se almacenan imágenes.

## Migration Plan

No hay migración de esquema: `displayName` es opcional y se resuelve con el valor por defecto al leer los ajustes, por lo que `SCHEMA_VERSION` sigue en 2. La reversión consiste en revertir el commit del change; el acceso a `/ajustes` vuelve a la navegación, el título al valor anterior y el nombre guardado deja de utilizarse.

## Open Questions

Ninguna. El alcance y las decisiones materiales quedaron resueltos antes de redactar el change.
