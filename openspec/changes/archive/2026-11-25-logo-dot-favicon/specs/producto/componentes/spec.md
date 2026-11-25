# Spec Delta

## ADDED Requirements

### Requirement: Círculo de la marca como punto final

El componente `Logo` SHALL colocar el círculo ámbar a la derecha del glifo o del wordmark y SHALL apoyar su base en la línea base, como punto final de frase, sin tapar ningún trazo ni desplazar el texto.

#### Scenario: Logotipo compacto en la sidebar colapsada

- **WHEN** se renderiza `Logo` con `format="initial"`
- **THEN** el círculo ámbar queda a la derecha de la «ı» y su base coincide con la línea base del glifo, por debajo de su centro vertical

#### Scenario: Logotipo expandido

- **WHEN** se renderiza `Logo` con `format="expanded"` en cualquier tamaño
- **THEN** el círculo ámbar continúa situado tras el wordmark «akarı» y su base coincide con la línea base del texto

#### Scenario: Accesibilidad y dimensiones

- **WHEN** se renderiza cualquiera de los formatos del logotipo
- **THEN** conserva `role="img"` con el nombre accesible «akari», los adornos siguen siendo `aria-hidden` y el alto del conjunto no cambia respecto a la versión anterior

### Requirement: Favicon con el icono compacto

La aplicación SHALL servir como favicon el icono compacto de la marca, formado por el trazo de la «ı» y el círculo ámbar a su derecha y apoyado en su línea base, y MUST NOT servir el monograma «a» sobre cuadrado redondeado.

#### Scenario: Recurso del favicon

- **WHEN** el navegador solicita el icono del sitio
- **THEN** recibe un SVG con el trazo de la «ı» y un círculo ámbar situado a su derecha y con su base coincidiendo con la base del trazo

#### Scenario: Contraste en ambos temas

- **WHEN** el favicon se muestra en una pestaña con tema claro o con tema oscuro
- **THEN** el trazo usa tinta en claro y papel en oscuro mediante `prefers-color-scheme` y el círculo conserva su ámbar, sin alterar la composición del icono
