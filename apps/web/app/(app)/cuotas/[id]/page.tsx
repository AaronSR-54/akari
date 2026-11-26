'use client';

import { useParams } from 'next/navigation';
import { InstallmentDetailScreen } from '../../../../src/components/pages/installment-detail';

export default function InstallmentPage() {
  const params = useParams<{ id: string }>();
  return <InstallmentDetailScreen planId={params.id} />;
}
