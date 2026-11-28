'use client';

import { useState } from 'react';
import {
  createRecurrence,
  parseAmountToMinor,
  type Account,
  type Frequency,
  type MovementType,
} from '@akari/domain';
import {
  AmountField,
  Button,
  Card,
  DateField,
  SegmentedControl,
  SelectField,
  Stack,
  TextField,
  useToast,
} from '@akari/ui';
import { useData } from '../providers';
import { frequencyOptions, movementCategoryOptions } from '../../lib/options';
import { appTodayKey } from '../../lib/clock';
import { errorMessage } from '../../lib/format';

export function RecurrenceForm({
  account,
  formId = 'recurrence-form',
  showActions = true,
  framed = true,
  onSaved,
  onCancel,
  onSavingChange,
}: {
  account: Account;
  formId?: string;
  showActions?: boolean;
  framed?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
  onSavingChange?: (saving: boolean) => void;
}) {
  const { repositories } = useData();
  const { toast } = useToast();
  const [type, setType] = useState<MovementType>('expense');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('Suscripciones');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [nextDate, setNextDate] = useState(appTodayKey());
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const amountMinor = parseAmountToMinor(amount, account.currency);
    if (amountMinor === null || amountMinor <= 0) {
      nextErrors.amount = 'El importe debe ser mayor que cero';
    }
    if (!concept.trim()) nextErrors.concept = 'El concepto es obligatorio';
    if (!nextDate) nextErrors.nextDate = 'La próxima fecha es obligatoria';
    if (endDate && nextDate && endDate < nextDate) {
      nextErrors.endDate = 'La fecha de fin no puede ser anterior a la próxima fecha';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    onSavingChange?.(true);
    try {
      await createRecurrence(repositories, {
        accountId: account.id,
        type,
        amountMinor: amountMinor!,
        concept,
        category,
        frequency,
        nextDate,
        endDate: endDate || null,
      });
      toast({ title: 'Recurrencia creada', tone: 'success' });
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Revisa los datos',
        description: errorMessage(error, 'No se ha podido crear la recurrencia'),
        tone: 'error',
      });
    } finally {
      setSaving(false);
      onSavingChange?.(false);
    }
  };

  const form = (
    <form id={formId} onSubmit={submit} noValidate>
      <Stack gap={4}>
        <SegmentedControl
          ariaLabel="Tipo de movimiento"
          options={[
            { value: 'expense', label: 'Gasto' },
            { value: 'income', label: 'Ingreso' },
          ]}
          value={type}
          onChange={setType}
          size="lg"
          fill
        />
        <AmountField
          label="Importe"
          value={amount}
          currency={account.currency}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0,00"
          error={errors.amount}
          help="No se registrará ningún movimiento hasta que marques el pago."
          required
        />
        <TextField
          label="Concepto"
          value={concept}
          onChange={(event) => setConcept(event.target.value)}
          error={errors.concept}
          required
          autoComplete="off"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Categoría"
            value={category}
            onValueChange={setCategory}
            options={movementCategoryOptions}
          />
          <SelectField
            label="Frecuencia"
            value={frequency}
            onValueChange={(value) => setFrequency(value as Frequency)}
            options={frequencyOptions}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <DateField
            label="Próxima fecha"
            value={nextDate}
            onValueChange={setNextDate}
            error={errors.nextDate}
            required
          />
          <DateField
            label="Fecha de fin"
            value={endDate}
            onValueChange={setEndDate}
            error={errors.endDate}
            help="Opcional. Déjala vacía si no quieres limitarla."
          />
        </div>
        {showActions ? (
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="tertiary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear recurrencia
            </Button>
          </div>
        ) : null}
      </Stack>
    </form>
  );

  return framed ? <Card padding="lg">{form}</Card> : form;
}
