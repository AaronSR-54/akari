'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { THEME_STORAGE_KEY } from './theme-script.js';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readPreference(): ThemePreference {
  if (typeof localStorage === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

function systemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>('light');

  const apply = useCallback((nextPreference: ThemePreference) => {
    const next = resolveTheme(nextPreference, systemDark());
    setResolved(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
    }
  }, []);

  useEffect(() => {
    const stored = readPreference();
    setPreferenceState(stored);
    apply(stored);
  }, [apply]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (readPreference() === 'system') apply('system');
    };
    query.addEventListener?.('change', listener);
    return () => query.removeEventListener?.('change', listener);
  }, [apply]);

  const setPreference = useCallback(
    (nextPreference: ThemePreference) => {
      setPreferenceState(nextPreference);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
      }
      apply(nextPreference);
    },
    [apply],
  );

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return value;
}
