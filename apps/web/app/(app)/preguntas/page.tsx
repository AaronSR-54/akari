import type { Metadata } from 'next';
import { QuestionsScreen } from '../../../src/components/pages/questions';

export const metadata: Metadata = { title: 'Preguntas rápidas' };

export default function QuestionsPage() {
  return <QuestionsScreen />;
}
