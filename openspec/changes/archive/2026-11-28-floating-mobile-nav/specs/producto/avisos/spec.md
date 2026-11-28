# Spec Delta

## MODIFIED Requirements

### Requirement: Apertura y cierre del panel de avisos

El shell SHALL abrir un panel de avisos anclado a la campana de la cabecera, con navegación lateral o superior, y SHALL difuminar el fondo como en las modales. En móvil SHALL abrir el mismo panel como modal inferior anclado al borde del viewport, con el mismo contenido y las mismas vías de cierre. Mientras está abierto, SHALL bloquear el scroll del documento y MUST restaurarlo al cerrarlo. MUST cerrarlo con Escape, con la ✕ o al pulsar fuera del panel.

#### Scenario: Apertura con navegación lateral

- **WHEN** la persona pulsa «Avisos» en la cabecera de la variante sidebar
- **THEN** se despliega bajo la campana un panel titulado «Avisos» con el foco dentro y la lista o el estado vacío visibles

#### Scenario: Apertura con cabecera superior

- **WHEN** la persona pulsa «Avisos» en la variante header
- **THEN** se despliega el mismo panel de avisos sin una segunda instancia ni una segunda navegación

#### Scenario: Apertura en móvil

- **WHEN** la persona pulsa «Avisos» en la cabecera móvil
- **THEN** se abre el mismo panel de avisos como modal inferior anclado al borde inferior, con el foco dentro y el fondo difuminado, sin una segunda instancia

#### Scenario: Fondo difuminado

- **WHEN** el panel de avisos está abierto
- **THEN** el resto de la página se ve difuminado con un desenfoque ligero, sin trampa de foco

#### Scenario: Scroll bloqueado

- **WHEN** el panel de avisos está abierto y la persona usa la rueda, el trackpad o el teclado para desplazarse
- **THEN** la página de fondo no se desplaza y el scroll vuelve a funcionar al cerrar el panel por cualquiera de sus vías

#### Scenario: Cierre del panel

- **WHEN** el panel está abierto y la persona pulsa Escape, la ✕ o fuera del panel
- **THEN** el panel se cierra y el foco vuelve al botón de avisos
