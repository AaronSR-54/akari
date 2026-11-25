'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  decimalString,
  money,
  parseAmountToMinor,
  recordMovement,
  updateMovement,
  type Account,
  type Movement,
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
  Switch,
  TextField,
  TextareaField,
  useToast,
} from '@akari/ui';
import { useData } from '../providers';
import { frequencyOptions, movementCategoryOptions } from '../../lib/options';
import { errorMessage } from '../../lib/format';
import { appTodayKey } from '../../lib/clock';

export function MovementForm({
  accounts,
  movement,
  defaultAccountId,
  defaultType = 'expense',
  formId = 'movement-form',
  showActions = true,
  framed = true,
  onSaved,
  onCancel,
  onSavingChange,
}: {
  accounts: Account[];
  movement?: Movement;
  defaultAccountId?: string;
  defaultType?: MovementType;
  formId?: string;
  showActions?: boolean;
  framed?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
  onSavingChange?: (saving: boolean) => void;
}) {
  const router = useRouter();
  const { repositories } = useData();
  const { toast } = useToast();
  const [type, setType] = useState<MovementType>(movement?.type ?? defaultType);
  const [accountId, setAccountId] = useState(
    movement?.accountId ?? defaultAccountId ?? accounts[0]?.id ?? '',
  );
  const [amount, setAmount] = useState(
    movement ? decimalString(money(movement.amountMinor, movement.currency)).replace('.', ',') : '',
  );
  const [date, setDate] = useState(movement?.date ?? appTodayKey());
  const [concept, setConcept] = useState(movement?.concept ?? '');
  const [category, setCategory] = useState(movement?.category ?? 'Alimentación');
  const [note, setNote] = useState(movement?.note ?? '');
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const account = accounts.find((candidate) => candidate.id === accountId);

  if (accounts.length === 0) {
    return null;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!accountId) nextErrors.accountId = 'Selecciona una cuenta';
    if (!concept.trim()) nextErrors.concept = 'El concepto es obligatorio';
    const minor = parseAmountToMinor(amount, account?.currency ?? 'EUR');
    if (minor === null) nextErrors.amount = 'Introduce un importe válido';
    else if (minor <= 0) nextErrors.amount = 'El importe debe ser mayor que cero';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    onSavingChange?.(true);
    try {
      if (movement) {
        await updateMovement(repositories, movement.id, {
          accountId,
          type,
          amountMinor: minor!,
          date,
          concept,
          category,
          note,
        });
      } else {
        await recordMovement(repositories, {
          accountId,
          type,
          amountMinor: minor!,
          date,
          concept,
          category,
          note,
          repeat: repeat ? { frequency } : null,
        });
      }
      toast({ title: movement ? 'Movimiento actualizado' : 'Movimiento guardado', tone: 'success' });
      if (onSaved) onSaved();
      else router.push('/movimientos');
    } catch (error) {
      const message = errorMessage(error, 'No se ha podido guardar el movimiento');
      toast({ title: 'Revisa los datos', description: message, tone: 'error' });
      setSaving(false);
      onSavingChange?.(false);
    }
  };

  const content = (
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
          currency={account?.currency ?? 'EUR'}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0,00"
          error={errors.amount}
          help={type === 'expense' ? 'Se restará del saldo de la cuenta.' : 'Se sumará al saldo de la cuenta.'}
          required
        />
        <SelectField
          label="Cuenta"
          value={accountId}
          onValueChange={setAccountId}
          options={accounts.map((item) => ({ value: item.id, label: item.name }))}
          error={errors.accountId}
          required
        />
        <TextField
          label="Concepto"
          value={concept}
          onChange={(event) => setConcept(event.target.value)}
          error={errors.concept}
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <DateField label="Fecha" value={date} onChange={(event) => setDate(event.target.value)} required />
          <SelectField
            label="Categoría"
            value={category}
            onValueChange={setCategory}
            options={movementCategoryOptions}
          />
        </div>
        <TextareaField
          label="Nota"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          help="Opcional. No se muestra en las listas."
        />
        {movement ? null : (
          <>
            <Switch
              checked={repeat}
              onChange={setRepeat}
              label="Repetir este movimiento"
              help="Crea una suscripción o un ingreso periódico."
            />
            {repeat ? (
              <SelectField
                label="Frecuencia"
                value={frequency}
                onValueChange={(value) => setFrequency(value as typeof frequency)}
                options={frequencyOptions}
              />
            ) : null}
          </>
        )}
        {showActions ? (
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="tertiary" onClick={onCancel ?? (() => router.back())}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {movement ? 'Guardar cambios' : 'Guardar movimiento'}
            </Button>
          </div>
        ) : null}
      </Stack>
    </form>
  );

  return framed ? <Card padding="lg">{content}</Card> : content;
}
