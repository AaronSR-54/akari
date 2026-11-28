'use client';

import { useState } from 'react';
import type { Account } from '@akari/domain';
import { Button, Modal } from '@akari/ui';
import { InstallmentPlanForm } from './forms/installment-plan-form';

const FORM_ID = 'installment-plan-dialog-form';

export function InstallmentPlanDialog({
  account,
  open,
  onClose,
}: {
  account: Account;
  open: boolean;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo plan de plazos"
      width="wide"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            Crear plan
          </Button>
        </>
      }
    >
      {open ? (
        <InstallmentPlanForm
          account={account}
          formId={FORM_ID}
          showActions={false}
          framed={false}
          onSaved={onClose}
          onCancel={onClose}
          onSavingChange={setSaving}
        />
      ) : null}
    </Modal>
  );
}
