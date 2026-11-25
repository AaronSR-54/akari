'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { deleteMovement } from '@akari/domain';
import { Amount, Button, InfoRow, Modal, useToast } from '@akari/ui';
import { useAccount, useGroupExpense, useMovement } from './hooks';
import { useData } from './providers';
import { MovementEditDialog } from './movement-edit-dialog';
import { errorMessage, formatLongDate } from '../lib/format';

const typeLabel = { expense: 'Gasto', income: 'Ingreso' } as const;

const linkClass = 'text-accent-strong underline-offset-4 hover:underline';

export function MovementDetailDialog({
  movementId,
  open,
  onClose,
}: {
  movementId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const movement = useMovement(movementId ?? '');
  const account = useAccount(movement?.accountId ?? '');
  const groupExpense = useGroupExpense(movement?.groupExpenseId ?? '');
  const { repositories } = useData();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const seenId = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      seenId.current = null;
      return;
    }
    if (movement) {
      seenId.current = movement.id;
      return;
    }
    if (movement === null && seenId.current === movementId) onClose();
  }, [open, movement, movementId, onClose]);

  const remove = async () => {
    if (!movement) return;
    setBusy(true);
    try {
      await deleteMovement(repositories, movement.id);
      toast({
        title: 'Movimiento eliminado',
        tone: 'success',
        actionLabel: 'Deshacer',
        onAction: () => {
          void repositories.movements.put(movement);
        },
      });
      onClose();
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

  const close = () => {
    setEditing(false);
    setConfirmDelete(false);
    onClose();
  };

  if (!open) return null;

  if (editing && movement) {
    return <MovementEditDialog movement={movement} open onClose={() => setEditing(false)} />;
  }

  if (confirmDelete) {
    return (
      <Modal
        open
        onClose={() => setConfirmDelete(false)}
        title="Eliminar movimiento"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button onClick={remove} loading={busy}>
              Eliminar movimiento
            </Button>
          </>
        }
      >
        El movimiento se eliminará de la cuenta y del listado. Podrás deshacerlo justo después.
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={close}
      title={movement?.concept ?? 'Movimiento'}
      className="max-w-xl"
      footer={
        <>
          <Button variant="tertiary" onClick={() => setConfirmDelete(true)} disabled={!movement || busy}>
            Eliminar
          </Button>
          <Button onClick={() => setEditing(true)} disabled={!movement}>
            Editar
          </Button>
        </>
      }
    >
      {movement ? (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-ui-13-strong text-text-primary">Datos del movimiento</h3>
          <InfoRow label="Tipo" value={typeLabel[movement.type]} />
          <InfoRow
            label="Importe"
            value={
              <Amount
                minor={movement.amountMinor}
                currency={movement.currency}
                type={movement.type}
                signed
                className="text-ui-10-strong"
              />
            }
          />
          <InfoRow label="Divisa" value={movement.currency} />
          <InfoRow label="Fecha" value={formatLongDate(movement.date)} />
          <InfoRow label="Categoría" value={movement.category} />
          <InfoRow
            label="Cuenta"
            value={
              account ? (
                <Link href={`/cuentas/${account.id}`} className={linkClass}>
                  {account.name}
                </Link>
              ) : (
                '—'
              )
            }
          />
          {movement.note ? <InfoRow label="Nota" value={movement.note} /> : null}
          <InfoRow label="Creado" value={formatLongDate(movement.createdAt.slice(0, 10))} />

          {movement.recurrenceId || movement.installmentPlanId || movement.groupExpenseId ? (
            <>
              <h3 className="mt-2 text-ui-13-strong text-text-primary">Vínculos</h3>
              {movement.recurrenceId ? (
                <InfoRow
                  label="Recurrencia"
                  value={
                    <Link href={`/cuentas/${movement.accountId}`} className={linkClass}>
                      Ver en la cuenta
                    </Link>
                  }
                />
              ) : null}
              {movement.installmentPlanId ? (
                <InfoRow
                  label="Plan de plazos"
                  value={
                    <Link href={`/cuentas/${movement.accountId}`} className={linkClass}>
                      Ver en la cuenta
                    </Link>
                  }
                />
              ) : null}
              {movement.groupExpenseId ? (
                <InfoRow
                  label="Gasto grupal"
                  value={
                    groupExpense ? (
                      <Link href={`/grupos/${groupExpense.groupId}`} className={linkClass}>
                        Ver en el grupo
                      </Link>
                    ) : (
                      '—'
                    )
                  }
                />
              ) : null}
            </>
          ) : null}
        </div>
      ) : (
        <p className="text-ui-11 text-text-secondary">Cargando movimiento…</p>
      )}
    </Modal>
  );
}
