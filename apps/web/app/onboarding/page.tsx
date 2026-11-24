import type { Metadata } from 'next';
import { OnboardingScreen } from '../../src/components/pages/onboarding';

export const metadata: Metadata = { title: 'Primeros pasos' };

export default function OnboardingPage() {
  return <OnboardingScreen />;
}
