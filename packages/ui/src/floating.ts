'use client';

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

const PANEL_GAP = 4;
const PANEL_VIEWPORT_MARGIN = 8;

export const FLOATING_PANEL_DEFAULT_MAX_HEIGHT = 280;
export const FLOATING_PANEL_DEFAULT_MIN_HEIGHT = 96;

export type FloatingPanelPosition = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

type FloatingPanelOptions = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  minWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  /** Altura que necesita el contenido para mostrarse entero; si se omite, se mide. */
  preferredHeight?: number;
  onDismiss?: () => void;
};

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Coloca un panel flotante junto a su disparador, lo voltea hacia arriba cuando
 * no cabe debajo, lo ajusta al viewport y lo cierra al pulsar fuera.
 *
 * La posición se calcula al abrir y se mantiene anclada al documento: al hacer
 * scroll, el panel se desplaza con la página en lugar de quedarse fijo en el
 * viewport. La altura máxima siempre queda dentro del viewport, con un margen
 * de 8 px por lado, para que el panel nunca se recorte contra la pantalla: si
 * no cabe entero, el contenido hace scroll dentro del panel.
 */
export function useFloatingPanel({
  open,
  anchorRef,
  panelRef,
  minWidth,
  maxHeight = FLOATING_PANEL_DEFAULT_MAX_HEIGHT,
  minHeight = FLOATING_PANEL_DEFAULT_MIN_HEIGHT,
  preferredHeight,
  onDismiss,
}: FloatingPanelOptions): FloatingPanelPosition | null {
  const [position, setPosition] = useState<FloatingPanelPosition | null>(null);
  const basePositionRef = useRef<FloatingPanelPosition | null>(null);
  const baseScrollRef = useRef({ x: 0, y: 0 });

  useIsomorphicLayoutEffect(() => {
    if (!open) {
      basePositionRef.current = null;
      return;
    }
    const commit = (next: FloatingPanelPosition) => {
      basePositionRef.current = next;
      baseScrollRef.current = { x: window.scrollX, y: window.scrollY };
      setPosition(next);
    };
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor || typeof window === 'undefined') return;
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxViewportHeight = Math.max(1, viewportHeight - PANEL_VIEWPORT_MARGIN * 2);
      const maxViewportWidth = Math.max(1, viewportWidth - PANEL_VIEWPORT_MARGIN * 2);
      const width = Math.min(Math.max(rect.width, minWidth ?? rect.width), maxViewportWidth);
      const left = clamp(
        rect.left,
        PANEL_VIEWPORT_MARGIN,
        Math.max(PANEL_VIEWPORT_MARGIN, viewportWidth - width - PANEL_VIEWPORT_MARGIN),
      );
      const spaceBelow = viewportHeight - rect.bottom - PANEL_GAP - PANEL_VIEWPORT_MARGIN;
      const spaceAbove = rect.top - PANEL_GAP - PANEL_VIEWPORT_MARGIN;
      const contentHeight = preferredHeight ?? panelRef.current?.scrollHeight ?? minHeight;
      const desiredHeight = Math.min(maxHeight, Math.max(minHeight, contentHeight));
      const fitsBelow = spaceBelow >= desiredHeight;
      const fitsAbove = spaceAbove >= desiredHeight;
      const placeAbove = !fitsBelow && fitsAbove;
      if (fitsBelow || fitsAbove) {
        const sideSpace = Math.max(0, placeAbove ? spaceAbove : spaceBelow);
        const availableHeight = Math.max(1, Math.min(maxHeight, sideSpace, maxViewportHeight));
        commit(
          placeAbove
            ? {
                left,
                width,
                bottom: Math.max(PANEL_VIEWPORT_MARGIN, viewportHeight - rect.top + PANEL_GAP),
                maxHeight: availableHeight,
              }
            : {
                left,
                width,
                top: Math.max(PANEL_VIEWPORT_MARGIN, rect.bottom + PANEL_GAP),
                maxHeight: availableHeight,
              },
        );
        return;
      }
      // No cabe entero ni arriba ni abajo: se centra sobre el viewport para no recortarse.
      const centeredHeight = Math.max(1, Math.min(maxHeight, maxViewportHeight));
      commit({
        left,
        width,
        top: Math.max(PANEL_VIEWPORT_MARGIN, (viewportHeight - centeredHeight) / 2),
        maxHeight: centeredHeight,
      });
    };

    const handleScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && panelRef.current?.contains(target)) return;
      const base = basePositionRef.current;
      if (!base) return;
      const deltaX = window.scrollX - baseScrollRef.current.x;
      const deltaY = window.scrollY - baseScrollRef.current.y;
      if (deltaX === 0 && deltaY === 0) return;
      setPosition({
        ...base,
        left: base.left - deltaX,
        top: base.top === undefined ? undefined : base.top - deltaY,
        bottom: base.bottom === undefined ? undefined : base.bottom + deltaY,
      });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, anchorRef, panelRef, minWidth, maxHeight, minHeight, preferredHeight]);

  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      dismissRef.current?.();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, anchorRef, panelRef]);

  return position;
}
