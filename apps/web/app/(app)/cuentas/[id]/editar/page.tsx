'use client';

import { useParams } from 'next/navigation';
import { AccountEditScreen } from '../../../../../src/components/pages/account-edit';

export default function EditAccountPage() {
  const params = useParams<{ id: string }>();
  return <AccountEditScreen accountId={params.id} />;
}
