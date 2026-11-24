import { render, screen } from '@testing-library/react';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Card, Grid, Inline, PageHeader, Stack } from './layout.js';

const here = path.dirname(fileURLToPath(import.meta.url));

describe('layout', () => {
  it('compone tarjetas, pilas y rejillas sin estilos literales de color', () => {
    const { container } = render(
      <Stack gap={4}>
        <Card padding="lg" variant="raised">
          <PageHeader title="Resumen" description="Contexto" />
        </Card>
        <Grid columns={2}>
          <Inline>Uno</Inline>
          <Inline>Dos</Inline>
        </Grid>
      </Stack>,
    );
    expect(screen.getByRole('heading', { name: 'Resumen' })).toBeInTheDocument();
    expect(container.querySelector('.bg-surface-raised')).toBeInTheDocument();
    expect(container.querySelector('.elevation-2')).toBeInTheDocument();
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('los componentes de UI no contienen colores hexadecimales', () => {
    const files = readdirSync(here).filter((file) => file.endsWith('.tsx'));
    for (const file of files) {
      const source = readFileSync(path.join(here, file), 'utf8');
      expect(source, `${file} contiene un color hexadecimal`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });
});
