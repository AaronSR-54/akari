'use client';

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageTitle, PageTitleProvider, usePageTitle } from './page-title';
import { PageHeaderResponsive } from './page-header-responsive';

vi.mock('./hooks', () => ({
  useSettings: () => ({ shellMode: 'sidebar' }),
}));

function TitleReader() {
  const { title, meta, titleAction } = usePageTitle();
  return (
    <>
      <span data-testid="context-title">{title}</span>
      <span data-testid="context-meta">{meta}</span>
      <span data-testid="context-action">{titleAction}</span>
    </>
  );
}

describe('page-title', () => {
  it('actualiza document.title sin tocar el título de la cabecera', async () => {
    render(
      <PageTitleProvider>
        <PageTitle title="Resumen" />
        <TitleReader />
      </PageTitleProvider>,
    );
    await waitFor(() => {
      expect(document.title).toBe('Resumen · akari');
      expect(screen.getByTestId('context-title').textContent).toBe('');
      expect(screen.getByTestId('context-meta').textContent).toBe('');
    });
  });

  it('PageHeaderResponsive publica título y subtítulo en el contexto', async () => {
    render(
      <PageTitleProvider>
        <PageHeaderResponsive
          title="Buenos días, Marta"
          meta="domingo, 29 de noviembre · 3 cuentas en este dispositivo"
        />
        <TitleReader />
      </PageTitleProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('context-title').textContent).toBe('Buenos días, Marta');
      expect(screen.getByTestId('context-meta').textContent).toBe(
        'domingo, 29 de noviembre · 3 cuentas en este dispositivo',
      );
    });
  });

  it('publica la acción junto al título', async () => {
    render(
      <PageTitleProvider>
        <PageHeaderResponsive title="Cuenta diaria" titleAction={<button>Cambiar</button>} />
        <TitleReader />
      </PageTitleProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('context-action').textContent).toBe('Cambiar');
    });
  });
});
