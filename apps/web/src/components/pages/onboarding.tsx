'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { bankCatalog, updateProfilePreferences, type ProfilePreferencesInput } from '@akari/domain';
import { loadDemoDatabase, storageErrorMessage } from '@akari/data';
import {
  Badge,
  Banner,
  Button,
  cn,
  Icon,
  Inline,
  MonthDayPicker,
  Logo,
  PageContainer,
  SectionHeader,
  Stack,
  useToast,
  type IconName,
} from '@akari/ui';
import { useSettings } from '../hooks';
import { useData } from '../providers';
import { CloudAccountCard } from '../account-panel';
import { useCloud } from '../cloud-provider';
import { BankIcon } from '../bank-icon';
import { appNow } from '../../lib/clock';
import { clearSignupOnboarding, hasSignupOnboarding } from '../../lib/access-intent';
import { defaultProfile } from '../../lib/profile';
import { currencyOptions } from '../../lib/options';

const STEPS = ['name', 'currency', 'income', 'banks', 'cloud'] as const;
type Step = (typeof STEPS)[number];

const STEP_META: Record<Step, { title: string; description: string; icon: IconName }> = {
  name: {
    title: '¿Cómo te llamas?',
    description:
      'Así te saludamos en el resumen y personalizamos tu perfil. Puedes cambiarlo cuando quieras en Ajustes.',
    icon: 'users',
  },
  currency: {
    title: 'Tu divisa favorita',
    description:
      'La usaremos por defecto al crear cuentas y al mostrar importes. Las cuentas existentes conservan su divisa.',
    icon: 'wallet',
  },
  income: {
    title: 'Tu ingreso mensual',
    description:
      'Si sueles cobrar un día concreto del mes, dínoslo para afinar avisos y previsiones. Es opcional.',
    icon: 'clock',
  },
  banks: {
    title: 'Tu banco',
    description:
      'Estamos preparando la importación de movimientos desde el CSV de tu banco. Muy pronto podrás usarla como atajo.',
    icon: 'arrows',
  },
  cloud: {
    title: 'Guarda tus datos',
    description:
      'La nube es opcional: sirve para recuperar tus datos en otro dispositivo y no depender de este navegador.',
    icon: 'insights',
  },
};

