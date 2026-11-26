'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { bankCatalog, updateProfilePreferences, type Account } from '@akari/domain';
import { loadDemoDatabase, storageErrorMessage } from '@akari/data';
import {
  Badge,
  Banner,
  Button,
  Card,
  cn,
  Icon,
  Inline,
  Logo,
  PageContainer,
  SectionHeader,
  SelectField,
  Stack,
  TextField,
  useToast,
  type IconName,
} from '@akari/ui';
import { useAccounts, useSettings } from '../hooks';
import { useData } from '../providers';
import { CloudAccountCard } from '../account-panel';
import { AccountForm } from '../forms/account-form';
import { MovementForm } from '../forms/movement-form';
import { BankIcon } from '../bank-icon';
import { appNow } from '../../lib/clock';
import { defaultProfile } from '../../lib/profile';
import { currencyOptions } from '../../lib/options';

const STEPS = ['profile', 'account', 'csv', 'movement', 'cloud'] as const;
type Step = (typeof STEPS)[number];

const STEP_META: Record<Step, { title: string; description: string; icon: IconName }> = {
  profile: {
    title: 'Tu perfil',
    description:
      'Empezamos por lo básico: cómo te llamas, tu divisa principal y el día en que suele entrar tu ingreso. Podrás cambiarlo cuando quieras en Ajustes.',
    icon: 'users',
  },
  account: {
    title: 'Tu primera cuenta',
    description:
      'Crea la cuenta donde vivirán tus movimientos. Si prefieres hacerlo más tarde, puedes omitir este paso.',
    icon: 'wallet',
  },
  csv: {
    title: 'Importa tus movimientos',
    description:
      'El atajo para no configurarlo todo a mano. Estamos preparando la importación de CSV de tu banco.',
    icon: 'arrows',
  },
  movement: {
    title: 'Tu primer movimiento',
    description:
      'Registra un gasto o un ingreso para ver cómo funciona el resumen. Si se repite, crearemos la suscripción.',
    icon: 'add',
  },
  cloud: {
    title: 'Guarda tus datos',
    description:
      'La nube es opcional: sirve para recuperar tus datos en otro dispositivo y no depender de este navegador.',
    icon: 'insights',
  },
};

