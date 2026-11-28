'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { hasLocalData } from '@akari/data';
import { Banner, Button, Card, Logo, PageContainer } from '@akari/ui';
import { CloudAuthForm } from '../account-panel';
import { useCloud } from '../cloud-provider';
import { useData } from '../providers';
import { useSettings } from '../hooks';
import {
  clearSignupOnboarding,
  hasSignupOnboarding,
  rememberSignupOnboarding,
  routeAfterAccess,
  routeAfterSkip,
} from '../../lib/access-intent';

export function LoginScreen() {
  const router = useRouter();
  const cloud = useCloud();
  const settings = useSettings();
  const { db, repositories } = useData();
  const finishing = useRef(false);

  const finishAccess = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;

    const onboardingCompleted = Boolean(settings?.onboardingCompleted);
    const target = routeAfterAccess({
      isSignup: hasSignupOnboarding(),
      onboardingCompleted,
    });

    if (target === '/') {
      clearSignupOnboarding();
      if (!onboardingCompleted) {
        await repositories.settings
          .update({ onboardingCompleted: true })
          .catch(() => undefined);
      }
    }

    router.replace(target);
  }, [repositories, router, settings?.onboardingCompleted]);

  useEffect(() => {
    if (!cloud.user) return;
    void finishAccess();
  }, [cloud.user, finishAccess]);

  useEffect(() => {
    const { body, documentElement } = document;
    const previousBody = body.style.overflow;
    const previousHtml = documentElement.style.overflow;
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousBody;
      documentElement.style.overflow = previousHtml;
    };
  }, []);

  const continueWithoutAccount = async () => {
    const onboardingCompleted = Boolean(settings?.onboardingCompleted);
    const target = routeAfterSkip({
      onboardingCompleted,
      hasLocalData: await hasLocalData(db),
    });

    if (target === '/' && !onboardingCompleted) {
      await repositories.settings
        .update({ onboardingCompleted: true })
        .catch(() => undefined);
    }

    router.push(target);
  };

  return (
    <main className="h-dvh overflow-hidden bg-surface-canvas">
      <PageContainer className="login-shell flex h-full w-full max-w-md flex-col justify-center py-6 sm:py-10">
        <div className="login-header mb-6 flex flex-col items-center text-center">
          <Logo format="expanded" size="XL" className="login-logo-full" />
          <Logo format="expanded" size="M" className="login-logo-compact" />
          <h1 className="login-title mt-5 text-ui-24-bold text-text-primary sm:text-ui-32-bold">
            Entra en tu cuenta
          </h1>
          <p className="login-copy mt-2 max-w-sm text-ui-12 text-text-secondary">
            Recupera tus datos en otro dispositivo y mantenlos al día. Akari sigue funcionando
            primero en este navegador.
          </p>
        </div>

        <Card padding="lg" className="login-card w-full">
          {cloud.enabled ? (
            <CloudAuthForm
              initialMode="signin"
              submitFullWidth
              onConnected={() => void finishAccess()}
              onAccessIntent={(intent) => {
                if (intent === 'signup') rememberSignupOnboarding();
                else clearSignupOnboarding();
              }}
            />
          ) : (
            <Banner tone="info" title="La nube no está configurada">
              Esta instalación guarda los datos solo en este dispositivo. Puedes seguir usando
              Akari sin cuenta.
            </Banner>
          )}
        </Card>

        <Button
          variant="tertiary"
          className="login-skip mt-4 w-full"
          onClick={() => void continueWithoutAccount()}
        >
          Continuar sin registrarte
        </Button>
      </PageContainer>
    </main>
  );
}
