'use client';

import { useMemo, useState } from 'react';
import {
  addGroupExpense,
  convertMinor,
  formatMinor,
  parseAmountToMinor,
  splitByFixed,
  splitByPercentage,
  splitEqual,
  type Account,
  type Group,
  type SplitMode,
} from '@akari/domain';
import {
  AmountField,
  Button,
  Card,
  Checkbox,
  DateField,
  SectionHeader,
  SegmentedControl,
  SelectField,
  TextField,
  useToast,
} from '@akari/ui';
import { useData } from '../providers';
import { currencyOptions, splitModeOptions } from '../../lib/options';
import { errorMessage, formatLongDate } from '../../lib/format';
import { appTodayKey } from '../../lib/clock';

export function GroupExpenseForm({
  group,
  accounts,
  onSaved,
}: {
  group: Group;
  accounts: Account[];
  onSaved?: () => void;
}) {
  const { repositories } = useData();
  const { toast } = useToast();
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(group.currency);
  const [rate, setRate] = useState('');
  const [payerMemberId, setPayerMemberId] = useState(group.members[0]?.id ?? '');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(appTodayKey());
  const [mode, setMode] = useState<SplitMode>('equal');
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(group.members.map((member) => [member.id, true])),
  );
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [fixed, setFixed] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const memberIds = group.members.filter((member) => selected[member.id]).map((member) => member.id);
  const amountMinor = parseAmountToMinor(amount, currency) ?? 0;
  const groupTotal = useMemo(() => {
    if (amountMinor <= 0) return 0;
    if (currency === group.currency) return amountMinor;
    const parsedRate = Number(rate.replace(',', '.'));
    if (!Number.isFinite(parsedRate) || parsedRate <= 0) return 0;
    return convertMinor(amountMinor, parsedRate);
  }, [amountMinor, currency, group.currency, rate]);

  const preview = useMemo(() => {
    if (groupTotal <= 0 || memberIds.length === 0) return { shares: [], error: null as string | null };
    try {
      if (mode === 'equal') {
        return { shares: splitEqual(groupTotal, memberIds), error: null };
      }
      if (mode === 'percentage') {
        return {
          shares: splitByPercentage(
            groupTotal,
            memberIds.map((memberId) => ({
              memberId,
              percentage: Number(
                (percentages[memberId] ?? String(100 / memberIds.length)).replace(',', '.'),
              ),
            })),
          ),
          error: null,
        };
      }
      return {
        shares: splitByFixed(
          groupTotal,
          memberIds.map((memberId) => ({
            memberId,
            amountMinor:
              parseAmountToMinor(
                fixed[memberId] ?? (groupTotal / 100 / memberIds.length).toFixed(2),
                group.currency,
              ) ?? 0,
          })),
        ),
        error: null,
      };
    } catch (splitError) {
      return {
        shares: [],
        error: splitError instanceof Error ? splitError.message : 'Revisa el reparto',
      };
    }
  }, [groupTotal, memberIds, mode, percentages, fixed, group.currency]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!concept.trim()) return setError('El concepto es obligatorio');
    if (amountMinor <= 0) return setError('Introduce un importe válido');
    if (currency !== group.currency && (!rate || Number(rate.replace(',', '.')) <= 0)) {
      return setError('Indica el tipo de cambio aplicado');
    }
    if (memberIds.length === 0) return setError('Selecciona al menos un participante');
    if (preview.error) return;

    setSaving(true);
    try {
      await addGroupExpense(repositories, {
        groupId: group.id,
        payerMemberId,
        amountMinor: groupTotal,
        originalAmountMinor: currency === group.currency ? undefined : amountMinor,
        originalCurrency: currency === group.currency ? undefined : currency,
        exchangeRate: currency === group.currency ? null : Number(rate.replace(',', '.')),
        accountId: accountId || null,
        splitMode: mode,
        shares: preview.shares,
        date,
        concept,
      });
      toast({ title: 'Gasto grupal guardado', tone: 'success' });
      setConcept('');
      setAmount('');
      setRate('');
      setFixed({});
      setPercentages({});
      onSaved?.();
    } catch (saveError) {
      setError(errorMessage(saveError, 'No se ha podido guardar el gasto'));
    } finally {
      setSaving(false);
    }
  };

  const currencyChoices = Array.from(new Set([group.currency, 'EUR', 'USD', 'GBP'])).map((code) => ({
    value: code,
    label: currencyOptions.find((option) => option.value === code)?.label ?? code,
  }));
  const perShare = preview.shares[0]?.amountMinor;
  const equalShare =
    preview.shares.length > 0 && preview.shares.every((share) => share.amountMinor === perShare);
  const payer = group.members.find((member) => member.id === payerMemberId);
  const destination = accounts.find((account) => account.id === accountId)?.name ?? group.name;

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-4 xl:grid-cols-[360px_480px_minmax(0,1fr)]">
        <Card padding="md" className="flex flex-col gap-3.5">
          <SectionHeader title="Gasto" />
          <AmountField
            label="Importe"
            value={amount}
            currency={currency}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
            required
          />
          <TextField
            label="Concepto"
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
            placeholder="Cena del piso"
            required
          />
          <DateField label="Fecha" value={date} onValueChange={setDate} required />
          <SelectField
            label="Pagó"
            value={payerMemberId}
            onValueChange={setPayerMemberId}
            options={group.members.map((member) => ({ value: member.id, label: member.name }))}
          />
          <SelectField
            label="Divisa del gasto"
            value={currency}
            onValueChange={setCurrency}
            options={currencyChoices}
          />
          {currency !== group.currency ? (
            <TextField
              label={`Tipo de cambio ${currency} → ${group.currency}`}
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              inputMode="decimal"
              help="Se guarda con el gasto y no se recalcula después."
              required
            />
          ) : null}
          <SelectField
            label="Cuenta de origen"
            value={accountId}
            onValueChange={setAccountId}
            options={[
              { value: '', label: 'Sin cuenta (solo grupo)' },
              ...accounts.map((account) => ({ value: account.id, label: account.name })),
            ]}
            help="Si no hay cuenta, no se mueve ningún saldo hasta liquidar."
          />
        </Card>

        <Card padding="md" className="flex flex-col gap-3">
          <SectionHeader title={`Reparto entre ${memberIds.length || group.members.length} personas`} />
          <SegmentedControl
            ariaLabel="Reparto"
            options={splitModeOptions}
            value={mode}
            onChange={setMode}
            size="sm"
            variant="plain"
          />
          <fieldset className="flex flex-col">
            <legend className="sr-only">Participantes y partes</legend>
            {group.members.map((member) => {
              const share = preview.shares.find((entry) => entry.memberId === member.id);
              return (
                <div
                  key={member.id}
                  className="flex min-h-13 items-center gap-2.5 border-b border-border-subtle py-1.5 last:border-0"
                >
                  <Checkbox
                    label={member.name}
                    checked={Boolean(selected[member.id])}
                    onChange={(event) =>
                      setSelected((current) => ({ ...current, [member.id]: event.target.checked }))
                    }
                    className="min-w-0 flex-1"
                  />
                  {mode === 'percentage' ? (
                    <input
                      aria-label={`Porcentaje de ${member.name}`}
                      value={
                        percentages[member.id] ??
                        String((100 / Math.max(1, memberIds.length)).toFixed(2))
                      }
                      onChange={(event) =>
                        setPercentages((current) => ({ ...current, [member.id]: event.target.value }))
                      }
                      inputMode="decimal"
                      className="h-8 w-16 rounded-lg border border-border-subtle bg-surface-default px-2 text-right text-ui-11"
                    />
                  ) : null}
                  {mode === 'fixed' ? (
                    <input
                      aria-label={`Parte de ${member.name}`}
                      value={
                        fixed[member.id] ??
                        (groupTotal > 0
                          ? (groupTotal / 100 / Math.max(1, memberIds.length)).toFixed(2)
                          : '0')
                      }
                      onChange={(event) =>
                        setFixed((current) => ({ ...current, [member.id]: event.target.value }))
                      }
                      inputMode="decimal"
                      className="h-8 w-20 rounded-lg border border-border-subtle bg-surface-default px-2 text-right text-ui-11"
                    />
                  ) : null}
                  <span className="flex h-9 w-24 shrink-0 items-center justify-center rounded-lg bg-surface-canvas font-tabular text-ui-11-strong text-text-primary">
                    {share ? formatMinor(share.amountMinor, group.currency) : '—'}
                  </span>
                </div>
              );
            })}
          </fieldset>
          {preview.error ? (
            <p role="alert" className="text-ui-11 text-status-danger-text">
              {preview.error}
            </p>
          ) : null}
        </Card>

        <Card padding="md" className="flex flex-col gap-3">
          <SectionHeader title="Resumen" />
          <p className="font-tabular text-ui-30-bold text-text-primary">
            {formatMinor(groupTotal, group.currency)}
          </p>
          <p className="text-ui-10 text-text-secondary">
            {memberIds.length} {memberIds.length === 1 ? 'persona' : 'personas'}
            {equalShare && perShare ? ` · ${formatMinor(perShare, group.currency)} cada una` : ''} ·{' '}
            {payer?.name ?? 'Sin pagador'} · {formatLongDate(date)}
          </p>
          {currency !== group.currency ? (
            <p className="text-ui-10 text-text-secondary">
              {formatMinor(amountMinor, currency)} a un tipo de {rate || '—'} {group.currency}
            </p>
          ) : null}
          <div className="rounded-lg bg-surface-canvas p-3">
            <p className="text-ui-9 text-text-secondary">Se guardará en</p>
            <p className="text-ui-11-strong text-text-primary">{destination}</p>
          </div>
          {error ? (
            <p role="alert" className="text-ui-11 text-status-danger-text">
              {error}
            </p>
          ) : null}
          <div className="mt-auto">
            <Button type="submit" loading={saving} className="w-full">
              Guardar y repartir
            </Button>
          </div>
        </Card>
      </div>
    </form>
  );
}
