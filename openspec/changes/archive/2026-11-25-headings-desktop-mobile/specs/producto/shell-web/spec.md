# Spec Delta

## MODIFIED Requirements

### Requirement: Cabecera con título y subtítulo en sidebar

La variante sidebar SHALL mostrar en la cabecera fija `DesktopHeader`, como único encabezado visible en escritorio, el título de la sección (`h1`) y, cuando la pantalla lo defina, su subtítulo (`meta`/`description`). Una pantalla MAY omitir el subtítulo para dejar el `h1` centrado verticalmente en la cabecera. El contenido MUST NOT repetir ninguno de los dos en escritorio; `actions` y `breadcrumbs` permanecen en el contenido. Una pantalla MAY ocultar su bloque de título/subtítulo en móvil cuando esa información ya esté presente en el cuerpo; en tablet el título SHALL seguir mostrándose en el contenido. La variante header MUST NOT mostrar una barra secundaria de título; `HeaderNav` SHALL seguir siendo la única barra superior.

#### Scenario: Sidebar con título y subtítulo en la cabecera

- **WHEN** se abre una página como Movimientos o Ajustes con la navegación lateral en escritorio
- **THEN** la cabecera muestra a la izquierda el título y debajo el subtítulo, a la derecha el buscador y el botón de avisos, y existe un único `h1` visible en la página

#### Scenario: Cabecera con el título solo

- **WHEN** se abre el resumen con la navegación lateral en escritorio
- **THEN** la cabecera muestra únicamente el saludo como `h1`, centrado verticalmente y sin subtítulo debajo
- **AND** el buscador y el botón de avisos siguen a la derecha y el `h1` sigue siendo el único visible en la página

#### Scenario: Sin encabezado duplicado en el contenido

- **WHEN** el shell está en modo sidebar y la ventana está en breakpoint de escritorio
- **THEN** el encabezado del contenido no repite el título ni el subtítulo y conserva `actions` y `breadcrumbs`

#### Scenario: Título y subtítulo dinámicos en la cabecera

- **WHEN** se abre una cuenta, un grupo o una pantalla con título y subtítulo dinámicos en vista sidebar
- **THEN** la cabecera muestra los mismos valores que antes mostraba el contenido y el `document.title` no cambia

#### Scenario: Tablet y móvil sin cambios

- **WHEN** la ventana está en tablet o móvil con la navegación lateral configurada
- **THEN** en tablet el título sigue mostrándose solo en el contenido y ninguna cabecera secundaria duplica el `h1`
- **AND** en móvil el resumen no renderiza el bloque con el saludo ni su subtítulo porque la fecha y el número de cuentas ya están en el cuerpo

#### Scenario: Páginas de navegación sin título en móvil

- **WHEN** la ventana está en móvil y se abre Movimientos, Grupos o Ajustes
- **THEN** el título de la sección no se renderiza en el contenido porque la navegación ya nombra el destino
- **AND** las acciones de la pantalla siguen visibles en móvil

#### Scenario: Páginas fuera de la navegación conservan el título

- **WHEN** se abre una pantalla que no está en la navegación, como una cuenta, un grupo, un formulario o Preguntas rápidas
- **THEN** el título sigue visible en móvil, tablet y escritorio
- **AND** el contexto que antes era subtítulo de la cabecera se muestra en el cuerpo con la misma tipografía que el resumen

#### Scenario: Variante header sin barra de subtítulo

- **WHEN** el shell usa la cabecera superior como navegación principal
- **THEN** solo existe `HeaderNav` en la parte superior, sin una segunda barra con el título y sin buscador ni avisos duplicados

#### Scenario: Contenido sin asomar por encima

- **WHEN** se hace scroll en una página larga con la navegación lateral
- **THEN** ningún encabezado del contenido queda visible por encima de la barra de título pegada al borde superior
