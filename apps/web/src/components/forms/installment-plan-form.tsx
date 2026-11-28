'use client';

import { useState } from 'react';
import {
  createInstallmentPlan,
  parseAmountToMinor,
  type Account,
  type Frequency,
} from '@akari/domain';
import {
  AmountField,
  Button,
  Card,
  DateField,
  SelectField,
  Stack,
  TextField,
  useToast,
} from '@akari/ui';
import { useData } from '../providers';
import { frequencyOptions } from '../../lib/options';
import { appTodayKey } from '../../lib/clock';
import { errorMessage } from '../../lib/format';

export function InstallmentPlanForm({
  account,
  formId = 'installment-plan-form',
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
  const [concept, setConcept] = useState('');
  const [total, setTotal] = useState('');
  const [installments, setInstallments] = useState('3');
  const [firstDueDate, setFirstDueDate] = useState(appTodayKey());
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!concept.trim()) nextErrors.concept = 'El concepto es obligatorio';
    const totalMinor = parseAmountToMinor(total, account.currency);
    if (totalMinor === null || totalMinor <= 0) {
      nextErrors.total = 'El importe total debe ser mayor que cero';
    }
    const count = Number(installments.replace(',', '.'));
    if (!Number.isInteger(count) || count < 2) {
      nextErrors.installments = 'El plan debe tener al menos dos cuotas';
    }
    if (!firstDueDate) nextErrors.firstDueDate = 'La primera cuota es obligatoria';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    onSavingChange?.(true);
    try {
      await createInstallmentPlan(repositories, {
        accountId: account.id,
        concept,
        totalMinor: totalMinor!,
        installments: count,
        firstDueDate,
        frequency,
      });
      toast({ title: 'Plan de plazos creado', tone: 'success' });
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Revisa los datos',
        description: errorMessage(error, 'No se ha podido crear el plan'),
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
        <TextField
          label="Concepto"
          value={concept}
          onChange={(event) => setConcept(event.target.value)}
          error={errors.concept}
          required
          autoComplete="off"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <AmountField
            label="Importe total"
            value={total}
            currency={account.currency}
            onChange={(event) => setTotal(event.target.value)}
            placeholder="0,00"
            error={errors.total}
            help="Se reparte entre las cuotas. No se registra ningún movimiento hasta pagarlas."
            required
          />
          <TextField
            label="Número de cuotas"
            value={installments}
            inputMode="numeric"
            onChange={(event) => setInstallments(event.target.value)}
            error={errors.installments}
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <DateField
            label="Primera cuota"
            value={firstDueDate}
            onValueChange={setFirstDueDate}
            error={errors.firstDueDate}
            required
          />
          <SelectField
            label="Frecuencia"
            value={frequency}
            onValueChange={(value) => setFrequency(value as Frequency)}
            options={frequencyOptions}
          />
        </div>
        {showActions ? (
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="tertiary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Crear plan
            </Button>
          </div>
        ) : null}
      </Stack>
    </form>
  );

  return framed ? <Card padding="lg">{form}</Card> : form;
}
