import type { Metadata } from 'next';
import { NewMovementScreen } from '../../../../src/components/pages/new-movement';

export const metadata: Metadata = { title: 'Nuevo movimiento' };

export default function NewMovementPage() {
  return <NewMovementScreen />;
}
