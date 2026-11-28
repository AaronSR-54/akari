const SIGNUP_ONBOARDING_KEY = 'akari:onboarding-after-signup';

/**
 * Marca que el acceso en curso es un alta, para que al volver del OAuth la
 * ruta de acceso continúe con el onboarding en lugar de abrir el resumen.
 */
export function rememberSignupOnboarding(): void {
  try {
    window.localStorage.setItem(SIGNUP_ONBOARDING_KEY, '1');
  } catch {
    // Sin almacenamiento local se sigue el camino de inicio de sesión normal.
  }
}

export function clearSignupOnboarding(): void {
  try {
    window.localStorage.removeItem(SIGNUP_ONBOARDING_KEY);
  } catch {
    // Sin efecto si localStorage no está disponible.
  }
}

export function hasSignupOnboarding(): boolean {
  try {
    return window.localStorage.getItem(SIGNUP_ONBOARDING_KEY) !== null;
  } catch {
    return false;
  }
}

/** Destino tras autenticarse: el alta nueva pasa por el asistente; entrar va al resumen. */
export function routeAfterAccess({
  isSignup,
  onboardingCompleted,
}: {
  isSignup: boolean;
  onboardingCompleted: boolean;
}): '/' | '/onboarding' {
  return isSignup && !onboardingCompleted ? '/onboarding' : '/';
}

/** Destino al seguir sin cuenta: con datos locales no se repite el asistente. */
export function routeAfterSkip({
  onboardingCompleted,
  hasLocalData,
}: {
  onboardingCompleted: boolean;
  hasLocalData: boolean;
}): '/' | '/onboarding' {
  return onboardingCompleted || hasLocalData ? '/' : '/onboarding';
}
