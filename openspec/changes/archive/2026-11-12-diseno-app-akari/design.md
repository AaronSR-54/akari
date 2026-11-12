# Design

## Context

Ver `proposal.md` — Why. El repositorio solo contiene OpenSpec, el canvas de producto y el README: no hay código, specs principales ni design system previo. El cambio es exclusivamente de diseño y su destino es el design file de akari en Figma, cuyo `fileKey` se confirmará al inicio del apply.

Restricciones que condicionan el enfoque:

- La UI se diseña en español y el producto se implementará después con Next.js + React Native + Tailwind, con arquitectura hexagonal y hooks headless.
- Un único design system debe servir a móvil y web; los tokens tienen que poder mapearse a variables CSS/Tailwind y al tema de React Native.
- El alcance funcional sale del canvas `docs/Esqueleto - Ideas varias.canvas`; no hay requisitos de negocio adicionales.
- El archivo Figma puede ya contener fundamentos o componentes de akari. Se auditará antes de crear nada.

## Goals / Non-Goals

**Goals:**

- Dejar en Figma una fuente de verdad única con fundamentos, componentes, pantallas móvil y web, prototipos y handoff.
- Validar los flujos y casos límite del canvas antes de escribir código, incluidos estados de carga, vacío, error, sin conexión y éxito.
- Producir tokens y APIs de componentes que se traduzcan de forma directa a Tailwind/RN y a props de React.
- Permitir que una persona de implementación trabaje desde Dev Mode sin ambigüedades.

**Non-Goals:**

- Implementar la app, el backend, la sincronización SQL, el cifrado, la autenticación o los widgets nativos.
- Publicar una librería Figma organizacional; el design system vive dentro del archivo de akari.
- Definir manual de marca, logo definitivo o copywriting final.
- Diseñar todos los casos límite imaginables: se cubren los flujos del canvas y los estados que cambian la experiencia.

## Decisions

### 1. Un único archivo Figma con el design system dentro

El design system, las pantallas y los prototipos viven en el design file de akari, organizados en tres páginas (`00-Portada`, `01-Diseño`, `02-Pantallas`) con secciones internas para fundamentos, componentes, prototipos, móvil, web y archivo. Se evita un archivo de librería independiente porque añade publicación, versionado y sincronización que hoy no aportan valor con un solo producto. Si en el futuro otro producto consume el sistema, se extrae a librería sin rehacer tokens ni componentes. La estructura de tres páginas responde al límite del plan Starter de Figma.

**Alternativa descartada:** archivo `akari-design-system` separado desde el inicio; más correcto a escala, pero prematuro.

### 2. Tokens en dos capas: primitivos y semánticos

Capa primitiva (paleta cruda, escala tipográfica, espaciado, radios, elevación, movimiento) y capa semántica (`surface`, `text-primary`, `border-subtle`, `danger`, `positive`, etc.) con modos claro y oscuro. Las pantallas y componentes consumen solo la capa semántica.

Esto permite cambiar la identidad visual tocando primitivos, mantener dark mode con un mode switch y mapear cada token a una variable CSS/Tailwind o al tema de RN. Nombres en kebab-case, sin abreviaturas opacas.

**Alternativa descartada:** tokens de una sola capa con nombres de color; se rompe en dark mode y mezcla intención con valor.

### 3. Componentes con variant properties y component properties

Los estados (default, hover, focus, pressed, disabled, loading, error) y tamaños son variantes del mismo componente. Los textos, iconos y booleanos de configuración se exponen como component properties. No se crean frames sueltos por estado.

Así la API de Figma se parece a las props que tendrá el componente React y el handoff no obliga a interpretar frames.

**Alternativa descartada:** un frame por estado; duplica mantenimiento y se desincroniza.

### 4. Mobile-first con baseline explícito

Móvil se diseña primero en 390×844 (iOS) y se verifica en 360×800 (Android). Web se adapta después con breakpoints 768, 1024 y 1440, navegación lateral en escritorio y tablas de alta densidad. Los flujos móviles son la referencia funcional; web añade densidad y atajos, no capacidades nuevas salvo las documentadas.

**Alternativa descartada:** diseñar web primero y reducir; pierde la jerarquía mobile-first que pide el canvas.

### 5. Dirección visual inicial “luz cálida”

Akari significa luz. La dirección propuesta es una base neutra cálida (papel), tinta profunda y un acento ámbar luminoso, con verde y rojo solo para semántica financiera. Tipografía sans humanista con numerales tabulares para importes. El objetivo es diferenciarse del fintech azul genérico sin sacrificar legibilidad.

La dirección se valida en la puerta de revisión de fundamentos antes de escalar a componentes y pantallas. Al ser tokens semánticos, cambiar la paleta después es barato. Si el archivo ya tiene identidad de marca, se adopta esa.

**Alternativa descartada:** azul corporativo neutro; seguro pero indistinguible.

### 6. Visualización de datos basada en tokens

