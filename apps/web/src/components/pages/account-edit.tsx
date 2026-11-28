'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteAccount } from '@akari/domain';
import { Button, Card, Modal, Stack, StatePage, useToast } from '@akari/ui';
import { AccountForm } from '../forms/account-form';
import { useAccount, useMovements } from '../hooks';
import { useData } from '../providers';
import { PageTitle } from '../page-title';
import { PageHeaderResponsive } from '../page-header-responsive';
import { HeadingMeta } from '../heading-meta';
import { PageSkeleton } from '../page-skeleton';
import { ActionLink } from '../action-link';
import { errorMessage } from '../../lib/format';

export function AccountEditScreen({ accountId }: { accountId: string }) {
  const account = useAccount(accountId);
  const movements = useMovements(accountId);
  const { repositories } = useData();
  const { toast } = useToast();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  if (account === undefined || movements === undefined) {
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

  const remove = async () => {
    setBusy(true);
    try {
      await deleteAccount(repositories, account.id);
      toast({ title: 'Cuenta eliminada', tone: 'success' });
      router.push('/');
    } catch (error) {
      toast({
        title: 'No se ha podido eliminar',
        description: errorMessage(error, 'Inténtalo de nuevo.'),
        tone: 'error',
      });
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Stack gap={5}>
      <PageTitle title={`Editar ${account.name}`} />
      <PageHeaderResponsive
        title={`Editar ${account.name}`}
        breadcrumbs={
          <Link href={`/cuentas/${account.id}`} className="hover:underline">
            {account.name} / Editar
          </Link>
        }
      />
      <HeadingMeta detail="Cambiar el saldo inicial recalcula el saldo y los agregados." />
      <div className="flex max-w-2xl flex-col gap-4">
        <AccountForm account={account} />
        <Card padding="md" className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-ui-13-strong text-text-primary">Eliminar cuenta</p>
            <p className="text-ui-10 text-text-secondary">
              La cuenta se borrará de este dispositivo. Esta acción no se puede deshacer.
            </p>
          </div>
          <Button variant="tertiary" onClick={() => setConfirmDelete(true)}>
            Eliminar cuenta
          </Button>
        </Card>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar cuenta"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button onClick={remove} loading={busy}>
              Eliminar cuenta
            </Button>
          </>
        }
      >
        {movements.length > 0
          ? 'Esta cuenta tiene movimientos. No se puede eliminar mientras existan; archívala o elimina sus movimientos primero.'
          : 'La cuenta se eliminará de este navegador. Esta acción no se puede deshacer.'}
      </Modal>
    </Stack>
  );
}
