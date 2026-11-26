'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { loadDemoDatabase, storageErrorMessage } from '@akari/data';
import { updateProfileName } from '@akari/domain';
import { Banner, Button, Card, Logo, PageContainer, Stack, TextField, useToast } from '@akari/ui';
import { useData } from '../providers';
import { useSettings } from '../hooks';
import { appNow } from '../../lib/clock';
import { defaultProfile } from '../../lib/profile';
import { useCloud } from '../cloud-provider';
import { CloudAccountCard } from '../account-panel';

export function OnboardingScreen() {
  const router = useRouter();
  const { db, repositories, ready, error } = useData();
  const settings = useSettings();
  const cloud = useCloud();
  const { toast } = useToast();
  const [busy, setBusy] = useState<'empty' | 'demo' | null>(null);
  const [nameDraft, setNameDraft] = useState<string>(defaultProfile.displayName);
  const [nameError, setNameError] = useState<string | undefined>();
  const nameInitialised = useRef(false);

  useEffect(() => {
    if (nameInitialised.current || !settings) return;
    nameInitialised.current = true;
    setNameDraft(settings.displayName ?? defaultProfile.displayName);
  }, [settings]);

  const saveName = async (): Promise<boolean> => {
    try {
      await updateProfileName(repositories, nameDraft);
      setNameError(undefined);
      return true;
    } catch (nameSaveError) {
      const message =
        nameSaveError instanceof Error ? nameSaveError.message : 'No se ha podido guardar el nombre.';
      setNameError(message);
      toast({ title: 'Revisa tu nombre', description: message, tone: 'error' });
      return false;
    }
  };

  const startEmpty = async () => {
    if (!(await saveName())) return;
    setBusy('empty');
    try {
      await repositories.settings.update({ onboardingCompleted: true, demoLoaded: false });
      router.replace('/');
    } catch (startError) {
      toast({ title: 'No se ha podido comenzar', description: storageErrorMessage(startError), tone: 'error' });
      setBusy(null);
    }
  };

  const startDemo = async () => {
    if (cloud.user) {
      toast({
        title: 'Desconecta la cuenta para cargar ejemplos',
        description:
          'Los datos de ejemplo sustituyen el contenido local. Cárgalos antes de conectar la cuenta o desconéctala desde Ajustes.',
        tone: 'info',
      });
      return;
    }
    setBusy('demo');
    try {
      await loadDemoDatabase(db, appNow());
      await updateProfileName(repositories, nameDraft);
      toast({ title: 'Datos de ejemplo cargados', tone: 'success' });
      router.replace('/');
    } catch (startError) {
      toast({ title: 'No se han podido cargar los datos', description: storageErrorMessage(startError), tone: 'error' });
      setBusy(null);
    }
  };

  return (
    <main className="min-h-screen bg-surface-canvas">
      <PageContainer className="flex min-h-screen max-w-3xl flex-col justify-center py-10">
        <div className="mb-8 flex flex-col gap-3">
          <Logo format="expanded" size="XL" />
          <h1 className="max-w-xl text-ui-32-bold text-text-primary md:text-heading-xxl">
            Tus cuentas, tranquilas y en orden.
          </h1>
          <p className="max-w-xl text-ui-14 text-text-secondary">
            akari guarda primero en este navegador y funciona sin conexión. Si quieres, conecta una
            cuenta para recuperar tus datos en otro dispositivo. La nube es opcional.
          </p>
        </div>

        <div className="flex max-w-xl flex-col gap-4">
          <Card padding="lg">
            <Stack gap={4}>
              <h2 className="text-ui-20-bold text-text-primary">¿Cómo quieres empezar?</h2>
              <p className="text-ui-12 text-text-secondary">
                Puedes cambiar de opinión desde Ajustes: los datos de ejemplo se pueden reiniciar en
                cualquier momento.
              </p>
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

              <TextField
                label="Tu nombre"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                error={nameError}
                help="Se muestra en tu perfil y en el shell. Máximo 40 caracteres."
                maxLength={40}
                autoComplete="name"
              />

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={startEmpty}
                  loading={busy === 'empty'}
                  disabled={!ready || Boolean(error)}
                  className="flex-1"
                >
                  Empezar vacío
                </Button>
                <Button
                  variant="secondary"
                  onClick={startDemo}
                  loading={busy === 'demo'}
                  disabled={!ready || Boolean(error)}
                  className="flex-1"
                >
                  Ver con datos de ejemplo
                </Button>
              </div>
              <p className="text-ui-10 text-text-tertiary">
                Esta versión no cifra la base local ni los datos en la nube de extremo a extremo. No
                introduzcas datos sensibles reales. Consulta{' '}
                <code>docs/desarrollo/desviaciones.md</code>.
              </p>
            </Stack>
          </Card>

          <CloudAccountCard variant="onboarding" defaultName={nameDraft} />
        </div>
      </PageContainer>
    </main>
  );
}
