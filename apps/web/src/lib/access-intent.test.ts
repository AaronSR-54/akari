import { describe, expect, it } from 'vitest';
import {
  clearSignupOnboarding,
  hasSignupOnboarding,
  rememberSignupOnboarding,
  routeAfterAccess,
  routeAfterSkip,
} from './access-intent';

describe('marcador de alta', () => {
  it('se guarda al iniciar el alta y se limpia al terminar', () => {
    rememberSignupOnboarding();
    expect(hasSignupOnboarding()).toBe(true);

    clearSignupOnboarding();
    expect(hasSignupOnboarding()).toBe(false);
  });
});

describe('routeAfterAccess', () => {
  it('lleva el alta nueva al onboarding', () => {
    expect(routeAfterAccess({ isSignup: true, onboardingCompleted: false })).toBe('/onboarding');
  });

  it('lleva el inicio de sesión al resumen', () => {
    expect(routeAfterAccess({ isSignup: false, onboardingCompleted: false })).toBe('/');
    expect(routeAfterAccess({ isSignup: false, onboardingCompleted: true })).toBe('/');
  });

  it('no repite el onboarding si ya estaba completado', () => {
    expect(routeAfterAccess({ isSignup: true, onboardingCompleted: true })).toBe('/');
  });
});

describe('routeAfterSkip', () => {
  it('salta el onboarding cuando ya hay datos locales', () => {
    expect(routeAfterSkip({ onboardingCompleted: false, hasLocalData: true })).toBe('/');
  });

  it('abre el onboarding cuando el dispositivo está vacío', () => {
    expect(routeAfterSkip({ onboardingCompleted: false, hasLocalData: false })).toBe(
      '/onboarding',
    );
  });

  it('no repite el onboarding si ya estaba completado', () => {
    expect(routeAfterSkip({ onboardingCompleted: true, hasLocalData: false })).toBe('/');
  });
});
