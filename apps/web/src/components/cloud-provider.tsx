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
import { useLiveQuery } from 'dexie-react-hooks';
import type { User } from '@supabase/supabase-js';
import {
  bootstrapLocalState,
  clearSyncedData,
  countPendingChanges,
  createSupabaseGateway,
  createSyncEngine,
  getLastSyncedAt,
  getSyncOwner,
  hasLocalData,
  setSyncOwner,
  type AkariDB,
  type AkariRepositories,
  type LocalChangeListener,
  type SyncEngine,
} from '@akari/data';
import { cloudEnabled, getSupabaseClient } from '../lib/supabase';
import { fetchProfileName, saveProfileName } from '../lib/cloud-profile';

export type CloudStatus =
  | 'disabled'
  | 'signed-out'
  | 'checking'
  | 'syncing'
  | 'idle'
  | 'offline'
  | 'error';

export type CloudUser = { id: string; email: string | null };

export type AuthResult = { needsConfirmation: boolean };

type CloudContextValue = {
  enabled: boolean;
  status: CloudStatus;
  user: CloudUser | null;
  lastSyncedAt: string | null;
  pendingChanges: number;
  error: string | null;
  hasLocalData: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  signIn: (
    email: string,
    password: string,
    options?: { replaceLocal?: boolean },
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const CloudContext = createContext<CloudContextValue | null>(null);

const INTENT_KEY = 'akari:connect-intent';
const OWNERSHIP_MESSAGE =
  'Este dispositivo ya está vinculado a otra cuenta. Desconecta y restablece los datos locales antes de usar una cuenta distinta.';

function rememberIntent(intent: 'upload' | 'download'): void {
  try {
    window.localStorage.setItem(INTENT_KEY, intent);
  } catch {
    // El almacenamiento local puede estar bloqueado; se usa la intención por defecto.
  }
}

function readIntent(): 'upload' | 'download' {
  try {
    return window.localStorage.getItem(INTENT_KEY) === 'upload' ? 'upload' : 'download';
  } catch {
    return 'download';
  }
}

function clearIntent(): void {
  try {
    window.localStorage.removeItem(INTENT_KEY);
  } catch {
    // Sin efecto si localStorage no está disponible.
  }
}

function authMessage(error: { message: string }, action: 'signin' | 'signup'): string {
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (message.includes('email not confirmed')) {
    return 'Confirma tu correo antes de entrar. Revisa tu bandeja de entrada.';
  }
  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'Ya existe una cuenta con ese email.';
  }
  if (message.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Demasiados intentos seguidos. Espera un momento y vuelve a probar.';
  }
  return action === 'signin'
    ? 'No se ha podido iniciar sesión. Revisa tus datos.'
    : 'No se ha podido crear la cuenta. Inténtalo de nuevo.';
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'No se ha podido sincronizar. Los cambios siguen guardados en este dispositivo.';
}

type CloudProviderProps = {
  db: AkariDB;
  repositories: AkariRepositories;
  ready: boolean;
  subscribeLocalChanges: (listener: LocalChangeListener) => () => void;
  children: ReactNode;
};

export function CloudProvider({
  db,
  repositories,
  ready,
  subscribeLocalChanges,
  children,
}: CloudProviderProps) {
  const client = getSupabaseClient();
  const [status, setStatus] = useState<CloudStatus>(cloudEnabled ? 'checking' : 'disabled');
  const [user, setUser] = useState<CloudUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [localData, setLocalData] = useState(false);

  const engineRef = useRef<SyncEngine | null>(null);
  const connectedUserRef = useRef<string | null>(null);
  const connectingRef = useRef<Promise<void> | null>(null);
  const syncingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(0);
  const lastPushedNameRef = useRef<string | null>(null);

  const settings = useLiveQuery(
    async () => (ready ? repositories.settings.get() : undefined),
    [repositories, ready],
  );

  const refreshCounters = useCallback(async () => {
    if (!ready) return;
    const [pending, hasData, last] = await Promise.all([
      countPendingChanges(db),
      hasLocalData(db),
      getLastSyncedAt(db),
    ]);
    pendingRef.current = pending;
    setPendingChanges(pending);
    setLocalData(hasData);
    setLastSyncedAt(last);
  }, [db, ready]);

  useEffect(() => {
    void refreshCounters();
  }, [refreshCounters]);

  const runSync = useCallback(
    async (manual = false) => {
      const engine = engineRef.current;
      if (!engine || syncingRef.current) return;
      if (manual) setError(null);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setStatus('offline');
        return;
      }

      syncingRef.current = true;
      setStatus('syncing');
      try {
        await engine.sync();
        await refreshCounters();
        setError(null);
        setStatus('idle');
      } catch (syncError) {
        setError(errorMessage(syncError));
        setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'error');
      } finally {
        syncingRef.current = false;
      }
    },
    [refreshCounters],
  );

  const scheduleSync = useCallback(() => {
    if (!engineRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void runSync();
    }, 1500);
  }, [runSync]);

  const doConnect = useCallback(
    async (current: CloudUser, mode: 'upload' | 'download' | 'keep') => {
      if (!client) return;

      const owner = await getSyncOwner(db);
      if (owner && owner !== current.id) {
        await client.auth.signOut();
        setUser(null);
        connectedUserRef.current = null;
        engineRef.current = null;
        setStatus('error');
        throw new Error(OWNERSHIP_MESSAGE);
      }

      const adopting = owner === null;
      if (adopting && mode === 'download') {
        await clearSyncedData(db);
      }
      if (adopting) {
        await setSyncOwner(db, current.id);
      }
      if (adopting && mode === 'upload') {
        await bootstrapLocalState(db);
      }

      engineRef.current = createSyncEngine({
        db,
        gateway: createSupabaseGateway(client, current.id),
      });
      connectedUserRef.current = current.id;

      try {
        const remoteName = await fetchProfileName(client, current.id);
        if (remoteName) {
          lastPushedNameRef.current = remoteName;
          const settingsNow = await repositories.settings.get();
          if (settingsNow.displayName !== remoteName) {
            await repositories.settings.update({ displayName: remoteName });
          }
        } else {
          const settingsNow = await repositories.settings.get();
          const localName = settingsNow.displayName?.trim() || 'Marta';
          lastPushedNameRef.current = localName;
          await saveProfileName(client, current.id, localName);
        }
      } catch (profileError) {
        // El perfil no bloquea la sincronización de los datos financieros.
        setError(errorMessage(profileError));
      }

      await refreshCounters();
      await runSync();
    },
    [client, db, refreshCounters, repositories, runSync],
  );

  const handleSession = useCallback(
    (current: CloudUser, mode: 'upload' | 'download' | 'keep'): Promise<void> => {
      if (connectedUserRef.current === current.id) return Promise.resolve();
      if (connectingRef.current) return connectingRef.current;

      const promise = doConnect(current, mode)
        .catch((connectError: unknown) => {
          setError(errorMessage(connectError));
          setStatus('error');
          throw connectError;
        })
        .finally(() => {
          clearIntent();
          connectingRef.current = null;
        });

      connectingRef.current = promise;
      return promise;
    },
    [doConnect],
  );

  // Sesión inicial y cambios de autenticación.
  useEffect(() => {
    if (!client) return;
    let active = true;

    const adoptSession = async (nextUser: User | null) => {
      if (!active) return;
      if (!nextUser) {
        setUser(null);
        connectedUserRef.current = null;
        engineRef.current = null;
        setStatus('signed-out');
        await refreshCounters();
        return;
      }

      const account = { id: nextUser.id, email: nextUser.email ?? null };
      setUser(account);

      const owner = await getSyncOwner(db);
      const mode = owner === nextUser.id ? 'keep' : owner ? 'keep' : readIntent();
      await handleSession(account, mode);
    };

    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        void adoptSession(data.session.user).catch(() => undefined);
      } else {
        setStatus('signed-out');
      }
    });

    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        connectedUserRef.current = null;
        engineRef.current = null;
        setStatus('signed-out');
        return;
      }
      if (session?.user && connectedUserRef.current !== session.user.id) {
        void adoptSession(session.user).catch(() => undefined);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [client, db, handleSession, refreshCounters]);

  // Cambios locales: cuenta pendientes y sincroniza con un pequeño retardo.
  useEffect(() => {
    return subscribeLocalChanges(() => {
      void refreshCounters();
      scheduleSync();
    });
  }, [refreshCounters, scheduleSync, subscribeLocalChanges]);

  // Foco, conexión y reintento periódico.
  useEffect(() => {
    const onFocus = () => {
      if (engineRef.current) void runSync();
    };
    const onOnline = () => {
      if (engineRef.current) void runSync();
    };
    const onOffline = () => {
      if (engineRef.current) setStatus('offline');
    };
    const onVisibility = () => {
      if (!document.hidden) onFocus();
    };
    const interval = setInterval(() => {
      if (engineRef.current && navigator.onLine && pendingRef.current > 0) void runSync();
    }, 60_000);

    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [runSync]);

  // Cambios del nombre en local se reflejan en el perfil remoto.
  useEffect(() => {
    if (!client || !user || !settings?.displayName) return;
    const name = settings.displayName.trim();
    if (!name || name === lastPushedNameRef.current) return;
    lastPushedNameRef.current = name;
    void saveProfileName(client, user.id, name).catch((profileError: unknown) => {
      setError(errorMessage(profileError));
    });
  }, [client, settings?.displayName, user]);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string): Promise<AuthResult> => {
      if (!client) throw new Error('La nube no está configurada en esta instalación.');
      setError(null);
      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres.');
      }
      const owner = await getSyncOwner(db);
      if (owner) {
        throw new Error(OWNERSHIP_MESSAGE);
      }

      rememberIntent('upload');
      const { data, error: authError } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo:
            typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : undefined,
        },
      });
      if (authError) throw new Error(authMessage(authError, 'signup'));
      if (!data.session?.user) {
        setStatus('signed-out');
        return { needsConfirmation: true };
      }

      const account = { id: data.session.user.id, email: data.session.user.email ?? null };
      setUser(account);
      await handleSession(account, 'upload');
      return { needsConfirmation: false };
    },
    [client, db, handleSession],
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string,
      options?: { replaceLocal?: boolean },
    ): Promise<AuthResult> => {
      if (!client) throw new Error('La nube no está configurada en esta instalación.');
      setError(null);

      const owner = await getSyncOwner(db);
      if (!owner && !options?.replaceLocal && (await hasLocalData(db))) {
        throw new Error(
          'Este dispositivo ya tiene datos. Confirma que quieres sustituirlos por los de tu cuenta.',
        );
      }

      rememberIntent('download');
      const { data, error: authError } = await client.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authMessage(authError, 'signin'));
      if (!data.session?.user) throw new Error('No se ha podido abrir la sesión.');

      const account = { id: data.session.user.id, email: data.session.user.email ?? null };
      setUser(account);
      await handleSession(account, 'download');
      if (connectedUserRef.current !== account.id) {
        throw new Error(OWNERSHIP_MESSAGE);
      }
      return { needsConfirmation: false };
    },
    [client, db, handleSession],
  );

  const signOut = useCallback(async () => {
    if (!client) return;
    await client.auth.signOut();
    engineRef.current = null;
    connectedUserRef.current = null;
    setUser(null);
    setStatus('signed-out');
    setError(null);
    await refreshCounters();
  }, [client, refreshCounters]);

  const syncNow = useCallback(async () => {
    if (!engineRef.current) return;
    await runSync(true);
  }, [runSync]);

  return (
    <CloudContext.Provider
      value={{
        enabled: cloudEnabled,
        status,
        user,
        lastSyncedAt,
        pendingChanges,
        error,
        hasLocalData: localData,
        signUp,
        signIn,
        signOut,
        syncNow,
      }}
    >
      {children}
    </CloudContext.Provider>
  );
}

export function useCloud(): CloudContextValue {
  const context = useContext(CloudContext);
  if (!context) throw new Error('useCloud debe usarse dentro de CloudProvider');
  return context;
}
