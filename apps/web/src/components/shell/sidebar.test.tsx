'use client';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesktopHeader } from './sidebar';

describe('DesktopHeader', () => {
  it('muestra título y subtítulo con buscador y avisos', () => {
    render(
      <DesktopHeader
        title="Buenos días, Marta"
        meta="domingo, 29 de noviembre · 3 cuentas en este dispositivo"
        onOpenSearch={vi.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Buenos días, Marta', level: 1 })).not.toBeNull();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('domingo, 29 de noviembre · 3 cuentas en este dispositivo')).not.toBeNull();
    expect(screen.getByRole('button', { name: /buscar/i })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Avisos' })).not.toBeNull();
  });

  it('omite el subtítulo cuando está vacío', () => {
    render(<DesktopHeader title="Grupos" meta="" onOpenSearch={vi.fn()} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByText(/domingo/i)).toBeNull();
  });
});
