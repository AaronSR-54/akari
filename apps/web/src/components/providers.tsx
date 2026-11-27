'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ThemeProvider, ToastProvider } from '@akari/ui';
import {
  DEMO_SEED_VERSION,
  createRepositories,
  createTrackedRepositories,
  loadDemoDatabase,
  openDatabase,
  storageErrorMessage,
  type AkariDB,
  type AkariRepositories,
  type LocalChangeListener,
} from '@akari/data';
import { appNow } from '../lib/clock';
import { CloudProvider } from './cloud-provider';

type DataContextValue = {
  db: AkariDB;
  repositories: AkariRepositories;
  ready: boolean;
  error: string | null;
  subscribeLocalChanges: (listener: LocalChangeListener) => () => void;
};

const DataContext = createContext<DataContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [db] = useState(() => openDatabase());
  const listeners = useRef(new Set<LocalChangeListener>());
  const [repositories] = useState(() =>
    createTrackedRepositories(createRepositories(db), db, (table) => {
      for (const listener of listeners.current) listener(table);
    }),
  );
  const subscribeLocalChanges = useCallback((listener: LocalChangeListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setReady(false);
    setError(null);
    db.open()
      .then(() => {
        if (active) setReady(true);
      })
      .catch((openingError: unknown) => {
        if (active) setError(storageErrorMessage(openingError));
      });
    return () => {
      active = false;
    };
  }, [db, attempt]);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    const refreshDemo = async () => {
      const settings = await repositories.settings.get();
      if (!active || !settings?.demoLoaded) return;
      if ((settings.demoSeedVersion ?? 1) >= DEMO_SEED_VERSION) return;
      await loadDemoDatabase(db, appNow());
    };
    void refreshDemo().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [ready, db, repositories]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <DataContext.Provider
          value={{
            db,
            repositories,
            ready,
            error,
            subscribeLocalChanges,
          }}
        >
          <CloudProvider
            db={db}
            repositories={repositories}
            ready={ready}
            subscribeLocalChanges={subscribeLocalChanges}
          >
            <div data-retry={attempt} className="contents">
              <RetryBridge onRetry={() => setAttempt((value) => value + 1)}>{children}</RetryBridge>
            </div>
          </CloudProvider>
        </DataContext.Provider>
      </ToastProvider>
    </ThemeProvider>
  );
}

const RetryContext = createContext<() => void>(() => undefined);
export function useDataRetry() {
  return useContext(RetryContext);
}

function RetryBridge({ onRetry, children }: { onRetry: () => void; children: ReactNode }) {
  return <RetryContext.Provider value={onRetry}>{children}</RetryContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData debe usarse dentro de Providers');
  return context;
}
