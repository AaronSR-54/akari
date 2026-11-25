import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  borders,
  elevations,
  grids,
  motion,
  primitiveColors,
  radius,
  semanticColors,
  sizes,
  space,
  textStyles,
} from './tokens.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = readFileSync(path.resolve(here, '../../../docs/diseno/fundamentos.md'), 'utf8');
const generated = readFileSync(path.resolve(here, '../generated/tokens.css'), 'utf8');

function section(start: string, end: string) {
  const startIndex = docs.indexOf(start);
  const endIndex = docs.indexOf(end, startIndex + start.length);
  return docs.slice(startIndex, endIndex === -1 ? undefined : endIndex);
}

function matches(source: string, regex: RegExp): string[] {
  return [...source.matchAll(regex)].map((match) => match[1]!);
}

describe('tokens de diseño', () => {
  it('los primitivos de color coinciden con la tabla de fundamentos', () => {
    const documented = new Map<string, string>();
    for (const match of section('## 3. Primitivos de color', '## 4. Primitivos numéricos').matchAll(
      /`(color\/[^`]+)`\s*\|\s*`(#[0-9A-Fa-f]{6})`/g,
    )) {
      documented.set(match[1]!, match[2]!.toUpperCase());
    }
    expect(Object.keys(primitiveColors)).toHaveLength(documented.size);
    for (const [name, value] of documented) {
      expect(primitiveColors[name]?.value, name).toBe(value);
    }
  });

  it('los colores semánticos y sus dos modos coinciden con la documentación', () => {
    const documented = new Map<string, { light: string; dark: string }>();
    for (const match of section('## 5. Tokens semánticos de color', 'Notas de uso:').matchAll(
      /`((?:surface|text|border|accent|status|focus|overlay|data)\/[^`]+)`\s*\|\s*(#[0-9A-Fa-f]{6})\s*\|\s*(#[0-9A-Fa-f]{6})/g,
    )) {
      documented.set(match[1]!, { light: match[2]!.toUpperCase(), dark: match[3]!.toUpperCase() });
    }
    expect(Object.keys(semanticColors)).toHaveLength(36);
    expect(documented.size).toBe(36);
    for (const [name, values] of documented) {
      expect(semanticColors[name], name).toEqual(values);
    }
  });

  it('los primitivos numéricos coinciden con la tabla', () => {
    const documented = new Map<string, number>();
    for (const match of section('## 4. Primitivos numéricos', '## 5. Tokens semánticos').matchAll(
      /`((?:space|radius|size|border|motion)\/[^`]+)`\s+(\d+)/g,
    )) {
      documented.set(match[1]!, Number(match[2]));
    }
    const current = { ...space, ...radius, ...sizes, ...borders, ...motion };
    expect(Object.keys(current)).toHaveLength(31);
    expect(documented.size).toBe(31);
    for (const [name, value] of documented) {
      expect(current[name as keyof typeof current], name).toBe(value);
    }
  });

  it('la escala tipográfica incluye los 49 estilos documentados', () => {
    const typography = section('## 7. Tipografía', '## 8. Elevación');
    const tableRows = typography
      .split('\n')
      .filter((line) => line.trim().startsWith('|'))
      .join('\n');
    const documented = new Set(
      matches(
        tableRows,
        /`((?:UI|Display|Heading|Body|Label|Numeric)\/[^`]+|Caption)`/g,
      ),
    );
    expect(documented.size).toBe(49);
    expect(Object.keys(textStyles).sort()).toEqual([...documented].sort());
  });

  it('elevaciones y grids documentados existen con el mismo nombre', () => {
    const elevationNames = matches(
      section('## 8. Elevación', '## 9. Grid'),
      /`(Elevation\/\d)`/g,
    );
    const gridNames = matches(
      section('## 9. Grid', '## 10. Movimiento'),
      /`(Grid\/[^`]+)`/g,
    );
    expect(Object.keys(elevations).sort()).toEqual(elevationNames.sort());
    expect(Object.keys(grids).sort()).toEqual([...new Set(gridNames)].sort());
  });

  it('el CSS generado expone todos los tokens semánticos, numéricos y de tipografía', () => {
    for (const name of Object.keys(semanticColors)) {
      expect(generated).toContain(`--color-${name.replace('/', '-')}:`);
    }
    for (const name of Object.keys(space)) {
      expect(generated).toContain(`--${name.replace('/', '-')}:`);
    }
    for (const name of Object.keys(textStyles)) {
      expect(generated).toContain(`.text-${name.replace(/\//g, '-').replace(/ /g, '-').toLowerCase()}`);
    }
    expect(generated).toContain('prefers-reduced-motion');
  });

  it('cada color semántico expone canales RGB para aplicar opacidad', () => {
    const channels = (hex: string) => {
      const value = hex.replace('#', '');
      return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16)).join(' ');
    };
    const blockFrom = (marker: string) => {
      const start = generated.indexOf(marker);
      const open = generated.indexOf('{', start);
      const end = generated.indexOf('}', open);
      return generated.slice(open, end);
    };
    const light = blockFrom(':root, [data-theme="light"]');
    const dark = blockFrom('[data-theme="dark"]');

    for (const [name, values] of Object.entries(semanticColors)) {
      const key = `--color-${name.replace('/', '-')}-rgb:`;
      expect(light, name).toContain(`${key} ${channels(values.light)};`);
      expect(dark, name).toContain(`${key} ${channels(values.dark)};`);
    }

    const presetSource = readFileSync(
      path.resolve(here, '../generated/tailwind-preset.cjs'),
      'utf8',
    );
    expect(presetSource).toContain('rgb(var(--color-overlay-scrim-rgb) / <alpha-value>)');
  });

  it('el preset de Tailwind conserva la escala que usan las pantallas del archivo', () => {
    const presetSource = readFileSync(
      path.resolve(here, '../generated/tailwind-preset.cjs'),
      'utf8',
    );
    const preset = JSON.parse(
      presetSource.replace(/^[\s\S]*?module\.exports = /, '').replace(/;\s*$/, ''),
    ) as {
      theme: {
        extend: {
          spacing: Record<string, string>;
          boxShadow: Record<string, string>;
          maxWidth: Record<string, string>;
        };
      };
    };
    // Alturas y paddings de W01–W08: 44, 52, 56, 10, 14 y 22 px.
    for (const [step, value] of Object.entries({
      '2.5': '10px',
      '3.5': '14px',
      '5.5': '22px',
      '11': '44px',
      '13': '52px',
      '14': '56px',
    })) {
      expect(preset.theme.extend.spacing[step], step).toBe(value);
    }
    expect(preset.theme.extend.boxShadow['elevation-1']).toBe('var(--elevation-1)');
    expect(preset.theme.extend.maxWidth.modal).toBe('440px');
  });
});
