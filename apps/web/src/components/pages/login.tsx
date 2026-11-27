'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Banner, Button, Card, Logo, PageContainer } from '@akari/ui';
import { CloudAuthForm } from '../account-panel';
import { useCloud } from '../cloud-provider';
import { useSettings } from '../hooks';

export function LoginScreen() {
  const router = useRouter();
  const cloud = useCloud();
  const settings = useSettings();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current || !cloud.user) return;
    redirected.current = true;
    router.replace('/');
  }, [cloud.user, router]);

  const backHref = settings?.onboardingCompleted ? '/' : '/onboarding';

  return (
    <main className="min-h-screen bg-surface-canvas">
      <PageContainer className="flex min-h-screen w-full max-w-md flex-col justify-center py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo format="expanded" size="XL" />
          <h1 className="mt-7 text-ui-24-bold text-text-primary sm:text-ui-32-bold">
            Entra en tu cuenta
          </h1>
          <p className="mt-2 max-w-sm text-ui-12 text-text-secondary">
            Recupera tus datos en otro dispositivo y mantenlos al día. Akari sigue funcionando
            primero en este navegador.
          </p>
        </div>

        <Card padding="lg" className="w-full">
          {cloud.enabled ? (
            <CloudAuthForm
              initialMode="signin"
              submitFullWidth
              onConnected={() => router.replace('/')}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <Banner tone="info" title="La nube no está configurada">
                Esta instalación guarda los datos solo en este dispositivo. Puedes seguir usando
                Akari sin cuenta.
              </Banner>
              <Button variant="secondary" onClick={() => router.push(backHref)}>
                Volver
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <p className="text-ui-10 text-text-tertiary">
            Sin cifrado de extremo a extremo. No uses datos sensibles reales.
          </p>
          <Button variant="tertiary" size="sm" onClick={() => router.push(backHref)}>
            {settings?.onboardingCompleted ? 'Volver al resumen' : 'Volver a primeros pasos'}
          </Button>
        </div>
      </PageContainer>
    </main>
  );
}
