# Spec Delta

## MODIFIED Requirements

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
- **THEN** la barra superior de la variante sidebar con el título de la sección, el buscador y el botón de avisos sigue visible y pegada al borde superior

#### Scenario: Rebote elástico contenido

- **WHEN** el documento recibe un gesto de overscroll en el borde superior o inferior
- **THEN** el rebote no arrastra la navegación y el desplazamiento normal del contenido sigue funcionando

#### Scenario: Ambas variantes del shell

- **WHEN** el shell usa sidebar o cabecera superior como navegación principal
- **THEN** la navegación principal permanece fija en ambos casos, `HeaderNav` ocupa el borde superior desde el reposo y no aparece una segunda navegación duplicada

### Requirement: Separación entre la cabecera y el contenido

La cabecera superior y el primer bloque del contenido SHALL mantener una separación vertical mínima de 24 px en todos los breakpoints donde existe una cabecera fija; el contenido MUST NOT empezar pegado al borde inferior de la cabecera.

#### Scenario: Título con aire bajo la cabecera

- **WHEN** se abre una página con la cabecera visible, en escritorio, tablet o móvil
- **THEN** el primer bloque del contenido empieza al menos 24 px por debajo del borde inferior de la cabecera

#### Scenario: Al hacer scroll

- **WHEN** la persona desplaza el contenido
- **THEN** la separación forma parte del contenido, la cabecera sigue pegada arriba y su altura no cambia

## REMOVED Requirements

### Requirement: Cabecera sin título de sección

**Reason**: La tarjeta pide mover el título de la página a la cabecera en la vista sidebar para mantener el contexto visible al hacer scroll.

**Migration**: Usar `Cabecera con título y subtítulo en sidebar`; la variante sidebar muestra título y subtítulo en `DesktopHeader` y el contenido no los repite en escritorio.

## ADDED Requirements

### Requirement: Cabecera con título y subtítulo en sidebar

La variante sidebar SHALL mostrar en la cabecera fija `DesktopHeader`, como único encabezado visible en escritorio, el título de la sección (`h1`) y su subtítulo (`meta`/`description`). El contenido MUST NOT repetir ninguno de los dos en escritorio; `actions` y `breadcrumbs` permanecen en el contenido. La variante header MUST NOT mostrar una barra secundaria de título; `HeaderNav` SHALL seguir siendo la única barra superior.

#### Scenario: Sidebar con título y subtítulo en la cabecera

- **WHEN** se abre una página como Resumen o Movimientos con la navegación lateral en escritorio
- **THEN** la cabecera muestra a la izquierda el título y debajo el subtítulo, a la derecha el buscador y el botón de avisos, y existe un único `h1` visible en la página

#### Scenario: Sin encabezado duplicado en el contenido

- **WHEN** el shell está en modo sidebar y la ventana está en breakpoint de escritorio
- **THEN** el encabezado del contenido no repite el título ni el subtítulo y conserva `actions` y `breadcrumbs`

#### Scenario: Título y subtítulo dinámicos en la cabecera

- **WHEN** se abre una cuenta, un grupo o el resumen con título y subtítulo dinámicos en vista sidebar
- **THEN** la cabecera muestra los mismos valores que antes mostraba el contenido y el `document.title` no cambia

#### Scenario: Tablet y móvil sin cambios

- **WHEN** la ventana está en tablet o móvil con la navegación lateral configurada
- **THEN** el título sigue mostrándose solo en el contenido y ninguna cabecera secundaria duplica el `h1`

#### Scenario: Variante header sin barra de subtítulo

- **WHEN** el shell usa la cabecera superior como navegación principal
- **THEN** solo existe `HeaderNav` en la parte superior, sin una segunda barra con el título y sin buscador ni avisos duplicados

#### Scenario: Contenido sin asomar por encima

- **WHEN** se hace scroll en una página larga con la navegación lateral
- **THEN** ningún encabezado del contenido queda visible por encima de la barra de título pegada al borde superior
