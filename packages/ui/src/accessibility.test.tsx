import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Button } from './buttons.js';
import { SelectField, TextField } from './fields.js';
import {
  Badge,
  BalanceSummary,
  ChartArea,
  ChartBars,
  MovementRow,
  ProgressInstallments,
} from './data-display.js';
import { StatePage } from './states.js';
import { Logo } from './logo.js';
import { MonthBalance } from './month-balance.js';

describe('accessibility', () => {
  it('la composición base no tiene violaciones graves', async () => {
    const { container } = render(
      <main>
        <Logo />
        <h1>Resumen</h1>
        <BalanceSummary totals={[{ minor: 100000, currency: 'EUR' }]} label="Saldo total" />
        <Badge tone="positive">Al día</Badge>
        <ProgressInstallments
          paid={2}
          total={6}
          label="Portátil · 2 de 6"
          status="on-track"
          percent={33}
        />
        <MovementRow
          concept="Cena"
          category="Ocio"
          dateLabel="10 nov"
          amountMinor={4500}
          currency="EUR"
          type="expense"
        />
        <ChartBars values={[10, 20]} labels={['L', 'M']} ariaLabel="Gasto semanal" />
        <ChartArea
          values={[0, 10, 20]}
          labels={['L', 'M', 'X']}
          ariaLabel="Gasto de la semana: 20,00 €"
          description="Del lunes al miércoles, total 20,00 €."
        />
        <MonthBalance
          days={Array.from({ length: 30 }, (_, index) => ({
            id: `2026-11-${index + 1}`,
            label: `día ${index + 1}`,
            balanceMinor: 1200000,
            total: '12.000,00 €',
            ariaLabel: `día ${index + 1}: saldo 12.000,00 €`,
          }))}
          openingBalanceMinor={1200000}
          openingLabel="sáb 31 oct"
          openingTotal="12.000,00 €"
          openingAriaLabel="sábado 31 de octubre: saldo de cierre 12.000,00 €"
          elapsedDays={29}
          ariaLabel="Saldo del mes por día"
        />
        <TextField label="Concepto" help="Ej. Cena" />
        <SelectField
          label="Tipo"
          value="personal"
          onValueChange={() => undefined}
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'deposit', label: 'Depósito' },
          ]}
        />
        <Button>Guardar</Button>
        <StatePage type="empty" title="Sin movimientos" description="Añade el primero para empezar." />
      </main>,
    );

    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it('month balance expone un grupo con nombre accesible', () => {
    render(
      <MonthBalance
        days={[
          {
            id: 'd1',
            label: 'dom 1 nov',
            balanceMinor: 1200000,
            total: '12.000,00 €',
            ariaLabel: 'domingo 1 de noviembre: saldo 12.000,00 €',
          },
        ]}
        openingBalanceMinor={1200000}
        openingLabel="sáb 31 oct"
        openingTotal="12.000,00 €"
        openingAriaLabel="sábado 31 de octubre: saldo de cierre 12.000,00 €"
        elapsedDays={1}
        ariaLabel="Saldo del mes por día"
      />,
    );
    expect(screen.getByRole('group', { name: /Saldo del mes por día/ })).toBeInTheDocument();
  });

  it('chart area expone su nombre accesible', () => {
    render(
      <ChartArea
        values={[0, 10]}
        labels={['L', 'M']}
        ariaLabel="Movimientos de la semana: 10,00 €"
      />,
    );
    expect(screen.getByRole('img', { name: 'Movimientos de la semana: 10,00 €' })).toBeInTheDocument();
  });

  it('el estado vacío ofrece una acción principal', () => {
    render(
      <StatePage
        type="empty"
        title="Sin movimientos"
        description="Añade el primero para empezar."
        primaryAction={<Button>Añadir movimiento</Button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Añadir movimiento' })).toBeInTheDocument();
  });

  it('el selector abierto no tiene violaciones graves', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <main>
        <SelectField
          label="Tipo"
          value="personal"
          onValueChange={() => undefined}
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'deposit', label: 'Depósito' },
          ]}
        />
      </main>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Tipo' }));
    expect(screen.getByRole('listbox', { name: 'Tipo' })).toBeInTheDocument();

    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
