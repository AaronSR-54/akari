# Proposal

## Why

Al hacer scroll con el trackpad en Chrome, el rebote elástico del viewport desplaza verticalmente la sidebar y la cabecera superior de escritorio: la navegación deja de sentirse fija y rompe la sensación de marco de aplicación. La cabecera conserva el inset del shell en reposo, así que da un pequeño salto de 16 px al empezar a hacer scroll; además se va con el contenido y repite el título de la sección dentro del shell, y en la variante header deja una segunda barra de subtítulo. En la variante lateral, el avatar de la persona también se repite en la sidebar y junto al buscador.

## What Changes

- Anclar la navegación principal y la barra superior de acciones, sin desplazamientos verticales ni animaciones al hacer scroll.
- Pegar la cabecera de acciones al borde superior en todo momento, también en reposo, sin el salto de 16 px al empezar a hacer scroll. La sidebar conserva su inset flotante.
- Evitar que el rebote elástico del documento (overscroll) arrastre la navegación, manteniendo el scroll normal del contenido.
- Corregir las superficies translúcidas de las barras del shell que hoy no se aplican por usar opacidades no soportadas sobre tokens CSS, para que la navegación fija sea legible sobre el contenido.
- Quitar el título de sección de la cabecera: queda solo con buscador y botón de avisos. En la variante header desaparece la barra de subtítulo y solo queda `HeaderNav`.
- Mostrar la identidad de la persona una sola vez por variante: en el pie de la sidebar cuando la navegación es lateral y en el header superior cuando no lo es.
- Añadir separación entre la cabecera superior y el primer título del contenido en todos los breakpoints, para que no queden pegados.
- Añadir cobertura E2E de regresión para la navegación fija, el overscroll, las superficies de las barras, el avatar único, la cabecera sin título y la separación con el contenido.

**Fuera de alcance**: rediseño de la navegación, cambios de rutas, cambios en el H1 de las páginas, cambiar el inset flotante de la sidebar, app móvil nativa y cualquier animación nueva ligada al scroll.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `producto/shell-web`: la navegación de escritorio debe permanecer fija durante el scroll y el overscroll; la cabecera no debe repetir el título de la sección y debe existir una sola barra superior por variante; la identidad de la persona debe mostrarse una sola vez; y debe existir separación entre la cabecera y el contenido.

## Impact

- Shell web: `apps/web/src/components/shell/sidebar.tsx` (`Sidebar`, `DesktopHeader` y la lógica de título) y `apps/web/src/components/shell/app-shell.tsx`.
- Estilos globales: `apps/web/app/globals.css` para el control de overscroll.
- Sin nuevas dependencias ni cambios de datos, dominio o persistencia.
- Pruebas: `e2e/shell.spec.ts`.
- Documentación: `docs/desarrollo/arquitectura.md` y `docs/diseno/estado.md`.
