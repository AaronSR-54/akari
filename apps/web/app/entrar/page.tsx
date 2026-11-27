import type { Metadata } from 'next';
import { LoginScreen } from '../../src/components/pages/login';

export const metadata: Metadata = { title: 'Entrar' };

export default function LoginPage() {
  return <LoginScreen />;
}
