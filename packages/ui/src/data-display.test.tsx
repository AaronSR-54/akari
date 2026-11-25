import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AccountCard,
  Amount,
  Badge,
  BalanceSummary,
  ChartArea,
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

  it('movement row acepta un icono propio sin perder el genérico por defecto', () => {
    const { container, rerender } = render(
      <MovementRow
        concept="Cena"
        category="Ocio"
        dateLabel="10 nov"
        amountMinor={4500}
        currency="EUR"
        type="expense"
      />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(
      <MovementRow
        concept="Cena"
        category="Ocio"
        dateLabel="10 nov"
        amountMinor={4500}
        currency="EUR"
        type="expense"
        icon={<span data-testid="icono-banco" />}
      />,
    );
    expect(screen.getByTestId('icono-banco')).toBeInTheDocument();
    expect(screen.getByTestId('icono-banco').parentElement).toHaveClass('bg-surface-sunken');
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('el distintivo plain no tiñe el logo con el color del movimiento', () => {
    render(
      <MovementRow
        concept="Nómina"
        category="Ingresos"
        dateLabel="1 nov"
        amountMinor={200000}
        currency="EUR"
        type="income"
        icon={<span data-testid="logo-banco" />}
        iconTone="plain"
      />,
    );
    const wrapper = screen.getByTestId('logo-banco').parentElement;
    expect(wrapper).toHaveClass('rounded-full');
    expect(wrapper).not.toHaveClass('bg-status-positive-soft');
    expect(wrapper).not.toHaveClass('text-status-positive-text');
  });

  it('icon={null} oculta por completo el distintivo de la fila', () => {
    const { container } = render(
      <MovementRow
        concept="Nómina"
        category="Ingresos"
        dateLabel="1 nov"
        amountMinor={200000}
        currency="EUR"
        type="income"
        icon={null}
      />,
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(screen.getByText('Nómina')).toBeInTheDocument();
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

  it('chart area describe la serie y marca el último valor', () => {
    render(
      <ChartArea
        values={[0, 500, 1200, 3000]}
        labels={['L', 'M', 'X', 'J']}
        ariaLabel="Movimientos de la semana: 30,00 €"
        description="Del lunes al jueves, total 30,00 €. Jueves, 12,00 € acumulados."
      />,
    );
    const chart = screen.getByRole('img', { name: 'Movimientos de la semana: 30,00 €' });
    expect(chart).toHaveAttribute('aria-describedby');
    expect(
      screen.getByText(/Del lunes al jueves, total 30,00 €/),
    ).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
    const paths = document.querySelectorAll('svg path');
    expect(paths).toHaveLength(2);
    expect(paths[1]).toHaveAttribute('d', expect.stringContaining('L 100 6'));
    const dot = document.querySelector('[data-chart-point="core"]');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('rounded-full', 'h-2', 'w-2');
    expect(dot).toHaveStyle({ left: '100%', top: '15%' });
  });

  it('chart area muestra el importe en un tooltip inline', () => {
    render(
      <ChartArea
        values={[500, 1200]}
        labels={['L', 'M']}
        ariaLabel="Movimientos de la semana"
        showLabels={false}
        tooltip={{ label: 'Semana · lun 23 – hoy', value: '12,00 € netos' }}
      />,
    );
    expect(screen.getByText('Semana · lun 23 – hoy')).toBeInTheDocument();
    expect(screen.getByText('12,00 € netos')).toBeInTheDocument();
    expect(screen.queryByText('L')).not.toBeInTheDocument();
  });

  it('chart area admite un solo punto y series en cero', () => {
    const { rerender } = render(
      <ChartArea values={[500]} labels={['L']} ariaLabel="Un día" description="Lunes, 5,00 €" />,
    );
    expect(screen.getByRole('img', { name: 'Un día' })).toBeInTheDocument();
    expect(document.querySelector('[data-chart-point="core"]')).toHaveStyle({ left: '100%' });

    rerender(<ChartArea values={[0, 0]} labels={['L', 'M']} ariaLabel="Sin gastos" />);
    expect(document.querySelector('svg path')?.getAttribute('d')).not.toContain('NaN');
    expect(document.querySelectorAll('[data-chart-point="core"]')).toHaveLength(1);
    expect(document.querySelector('[data-chart-point="halo"]')).toBeInTheDocument();
  });

  it('charts tienen descripción accesible y etiquetas', () => {
    render(
      <ChartBars values={[10, 20, 5]} labels={['L', 'M', 'X']} ariaLabel="Gasto semanal" />,
    );
    expect(screen.getByRole('img', { name: 'Gasto semanal' })).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
