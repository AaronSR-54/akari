import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const svg = readFileSync(path.resolve(__dirname, '../app/icon.svg'), 'utf8');

type Element = Record<string, string>;

function elements(tag: string): Element[] {
  return [...svg.matchAll(new RegExp(`<${tag}\\b([^>]*?)/?>`, 'g'))].map((match) =>
    Object.fromEntries(
      [...match[1]!.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map((attr) => [attr[1]!, attr[2]!]),
    ),
  );
}

const rects = elements('rect');
const circles = elements('circle');

describe('favicon', () => {
  it('usa el icono compacto sin fondo con el trazo de la ı y el círculo ámbar', () => {
    expect(svg).toContain('viewBox="0 0 96 96"');
    expect(svg).toContain('aria-label="akari"');
    expect(svg).not.toMatch(/<text\b>/);

    expect(rects).toHaveLength(1);
    expect(rects[0]).not.toHaveProperty('fill');
    expect(rects[0]?.class).toBe('stem');
    expect(circles).toHaveLength(1);
    expect(circles[0]?.fill).toBe('#E8A33D');

    expect(svg).toContain('prefers-color-scheme');
  });

  it('sitúa el círculo a la derecha del trazo y 1 unidad bajo su línea base', () => {
    const stem = rects[0]!;
    const dot = circles[0]!;
    const stemRight = Number(stem.x) + Number(stem.width);
    const stemBottom = Number(stem.y) + Number(stem.height);
    const dotCenterX = Number(dot.cx);
    const dotCenterY = Number(dot.cy);
    const dotRadius = Number(dot.r);

    expect(dotCenterX - dotRadius).toBeGreaterThan(stemRight);
    expect(dotCenterY).toBeGreaterThan(Number(stem.y) + Number(stem.height) / 2);
    expect(dotCenterY + dotRadius - stemBottom).toBe(1);
  });
});
