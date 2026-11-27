'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Badge,
  Banner,
  Button,
  Card,
  Inline,
  Modal,
  SectionHeader,
  Stack,
  TextField,
  useToast,
  type BadgeTone,
} from '@akari/ui';
import { useCloud, type CloudStatus } from './cloud-provider';

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

export function CloudAuthForm({
  initialMode = 'signup',
  defaultName = '',
  submitFullWidth = false,
  onConnected,
  onCancel,
}: {
  initialMode?: 'signup' | 'signin';
  defaultName?: string;
  submitFullWidth?: boolean;
  onConnected?: () => void;
  onCancel?: () => void;
}) {
  const cloud = useCloud();
  const { toast } = useToast();
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [replaceLocal, setReplaceLocal] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

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
    if (mode === 'signup' && !name.trim()) {
      setError('Escribe tu nombre.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await cloud.signUp(email.trim(), password, name.trim());
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
      } else {
        await cloud.signIn(email.trim(), password, {
          replaceLocal: replaceLocal || !cloud.hasLocalData,
        });
        toast({ title: 'Sesión iniciada', description: 'Datos sincronizados.', tone: 'success' });
      }
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

  return (
    <Stack gap={3}>
      <div
        role="tablist"
        aria-label="Acceso a la cuenta"
        className="grid grid-cols-2 gap-1 rounded-xl bg-surface-sunken p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          onClick={() => {
            setMode('signin');
            setError(undefined);
            setMessage(undefined);
          }}
          className={`rounded-lg px-3 py-2 text-ui-11-strong transition-colors ${
            mode === 'signin'
              ? 'bg-surface-default text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          onClick={() => {
            setMode('signup');
            setError(undefined);
            setMessage(undefined);
          }}
          className={`rounded-lg px-3 py-2 text-ui-11-strong transition-colors ${
            mode === 'signup'
              ? 'bg-surface-default text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {mode === 'signup' ? (
        <TextField
          label="Tu nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={40}
          autoComplete="name"
          help="Se muestra en tu perfil y en el shell. Máximo 40 caracteres."
        />
      ) : null}

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
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        help="Mínimo 8 caracteres. La gestiona Supabase; Akari no la guarda."
        required
      />

      {mode === 'signin' && cloud.hasLocalData ? (
        <label className="flex items-start gap-2 text-ui-11 text-text-secondary">
          <input
            type="checkbox"
            checked={replaceLocal}
            onChange={(event) => setReplaceLocal(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            Sustituir los datos de este dispositivo por los de mi cuenta. Si no lo marcas, no se
            conectará la cuenta.
          </span>
        </label>
      ) : null}

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
        <CloudAuthForm
          defaultName={defaultName}
          onCancel={onClose}
          onConnected={() => {
            onConnected?.();
            onClose();
          }}
        />
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
