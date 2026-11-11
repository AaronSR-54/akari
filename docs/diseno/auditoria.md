# Auditoría del design file de akari

- **Archivo:** akari
- **URL:** https://www.figma.com/design/npwsfgd0s4n4UWszvg28wv/akari
- **fileKey:** `npwsfgd0s4n4UWszvg28wv`
- **Fecha:** 2026-11-11
- **Sesión Figma:** `59d406ed-013d-48c0-8435-8e645fd7f495`

## Inventario inicial

| Elemento | Hallazgo |
| --- | --- |
| Páginas | 1 (`Page 1`) |
| Nodos en la página | 1 frame vacío `Frame 1` de 731×645 |
| Colecciones de variables | 0 |
| Variables locales | 0 |
| Estilos de texto | 0 |
| Estilos de efecto | 0 |
| Estilos de pintura | 0 |
| Componentes y component sets | 0 |
| Instancias | 0 |
| Librerías añadidas | Team library, Material 3, Simple Design System, iOS/iPadOS 26, watchOS 26, visionOS 26, macOS 26, iOS/iPadOS 27, macOS 27 |
| Búsquedas en librerías | `button`, `input`, `surface`, `space`, `heading`: sin resultados |

## Decisión

1. **Se reutiliza:** nada del contenido actual; el archivo no tiene design system previo.
2. **Se extiende:** no aplica.
3. **Se archiva como duplicado:** no hay duplicados. El `Frame 1` vacío se elimina y su espacio lo ocupa la portada.
4. **Se construye:** un design system propio de akari dentro del archivo, con fundamentos en la sección `Fundamentos` de `01-Diseño` y componentes en la sección `Componentes` de la misma página.
5. **Librerías de comunidad:** no se adoptan Material 3, Simple Design System ni los kits de Apple porque la dirección visual de akari es propia y mezclar kits rompería la consistencia de tokens. La team library no devolvió activos para las consultas realizadas.

## Consecuencia para el plan

No hay migración ni consolidación pendiente. La F0 parte de cero y puede definir los tokens sin conflictos. Cualquier activo que se cree queda registrado en el changelog de la portada.
