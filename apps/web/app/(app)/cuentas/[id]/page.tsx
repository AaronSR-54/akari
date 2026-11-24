'use client';

import { useParams } from 'next/navigation';
import { AccountDetailScreen } from '../../../../src/components/pages/account-detail';

export default function AccountPage() {
  const params = useParams<{ id: string }>();
  return <AccountDetailScreen accountId={params.id} />;
}
