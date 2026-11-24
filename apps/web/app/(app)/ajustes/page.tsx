import type { Metadata } from 'next';
import { SettingsScreen } from '../../../src/components/pages/settings';

export const metadata: Metadata = { title: 'Ajustes' };

export default function SettingsPage() {
  return <SettingsScreen />;
}
