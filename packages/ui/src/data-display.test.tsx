import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AccountCard,
  Amount,
  Badge,
  BalanceSummary,
  ChartBars,
  MovementRow,
  ProgressInstallments,
} from './data-display.js';

describe('data display', () => {
  it('formatea importes con signo y cifras tabulares', () => {
    render(
      <>
        <Amount minor={1250} currency="EUR" type="expense" />
        <Amount minor={2000} currency="EUR" type="income" />
        <Amount minor={-500} currency="EUR" />
      </>,
    );
    const amounts = [...document.querySelectorAll('[data-amount]')];
    expect(amounts[0]).toHaveTextContent('−');
    expect(amounts[1]).toHaveTextContent('+');
    expect(amounts[2]).toHaveTextContent('−');
    expect(amounts[0]).toHaveClass('font-tabular');
  });

  it('badge comunica el estado con texto, no solo color', () => {
    render(<Badge tone="negative">Vencido</Badge>);
    expect(screen.getByText('Vencido')).toBeInTheDocument();
    expect(screen.getByText('Vencido').className).toContain('bg-status-danger-soft');
  });

  it('la tarjeta de cuenta muestra saldo y estimado', () => {
    render(
      <AccountCard
        name="Cuenta diaria"
        type="personal"
        currency="EUR"
        balanceMinor={245001}
        meta="Actualizada hace 2 min"
      />,
    );
    expect(screen.getByText('Cuenta diaria')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Saldo disponible')).toBeInTheDocument();
    expect(screen.getByText('Actualizada hace 2 min')).toBeInTheDocument();
  });

  it('movement row distingue gasto e ingreso y permite acción', () => {
    render(
      <MovementRow
        concept="Cena"
        category="Ocio"
        dateLabel="10 nov"
        amountMinor={4500}
        currency="EUR"
        type="expense"
      />,
    );
    expect(screen.getByText('Cena')).toBeInTheDocument();
    expect(screen.getByText(/10 nov · Ocio/)).toBeInTheDocument();
  });

  it('balance summary agrupa divisas y alerta', () => {
    render(
      <BalanceSummary
        totals={[
          { minor: 100000, currency: 'EUR' },
          { minor: 5000, currency: 'USD' },
        ]}
        variant="alert"
        footer="Estimado negativo"
      />,
    );
    expect(screen.getByText('Saldo total')).toBeInTheDocument();
    expect(screen.getByText('Estimado negativo')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-amount]')).toHaveLength(2);
  });

  it('progress expone x de y y estado escrito', () => {
    render(
      <ProgressInstallments
        paid={3}
        total={12}
        label="Portátil · 3 de 12"
        status="overdue"
        percent={25}
        remainingLabel="Quedan 9 cuotas · 450,00 €"
        showStatus
      />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    expect(screen.getByText('Atrasado')).toBeInTheDocument();
    expect(screen.getAllByText(/3 de 12/).length).toBeGreaterThan(0);
  });

  it('charts tienen descripción accesible y etiquetas', () => {
    render(
      <ChartBars values={[10, 20, 5]} labels={['L', 'M', 'X']} ariaLabel="Gasto semanal" />,
    );
    expect(screen.getByRole('img', { name: 'Gasto semanal' })).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
