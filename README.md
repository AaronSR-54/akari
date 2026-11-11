# akari

Proyecto gestionado con [OpenSpec](https://github.com/Fission-AI/OpenSpec): desarrollo guiado por especificaciones.

## Estructura

```
openspec/
├── config.yaml     # configuración (schema: spec-driven, idioma: es)
├── specs/          # especificaciones principales (fuente de verdad)
└── changes/        # propuestas de cambio (activas y archive/)
.opencode/
├── commands/       # /opsx-propose, /opsx-apply, /opsx-explore, ...
└── skills/         # skills de OpenSpec para el agente
```

## Flujo de trabajo

| Comando | Para qué |
| --- | --- |
| `/opsx-propose "idea"` | Propuesta completa: proposal + design + specs + tasks |
| `/opsx-apply` | Implementar las tareas del cambio activo |
| `/opsx-explore` | Explorar el problema antes de escribir nada |
| `/opsx-update` | Revisar o reajustar un plan existente |
| `/opsx-sync` | Pasar deltas de un cambio a las specs principales |
| `/opsx-archive` | Cerrar un cambio completado |

## CLI

```bash
openspec list            # cambios activos
openspec list --specs    # specs principales
openspec show <item>     # detalle de un cambio o spec
openspec validate        # validar estructura
openspec doctor          # salud del repo
```
