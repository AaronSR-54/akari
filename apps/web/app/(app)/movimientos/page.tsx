import type { Metadata } from 'next';
import { MovementsScreen } from '../../../src/components/pages/movements';

export const metadata: Metadata = { title: 'Movimientos' };

export default function MovementsPage() {
  return <MovementsScreen />;
}
