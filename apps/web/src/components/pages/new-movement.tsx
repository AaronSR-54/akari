'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageHeader, Stack, StatePage } from '@akari/ui';
import { useAccounts } from '../../components/hooks';
import { MovementForm } from '../../components/forms/movement-form';
import { PageTitle } from '../../components/page-title';
import { ActionLink } from '../../components/action-link';
import { PageSkeleton } from '../../components/page-skeleton';

export function NewMovementScreen() {
  const accounts = useAccounts();
  const searchParams = useSearchParams();
  const defaultAccountId = searchParams.get('cuenta') ?? undefined;

  if (!accounts) {
    return <PageSkeleton variant="single" />;
  }

  if (accounts.length === 0) {
    return (
      <StatePage
        type="empty"
        title="Necesitas una cuenta"
        description="Antes de registrar un movimiento, crea la cuenta donde se guardará."
        primaryAction={
          <ActionLink href="/cuentas/nueva">Crear cuenta</ActionLink>
        }
      />
    );
  }

  return (
    <Stack gap={5}>
      <PageTitle title="Nuevo movimiento" />
      <PageHeader
        title="Nuevo movimiento"
        description="Un gasto o ingreso; si se repite, akari crea la suscripción."
        breadcrumbs={
          <Link href="/movimientos" className="hover:underline">
            Movimientos / Nuevo
          </Link>
        }
      />
      <div className="max-w-2xl">
        <MovementForm accounts={accounts} defaultAccountId={defaultAccountId} />
      </div>
    </Stack>
  );
}
