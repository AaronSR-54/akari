import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, resolveTheme } from './theme.js';
import { THEME_STORAGE_KEY, themeScript } from './theme-script.js';

describe('theme', () => {
  it('resuelve claro, oscuro y sistema', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('el script aplica el tema antes del primer pintado', () => {
    const script = themeScript();
    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain('prefers-color-scheme: dark');
    expect(script).toContain('dataset.theme');
  });

  it('respeta la preferencia guardada y la aplica al documento', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(
      <ThemeProvider>
        <p>Tema</p>
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
    expect(screen.getByText('Tema')).toBeInTheDocument();
  });

  it('sin preferencia guardada sigue al sistema', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
    render(
      <ThemeProvider>
        <p>Tema</p>
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
  });
});
