import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../../..');

// Escala de 4 px que comparten Figma, los tokens y el preset de Tailwind.
const SPACING = new Set([
  '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7',
  '7.5', '8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24', '28',
  '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96',
]);

const SPACING_UTILITY = /(?:^|[\s"'`])(?:-)?(gap|space-x|space-y|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-([0-9]+(?:\.[0-9]+)?)(?=[\s"'`]|$)/g;
const ARBITRARY_SPACING = /(?:^|[\s"'`])(?:-)?(gap|space-x|space-y|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-\[/g;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return files(full);
    if (!full.endsWith('.tsx') || full.endsWith('.test.tsx')) return [];
    // El logo usa geometría vectorial propia del archivo de diseño.
    if (full.endsWith('logo.tsx')) return [];
    return [full];
  });
}

describe('sistema de espaciado', () => {
  it('las pantallas y componentes solo usan pasos de la escala de diseño', () => {
    const offenders: string[] = [];
    for (const file of [...files(path.join(root, 'apps/web/src')), ...files(path.join(root, 'packages/ui/src'))]) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(SPACING_UTILITY)) {
        const step = match[2]!;
        if (!SPACING.has(step)) {
          offenders.push(`${path.relative(root, file)}: ${match[1]}-${step}`);
        }
      }
      for (const match of source.matchAll(ARBITRARY_SPACING)) {
        offenders.push(`${path.relative(root, file)}: ${match[1]}-[...]`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
