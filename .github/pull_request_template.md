## Change

- **Id:** `<!-- change-id -->`
- **Rama:** `feat/<!-- change-id -->`
- **Carpeta:** `openspec/changes/archive/<fecha>-<!-- change-id -->/`
- **Tarjetas Kan:**
  - `<!-- card-public-id -->` — <!-- título -->

## Resumen

<!-- Qué cambia y por qué. Si agrupa tarjetas, justifica por qué forman un solo change. -->

## Deltas de specs

<!-- Capacidades nuevas o modificadas y enlaces a openspec/changes/<id>/specs/. -->

## Verificaciones

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run e2e` (o motivo por el que no aplica)

## Lista de comprobación

- [ ] Un change = una rama = una PR.
- [ ] El commit incluye solo el alcance del change y no mezcla trabajo ajeno.
- [ ] No se toca `docs/diseno/`, `design/` ni `openspec/specs/diseno/*`.
- [ ] No se commitean `.env`, tokens, credenciales ni datos personales.
- [ ] Todas las tarjetas del manifiesto están enlazadas en esta PR.
- [ ] Los ficheros compartidos (`AGENTS.md`, `package.json`, CI, configuración) están coordinados.
