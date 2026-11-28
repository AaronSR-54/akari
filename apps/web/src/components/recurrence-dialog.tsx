'use client';

import { useState } from 'react';
import type { Account } from '@akari/domain';
import { Button, Modal } from '@akari/ui';
import { RecurrenceForm } from './forms/recurrence-form';

const FORM_ID = 'recurrence-dialog-form';

export function RecurrenceDialog({
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
      title="Nueva recurrencia"
      width="wide"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={saving}>
            Crear recurrencia
          </Button>
        </>
      }
    >
      {open ? (
        <RecurrenceForm
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
