# Spec Delta

## ADDED Requirements

### Requirement: Panel único de cuentas

El resumen SHALL presentar todas las cuentas en un único panel a todo el ancho, con el encabezado «Cuentas» dentro de la tarjeta y bloques distinguidos por fondo hundido, sin tabla ni líneas divisorias, manteniendo íntegro el bento superior.

#### Scenario: Panel único responsive

- **WHEN** se abre el dashboard con al menos una cuenta
- **THEN** todas las cuentas aparecen como bloques dentro de una sola superficie que ocupa todo el ancho del contenido, directamente debajo de los accesos rápidos
- **AND** la tarjeta del panel muestra en su interior un encabezado «Cuentas» con un enlace «Gestionar cuentas» que lleva a `/cuentas/nueva`
- **AND** en escritorio los bloques se reparten lado a lado, sin tabla ni líneas divisorias, y se distinguen por un fondo de superficie hundida con esquinas redondeadas y espaciado entre ellos
- **AND** en móvil los bloques se apilan unos sobre otros
- **AND** el saldo, la gráfica del mes, los últimos movimientos, el balance del mes y los accesos rápidos conservan su composición y comportamiento anteriores

#### Scenario: Escalado de 0 a N cuentas

- **WHEN** el número de cuentas cambia entre ninguna, una y muchas
- **THEN** con ninguna cuenta no se renderiza el panel de cuentas y se muestra el estado vacío existente
- **AND** con una o muchas cuentas el panel acomoda los bloques en columnas y pasa a siguientes líneas cuando hace falta, sin desbordar el ancho del contenido ni introducir scroll propio
- **AND** los nombres largos de cuenta se truncan sin desplazar a los demás bloques

#### Scenario: Accesos a cuentas conservados

- **WHEN** se revisan los accesos del resumen
- **THEN** el pill «Nueva cuenta» y el enlace «Gestionar cuentas» del encabezado siguen llevando a `/cuentas/nueva`
- **AND** cada bloque del panel sigue llevando al detalle de su cuenta

#### Scenario: Agrupación accesible

- **WHEN** una persona usa un lector de pantalla en el resumen
- **THEN** las cuentas siguen formando un grupo con un nombre accesible
- **AND** el encabezado «Cuentas» nombra la sección y el enlace «Gestionar cuentas» es él mismo un enlace independiente de los bloques
