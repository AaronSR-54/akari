# Matriz de cobertura — akari

- **Cambio:** `diseno-app-akari` (F4 · handoff)
- **Fecha:** 2026-11-12
- **Fuente de requisitos:** `docs/Esqueleto - Ideas varias.canvas`
- **Archivo de diseño:** `00-Portada`, `01-Diseño`, `02-Pantallas` (sesión FigCraft `akari`)
- **Referencia Figma:** https://www.figma.com/design/npwsfgd0s4n4UWszvg28wv/akari

## 1. Cómo leer la matriz

Cada fila relaciona una funcionalidad del canvas con las pantallas que la cubren. Los códigos `Mxx` y `Wxx` son el prefijo del nombre del frame; el nombre completo sigue la convención `[Plataforma]/[Flujo]/[Código] [Pantalla]`. La columna **Estados** indica qué estados no felices están dibujados o anotados en esa misma pantalla o en su variante.

La matriz se revisa contra el canvas, no contra la implementación: una fila sin pantalla debe tener una justificación explícita de exclusión.

## 2. Cuentas

| Funcionalidad del canvas | Móvil | Web | Estados y notas |
| --- | --- | --- | --- |
| Cuentas personales, conjuntas y de depósito | `M06` Alta de cuenta, `M14` Cuenta conjunta | `W01` Resumen, `W02` Detalle | M06: tipo Personal/Conjunta/Depósito, error de saldo y TAE condicional. W01: las tres cuentas en una vista. |
| Saldo inicial obligatorio | `M06` | Reutiliza `M06` en shell web | Botón disabled y error inline si el saldo es 0 o falta (anotación *development*). |
| TAE e ingresos estimados de depósito | `M06` (TAE), `M07` (estimado) | `W02` | M07 y W02 separan saldo real de estimado a fin de mes. |
| Añadir movimientos | `M09` Nuevo movimiento, `M08` Movimientos | `W03` Movimientos | M09: gasto/ingreso, fecha, cuenta y repetición. W03: alta desde la cabecera y edición en línea. |
| Suscripciones y pagos periódicos | `M09` (Repetir), `M10` Plazos | `W02`, `W03` (filtro Suscripciones) | M09 distingue movimiento único y periódico; W02 muestra una suscripción en el detalle. |
| Ingresos periódicos (nómina) | `M05`, `M09` | `W03` | La nómina aparece como ingreso en el resumen y en la tabla. |
| Balance saldo/gastos mensual | `M05` | `W01` | Tarjetas bento con gasto del mes y comparación contra el mes anterior. |
| Pagos a plazos | `M10` | `W02` (bloque Plazos) | M10: cuota pagada, vencida y próxima; pago de cuota vencida. |
| Saldo total entre cuentas | `M05` | `W01` | Solo suma las cuentas incluidas en el saldo total. |
| Saldo real frente a estimado | `M07` | `W02` | `M07` incluye la alerta de estimado negativo; W02 añade evolución y plazos. |

## 3. Gastos grupales

| Funcionalidad del canvas | Móvil | Web | Estados y notas |
| --- | --- | --- | --- |
| Reparto proporcional, por porcentaje o cantidad fija | `M11` Gasto grupal | `W04` Gasto grupal | Chips de reparto con estado seleccionado textual; el total y las partes cuadran. |
| Definir gastos periódicos y únicos | `M09` (Repetir) + `M11` | `W04` | La recurrencia se define en el movimiento; el gasto grupal siempre es único. |
| Quién paga a quién y a qué cuenta | `M12` Liquidación | `W04` (Cuenta de cobro) | M12: transferencias pendientes y saldadas; W04 indica la cuenta de cobro antes de guardar. |
| Gasto sin cuenta asociada | `M11` | `W04` | El gasto se registra en el grupo y no mueve saldo hasta liquidarse. |
| Conversión de divisas | `M11` | `W04` | Anotación *development*: se convierte a la divisa de la cuenta de cobro con el tipo del día; el importe original queda en el detalle. No se dibuja un frame específico porque la conversión es una regla, no una pantalla. |

## 4. Compartición y red social

| Funcionalidad del canvas | Móvil | Web | Estados y notas |
| --- | --- | --- | --- |
| Varios usuarios modifican cuentas conjuntas | `M14` Miembros y permisos | `W06` (sincronización) | Roles Admin/Editor/Lectora; solo la administradora cambia roles. En web la gestión de roles reutiliza el patrón de M14; no se duplica un frame. |
| Invitaciones pendientes | `M14` | — | Se distingue miembro activo de invitación pendiente, con fecha y reenvío. |
| Red de amigos (social) | — | — | **Exclusión justificada:** F2 cubre miembros e invitaciones de una cuenta; la red de amistades se planifica en un cambio posterior porque no tiene flujo de negocio cerrado en el canvas (ver §7). |

## 5. Dashboard, notificaciones y superficies nativas

