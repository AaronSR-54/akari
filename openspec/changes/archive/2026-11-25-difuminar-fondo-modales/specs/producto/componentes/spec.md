# Spec Delta

## ADDED Requirements

### Requirement: Fondo atenuado y difuminado en overlays

Al abrir un overlay modal, la aplicación SHALL atenuar el contenido de fondo con el scrim del sistema y SHALL difuminarlo, y al cerrarlo SHALL devolver el fondo a su estado normal.

#### Scenario: Apertura de un modal

- **WHEN** la persona abre un modal o una hoja
- **THEN** el fondo queda atenuado con `overlay/scrim` al 50 % y difuminado, sin que el panel del overlay pierda nitidez

#### Scenario: Cierre del overlay

- **WHEN** el overlay se cierra con su botón, con Escape o pulsando fuera
- **THEN** el fondo recupera su nitidez y su atenuación previas

#### Scenario: Contraste del panel

- **WHEN** el overlay está abierto en tema claro u oscuro
- **THEN** el texto y los controles del panel mantienen el contraste que exige la spec de componentes

### Requirement: Scroll de la página bloqueado con un overlay abierto

Mientras un overlay modal esté abierto, la página principal SHALL NOT desplazarse, y al cerrarlo SHALL conservar la posición de scroll que tenía antes de abrirlo.

#### Scenario: Intento de scroll con el overlay abierto

- **WHEN** el overlay está abierto y la persona usa la rueda, el teclado o un gesto táctil sobre el fondo
- **THEN** la posición de scroll de la página no cambia, aunque el panel del overlay siga pudiendo desplazarse por dentro

#### Scenario: Restauración al cerrar

- **WHEN** el overlay se cierra
- **THEN** la página vuelve a poder desplazarse y mantiene la posición de scroll previa a la apertura

#### Scenario: Overlays superpuestos

- **WHEN** se abre un segundo overlay sobre uno ya abierto y después se cierra
- **THEN** el bloqueo de scroll se mantiene hasta que se cierra el último overlay
