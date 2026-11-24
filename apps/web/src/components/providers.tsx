'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ThemeProvider, ToastProvider } from '@akari/ui';
import { openDatabase, createRepositories, storageErrorMessage, type AkariDB, type AkariRepositories } from '@akari/data';

type DataContextValue = {
  db: AkariDB;
  repositories: AkariRepositories;
  ready: boolean;
  error: string | null;
};

const DataContext = createContext<DataContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [db] = useState(() => openDatabase());
  const [repositories] = useState(() => createRepositories(db));
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

  return (
    <ThemeProvider>
      <ToastProvider>
        <DataContext.Provider
          value={{
            db,
            repositories,
            ready,
            error,
          }}
        >
          <div data-retry={attempt} className="contents">
            <RetryBridge onRetry={() => setAttempt((value) => value + 1)}>{children}</RetryBridge>
          </div>
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
