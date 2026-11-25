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
  onDismiss?: () => void;
};

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Coloca un panel flotante junto a su disparador, lo voltea hacia arriba cuando
 * no cabe debajo, lo ajusta al viewport y lo cierra al pulsar fuera.
 */
export function useFloatingPanel({
  open,
  anchorRef,
  panelRef,
  minWidth,
  maxHeight = FLOATING_PANEL_DEFAULT_MAX_HEIGHT,
  minHeight = FLOATING_PANEL_DEFAULT_MIN_HEIGHT,
  onDismiss,
}: FloatingPanelOptions): FloatingPanelPosition | null {
  const [position, setPosition] = useState<FloatingPanelPosition | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor || typeof window === 'undefined') return;
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(
        Math.max(rect.width, minWidth ?? rect.width),
        viewportWidth - PANEL_VIEWPORT_MARGIN * 2,
      );
      const left = Math.max(
        PANEL_VIEWPORT_MARGIN,
        Math.min(rect.left, viewportWidth - width - PANEL_VIEWPORT_MARGIN),
      );
      const spaceBelow = viewportHeight - rect.bottom - PANEL_GAP - PANEL_VIEWPORT_MARGIN;
      const spaceAbove = rect.top - PANEL_GAP - PANEL_VIEWPORT_MARGIN;
      const placeAbove = spaceBelow < minHeight && spaceAbove > spaceBelow;
      const availableHeight = Math.max(
        minHeight,
        Math.min(maxHeight, placeAbove ? spaceAbove : spaceBelow),
      );
      setPosition(
        placeAbove
          ? { left, width, bottom: viewportHeight - rect.top + PANEL_GAP, maxHeight: availableHeight }
          : { left, width, top: rect.bottom + PANEL_GAP, maxHeight: availableHeight },
      );
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchorRef, panelRef, minWidth, maxHeight, minHeight]);

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
