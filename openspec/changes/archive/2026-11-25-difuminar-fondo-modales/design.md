# Design

## Context

Ver `proposal.md` para el motivo. El estado actual que condiciona la solución:

- `feedback.tsx` aplica `bg-overlay-scrim/50` al contenedor fijo del `Modal`. El token `overlay/scrim` se genera como `--color-overlay-scrim: #1F1B16` y el preset de Tailwind lo expone como `var(--color-overlay-scrim)`. Tailwind 3 no puede aplicar la opacidad `50` sobre un hexadecimal dentro de una variable, así que la declaración resultante es inválida y el scrim queda transparente (verificado en navegador: `background-color: rgba(0, 0, 0, 0)`).
- El bloqueo de scroll ya existe (`document.body.style.overflow = 'hidden'`) y funciona en Chromium, pero no tiene pruebas y no cubre `html` en navegadores que desplazan ese elemento.
- El diseño congelado define el scrim por color y opacidad 40–60 %, pero no menciona desenfoque.

## Goals / Non-Goals

**Goals:**

- Que el scrim atenúe de verdad y difumine el fondo en todos los overlays que usan `Modal`/`BottomSheet`.
- Que el bloqueo de scroll sea explícito, restaurable y comprobable, incluido el caso de overlays superpuestos.
- Mantener los tokens como única fuente de color y opacidad.

**Non-Goals:**

- Añadir animación de entrada/salida del overlay o del desenfoque.
- Cambiar la estructura o el tamaño del panel del modal.
- Introducir un token nuevo de desenfoque: se usa la escala de `backdrop-blur` de Tailwind y se anota la desviación.

## Decisions

1. **Canales RGB en los tokens semánticos.** `generate.ts` emite, junto a cada `--color-<token>: #hex`, un `--color-<token>-rgb: r g b` por tema, y el preset pasa a `rgb(var(--color-<token>-rgb) / <alpha-value>)`. Así `bg-overlay-scrim/50` funciona y cualquier color semántico admite opacidad sin tocar los componentes.
   - Alternativa descartada: `color-mix()` en una clase arbitraria del componente. Depende de una expresión literal en el componente y no arregla el resto de colores.
   - Alternativa descartada: duplicar el scrim en dos capas (una con `opacity-50`). Atenúa también el panel o degrada el `backdrop-filter`, y complica el cierre por clic fuera.

2. **Desenfoque con `backdrop-blur-sm` (4 px) sobre el scrim.** Es un efecto estático, así que no consume tokens de movimiento ni necesita animación. Se aplica al mismo contenedor que el color para que el clic fuera siga funcionando.
   - Alternativa descartada: token `overlay/blur` nuevo. Sería definir diseño nuevo; con el diseño congelado se prefiere documentar la desviación y usar la escala estándar.

3. **Bloqueo de scroll sobre `body` y `html` con guardado y restauración.** El efecto del modal guarda `body.style.overflow` y `documentElement.style.overflow`, los pone a `hidden` y los restaura al desmontar. No se usa `position: fixed` con compensación de scroll porque provoca saltos de layout y complica la restauración de la posición.
   - Overlays superpuestos: cada instancia guarda el valor que encuentra (la segunda guarda `hidden`) y lo restaura; el último en cerrarse devuelve el valor original.
   - El panel mantiene `overflow-y-auto`, por lo que su contenido largo sigue siendo desplazable sin mover la página.

4. **Cobertura en dos niveles.** Prueba de componente (`feedback.test.tsx`) para el bloqueo y la restauración de `overflow`, y E2E sobre un modal real para el scrim atenuado/difuminado y `window.scrollY` constante ante la rueda.

## Risks / Trade-offs

- [El cambio de preset afecta a todos los colores semánticos] → Solo cambia la forma de resolver el mismo hexadecimal; se añade una prueba que compara los canales RGB con el hex original y se ejecutan todos los tests y E2E.
- [Al ocultar el scroll se pierde el ancho de la barra y el layout salta] → Comportamiento que ya existía con `body`; se mantiene y se documenta como límite conocido.
- [`backdrop-filter` no soportado en navegadores antiguos] → El scrim sigue atenuando con el color; el desenfoque es progresivo.
- [Cambio visual no previsto en el diseño congelado] → Se registra en `docs/desarrollo/desviaciones.md` y se continúa con el código.

## Migration Plan

1. Regenerar tokens y comprobar que el preset y el CSS conservan los hexadecimales y añaden los canales RGB.
2. Aplicar scrim y bloqueo en `feedback.tsx`.
3. Añadir pruebas de componente y E2E; ejecutar `typecheck`, `lint`, `test`, `build` y `e2e`.
4. Rollback: revertir la rama devuelve el scrim transparente anterior; no hay datos ni migraciones implicadas.