Los gráficos usan la paleta semántica de datos y un segundo canal (etiqueta, patrón o forma), sin depender solo del color. No se diseña contra una librería de charts concreta: se entregan especificaciones de serie, ejes, tooltip y estado vacío para que implementación elija.

**Alternativa descartada:** diseñar con el estilo por defecto de una librería; acopla el diseño a una dependencia futura.

### 7. Contenido de ejemplo realista y sin PII

Los frames usan datos verosímiles en español, EUR como divisa base y ejemplos de USD/GBP para conversión. Se incluyen importes largos, nombres largos y textos traducidos para probar truncado y wrapping. Nada de datos personales reales.

### 8. Handoff dentro y fuera de Figma

Las anotaciones de comportamiento viven junto a cada pantalla en Figma. La matriz de cobertura y el changelog se mantienen además en `docs/diseno/` para que la revisión de código y producto no dependa de abrir Figma. La portada del archivo enlaza ambos.

**Alternativa descartada:** todo el handoff solo en Figma; incómodo para implementación y para revisar en git.

### 9. Fases con puertas de revisión

- **F0 Fundamentos:** auditoría del archivo, paleta, tipografía, espaciado, radios, elevación, iconografía, modos.
- **F1 Componentes:** navegación, acciones, formularios, datos, feedback, estados.
- **F2 Móvil:** onboarding, cuentas, movimientos, gastos grupales, dashboard, compartición, notificaciones, datos/sync.
- **F3 Web:** adaptación responsive y vistas de alta densidad.
- **F4 Prototipos y handoff:** flujos conectados, matriz de cobertura, anotaciones, changelog.

Cada fase se revisa y aprueba antes de la siguiente. Esto controla el alcance y evita construir pantallas sobre fundamentos no validados.

### 10. Reutilización antes que creación

Antes de crear variables, estilos o componentes se ejecuta `search_design_system` y se consultan las librerías del archivo. Si akari ya tiene fundamentos, se extienden; si hay duplicados, se consolidan y se archivan. Nunca se crean dos componentes para el mismo propósito.

### 11. Resolución del archivo destino

El apply empieza pidiendo la URL del design file de akari. Si el usuario no la aporta, se ofrece crear un archivo nuevo. El `fileKey` queda registrado en la portada del archivo y en el changelog para futuras sesiones. No es una decisión abierta: es una entrada obligatoria de la primera tarea.

## Risks / Trade-offs

- **Alcance amplio para una fase de diseño** → fases con puertas, matriz de cobertura y prioridad a los cuatro flujos clave (cuenta, movimiento, gasto grupal, dashboard).
- **Deriva entre diseño e implementación** → tokens semánticos mapeables, API de componentes documentada y checklist de handoff antes de aprobar.
- **Conflicto con un design system preexistente en akari** → auditoría y reutilización primero; consolidar y archivar duplicados, nunca convivir con dos sistemas.
- **Falta del enlace o del `fileKey`** → primera tarea bloqueante; sin archivo destino no se escribe nada.
- **Divergencia móvil/web** → mismos componentes y variables, matriz de paridad y notas explícitas de diferencias.
- **Regresiones de accesibilidad** → contraste AA, foco visible, objetivos de 44 px y segundo canal en gráficos como criterios de revisión.
- **Límites o lentitud del MCP de Figma en archivos grandes** → operaciones por fase, componentes antes que pantallas, verificación visual al cerrar cada fase.
- **Textos en español más largos que el diseño** → reglas de truncado, samples largos y revisión de wrapping en móvil.
- **Diferencias nativas iOS/Android** → notas de plataforma y frames específicos solo donde la safe area o el patrón cambian; no duplicar todo.
- **Exceso de fidelidad prematuro** → el objetivo es validar flujos y sistema, no pulir microanimaciones antes de aprobar la arquitectura visual.

## Migration Plan

No hay migración de producción. El “despliegue” es la aprobación por fases dentro de Figma:

1. Auditar el archivo destino y registrar el `fileKey`; si no hay archivo, crearlo.
2. Ejecutar F0 y congelar fundamentos aprobados.
3. Construir F1 sobre fundamentos aprobados.
4. Diseñar F2 y aprobar flujos móviles.
5. Adaptar F3 y aprobar paridad web.
6. Cerrar F4 y marcar los flujos como aprobados.

Rollback: antes de una reestructuración grande se duplica la sección afectada en la sección Archivo de `02-Pantallas` y se anota en el changelog. Los cambios de tokens se hacen en la capa primitiva o semántica, nunca pantalla a pantalla.

## Open Questions

- ¿Existe un manual de marca, logo o paleta corporativa que deba respetarse? Se puede responder en la revisión de F0 sin cambiar el enfoque ni las tareas.
- ¿Hay fuentes licenciadas o preferidas en la cuenta de Figma? Si no, se usan alternativas de Google Fonts y los tokens permiten sustituirlas después.