| Funcionalidad del canvas | Móvil | Web | Estados y notas |
| --- | --- | --- | --- |
| Dashboard bento | `M05` | `W01`, `W05` | Una idea por tarjeta; métricas con importe tabular y sparkline. |
| ShortQuestions: mayor gasto y gastos evitables | `M13` Pregunta rápida | `W05` Preguntas rápidas | M13: una pregunta a la vez; W05: cuatro preguntas y respuesta completa. Estado sin datos suficientes anotado. |
| Notificaciones de próximos pagos | `M15` Avisos, `M10` | `W01` (aviso de pago) | M15 separa Pago/Cobro/Grupo por texto y color; el banner de W01 permite pagar. |
| Acceso rápido desde la notificación para añadir gasto | `M15` → `M09` | `W01` → `M09`/`W03` | Deep link anotado en M15: abre M09 con el importe vacío. |
| Widgets Android e iOS | `M16` Widget | — | Solo lectura salvo «Añadir gasto»; nunca muestra cuentas ocultas. Limitación de plataforma anotada en el frame. |
| Mobile-first y ergonomía | `M01`–`M19` (390 × 844) | `W07` verifica 768 | Verificado también a 360 × 800; tab bar de 44 px y contenido a 20 px laterales. |

## 6. Datos y sincronización

| Funcionalidad del canvas | Móvil | Web | Estados y notas |
| --- | --- | --- | --- |
| Datos cifrados y contraseña local | `M02`, `M03`, `M17` | `W06` | La contraseña cifra la base local; sin recuperación remota. |
| Sincronización opcional en tiempo real y en SQL | `M04`, `M17` | `W06` | Obligatoria para cuentas conjuntas compartidas; desactivarla no borra datos. |
| Base `.db` cifrada en cualquier ubicación | `M02` (elección de ubicación), `M17` | `W06` | Ubicación local frente a este dispositivo + nube; exportación de copia cifrada. |
| Conflictos y modo sin conexión | `M17`, `M19` | `W06` | M19: datos guardados y cola de subida; W06: conflicto con dos dispositivos y acción Revisar. |

## 7. Fuera de alcance y justificaciones

| Elemento del canvas | Decisión |
| --- | --- |
| Stack (Next.js, React Native, Tailwind, hexagonal, hooks headless) | No es UI. Se traduce en tokens y APIs de componentes documentadas en `componentes.md` y `handoff.md`. |
| Backend, autenticación, pagos reales, push y widgets nativos | Implementación posterior; el diseño cubre la superficie y sus estados, no la infraestructura. |
| Alta de cuenta y registro de movimiento en web | Se reutilizan `M06` y `M09` dentro del shell web (decisión 4: web añade densidad, no capacidades). No se duplica un frame W. |
| Red de amistades | Excluida de F2; requiere definir el modelo social antes de dibujarla. |
| Conversión de divisas | Cubierta como regla en M11/W04; no requiere pantalla propia. |

## 8. Verificación

- **27 pantallas** dibujadas: 19 móviles (`M01`–`M19`) y 8 web (`W01`–`W08`; W08 es la alternativa con header superior).
- **7 flujos conectados** en `01-Diseño ▸ Prototipos`: onboarding, alta de cuenta, registro de movimiento, gasto grupal, preguntas/detalle, resumen/cuentas web y grupos/ajustes web.
- **Todas las pantallas** tienen al menos una anotación de interacción, una de desarrollo y una de accesibilidad (119 anotaciones en total).
- **Ninguna pantalla queda solo en estado feliz**: M02, M03, M06, M10, M17, M18, M19 y W03/W06 dibujan error, vacío, sin conexión o conflicto; el resto los documenta en anotaciones.
- **Sin pantallas huérfanas**: cada frame se puede rastrear a una fila de esta matriz y cada fila del canvas tiene pantalla o justificación.
- **Estado:** matriz aprobada con F4 el 12 nov 2026; `Componentes`, `Móvil` y `Web` marcados como *Ready for dev*. La iteración v1.1 añade el sidebar compacto/expandido y `W08` con header transparente.

## 9. Prototipos por flujo

| Flujo | Pantalla de entrada | Recorrido | Estado |
| --- | --- | --- | --- |
| 0 · Onboarding | `M01` | `M01 → M02 → M04 → M05` | Aprobado |
| A · Alta de cuenta | `M06` | `M06 → M05` | Aprobado |
| B · Registro de movimiento | `M05` | `M05 → M09 → M08` | Aprobado |
| C · Gasto grupal | `M11` | `M11 → M12 → M14` | Aprobado |
| D · Preguntas y detalle | `M13` | `M13 → M08` | Aprobado |
| E · Resumen y cuentas web | `W01` | `W01 → W02 → W03` | Aprobado |
| F · Grupos y ajustes web | `W04` | `W04 → W05 → W06` | Aprobado |

Los botones «Abrir prototipo» de `01-Diseño ▸ Prototipos` abren la pantalla de entrada de cada fila. La tab bar móvil y la sidebar web permiten cambiar de raíz sin volver al índice.

