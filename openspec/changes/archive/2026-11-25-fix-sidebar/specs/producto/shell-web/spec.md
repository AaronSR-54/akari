# Spec Delta

## MODIFIED Requirements

### Requirement: Navegación principal de escritorio

La aplicación web SHALL ofrecer una navegación principal persistente en escritorio con los destinos Resumen, Movimientos, Grupos y Ajustes, y SHALL indicar el destino activo. La expansión transitoria por hover o foco SHALL superponerse al contenido con sombra y atenuación sin alterar el ancho del área principal; la expansión fijada SHALL reservar el ancho completo y redimensionar el contenido.

#### Scenario: Destino activo

- **WHEN** la persona navega a cualquier sección principal
- **THEN** el shell marca esa sección como activa de forma textual y visual, no solo por color

#### Scenario: Sidebar compacta y expandida

- **WHEN** la ventana está en escritorio
- **THEN** la sidebar arranca compacta, se expande con hover o con el control dedicado y se colapsa al salir o al usar el control

#### Scenario: Expansión de la sidebar sin desplazar el contenido

- **WHEN** la persona hace hover sobre la sidebar compacta y esta pasa a la vista expandida sin fijarla
- **THEN** el panel se dibuja sobre el contenido con sombra pronunciada y una atenuación ligera, y el área principal conserva el mismo ancho y posición que en estado compacto

#### Scenario: Sidebar fijada abierta

- **WHEN** la persona usa el control para fijar la sidebar en la vista expandida
- **THEN** el shell reserva 240 px para la navegación, el contenido se redimensiona para verse entero y no aparece la atenuación

#### Scenario: Colapso tras la expansión superpuesta

- **WHEN** la persona retira el puntero de la sidebar expandida sin haber fijado el panel
- **THEN** la sidebar vuelve a la vista compacta, desaparecen la sombra pronunciada y la atenuación, y el contenido recupera su ancho sin desplazarse

#### Scenario: Navegación exclusiva

- **WHEN** se muestra la sidebar
- **THEN** no se muestra simultáneamente el header superior alternativo como segunda navegación principal

## ADDED Requirements

### Requirement: Tamaños unificados de la navegación

El shell SHALL usar una misma escala de tamaños para el logotipo, los ítems de navegación y el avatar en todas sus variantes, de modo que cambiar entre sidebar y header no altere esas dimensiones.

#### Scenario: Tamaños en escritorio

- **WHEN** se compara la sidebar expandida con `HeaderNav` en escritorio
- **THEN** ambos muestran el logotipo expandido a 32 px, los ítems de navegación con altura de 44 px y el avatar a 40 px

#### Scenario: Tamaños en tablet

- **WHEN** se muestra la navegación superior en el breakpoint de tablet
- **THEN** los ítems de navegación miden 44 px de altura y el avatar mide 40 px, con el logotipo expandido a 32 px

#### Scenario: Tamaños en móvil

- **WHEN** se muestra la barra superior y la barra inferior en móvil
- **THEN** el avatar de la barra superior mide 40 px y los destinos de la barra inferior mantienen un objetivo táctil de al menos 44 px

#### Scenario: Identidad sin duplicados

- **WHEN** se unifican los tamaños de la navegación
- **THEN** sigue apareciendo un único avatar por variante y el logotipo conserva su etiqueta accesible
