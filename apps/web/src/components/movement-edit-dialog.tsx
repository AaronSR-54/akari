'use client';

import { useState } from 'react';
import {
  decimalString,
  deleteMovement,
  money,
  parseAmountToMinor,
  updateMovement,
  type Movement,
} from '@akari/domain';
import {
  AmountField,
  Button,
  DateField,
  Modal,
  SelectField,
  TextField,
  useToast,
} from '@akari/ui';
import { useData } from './providers';
import { movementCategoryOptions } from '../lib/options';
import { errorMessage } from '../lib/format';

export function MovementEditDialog({
  movement,
  open,
  onClose,
}: {
  movement: Movement | null;
  open: boolean;
  onClose: () => void;
}) {
  const { repositories } = useData();
  const { toast } = useToast();
  const [concept, setConcept] = useState(movement?.concept ?? '');
  const [amount, setAmount] = useState(
    movement ? decimalString(money(movement.amountMinor, movement.currency)).replace('.', ',') : '',
  );
  const [date, setDate] = useState(movement?.date ?? '');
  const [category, setCategory] = useState(movement?.category ?? 'Otros');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!movement) return;
    const minor = parseAmountToMinor(amount, movement.currency);
    if (!concept.trim()) return setError('El concepto es obligatorio');
    if (minor === null || minor <= 0) return setError('El importe debe ser mayor que cero');
    setSaving(true);
    try {
      await updateMovement(repositories, movement.id, {
        concept,
        amountMinor: minor,
        date,
        category,
      });
      toast({ title: 'Movimiento actualizado', tone: 'success' });
      onClose();
    } catch (updateError) {
      setError(errorMessage(updateError, 'No se ha podido guardar'));
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!movement) return;
    setSaving(true);
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
    } catch {
      setError('No se ha podido eliminar el movimiento');
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar movimiento"
      footer={
        <>
          <Button variant="tertiary" onClick={remove} disabled={saving}>
            Eliminar
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="movement-edit-form" loading={saving}>
            Guardar
          </Button>
        </>
      }
    >
      {movement ? (
        <form id="movement-edit-form" onSubmit={save} noValidate className="flex flex-col gap-3">
          <TextField label="Concepto" value={concept} onChange={(event) => setConcept(event.target.value)} required />
          <AmountField
            label="Importe"
            value={amount}
            currency={movement.currency}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          <DateField label="Fecha" value={date} onChange={(event) => setDate(event.target.value)} required />
          <SelectField
            label="Categoría"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            options={movementCategoryOptions}
          />
          {error ? (
            <p role="alert" className="text-ui-11 text-status-danger-text">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}
    </Modal>
  );
}
