'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  createAccount,
  decimalString,
  money,
  parseAmountToMinor,
  updateAccount,
  type Account,
  type AccountType,
} from '@akari/domain';
import { Button, Card, Stack, TextField, SelectField, AmountField, Switch, useToast } from '@akari/ui';
import { useData } from '../providers';
import { accountTypeOptions, currencyOptions } from '../../lib/options';
import { errorMessage } from '../../lib/format';

export function AccountForm({ account }: { account?: Account }) {
  const router = useRouter();
  const { repositories } = useData();
  const { toast } = useToast();
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<AccountType>(account?.type ?? 'personal');
  const [currency, setCurrency] = useState(account?.currency ?? 'EUR');
  const [balance, setBalance] = useState(
    account ? decimalString(money(account.initialBalanceMinor, account.currency)).replace('.', ',') : '',
  );
  const [tae, setTae] = useState(account?.taeBps ? String(account.taeBps / 100) : '');
  const [includeInTotal, setIncludeInTotal] = useState(account?.includeInTotal ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'El nombre es obligatorio';
    const minor = parseAmountToMinor(balance, currency);
    if (minor === null) nextErrors.balance = 'El saldo inicial es obligatorio';
    else if (minor <= 0) nextErrors.balance = 'El saldo inicial debe ser mayor que cero';
    const taeBps = tae.trim() ? Math.round(Number(tae.replace(',', '.')) * 100) : null;
    if (taeBps !== null && (!Number.isFinite(taeBps) || taeBps < 0 || taeBps > 10000)) {
      nextErrors.tae = 'La TAE debe estar entre 0 y 100 %';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const input = {
        name,
        type,
        currency,
        initialBalanceMinor: minor!,
        taeBps,
        includeInTotal,
      };
      const saved = account
        ? await updateAccount(repositories, account.id, input)
        : await createAccount(repositories, input);
      toast({ title: account ? 'Cuenta actualizada' : 'Cuenta creada', tone: 'success' });
      router.push(`/cuentas/${saved.id}`);
    } catch (error) {
      const message = errorMessage(error, 'No se ha podido guardar la cuenta');
      toast({ title: 'Revisa los datos', description: message, tone: 'error' });
      setSaving(false);
    }
  };

  return (
    <Card padding="lg">
      <form onSubmit={submit} noValidate>
        <Stack gap={4}>
          <TextField
            label="Nombre de la cuenta"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
            required
            autoComplete="off"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Tipo"
              value={type}
              onValueChange={(value) => setType(value as AccountType)}
              options={accountTypeOptions}
              help="La cuenta conjunta podrá compartirse en una fase posterior."
            />
            <SelectField
              label="Divisa"
              value={currency}
              onValueChange={setCurrency}
              options={currencyOptions}
            />
          </div>
          <AmountField
            label="Saldo inicial"
            value={balance}
            currency={currency}
            onChange={(event) => setBalance(event.target.value)}
            placeholder="0,00"
            error={errors.balance}
            help="Obligatorio y mayor que cero. Se usa como punto de partida del saldo."
            required
          />
          {type === 'deposit' ? (
            <TextField
              label="TAE anual"
              value={tae}
              onChange={(event) => setTae(event.target.value)}
              error={errors.tae}
              inputMode="decimal"
              help="Porcentaje anual. La previsión de intereses se muestra en el detalle."
              placeholder="2,5"
            />
          ) : null}
          <Switch
            checked={includeInTotal}
            onChange={setIncludeInTotal}
            label="Incluir en el saldo total"
            help="Puedes excluir cuentas que no quieras sumar en el resumen."
          />
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="tertiary" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {account ? 'Guardar cambios' : 'Guardar cuenta'}
            </Button>
          </div>
        </Stack>
      </form>
    </Card>
  );
}