function Stepper({ step }: { step: Step }) {
  const current = STEPS.indexOf(step);

  return (
    <nav aria-label="Progreso del onboarding" className="w-full">
      <ol className="hidden items-center sm:flex">
        {STEPS.map((item, index) => {
          const complete = index < current;
          const active = index === current;
          return (
            <li key={item} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full border text-ui-11-strong transition-colors',
                  complete && 'border-accent-default bg-accent-default text-accent-ink',
                  active && 'border-accent-default bg-accent-soft text-accent-strong',
                  !complete &&
                    !active &&
                    'border-border-subtle bg-surface-default text-text-tertiary',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {complete ? '✓' : index + 1}
              </span>
              <span
                className={cn(
                  'truncate text-ui-11-strong',
                  active || complete ? 'text-text-primary' : 'text-text-tertiary',
                )}
              >
                {STEP_META[item].title}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    'mx-2 h-px min-w-3 flex-1',
                    index < current ? 'bg-accent-default' : 'bg-border-subtle',
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="flex items-center justify-between gap-3 sm:hidden">
        <div>
          <p className="text-ui-10 uppercase tracking-[0.14em] text-text-tertiary">
            Paso {current + 1} de {STEPS.length}
          </p>
          <p className="text-ui-12-strong text-text-primary">{STEP_META[step].title}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((item, index) => (
            <span
              key={item}
              className={cn(
                'h-2 rounded-full transition-all',
                index === current
                  ? 'w-5 bg-accent-default'
                  : index < current
                    ? 'w-2 bg-accent-default'
                    : 'w-2 bg-surface-sunken',
              )}
              aria-current={index === current ? 'step' : undefined}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  const { db, repositories, ready, error } = useData();
  const settings = useSettings();
  const accounts = useAccounts();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('profile');
  const [busy, setBusy] = useState<'profile' | 'demo' | 'finish' | null>(null);
  const [nameDraft, setNameDraft] = useState<string>(defaultProfile.displayName);
  const [currencyDraft, setCurrencyDraft] = useState('EUR');
  const [incomeDayDraft, setIncomeDayDraft] = useState('1');
  const [profileError, setProfileError] = useState<string | undefined>();
  const [createdAccount, setCreatedAccount] = useState<Account | null>(null);
  const [movementSaved, setMovementSaved] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current || !settings) return;
    initialised.current = true;
    setNameDraft(settings.displayName ?? defaultProfile.displayName);
    setCurrencyDraft(settings.primaryCurrency ?? 'EUR');
    setIncomeDayDraft(String(settings.primaryIncomeDay ?? 1));
  }, [settings]);

  const meta = STEP_META[step];

  const finish = async (markCompleted = true) => {
    setBusy('finish');
    try {
      if (markCompleted) {
        await repositories.settings.update({ onboardingCompleted: true });
      }
      router.replace('/');
    } catch (finishError) {
      toast({
        title: 'No se ha podido terminar',
        description: storageErrorMessage(finishError),
        tone: 'error',
      });
      setBusy(null);
    }
  };

  const saveProfile = async (): Promise<boolean> => {
    setProfileError(undefined);
    try {
      await updateProfilePreferences(repositories, {
        displayName: nameDraft,
        primaryCurrency: currencyDraft,
        primaryIncomeDay: Number(incomeDayDraft),
      });
      return true;
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'No se ha podido guardar el perfil.';
      setProfileError(message);
      toast({ title: 'Revisa tus datos', description: message, tone: 'error' });
      return false;
    }
  };

  const continueProfile = async () => {
    setBusy('profile');
    const saved = await saveProfile();
    setBusy(null);
    if (saved) setStep('account');
  };

  const startDemo = async () => {
    setBusy('demo');
    try {
      const saved = await saveProfile();
      if (!saved) {
        setBusy(null);
        return;
      }
      await loadDemoDatabase(db, appNow());
      await updateProfilePreferences(repositories, {
        displayName: nameDraft,
        primaryCurrency: currencyDraft,
        primaryIncomeDay: Number(incomeDayDraft),
      });
      toast({ title: 'Datos de ejemplo cargados', tone: 'success' });
      router.replace('/');
    } catch (startError) {
      toast({
        title: 'No se han podido cargar los datos',
        description: storageErrorMessage(startError),
        tone: 'error',
      });
      setBusy(null);
    }
  };

  const movementAccounts =
    accounts && accounts.length > 0 ? accounts : createdAccount ? [createdAccount] : [];
  const defaultAccountId = createdAccount?.id ?? accounts?.[0]?.id;

  return (
    <main className="min-h-screen bg-surface-canvas">
      <PageContainer className="flex min-h-screen max-w-6xl flex-col py-8 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Logo format="expanded" size="XL" />
          <Button variant="tertiary" size="sm" onClick={() => void finish()}>
            Omitir el asistente
          </Button>
        </header>

        <div className="mt-8">
          <Stepper step={step} />
        </div>

        <div className="mt-8 grid flex-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:pt-2">
            <div className="flex items-center gap-3 lg:block">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-strong lg:h-16 lg:w-16">
                <Icon name={meta.icon} size={20} />
              </span>
              <div className="min-w-0 lg:mt-5">
                <p className="text-ui-10 uppercase tracking-[0.16em] text-accent-strong">
                  Paso {STEPS.indexOf(step) + 1} de {STEPS.length}
                </p>
                <h1 className="text-ui-20-bold text-text-primary lg:text-ui-32-bold">
                  {meta.title}
                </h1>
              </div>
            </div>
            <p className="mt-3 text-ui-12 text-text-secondary lg:mt-4 lg:text-ui-13">
              {meta.description}
            </p>
            <p className="mt-4 hidden text-ui-10 text-text-tertiary lg:block">
              Tus datos se guardan primero en este dispositivo. La nube es opcional y se puede
              activar al final.
            </p>
          </aside>

          <section key={step} className="min-w-0">
            {error ? (
              <Banner tone="error" title="Almacenamiento no disponible">
                {error}
              </Banner>
            ) : null}

            {settings?.onboardingCompleted ? (
              <Banner tone="info" title="Ya has completado los primeros pasos">
                Puedes volver a la aplicación sin borrar tus datos.
              </Banner>
            ) : null}

            {step === 'profile' ? (
              <Card padding="lg">
                <Stack gap={4}>
                  <TextField
                    label="Tu nombre"
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    error={profileError}
                    help="Se muestra en tu perfil y en el shell. Máximo 40 caracteres."
                    maxLength={40}
                    autoComplete="name"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField
                      label="Divisa principal"
                      value={currencyDraft}
                      onValueChange={setCurrencyDraft}
                      options={currencyOptions}
                      help="Se usará por defecto al crear cuentas."
                    />
                    <TextField
                      label="Día de tu ingreso principal"
                      type="number"
                      min={1}
                      max={31}
                      value={incomeDayDraft}
                      onChange={(event) => setIncomeDayDraft(event.target.value)}
                      help="Entre 1 y 31. Si el mes es más corto, se ajusta al último día."
                    />
                  </div>
                  <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => void startDemo()}
                      loading={busy === 'demo'}
                      disabled={!ready || Boolean(error)}
                    >
                      Ver con datos de ejemplo
                    </Button>
                    <Button
                      onClick={() => void continueProfile()}
                      loading={busy === 'profile'}
                      disabled={!ready || Boolean(error)}
                    >
                      Continuar
                    </Button>
                  </div>
                  <p className="text-ui-10 text-text-tertiary">
                    Esta versión no cifra la base local ni los datos en la nube de extremo a extremo.
                    No introduzcas datos sensibles reales. Consulta{' '}
                    <code>docs/desarrollo/desviaciones.md</code>.
                  </p>
                </Stack>
              </Card>
            ) : null}

            {step === 'account' ? (
              <Stack gap={3}>
                {accounts && accounts.length > 0 ? (
                  <Card padding="lg">
                    <Stack gap={3}>
                      <SectionHeader title="Ya tienes una cuenta" />
                      <p className="text-ui-12 text-text-secondary">
                        Puedes seguir con {accounts[0]?.name ?? 'tu cuenta'} o crear otra más
                        adelante.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setStep('csv')}>Continuar</Button>
                        <Button variant="tertiary" onClick={() => setStep('profile')}>
                          Atrás
                        </Button>
                      </div>
                    </Stack>
                  </Card>
                ) : (
                  <AccountForm
                    defaultCurrency={currencyDraft}
                    submitLabel="Crear cuenta y continuar"
                    showCancel={false}
                    onSaved={(account) => {
                      setCreatedAccount(account);
                      setStep('csv');
                    }}
                  />
                )}
                {!accounts || accounts.length === 0 ? (
                  <div className="flex flex-wrap justify-between gap-2">
                    <Button variant="tertiary" size="sm" onClick={() => setStep('profile')}>
                      Atrás
                    </Button>
                    <Button variant="tertiary" size="sm" onClick={() => setStep('csv')}>
                      Omitir este paso
                    </Button>
                  </div>
                ) : null}
              </Stack>
            ) : null}

            {step === 'csv' ? (
              <Card padding="lg">
                <Stack gap={4}>
                  <SectionHeader
                    title="Bancos compatibles"
                    action={<Badge tone="info">Próximamente</Badge>}
                  />
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {bankCatalog
                      .filter((bank) => bank.icon === 'app')
                      .map((bank) => (
                        <li
                          key={bank.id}
                          className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-default px-2 py-1.5"
                        >
                          <BankIcon bankId={bank.id} size={20} />
                          <span className="truncate text-ui-10 text-text-secondary">{bank.name}</span>
                        </li>
                      ))}
                  </ul>
                  <Banner tone="info" title="Tus datos bancarios no se usan para nada">
                    El archivo se procesará en tu navegador y solo servirá como atajo para crear tus
                    movimientos, sin configurarlo todo a mano. No lo enviamos a tu banco ni lo usamos
                    con otros fines. Supabase cifra los datos en tránsito y en reposo; el cifrado de
                    extremo a extremo llegará más adelante.
                  </Banner>
                  <Inline className="flex-wrap justify-between gap-2">
                    <Button variant="tertiary" size="sm" onClick={() => setStep('account')}>
                      Atrás
                    </Button>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="tertiary" size="sm" onClick={() => setStep('movement')}>
                        Omitir este paso
                      </Button>
                      <Button onClick={() => setStep('movement')}>Continuar y añadir a mano</Button>
                    </div>
                  </Inline>
                </Stack>
              </Card>
            ) : null}

            {step === 'movement' ? (
              <Stack gap={3}>
                {movementAccounts.length === 0 ? (
                  <Card padding="lg">
                    <Stack gap={3}>
                      <SectionHeader title="Aún no hay cuentas" />
                      <p className="text-ui-12 text-text-secondary">
                        Para registrar un movimiento necesitas una cuenta. Puedes crearla ahora o
                        omitir este paso.
                      </p>
                      <Inline className="flex-wrap gap-2">
                        <Button onClick={() => setStep('account')}>Crear una cuenta</Button>
                        <Button variant="tertiary" onClick={() => setStep('cloud')}>
                          Omitir este paso
                        </Button>
                      </Inline>
                    </Stack>
                  </Card>
                ) : movementSaved ? (
                  <Card padding="lg">
                    <Stack gap={3}>
                      <SectionHeader title="Movimiento guardado" />
                      <Banner tone="success" title="Todo listo">
                        Puedes añadir otro movimiento o continuar con la cuenta en la nube.
                      </Banner>
                      <Inline className="flex-wrap justify-between gap-2">
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => {
                            setMovementSaved(false);
                            setFormKey((value) => value + 1);
                          }}
                        >
                          Añadir otro
                        </Button>
                        <Button onClick={() => setStep('cloud')}>Continuar</Button>
                      </Inline>
                    </Stack>
                  </Card>
                ) : (
                  <Card padding="lg">
                    <Stack gap={4}>
                      <MovementForm
                        key={formKey}
                        accounts={movementAccounts}
                        defaultAccountId={defaultAccountId}
                        showActions={false}
                        framed={false}
                        formId="onboarding-movement"
                        onSaved={() => setMovementSaved(true)}
                      />
                      <div className="flex flex-wrap justify-between gap-2">
                        <Button variant="tertiary" size="sm" onClick={() => setStep('csv')}>
                          Atrás
                        </Button>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="tertiary" size="sm" onClick={() => setStep('cloud')}>
                            Omitir este paso
                          </Button>
                          <Button type="submit" form="onboarding-movement">
                            Guardar movimiento
                          </Button>
                        </div>
                      </div>
                    </Stack>
                  </Card>
                )}
              </Stack>
            ) : null}

            {step === 'cloud' ? (
              <Stack gap={3}>
                <CloudAccountCard variant="onboarding" defaultName={nameDraft} />
                <Card padding="md">
                  <Stack gap={3}>
                    <p className="text-ui-12 text-text-secondary">
                      Si no conectas una cuenta, tus datos se quedan en este dispositivo. Puedes
                      hacerlo más tarde desde Ajustes.
                    </p>
                    <Inline className="flex-wrap justify-between gap-2">
                      <Button variant="tertiary" onClick={() => setStep('movement')}>
                        Atrás
                      </Button>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="tertiary" onClick={() => void finish()}>
                          Ahora no
                        </Button>
                        <Button onClick={() => void finish()} loading={busy === 'finish'}>
                          Terminar
                        </Button>
                      </div>
                    </Inline>
                  </Stack>
                </Card>
              </Stack>
            ) : null}
          </section>
        </div>
      </PageContainer>
    </main>
  );
}
