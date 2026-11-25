'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** Punto de corte que coincide con el breakpoint `md` de la shell (768 px). */
export const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

function subscribe(query: string, onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined;
  }
  const queryList = window.matchMedia(query);
  queryList.addEventListener('change', onChange);
  return () => queryList.removeEventListener('change', onChange);
}

function getSnapshot(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(query).matches;
}

/**
 * Suscribe un componente a una media query. En servidor devuelve `false` y se
 * corrige tras la hidratación, sin desajustes en el HTML servido.
 */
export function useMediaQuery(query: string): boolean {
  const subscribeToQuery = useCallback((onChange: () => void) => subscribe(query, onChange), [query]);
  const readSnapshot = useCallback(() => getSnapshot(query), [query]);
  return useSyncExternalStore(subscribeToQuery, readSnapshot, () => false);
}
