'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loadDemoDatabase, storageErrorMessage } from '@akari/data';
import { Banner, Button, Card, Logo, PageContainer, Stack, useToast } from '@akari/ui';
import { useData } from '../providers';
import { useSettings } from '../hooks';

export function OnboardingScreen() {
  const router = useRouter();
  const { db, repositories, ready, error } = useData();
  const settings = useSettings();
  const { toast } = useToast();
  const [busy, setBusy] = useState<'empty' | 'demo' | null>(null);

  const startEmpty = async () => {
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
    setBusy('demo');
    try {
      await loadDemoDatabase(db);
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
            akari guarda todo en este navegador. Sin cuentas online, sin servidores y sin prisa por
            conectar nada. El cifrado y la sincronización llegarán en una fase posterior.
          </p>
        </div>

        <Card padding="lg" className="max-w-xl">
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
              Esta versión no pide contraseña ni cifra la base local. No introduzcas datos sensibles
              reales. Consulta <code>docs/desarrollo/desviaciones.md</code>.
            </p>
          </Stack>
        </Card>
      </PageContainer>
    </main>
  );
}
