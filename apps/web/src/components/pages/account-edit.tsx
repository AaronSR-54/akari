'use client';

import Link from 'next/link';
import { PageHeader, Stack, StatePage } from '@akari/ui';
import { AccountForm } from '../forms/account-form';
import { useAccount } from '../hooks';
import { PageTitle } from '../page-title';
import { PageSkeleton } from '../page-skeleton';
import { ActionLink } from '../action-link';

export function AccountEditScreen({ accountId }: { accountId: string }) {
  const account = useAccount(accountId);

  if (account === undefined) {
    return <PageSkeleton variant="single" />;
  }

  if (account === null) {
    return (
      <StatePage
        type="empty"
        title="La cuenta no existe"
        description="No se puede editar una cuenta que ya no está disponible."
        primaryAction={<ActionLink href="/">Volver al resumen</ActionLink>}
      />
    );
  }

  return (
    <Stack gap={5}>
      <PageTitle title={`Editar ${account.name}`} />
      <PageHeader
        title={`Editar ${account.name}`}
        description="Cambiar el saldo inicial recalcula el saldo y los agregados."
        breadcrumbs={
          <Link href={`/cuentas/${account.id}`} className="hover:underline">
            {account.name} / Editar
          </Link>
        }
      />
      <div className="max-w-2xl">
        <AccountForm account={account} />
      </div>
    </Stack>
  );
}
