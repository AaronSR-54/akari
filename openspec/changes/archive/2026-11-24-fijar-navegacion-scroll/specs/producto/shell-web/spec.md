# Spec Delta

## ADDED Requirements

### Requirement: Navegación fija durante el scroll y el overscroll

La navegación principal SHALL permanecer en una posición fija mientras se desplaza el contenido, sin animaciones inducidas por el scroll o el rebote elástico. La barra superior de acciones de la variante sidebar SHALL permanecer pegada al borde superior del viewport tanto en reposo como al hacer scroll.

#### Scenario: Scroll con trackpad

- **WHEN** la persona desplaza el contenido con el trackpad, incluido el rebote elástico al llegar al inicio o al final
- **THEN** la sidebar conserva su posición vertical y la barra de acciones permanece en el borde superior, sin ninguna animación de subida o bajada

#### Scenario: Sin salto al empezar el scroll

- **WHEN** la página está en el inicio y la persona empieza a desplazarla
- **THEN** la barra de acciones ya está pegada al borde superior, no cambia de posición y el contenido no asoma por encima

#### Scenario: Cabecera superior siempre visible

- **WHEN** se recorre una página larga hasta el final y se vuelve al inicio
- **THEN** la barra superior de acciones con el buscador y el botón de avisos sigue visible, pegada al borde superior y sin mostrar el título de la sección

#### Scenario: Rebote elástico contenido

- **WHEN** el documento recibe un gesto de overscroll en el borde superior o inferior
- **THEN** el rebote no arrastra la navegación y el desplazamiento normal del contenido sigue funcionando

#### Scenario: Ambas variantes del shell

- **WHEN** el shell usa sidebar o cabecera superior como navegación principal
- **THEN** la navegación principal permanece fija en ambos casos, `HeaderNav` ocupa el borde superior desde el reposo y no aparece una segunda navegación duplicada

### Requirement: Cabecera sin título de sección

La barra superior de acciones de la variante sidebar MUST NOT mostrar el título de la sección: el título SHALL mostrarse solo en el contenido de la página. La variante header MUST NOT mostrar una barra secundaria de título; `HeaderNav` SHALL ser la única barra superior.

#### Scenario: Sidebar sin título duplicado

- **WHEN** se abre una página como Ajustes o Movimientos con la navegación lateral
- **THEN** la cabecera superior muestra solo el buscador y el botón de avisos, y el único título de sección visible es el encabezado del contenido

#### Scenario: Variante header sin barra de subtítulo

- **WHEN** el shell usa la cabecera superior como navegación principal
- **THEN** solo existe `HeaderNav` en la parte superior, sin una segunda barra con el título y sin buscador ni avisos duplicados

#### Scenario: Contenido sin asomar por encima

- **WHEN** se hace scroll en una página larga con la navegación lateral
- **THEN** ningún encabezado del contenido queda visible por encima de la barra de acciones pegada al borde superior

### Requirement: Separación entre la cabecera y el contenido

La cabecera superior y el primer título del contenido SHALL mantener una separación vertical mínima de 24 px en todos los breakpoints donde existe una cabecera fija; el contenido MUST NOT empezar pegado al borde inferior de la cabecera.

#### Scenario: Título con aire bajo la cabecera

- **WHEN** se abre una página con la cabecera visible, en escritorio, tablet o móvil
- **THEN** el primer título del contenido empieza al menos 24 px por debajo del borde inferior de la cabecera

#### Scenario: Al hacer scroll

- **WHEN** la persona desplaza el contenido
- **THEN** la separación forma parte del contenido, la cabecera sigue pegada arriba y su altura no cambia

### Requirement: Identidad única en la navegación de escritorio

La variante de sidebar SHALL mostrar el avatar de la persona una sola vez, en el pie de la sidebar, y MUST NOT duplicarlo en la cabecera superior. La variante de header SHALL mostrarlo una sola vez en la navegación superior.

#### Scenario: Sidebar visible

- **WHEN** el shell usa la sidebar como navegación principal
- **THEN** solo hay un avatar visible, situado en el pie de la sidebar, y la cabecera superior muestra el buscador y el botón de avisos sin repetir la identidad

#### Scenario: Header superior

- **WHEN** el shell usa la cabecera superior como navegación principal
- **THEN** solo hay un avatar visible y está en la navegación superior

#### Scenario: Etiqueta accesible

- **WHEN** se inspecciona el avatar visible
- **THEN** conserva el nombre accesible de la persona y no se elimina del árbol de accesibilidad
