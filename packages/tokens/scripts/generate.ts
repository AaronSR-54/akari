import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  borders,
  elevations,
  fontFamily,
  grids,
  motion,
  primitiveColors,
  radius,
  semanticColors,
  sizes,
  space,
  textStyles,
  tokenCatalog,
} from '../src/tokens.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../generated');

const kebab = (value: string) =>
  value
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

const classForStyle = (name: string) => `text-${kebab(name)}`;

const weightValue: Record<number, number> = {
  400: 400,
  500: 500,
  600: 600,
  700: 700,
};

function themeBlock(theme: 'light' | 'dark') {
  const lines: string[] = [];
  for (const [name, values] of Object.entries(semanticColors)) {
    lines.push(`  --color-${kebab(name)}: ${values[theme]};`);
  }
  return lines.join('\n');
}

function baseBlock() {
  const lines: string[] = [];

  for (const [name, entry] of Object.entries(primitiveColors)) {
    lines.push(`  --${kebab(name)}: ${entry.value};`);
  }

  for (const [name, value] of Object.entries(space)) {
    lines.push(`  --${kebab(name)}: ${value}px;`);
  }

  for (const [name, value] of Object.entries(radius)) {
    lines.push(`  --${kebab(name)}: ${value}px;`);
  }

  for (const [name, value] of Object.entries(sizes)) {
    lines.push(`  --${kebab(name)}: ${value}px;`);
  }

  for (const [name, value] of Object.entries(borders)) {
    lines.push(`  --${kebab(name)}: ${value}px;`);
  }

  for (const [name, value] of Object.entries(motion)) {
    lines.push(`  --${kebab(name)}: ${value}ms;`);
  }

  for (const [name, entry] of Object.entries(elevations)) {
    lines.push(`  --${kebab(name)}: ${entry.value};`);
  }

  for (const [name, entry] of Object.entries(grids)) {
    const suffix = kebab(name);
    lines.push(`  --${suffix}-columns: ${entry.columns};`);
    lines.push(`  --${suffix}-gutter: ${entry.gutter}px;`);
    lines.push(`  --${suffix}-margin: ${entry.margin}px;`);
  }

  lines.push(`  --font-sans: ${fontFamily};`);
  return lines.join('\n');
}

function typographyBlock() {
  const lines: string[] = [];
  for (const [name, style] of Object.entries(textStyles)) {
    const isNumeric = name.startsWith('Numeric/');
    lines.push(
      [
        `.${classForStyle(name)} {`,
        `  font-size: ${style.size}px;`,
        `  line-height: ${style.lineHeight === 'auto' ? 'normal' : `${style.lineHeight}px`};`,
        `  font-weight: ${weightValue[style.weight] ?? style.weight};`,
        ...(isNumeric
          ? ['  font-variant-numeric: tabular-nums;', '  font-feature-settings: "tnum";']
          : []),
        '}',
      ].join('\n'),
    );
  }

  lines.push(
    [
      '.font-tabular {',
      '  font-variant-numeric: tabular-nums;',
      '  font-feature-settings: "tnum";',
      '}',
      '',
      '.elevation-1 { box-shadow: var(--elevation-1); }',
      '.elevation-2 { box-shadow: var(--elevation-2); }',
      '.elevation-3 { box-shadow: var(--elevation-3); }',
      '',
      '.grid-web {',
      '  display: grid;',
      '  grid-template-columns: repeat(12, minmax(0, 1fr));',
      '  gap: var(--grid-web-12col-gutter);',
      '}',
      '',
      '.grid-mobile {',
      '  display: grid;',
      '  grid-template-columns: repeat(4, minmax(0, 1fr));',
      '  gap: var(--grid-mobile-4col-gutter);',
      '}',
      '',
      '@media (prefers-reduced-motion: reduce) {',
      '  *, *::before, *::after {',
      '    animation-duration: 0.01ms !important;',
      '    animation-iteration-count: 1 !important;',
      '    transition-duration: 0.01ms !important;',
      '    scroll-behavior: auto !important;',
      '  }',
      '}',
    ].join('\n'),
  );

  return lines.join('\n\n');
}

function buildCss() {
  return [
    '/* Generado por packages/tokens/scripts/generate.ts. No editar a mano. */',
    ':root, [data-theme="light"] {',
    '  color-scheme: light;',
    baseBlock(),
    themeBlock('light'),
    '}',
    '',
    '[data-theme="dark"] {',
    '  color-scheme: dark;',
    themeBlock('dark'),
    '}',
    '',
    typographyBlock(),
    '',
  ].join('\n');
}

function nestedSemanticColors() {
  const colors: Record<string, Record<string, string>> = {};
  for (const name of Object.keys(semanticColors)) {
    const parts = name.split('/');
    const group = parts[0]!;
    const key = parts.slice(1).join('-');
    const bucket = colors[group] ?? {};
    bucket[key] = `var(--color-${kebab(name)})`;
    colors[group] = bucket;
  }
  return colors;
}

// Escala de 4 px usada por los diseños W01–W08. Incluye los medios pasos que
// Figma emplea (10, 14, 22 px) para no perder utilidades al compilar Tailwind.
const SPACING_STEPS = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64,
  72, 80, 96,
];

function buildPreset() {
  const spacing: Record<string, string> = {};
  for (const step of SPACING_STEPS) {
    spacing[String(step)] = `${step * 4}px`;
  }
  // Los tokens documentados mandan sobre la escala derivada.
  for (const [name, value] of Object.entries(space)) {
    spacing[name.replace('space/', '')] = `${value}px`;
  }

  const borderRadius: Record<string, string> = {};
  for (const [name, value] of Object.entries(radius)) {
    borderRadius[name.replace('radius/', '')] = `${value}px`;
  }

  const boxShadow: Record<string, string> = {};
  for (const name of Object.keys(elevations)) {
    boxShadow[kebab(name)] = `var(--${kebab(name)})`;
  }

  const transitionDuration: Record<string, string> = {};
  for (const [name, value] of Object.entries(motion)) {
    transitionDuration[name.replace('motion/', '')] = `${value}ms`;
  }

  const preset = {
    theme: {
      colors: nestedSemanticColors(),
      borderRadius,
      transitionDuration,
      fontFamily: {
        sans: ["'Inter Variable'", 'Inter', 'system-ui', 'sans-serif'],
      },
      extend: {
        spacing,
        boxShadow,
        maxWidth: {
          content: '1296px',
          state: '420px',
          modal: '440px',
          sheet: '560px',
        },
      },
    },
  };

  return `/* Generado por packages/tokens/scripts/generate.ts. No editar a mano. */
module.exports = ${JSON.stringify(preset, null, 2)};
`;
}

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'tokens.css'), buildCss(), 'utf8');
await writeFile(path.join(outDir, 'tailwind-preset.cjs'), buildPreset(), 'utf8');
await writeFile(
  path.join(outDir, 'catalog.json'),
  `${JSON.stringify(
    {
      ...tokenCatalog,
      generatedAt: 'deterministic',
      source: 'packages/tokens/src/tokens.ts',
    },
    null,
    2,
  )}\n`,
  'utf8',
);

console.log('Tokens generated in packages/tokens/generated');
