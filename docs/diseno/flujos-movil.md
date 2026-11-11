# Flujos móvil · akari

Inventario de las pantallas móviles dibujadas en `02-Pantallas → Móvil`. Todas miden **390 × 844** (área útil 390 × 728 entre barra de estado y tab bar) y reutilizan los componentes publicados en `01-Diseño → Componentes`.

## 1. Navegación y ergonomía

- **Raíces:** Inicio (M05, M13), Movimientos (M08, M18), Grupos (M11, M12, M14), Ajustes (M17). Muestran la `TabBar` con el destino activo en píldora de tinta.
- **Pantallas internas:** M02, M03, M04, M06, M07, M09, M10, M15, M19. Usan `TopBar` con volver y **no** muestran tab bar.
- **Alcance con una mano:** acciones principales y campos en la mitad inferior; el botón primario va a 48 px del borde y nunca bajo el pliegue del pulgar.
- **Zonas seguras:** 44 px de barra de estado arriba; 72 px de tab bar abajo; el contenido respeta 20 px laterales.
- **Volver:** gesto desde el borde izquierdo y botón de la `TopBar`; nunca se pierde un formulario sin confirmación.
- **Deep links:** un aviso de pago abre M10; una invitación abre M14; el widget abre M09 con el importe vacío.
- **360 × 800:** el contenido pasa a 320 px de ancho; las tarjetas bento se apilan si el texto no cabe y la tab bar mantiene 44 px de objetivo. Verificado con la retícula de 4 columnas y los mismos componentes.

## 2. Inventario de pantallas

| # | Pantalla | Función | Componentes | Estados cubiertos |
| --- | --- | --- | --- | --- |
| M01 | Bienvenida | Primera apertura, propuesta de valor | `Balance/Summary`, `Button/Primary`, `Button/Tertiary` | Éxito (sin datos) |
| M02 | Protección | Crear contraseña y elegir ubicación | `TopBar`, `Field/Text`, tarjetas de opción | Default, foco, error de coincidencia |
| M03 | Desbloqueo | Abrir base local | `Field/Text` Error, `Button/Primary`, `Link` | Error con intentos restantes |
| M04 | Sincronización | Activar nube (opcional) | `TopBar`, lista de ventajas, `Switch` | Éxito, omisión |
| M05 | Resumen | Dashboard bento y cuentas | `Balance/Summary`, tarjetas métrica, `Account/Card`, `Movement/Row`, `TabBar` | Normal, carga (skeleton), vacío |
| M06 | Alta de cuenta | Nombre, tipo, saldo obligatorio, TAE | `TopBar`, `Field/Text`, `Select/Field`, `Amount/Input`, `Switch`, primario disabled | Error de validación (saldo 0) |
| M07 | Detalle de cuenta | Saldo real frente a estimado | `Account/Card`, métricas, `Chart/Bars`, `Movement/Row` | Normal, alerta |
| M08 | Movimientos | Lista, búsqueda y filtros | `Search/Field`, chips, `Movement/Row`, `TabBar` | Con datos, filtro sin resultados |
| M09 | Nuevo movimiento | Alta de gasto/ingreso | `Amount/Input`, `Field/Text`, `Select/Field`, `Switch`, primario | Default, foco, guardado |
| M10 | Plazos | Cuotas pagadas, vencidas y próximas | `Progress/Installments` Atrasado, `Badge`, primario | Atrasado, completado |
| M11 | Gasto grupal | Reparto a partes iguales | `Amount/Input`, chips, lista de participantes | Reparto válido |
| M12 | Liquidación | Quién paga a quién | Tarjetas de transferencia, `Badge` | Pendiente, saldado |
| M13 | Pregunta rápida | Mayor gasto del mes | chips, `Chart/Bars`, tarjeta de respuesta | Con datos, sin datos suficientes |
| M14 | Cuenta conjunta | Miembros, permisos e invitaciones | `Badge`, lista, `Button/Primary` | Invitación pendiente, miembro activo |
| M15 | Avisos | Próximos pagos y actividad | `Badge` por tono, `Switch` | No leído, leído |
| M16 | Widget | Vista previa del widget nativo | Tarjeta akari, accesos de apps | Solo lectura |
| M17 | Ajustes | Datos, sincronización y conflictos | `Banner` Aviso, filas de ajuste, `Switch`, `TabBar` | Sin conexión, conflicto pendiente |
| M18 | Vacío | Estado vacío de movimientos | `State/Page` Vacío, `TabBar` | Vacío |
| M19 | Sin conexión | Datos guardados y edición local | `Banner` Aviso, tarjetas de cuenta, `TabBar` | Sin conexión con datos parciales |

## 3. Matriz de estados por superficie

| Superficie | Carga | Vacío | Error | Sin conexión | Éxito |
| --- | --- | --- | --- | --- | --- |
| Resumen (M05) | `Skeleton` Lista | M18 | `State/Page` Error | M19 | Toast «Actualizado» |
| Movimientos (M08) | `Skeleton` Lista | `State/Page` Vacío | `State/Page` Error | `Banner` + datos guardados | Toast al guardar |
| Cuenta (M07) | `Skeleton` Tarjeta | — | `State/Page` Error | `Banner` Aviso | `Badge` al día |
| Gasto grupal (M11) | — | Sin participantes | Error de reparto | Se guarda en local | Toast «Repartido» |
| Ajustes (M17) | — | — | `Banner` Error | M17 | Toast de sincronización |

Regla: ninguna pantalla se entrega solo con el estado feliz; el estado se elige por superficie, no por pantalla completa.

## 4. Decisiones de interacción

- **Alta de gasto** en dos toques: FAB → importe con teclado numérico → guardar. El resto de campos tiene valores por defecto.
- **Importes** siempre con signo y cifras tabulares; el gasto va en tinta y el ingreso en verde.
- **Reparto grupal** muestra la suma por persona y el total para que el reparto se pueda comprobar sin calculadora.
- **Plazos** distinguen pagada, vencida y próxima por texto y color; la acción principal solo aparece si hay una cuota vencida.
- **Sin conexión** nunca bloquea la lectura y avisa de que los cambios se enviarán al reconectar.
- **Widget** es de solo lectura salvo «Añadir gasto», y respeta las cuentas ocultas.

## 5. Prototipo

Los flujos conectados de alta de cuenta, registro de movimiento, gasto grupal y dashboard se enlazan en `01-Diseño → Prototipos` (ver `docs/diseno/handoff.md`). Cada pantalla enlaza con su estado de error o vacío mediante una interacción `onClick` en la acción principal.
