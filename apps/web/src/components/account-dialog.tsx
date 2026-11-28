'use client';

import { useRouter } from 'next/navigation';
import type { Account } from '@akari/domain';
import { Button, Modal } from '@akari/ui';
import { AccountForm } from './forms/account-form';

const FORM_ID = 'account-dialog-form';

export function AccountDialog({
  open,
  onClose,
  defaultCurrency,
}: {
  open: boolean;
  onClose: () => void;
  defaultCurrency?: string;
}) {
  const router = useRouter();

  const saved = (account: Account) => {
    onClose();
    router.push(`/cuentas/${account.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva cuenta"
      width="wide"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID}>
            Guardar cuenta
          </Button>
        </>
      }
    >
      {open ? (
        <AccountForm
          formId={FORM_ID}
          showActions={false}
          framed={false}
          defaultCurrency={defaultCurrency}
          onCancel={onClose}
          onSaved={saved}
        />
      ) : null}
    </Modal>
  );
}