const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
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
  const cloud = useCloud();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('name');
  const [busy, setBusy] = useState<'step' | 'demo' | 'finish' | null>(null);
  const [nameDraft, setNameDraft] = useState<string>(defaultProfile.displayName);
  const [currencyDraft, setCurrencyDraft] = useState('EUR');
  const [incomeDayDraft, setIncomeDayDraft] = useState('');
  const [profileError, setProfileError] = useState<string | undefined>();
  const [contentHeight, setContentHeight] = useState<number>();
  const [asideHeight, setAsideHeight] = useState<number>();
  const initialised = useRef(false);
  const nameTouched = useRef(false);
  const redirected = useRef(false);
  const fromSignup = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Si el asistente viene de crear la cuenta en la ruta de acceso, la sesión
    // activa no debe saltárselo: es parte del alta.
    fromSignup.current = hasSignupOnboarding();
  }, []);

  useEffect(() => {
    if (initialised.current || !settings) return;
    initialised.current = true;
    // Si la persona ya ha escrito antes de que termine de cargar IndexedDB,
    // no pisamos su nombre con el valor guardado.
    if (!nameTouched.current) {
      setNameDraft(settings.displayName ?? defaultProfile.displayName);
    }
    setCurrencyDraft(settings.primaryCurrency ?? 'EUR');
    setIncomeDayDraft(settings.primaryIncomeDay == null ? '' : String(settings.primaryIncomeDay));
  }, [settings]);

  useEffect(() => {
    if (!settings || redirected.current) return;
    if (settings.onboardingCompleted) {
      redirected.current = true;
      clearSignupOnboarding();
      router.replace('/');
      return;
    }
    if (!cloud.user) return;
    if (fromSignup.current) return;
    // Con una sesión de nube activa, el asistente ya no aporta nada: la cuenta
    // existe y sus datos vienen de Supabase. Lo damos por completado y vamos al
    // resumen para no rebotar entre ambas pantallas.
    redirected.current = true;
    void repositories.settings
      .update({ onboardingCompleted: true })
      .catch(() => undefined)
      .then(() => router.replace('/'));
  }, [settings, cloud.user, repositories, router]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const measure = () => setContentHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [step, error]);

  useEffect(() => {
    const element = asideRef.current;
    if (!element) return;
    const measure = () => setAsideHeight(element.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [step]);

  const meta = STEP_META[step];
  const stepIndex = STEPS.indexOf(step);

  const savePreferences = async (patch: ProfilePreferencesInput): Promise<boolean> => {
    setProfileError(undefined);
    try {
      await updateProfilePreferences(repositories, patch);
      return true;
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'No se ha podido guardar el perfil.';
      setProfileError(message);
      toast({ title: 'Revisa tus datos', description: message, tone: 'error' });
      return false;
    }
  };

  const finish = async (markCompleted = true) => {
    setBusy('finish');
    try {
      if (markCompleted) {
        await repositories.settings.update({ onboardingCompleted: true });
      }
      clearSignupOnboarding();
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

  const continueStep = async () => {
    setBusy('step');
    let saved = true;

    if (step === 'name') {
      saved = await savePreferences({ displayName: nameDraft });
      if (saved) setStep('currency');
    } else if (step === 'currency') {
      saved = await savePreferences({ primaryCurrency: currencyDraft });
      if (saved) setStep('income');
    } else if (step === 'income') {
      saved = await savePreferences({
        primaryIncomeDay: incomeDayDraft.trim() === '' ? null : Number(incomeDayDraft),
      });
      if (saved) setStep('banks');
    } else if (step === 'banks') {
      setStep('cloud');
    }

    setBusy(null);
    if (!saved) return;
  };

  const skipIncome = async () => {
    setBusy('step');
    const saved = await savePreferences({ primaryIncomeDay: null });
    setBusy(null);
    if (saved) setStep('banks');
  };

  const startDemo = async () => {
    setBusy('demo');
    try {
      const saved = await savePreferences({
        displayName: nameDraft,
        primaryCurrency: currencyDraft,
        primaryIncomeDay: incomeDayDraft.trim() === '' ? null : Number(incomeDayDraft),
      });
      if (!saved) {
        setBusy(null);
        return;
      }
      await loadDemoDatabase(db, appNow());
      await updateProfilePreferences(repositories, {
        displayName: nameDraft,
        primaryCurrency: currencyDraft,
        primaryIncomeDay: incomeDayDraft.trim() === '' ? null : Number(incomeDayDraft),
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
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-strong lg:h-16 lg:w-16">
                <Icon name={meta.icon} size={20} />
              </span>
              <div className="min-w-0 lg:mt-5">
                <p className="text-ui-10 uppercase tracking-[0.16em] text-accent-strong">
                  Paso {stepIndex + 1} de {STEPS.length}
                </p>
                <h1 className="text-ui-20-bold text-text-primary lg:text-ui-32-bold">
                  {meta.title}
                </h1>
              </div>
            </div>
            <div
              className="mt-3 overflow-hidden transition-[height] duration-slow ease-out motion-reduce:transition-none lg:mt-4"
              style={{ height: asideHeight }}
            >
              <p ref={asideRef} className="text-ui-12 text-text-secondary lg:text-ui-13">
                {meta.description}
              </p>
            </div>
            {step === 'name' ? (
              <Button
                variant="tertiary"
                size="sm"
                className="mt-4"
                onClick={() => void startDemo()}
                loading={busy === 'demo'}
                disabled={!ready || Boolean(error)}
              >
                Ver con datos de ejemplo
              </Button>
            ) : null}
            <p className="mt-4 text-ui-10 text-text-tertiary">
              Tus datos se guardan primero en este dispositivo. La nube es opcional y se puede
              activar al final. Esta versión no cifra la base local ni la nube de extremo a extremo.
            </p>
          </aside>

          <section className="min-w-0">
            {error ? (
              <Banner tone="error" title="Almacenamiento no disponible">
                {error}
              </Banner>
            ) : null}

            <div
              className="overflow-hidden rounded-xl border border-border-subtle bg-surface-default transition-[height] duration-slow ease-out motion-reduce:transition-none"
              style={{ height: contentHeight }}
            >
              <div ref={contentRef} key={step} className="min-w-0 p-6">
                {step === 'name' ? (
                  <div className="flex flex-col items-center justify-center gap-5 py-6">
                    <label htmlFor="onboarding-name" className="sr-only">
                      Tu nombre
                    </label>
                    <input
                      id="onboarding-name"
                      value={nameDraft}
                      onChange={(event) => {
                        nameTouched.current = true;
                        setNameDraft(event.target.value);
                      }}
                      maxLength={40}
                      autoComplete="name"
                      autoFocus
                      spellCheck={false}
                      aria-invalid={profileError ? true : undefined}
                      aria-describedby="onboarding-name-help"
                      placeholder="Tu nombre"
                      className={cn(
                        'w-full max-w-xl cursor-text border-0 bg-transparent p-0 text-center text-ui-32-bold caret-accent-default outline-none ring-0 placeholder:text-text-placeholder focus:outline-none focus:ring-0 md:text-heading-xxl',
                        profileError ? 'text-status-danger-text' : 'text-text-primary',
                      )}
                    />
                    <p
                      id="onboarding-name-help"
                      className={cn(
                        'max-w-sm text-center text-ui-11',
                        profileError ? 'text-status-danger-text' : 'text-text-secondary',
                      )}
                      aria-live="polite"
                    >
                      {profileError ??
                        'Toca el texto y escribe tu nombre. No hay nada que seleccionar.'}
                    </p>
                    <div className="flex flex-wrap justify-end gap-2 self-stretch">
                      <Button
                        onClick={() => void continueStep()}
                        loading={busy === 'step'}
                        disabled={!ready || Boolean(error)}
                      >
                        Continuar
                      </Button>
                    </div>
                  </div>
                ) : null}

                {step === 'currency' ? (
                  <Stack gap={4}>
                    <div className="grid grid-cols-2 gap-3">
                      {currencyOptions.map((option) => {
                        const selected = currencyDraft === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setCurrencyDraft(option.value)}
                            aria-pressed={selected}
                            className={cn(
                              'flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors',
                              selected
                                ? 'border-accent-default bg-accent-soft text-text-primary'
                                : 'border-border-subtle bg-surface-default text-text-secondary hover:bg-surface-sunken',
                            )}
                          >
                            <span className="text-ui-24-bold">{CURRENCY_SYMBOL[option.value]}</span>
                            <span className="text-ui-12-strong">{option.label}</span>
                            <span className="text-ui-10 text-text-tertiary">{option.value}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <Button variant="tertiary" size="sm" onClick={() => setStep('name')}>
                        Atrás
                      </Button>
                      <Button onClick={() => void continueStep()} loading={busy === 'step'}>
                        Continuar
                      </Button>
                    </div>
                  </Stack>
                ) : null}

                {step === 'income' ? (
                  <Stack gap={4}>
                    <MonthDayPicker
                      value={incomeDayDraft.trim() === '' ? null : Number(incomeDayDraft)}
                      onSelect={(day) => setIncomeDayDraft(String(day))}
                      label="Día del ingreso principal"
                    />
                    <div className="text-center">
                      <p className="text-ui-12-strong text-text-primary">
                        {incomeDayDraft.trim() === ''
                          ? 'Sin definir'
                          : `Día ${incomeDayDraft} de cada mes`}
                      </p>
                      <p className="text-ui-10 text-text-secondary">
                        Opcional. Si el mes es más corto, se ajusta al último día.
                      </p>
                      {profileError ? (
                        <p className="mt-1 text-ui-11 text-status-danger-text">{profileError}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap justify-between gap-2">
                      <Button variant="tertiary" size="sm" onClick={() => setStep('currency')}>
                        Atrás
                      </Button>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="tertiary" onClick={() => void skipIncome()}>
                          No lo tengo
                        </Button>
                        <Button onClick={() => void continueStep()} loading={busy === 'step'}>
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </Stack>
                ) : null}

                {step === 'banks' ? (
                  <Stack gap={4}>
                    <SectionHeader
                      title="Bancos compatibles"
                      action={<Badge tone="info">Próximamente</Badge>}
                    />
                    <ul
                      aria-label="Bancos compatibles"
                      className="grid grid-cols-4 justify-items-center gap-4 sm:grid-cols-5"
                    >
                      {bankCatalog
                        .filter((bank) => bank.icon === 'app')
                        .map((bank) => (
                          <li key={bank.id} title={bank.name} aria-label={bank.name} role="img">
                            <span className="grid h-16 w-16 place-items-center rounded-full border border-border-subtle bg-surface-default p-1 shadow-sm sm:h-[72px] sm:w-[72px]">
                              <BankIcon bankId={bank.id} size={64} />
                            </span>
                          </li>
                        ))}
                    </ul>
                    <Banner tone="info" title="Tus datos bancarios no se usan para nada">
                      El archivo se procesará en tu navegador y solo servirá como atajo para crear
                      tus movimientos, sin configurarlo todo a mano. No lo enviamos a tu banco ni lo
                      usamos con otros fines. Supabase cifra los datos en tránsito y en reposo; el
                      cifrado de extremo a extremo llegará más adelante.
                    </Banner>
                    <div className="flex flex-wrap justify-between gap-2">
                      <Button variant="tertiary" size="sm" onClick={() => setStep('income')}>
                        Atrás
                      </Button>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="tertiary" onClick={() => void finish()}>
                          Omitir
                        </Button>
                        <Button onClick={() => void continueStep()} loading={busy === 'step'}>
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </Stack>
                ) : null}

                {step === 'cloud' ? (
                  <Stack gap={4}>
                    <CloudAccountCard variant="onboarding" bare defaultName={nameDraft} />
                    <div className="flex flex-col gap-3 border-t border-border-subtle pt-4">
                      <p className="text-ui-12 text-text-secondary">
                        Si no conectas una cuenta, tus datos se quedan en este dispositivo. Puedes
                        hacerlo más tarde desde Ajustes.
                      </p>
                      <Inline className="flex-wrap justify-between gap-2">
                        <Button variant="tertiary" onClick={() => setStep('banks')}>
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
                    </div>
                  </Stack>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </PageContainer>
    </main>
  );
}
