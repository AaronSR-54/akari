import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOBILE_MEDIA_QUERY, useMediaQuery } from './media.js';

function stubMatchMedia(initial: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const queryList = {
    matches: initial,
    media: MOBILE_MEDIA_QUERY,
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(() => queryList),
  });
  return {
    listeners,
    setMatches(matches: boolean) {
      queryList.matches = matches;
      act(() => {
        for (const listener of listeners) listener({ matches } as MediaQueryListEvent);
      });
    },
  };
}

function Probe() {
  const mobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  return <span data-testid="probe">{mobile ? 'móvil' : 'escritorio'}</span>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMediaQuery', () => {
  it('parte del valor de matchMedia', () => {
    stubMatchMedia(true);
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('móvil');
  });

  it('se actualiza al cambiar la media query y deja de escuchar al desmontar', () => {
    const media = stubMatchMedia(false);
    const { unmount } = render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('escritorio');
    expect(media.listeners.size).toBe(1);

    media.setMatches(true);
    expect(screen.getByTestId('probe')).toHaveTextContent('móvil');

    unmount();
    expect(media.listeners.size).toBe(0);
  });
});
