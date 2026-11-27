import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFloatingPanel } from './floating.js';

type Rect = { top: number; bottom: number; left: number; width: number };

function Harness({
  rect,
  maxHeight = 460,
  minHeight = 380,
  preferredHeight,
}: {
  rect: Rect;
  maxHeight?: number;
  minHeight?: number;
  preferredHeight?: number;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const position = useFloatingPanel({
    open: true,
    anchorRef,
    panelRef,
    minWidth: 320,
    maxHeight,
    minHeight,
    preferredHeight,
  });

  return (
    <>
      <button
        ref={(node) => {
          if (!node) return;
          anchorRef.current = node;
          node.getBoundingClientRect = () =>
            ({
              ...rect,
              right: rect.left + rect.width,
              height: rect.bottom - rect.top,
              x: rect.left,
              y: rect.top,
              toJSON: () => ({}),
            }) as DOMRect;
        }}
      >
        Ancla
      </button>
      <div
        ref={panelRef}
        data-testid="panel"
        style={{
          position: 'fixed',
          left: position?.left,
          width: position?.width,
          top: position?.top,
          bottom: position?.bottom,
          maxHeight: position?.maxHeight,
        }}
      />
    </>
  );
}

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
}

function panel() {
  return screen.getByTestId('panel');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useFloatingPanel', () => {
  it('coloca el panel debajo cuando hay sitio y respeta su altura máxima', () => {
    setViewport(1440, 900);
    render(<Harness rect={{ top: 300, bottom: 348, left: 100, width: 324 }} />);
    expect(panel().style.top).toBe('352px');
    expect(panel().style.maxHeight).toBe('460px');
    expect(panel().style.left).toBe('100px');
    expect(panel().style.width).toBe('324px');
  });

  it('voltea hacia arriba cuando no cabe debajo', () => {
    setViewport(1440, 900);
    render(<Harness rect={{ top: 700, bottom: 748, left: 100, width: 324 }} />);
    expect(panel().style.top).toBe('');
    expect(panel().style.bottom).toBe('204px');
    expect(panel().style.maxHeight).toBe('460px');
  });

  it('sube el panel cuando no cabe entero debajo aunque haya algo de sitio', () => {
    setViewport(1440, 900);
    render(
      <Harness
        rect={{ top: 500, bottom: 548, left: 100, width: 324 }}
        preferredHeight={460}
      />,
    );
    expect(panel().style.top).toBe('');
    expect(panel().style.bottom).toBe('404px');
    expect(panel().style.maxHeight).toBe('460px');
  });

  it('si no cabe ni arriba ni debajo se centra sin recortarse', () => {
    setViewport(1440, 900);
    render(
      <Harness
        rect={{ top: 400, bottom: 448, left: 100, width: 324 }}
        preferredHeight={460}
      />,
    );
    expect(panel().style.top).toBe('220px');
    expect(panel().style.maxHeight).toBe('460px');
  });

  it('en un viewport de 560 px lo centra y muestra el contenido completo', () => {
    setViewport(1280, 560);
    render(
      <Harness
        rect={{ top: 260, bottom: 308, left: 100, width: 324 }}
        preferredHeight={460}
      />,
    );
    expect(panel().style.top).toBe('50px');
    expect(panel().style.maxHeight).toBe('460px');
  });

  it('en un viewport menor que el contenido lo limita al alto disponible', () => {
    setViewport(1280, 400);
    render(
      <Harness
        rect={{ top: 180, bottom: 228, left: 100, width: 324 }}
        preferredHeight={460}
      />,
    );
    expect(Number.parseFloat(panel().style.maxHeight)).toBe(384);
    expect(Number.parseFloat(panel().style.top)).toBeGreaterThanOrEqual(8);
  });

  it('nunca saca el panel del viewport: altura acotada con margen', () => {
    for (const height of [900, 600, 420, 240]) {
      setViewport(1440, height);
      const { unmount } = render(<Harness rect={{ top: 100, bottom: 148, left: 100, width: 324 }} />);
      const maxHeight = Number.parseFloat(panel().style.maxHeight);
      expect(maxHeight).toBeGreaterThan(0);
      expect(maxHeight).toBeLessThanOrEqual(height - 16);
      unmount();
    }
  });

  it('ajusta el ancho y la posición horizontal a pantallas estrechas', () => {
    setViewport(300, 900);
    render(<Harness rect={{ top: 100, bottom: 148, left: 280, width: 324 }} />);
    expect(panel().style.width).toBe('284px');
    expect(panel().style.left).toBe('8px');
  });

  it('se desplaza con la página en lugar de quedarse sticky en el viewport', () => {
    setViewport(1440, 900);
    const rect = { top: 300, bottom: 348, left: 100, width: 324 };
    render(<Harness rect={rect} />);
    expect(panel().style.top).toBe('352px');

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 });
    rect.top = 100;
    rect.bottom = 148;
    fireEvent.scroll(window);
    expect(panel().style.top).toBe('232px');

    fireEvent.scroll(panel());
    expect(panel().style.top).toBe('232px');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });
});
