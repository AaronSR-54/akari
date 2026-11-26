# Puesta en marcha

## Requisitos

- Node.js 20.9 o superior (probado con Node 26).
- npm 10 o superior.
- Navegador con IndexedDB e `Intl` (Chrome, Edge, Firefox o Safari recientes).
- Para E2E: Chromium de Playwright.

La app funciona en local y guarda los datos en el navegador. La nube (Supabase) es opcional: solo necesita variables de entorno si quieres probar la sincronización.

## Instalación

```bash
npm install
```

`npm install` instala los workspaces y enlaza `@akari/*` entre paquetes.

## Desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`. La primera vez redirige a `/onboarding`.

La app usa Webpack (`next dev --webpack`) porque los paquetes internos importan con extensión `.js` y necesitan `extensionAlias`; el build también usa `next build --webpack`. `allowedDevOrigins` permite abrir el servidor por `127.0.0.1`.

## Nube opcional (Supabase)

1. Aplica los archivos de `supabase/migrations/` en un proyecto de Supabase, en orden.
2. Crea `apps/web/.env.local` con:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

Sin esas variables la app arranca en modo local y la tarjeta de cuenta aparece como «Sin configurar». Nunca uses la `service_role` key en el cliente. La guía completa está en [Nube y sincronización](./nube-supabase.md) y en [`supabase/README.md`](../../supabase/README.md).

En un worktree, crea `apps/web/.env.local` dentro de ese worktree para probar la nube.

## Build de producción

```bash
npm run build
npm run start -w @akari/web
```

`npm run build` genera primero los tokens y después la app.

## Pruebas

```bash
npm test              # Vitest: dominio, datos, componentes y paridad de tokens
npm run test:coverage # cobertura de dominio y datos
npm run typecheck     # TypeScript en todos los workspaces
npm run lint          # ESLint
npx playwright install chromium
npm run e2e           # Playwright: flujos, responsive y axe
```

Playwright compila la app y arranca su propio servidor de producción en el puerto 3100 (`webServer` en `playwright.config.ts`). Si ya tienes uno en ese puerto, lo reutiliza.

Proyectos E2E:

- `desktop`: 1440 × 900.
- `tablet`: 900 × 900.
- `mobile-web`: 390 × 844.

## Datos de ejemplo y reinicio

- En `/onboarding`, elige «Ver con datos de ejemplo».
- En `/ajustes` puedes volver a cargar ejemplos o reiniciar todos los datos.
- El mock usa una **fecha fija**: domingo 29 de noviembre de 2026 (`apps/web/src/lib/clock.ts`). Así la gráfica de saldo del mes muestra siempre la misma evolución desde la base a día 1 y la tarjeta de balance el mismo saldo total estimado, con tres meses de historial sembrados. Los formularios también arrancan con esa fecha.
- Para cambiar la fecha sin tocar código, define `NEXT_PUBLIC_AKARI_NOW` con un ISO 8601, por ejemplo `2026-11-29T12:00:00`, y reinicia el servidor.
- Exporta una copia antes de reiniciar: el archivo no está cifrado en esta fase.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Genera tokens y arranca Next en desarrollo. |
| `npm run build` | Genera tokens y compila la app. |
| `npm run start -w @akari/web` | Sirve el build de producción. |
| `npm test` | Vitest. |
| `npm run test:coverage` | Vitest con cobertura de dominio/datos. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript por workspace. |
| `npm run e2e` | Playwright. |
| `npm run build -w @akari/tokens` | Regenera CSS, preset y catálogo. |

## Problemas frecuentes

| Síntoma | Causa / solución |
| --- | --- |
| La página queda en «Cargando contenido» | Revisa la consola: si IndexedDB está bloqueado (modo privado), la app debe mostrar el error de almacenamiento. |
| Los cambios no persisten | Comprueba que el navegador permite almacenamiento local y que no estás en una ventana privada con cuota cero. |
| `next dev` bloquea recursos desde `127.0.0.1` | Ya está permitido en `allowedDevOrigins`; si usas otro host, añádelo. |
| Playwright no encuentra navegador | Ejecuta `npx playwright install chromium`. |
| Los tokens no se actualizan | Ejecuta `npm run build -w @akari/tokens`; el preset y el CSS son artefactos generados. |

## Documentos relacionados

- [Arquitectura](./arquitectura.md)
- [Convenciones](./convenciones.md)
- [Mapa diseño → código](./mapa-diseno-codigo.md)
