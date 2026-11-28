'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Badge,
  Banner,
  Button,
  Card,
  Inline,
  Logo,
  Modal,
  SectionHeader,
  SegmentedControl,
  Stack,
  TextField,
  useToast,
  type BadgeTone,
} from '@akari/ui';
import { useCloud, type CloudStatus, type LocalDataChoice } from './cloud-provider';

function statusInfo(status: CloudStatus): { label: string; tone: BadgeTone; text: string } {
  switch (status) {
    case 'disabled':
      return {
        label: 'Sin configurar',
        tone: 'neutral',
        text: 'Esta instalación no tiene Supabase configurado. Los datos se guardan solo en este dispositivo.',
      };
    case 'signed-out':
      return {
        label: 'Sin cuenta',
        tone: 'neutral',
        text: 'Conecta una cuenta para recuperar tus datos en otro dispositivo y no depender de este navegador.',
      };
    case 'checking':
      return { label: 'Comprobando', tone: 'info', text: 'Comprobando la sesión guardada…' };
    case 'syncing':
      return {
        label: 'Sincronizando',
        tone: 'info',
        text: 'Subiendo cambios y buscando novedades…',
      };
    case 'offline':
      return {
        label: 'Sin conexión',
        tone: 'warning',
        text: 'Los cambios se guardan en local y se enviarán cuando vuelva la conexión.',
      };
    case 'error':
      return {
        label: 'Con error',
        tone: 'negative',
        text: 'El último intento no terminó. Los cambios pendientes siguen guardados en este dispositivo.',
      };
    default:
      return {
        label: 'Al día',
        tone: 'positive',
        text: 'Tus datos están sincronizados con la nube.',
      };
  }
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[18px] w-[18px] shrink-0">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function AnimatedHeight({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return;
    const update = () => setHeight(content.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    // El relleno de 8 px por lado deja aire al anillo de foco; los márgenes
    // negativos lo compensan para que el bloque siga ocupando lo mismo.
    <div
      className="auth-height -mx-2 -my-2 overflow-hidden px-2 py-2"
      style={height === undefined ? undefined : { height: height + 16 }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

function LocalDataSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: LocalDataChoice;
  onChange: (value: LocalDataChoice) => void;
  disabled?: boolean;
}) {
  return (
    <Stack gap={2}>
      <SegmentedControl
        ariaLabel="Qué hacer con los datos locales"
        options={[
          { value: 'sync', label: 'Sincronizar' },
          { value: 'discard', label: 'Usar los de la cuenta' },
        ]}
        value={value}
        onChange={onChange}
        disabled={disabled}
        size="md"
        fill
      />
      <p className="text-ui-10 text-text-tertiary">
        {value === 'sync'
          ? 'Se suben y se unen a los de tu cuenta.'
          : 'Se sustituyen por los de tu cuenta.'}
      </p>
    </Stack>
  );
}

export function CloudAuthForm({
  initialMode = 'signup',
  defaultName = '',
  submitFullWidth = false,
  onConnected,
  onCancel,
  onAccessIntent,
}: {
  initialMode?: 'signup' | 'signin';
  defaultName?: string;
  submitFullWidth?: boolean;
  onConnected?: () => void;
  onCancel?: () => void;
  onAccessIntent?: (intent: 'signin' | 'signup') => void;
}) {
  const cloud = useCloud();
  const { toast } = useToast();
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [signupStep, setSignupStep] = useState<'email' | 'password'>('email');
  const [signinStep, setSigninStep] = useState<'credentials' | 'local-data'>('credentials');
  const [pendingProvider, setPendingProvider] = useState<'email' | 'google'>('email');
  const [swapDirection, setSwapDirection] = useState<'left' | 'right'>('right');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localDataChoice, setLocalDataChoice] = useState<LocalDataChoice>('sync');
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const switchMode = (next: 'signup' | 'signin') => {
    setMode(next);
    setSignupStep('email');
    setSigninStep('credentials');
    setConfirmPassword('');
    setSwapDirection(next === 'signup' ? 'right' : 'left');
    setError(undefined);
    setMessage(undefined);
  };

  const continueSignup = () => {
    setError(undefined);
    setMessage(undefined);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Escribe un email válido.');
      return;
    }
    setSignupStep('password');
    setSwapDirection('right');
  };

  const signInWithEmail = async () => {
    onAccessIntent?.('signin');
    setBusy(true);
    try {
      await cloud.signIn(email.trim(), password, {
        localData: cloud.hasUnlinkedLocalData ? localDataChoice : undefined,
      });
      toast({ title: 'Sesión iniciada', description: 'Datos sincronizados.', tone: 'success' });
      onConnected?.();
    } catch (submitError) {
      setSigninStep('credentials');
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se ha podido completar la conexión. Inténtalo de nuevo.',
      );
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setError(undefined);
    setMessage(undefined);
    if (!email.trim()) {
      setError('Escribe tu email.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (mode === 'signup') {
      if (!confirmPassword) {
        setError('Repite la contraseña.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    if (mode === 'signin') {
      if (cloud.hasUnlinkedLocalData) {
        setPendingProvider('email');
        setSigninStep('local-data');
        setSwapDirection('right');
        return;
      }
      await signInWithEmail();
      return;
    }

    setBusy(true);
    try {
      const displayName =
        defaultName.trim() || email.trim().split('@')[0] || 'Akari';
      onAccessIntent?.('signup');
      const result = await cloud.signUp(email.trim(), password, displayName);
      if (result.needsConfirmation) {
        setMessage(
          'Te hemos enviado un correo para confirmar la cuenta. Cuando lo confirmes, vuelve a esta pantalla.',
        );
        toast({ title: 'Revisa tu correo', tone: 'info' });
        return;
      }
      toast({
        title: 'Cuenta creada',
        description: 'Tus datos se sincronizan con la nube.',
        tone: 'success',
      });
      onConnected?.();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se ha podido completar la conexión. Inténtalo de nuevo.',
      );
    } finally {
      setBusy(false);
    }
  };

  const google = async (next: 'signin' | 'signup') => {
    if (next === 'signin' && cloud.hasUnlinkedLocalData && signinStep === 'credentials') {
      setError(undefined);
      setMessage(undefined);
      setPendingProvider('google');
      setSigninStep('local-data');
      setSwapDirection('right');
      return;
    }
    setError(undefined);
    setMessage(undefined);
    setBusy(true);
    try {
      onAccessIntent?.(next);
      await cloud.signInWithGoogle(
        next,
        next === 'signin' && cloud.hasUnlinkedLocalData ? { localData: localDataChoice } : undefined,
      );
    } catch (googleError) {
      if (next === 'signin') setSigninStep('credentials');
      setError(
        googleError instanceof Error
          ? googleError.message
          : 'No se ha podido abrir el acceso con Google.',
      );
      setBusy(false);
    }
  };

  const continueWithLocalData = async () => {
    setError(undefined);
    setMessage(undefined);
    if (pendingProvider === 'google') {
      await google('signin');
      return;
    }
    await signInWithEmail();
  };

  const feedback = (
    <>
      {message ? (
        <Banner tone="info" title="Confirmación pendiente">
          {message}
        </Banner>
      ) : null}
      {error ? (
        <Banner tone="error" title="No se ha podido continuar">
          {error}
        </Banner>
      ) : null}
    </>
  );

  const cancelAndSubmit = (
    <Inline className="mt-1 flex-wrap justify-end gap-2">
      {onCancel ? (
        <Button variant="tertiary" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
      ) : null}
      <Button
        onClick={() => void submit()}
        loading={busy}
        className={submitFullWidth ? 'w-full' : undefined}
      >
        {mode === 'signup' ? 'Crear cuenta' : 'Entrar'}
      </Button>
    </Inline>
  );

  const googleButton = (
    <Button
      variant="secondary"
      className="w-full"
      icon={<GoogleMark />}
      onClick={() => void google(mode)}
      loading={busy}
    >
      {mode === 'signup' ? 'Registrarse con Google' : 'Iniciar sesión con Google'}
    </Button>
  );

  const divider = (
    <div className="flex items-center gap-3 text-ui-10 text-text-tertiary">
      <span aria-hidden="true" className="h-px flex-1 bg-border-subtle" />
      o con tu correo
      <span aria-hidden="true" className="h-px flex-1 bg-border-subtle" />
    </div>
  );

  const signin =
    signinStep === 'credentials' ? (
      <Stack gap={3}>
        {googleButton}
        {divider}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          help="Mínimo 8 caracteres. Akari no la guarda."
          required
        />
        {feedback}
        {cancelAndSubmit}
      </Stack>
    ) : (
      <Stack gap={3}>
        <p className="text-ui-11 text-text-secondary">
          Este dispositivo tiene datos que no están en tu cuenta. ¿Quieres sincronizarlos?
        </p>
        <LocalDataSelector
          value={localDataChoice}
          onChange={setLocalDataChoice}
          disabled={busy}
        />
        {feedback}
        <Inline className="mt-1 flex-wrap justify-end gap-2">
          <Button
            variant="tertiary"
            onClick={() => {
              setSigninStep('credentials');
              setSwapDirection('left');
              setError(undefined);
              setMessage(undefined);
            }}
            disabled={busy}
          >
            Volver
          </Button>
          <Button onClick={() => void continueWithLocalData()} loading={busy}>
            Continuar
          </Button>
        </Inline>
      </Stack>
    );

  const signupEmail = (
    <Stack gap={3}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />
      {feedback}
      <Button className="w-full" onClick={continueSignup} disabled={busy}>
        Continuar
      </Button>
    </Stack>
  );

  const signupPassword = (
    <Stack gap={3}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSignupStep('email');
            setSwapDirection('left');
          }}
          className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
        >
          Cambiar email
        </button>
      </div>
      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
        help="Mínimo 8 caracteres. Akari no la guarda."
        required
      />
      <TextField
        label="Repite la contraseña"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        autoComplete="new-password"
        required
      />
      {feedback}
      {cancelAndSubmit}
    </Stack>
  );

  const signup =
    signupStep === 'email' ? (
      <Stack gap={3}>
        {googleButton}
        {divider}
        {signupEmail}
      </Stack>
    ) : (
      <Stack gap={3}>{signupPassword}</Stack>
    );

  const body = mode === 'signin' ? signin : signup;

  return (
    <Stack gap={3}>
      <div
        role="tablist"
        aria-label="Acceso a la cuenta"
        className="relative grid grid-cols-2 gap-1 rounded-xl bg-surface-sunken p-1"
      >
        <span
          aria-hidden="true"
          style={{
            width: 'calc(50% - 0.375rem)',
            transform: mode === 'signup' ? 'translateX(calc(100% + 0.25rem))' : 'translateX(0)',
            transition: 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          className="pointer-events-none absolute inset-y-1 left-1 rounded-lg bg-surface-default shadow-sm motion-reduce:transition-none"
        />
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          onClick={() => switchMode('signin')}
          className={`relative z-10 rounded-lg px-3 py-2 text-ui-11-strong transition-colors ${
            mode === 'signin'
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          onClick={() => switchMode('signup')}
          className={`relative z-10 rounded-lg px-3 py-2 text-ui-11-strong transition-colors ${
            mode === 'signup'
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <AnimatedHeight>
        <div
          key={`${mode}-${mode === 'signin' ? signinStep : signupStep}`}
          className="auth-swap"
          style={{ '--auth-shift': swapDirection === 'right' ? '20px' : '-20px' } as CSSProperties}
        >
          {body}
        </div>
      </AnimatedHeight>
    </Stack>
  );
}

export function CloudAuthDialog({
  open,
  onClose,
  defaultName = '',
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  defaultName?: string;
  onConnected?: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Tu cuenta en la nube">
      {open ? (
        <div className="flex flex-col gap-1">
          <div className="mb-4 flex justify-center">
            <Logo format="expanded" size="M" />
          </div>
          <CloudAuthForm
            defaultName={defaultName}
            onCancel={onClose}
            onConnected={() => {
              onConnected?.();
              onClose();
            }}
          />
          <Button variant="tertiary" className="mt-2 w-full" onClick={onClose}>
            Continuar sin registrarte
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}

function formatLastSync(value: string): string {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: es });
  } catch {
    return 'hace un momento';
  }
}

export function CloudAccountCard({
  variant = 'settings',
  bare = false,
  defaultName = '',
  onConnected,
}: {
  variant?: 'settings' | 'onboarding';
  /** Sin el contenedor Card, para integrarlo en una tarjeta ya existente. */
  bare?: boolean;
  defaultName?: string;
  onConnected?: () => void;
}) {
  const cloud = useCloud();
  const router = useRouter();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const info = statusInfo(cloud.status);
  const title = variant === 'settings' ? 'Cuenta y sincronización' : 'Guarda tus datos en la nube';

  const content = (
    <>
      <SectionHeader title={title} action={<Badge tone={info.tone}>{info.label}</Badge>} />

      {!cloud.enabled ? (
        <p className="text-ui-11 text-text-secondary">
          La nube no está configurada en esta instalación. Define{' '}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para
          activarla. Mientras tanto, todo se guarda en este dispositivo.
        </p>
      ) : cloud.user ? (
        <>
          <p className="text-ui-11 text-text-secondary">{info.text}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ui-10 text-text-secondary">
            <span className="text-ui-11-strong text-text-primary">
              {cloud.user.email ?? 'Cuenta conectada'}
            </span>
            <span>{cloud.pendingChanges} cambios pendientes</span>
            {cloud.lastSyncedAt ? (
              <span>Última sincronización {formatLastSync(cloud.lastSyncedAt)}</span>
            ) : null}
          </div>
          {cloud.error ? (
            <Banner tone="error" title="No se ha podido sincronizar">
              {cloud.error}
            </Banner>
          ) : null}
          <Inline className="flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void cloud.syncNow()}
              loading={cloud.status === 'syncing'}
            >
              Sincronizar ahora
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => {
                void cloud.signOut().then(() => {
                  toast({
                    title: 'Sesión cerrada',
                    description: 'Los datos locales siguen aquí.',
                    tone: 'success',
                  });
                });
              }}
            >
              Cerrar sesión
            </Button>
          </Inline>
        </>
      ) : (
        <>
          <p className="text-ui-11 text-text-secondary">{info.text}</p>
          {cloud.error ? (
            <Banner tone="error" title="No se ha podido conectar">
              {cloud.error}
            </Banner>
          ) : null}
          <Inline>
            <Button
              size="sm"
              onClick={() =>
                variant === 'settings' ? router.push('/entrar') : setDialogOpen(true)
              }
            >
              Crear cuenta o iniciar sesión
            </Button>
          </Inline>
        </>
      )}

      <p className="text-ui-10 text-text-tertiary">
        Akari sigue guardando primero en este dispositivo. La nube es una copia de continuidad, no
        un requisito para usar la app.
      </p>

      {cloud.enabled ? (
        <CloudAuthDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          defaultName={defaultName}
          onConnected={onConnected}
        />
      ) : null}
    </>
  );

  if (bare) {
    return (
      <div className="flex flex-col gap-3" data-cloud="panel">
        {content}
      </div>
    );
  }

  return (
    <Card padding="md" className="flex flex-col gap-3" data-cloud="panel">
      {content}
    </Card>
  );
}
