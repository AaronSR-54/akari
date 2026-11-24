import { decimalString, money, type Movement } from '@akari/domain';

function escape(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function movementsToCsv(
  movements: Movement[],
  accountName: (accountId: string) => string,
): string {
  const header = ['Fecha', 'Concepto', 'Categoría', 'Cuenta', 'Tipo', 'Importe', 'Divisa'];
  const rows = movements.map((movement) => [
    movement.date,
    escape(movement.concept),
    escape(movement.category),
    escape(accountName(movement.accountId)),
    movement.type === 'expense' ? 'Gasto' : 'Ingreso',
    decimalString(money(movement.amountMinor, movement.currency)),
    movement.currency,
  ]);
  return [header.join(';'), ...rows.map((row) => row.join(';'))].join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
