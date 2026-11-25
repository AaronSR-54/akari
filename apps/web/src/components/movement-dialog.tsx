'use client';

import { useState } from 'react';
import { deleteMovement, type Account, type Movement } from '@akari/domain';
import { Button, Modal, useToast } from '@akari/ui';
import { MovementForm } from './forms/movement-form';
import { useData } from './providers';
import { ActionLink } from './action-link';

const FORM_ID = 'movement-dialog-form';

export function MovementDialog({
  accounts,
  movement = null,
  defaultAccountId,
  open,
  onClose,
}: {
  accounts: Account[];
  movement?: Movement | null;
  defaultAccountId?: string;
  open: boolean;
  onClose: () => void;
}) {
  const { repositories } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const close = () => {
    setSaving(false);
    setDeleting(false);
    onClose();
  };

  const remove = async () => {
    if (!movement) return;
    setDeleting(true);
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
      close();
    } catch {
      toast({ title: 'No se ha podido eliminar el movimiento', tone: 'error' });
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={movement ? 'Editar movimiento' : 'Nuevo movimiento'}
      width="wide"
      footer={
        accounts.length === 0 ? (
          <Button variant="secondary" onClick={close}>
            Cerrar
          </Button>
        ) : (
          <>
            {movement ? (
              <Button variant="tertiary" onClick={remove} loading={deleting} disabled={saving}>
                Eliminar
              </Button>
            ) : null}
            <Button variant="secondary" onClick={close} disabled={saving || deleting}>
              Cancelar
            </Button>
            <Button type="submit" form={FORM_ID} loading={saving} disabled={deleting}>
              {movement ? 'Guardar' : 'Guardar movimiento'}
            </Button>
          </>
        )
      }
    >
      {accounts.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p>Antes de registrar un movimiento, crea la cuenta donde se guardará.</p>
          <ActionLink href="/cuentas/nueva">Crear cuenta</ActionLink>
        </div>
      ) : (
        <MovementForm
          key={movement?.id ?? 'nuevo'}
          accounts={accounts}
          movement={movement ?? undefined}
          defaultAccountId={defaultAccountId}
          formId={FORM_ID}
          framed={false}
          showActions={false}
          onSaved={close}
          onSavingChange={setSaving}
        />
      )}
    </Modal>
  );
}
