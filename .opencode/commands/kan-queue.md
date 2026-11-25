---
description: "Revisa la cola de Kan.bn sin escribir en el tablero"
---

Revisa la cola de Kan.bn.

1. Ejecuta `node scripts/kan-sync.mjs queue --json`.
2. Resume las tarjetas libres de `TO DO` (`claimable: true`) y las ya reclamadas con su change, rama y persona.
3. No muevas, asignes ni crees tarjetas: esta consulta es de solo lectura.
4. Si el usuario pide reclamar una tarjeta, usa el `publicId` de la salida y propone el `claim` correspondiente; no inventes identificadores.

Argumentos opcionales: `$ARGUMENTS`
