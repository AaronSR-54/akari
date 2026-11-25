import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MonthBalance, type MonthBalanceDay } from './month-balance.js';

const days: MonthBalanceDay[] = [
  {
    id: '2026-11-01',
    label: 'dom 1 nov',
    balanceMinor: 1290000,
    total: '12.900,00 €',
    items: [{ id: 'm1', label: 'Nómina', value: '+2.400,00 €' }],
    ariaLabel: 'domingo 1 de noviembre: saldo 12.900,00 €',
  },
  {
    id: '2026-11-02',
    label: 'lun 2 nov',
    balanceMinor: 1205000,
    total: '12.050,00 €',
    ariaLabel: 'lunes 2 de noviembre: saldo 12.050,00 €',
  },
  {
    id: '2026-11-03',
    label: 'mar 3 nov',
    balanceMinor: 1235000,
    total: '12.350,00 €',
    items: [
      { id: 'm2', label: 'Venta', value: '+350,00 €' },
      { id: 'm3', label: 'Cena', value: '−50,00 €' },
    ],
    ariaLabel: 'martes 3 de noviembre: saldo 12.350,00 €',
  },
  {
    id: '2026-11-04',
    label: 'mié 4 nov',
    balanceMinor: 1235000,
    total: '12.350,00 €',
    ariaLabel: 'miércoles 4 de noviembre: saldo 12.350,00 €',
  },
];

function renderMonth() {
  return render(
    <MonthBalance
      days={days}
      openingBalanceMinor={1200000}
      openingLabel="sáb 31 oct"
      openingTotal="12.000,00 €"
      openingAriaLabel="sábado 31 de octubre: saldo de cierre 12.000,00 €"
      elapsedDays={3}
      ariaLabel="Saldo del mes por día"
    />,
  );
}

describe('month balance', () => {
  it('no muestra textos de cabecera', () => {
    renderMonth();
    expect(screen.queryByText(/Base 1 nov/)).not.toBeInTheDocument();
    expect(screen.queryByText('Saldo del mes')).not.toBeInTheDocument();
    expect(screen.queryByText(/Día 3 de 30/)).not.toBeInTheDocument();
    expect(screen.queryByText(/31 oct/)).not.toBeInTheDocument();
  });

  it('recorre los días transcurridos con el teclado y muestra el saldo', async () => {
    const user = userEvent.setup();
    renderMonth();
    const chart = screen.getByRole('group', { name: /Saldo del mes por día/ });

    await user.tab();
    expect(chart).toHaveFocus();
    expect(screen.getByText('mar 3 nov')).toBeInTheDocument();
    expect(screen.getByText('Saldo tras el día')).toBeInTheDocument();
    expect(screen.getByText('12.350,00 €')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('lun 2 nov')).toBeInTheDocument();
    expect(screen.getByText('Sin movimientos')).toBeInTheDocument();

    await user.keyboard('{Home}');
    expect(screen.getByText('sáb 31 oct')).toBeInTheDocument();
    expect(screen.getByText('Cierre del mes anterior')).toBeInTheDocument();
    expect(screen.getByText('Saldo al cierre')).toBeInTheDocument();
    expect(screen.getByText('12.000,00 €')).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('dom 1 nov')).toBeInTheDocument();
    expect(screen.getByText('Nómina')).toBeInTheDocument();

    await user.keyboard('{End}');
    expect(screen.getByText('mar 3 nov')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByText('Saldo tras el día')).not.toBeInTheDocument();
  });

  it('el punto más alto toca el borde superior', () => {
    const { container } = renderMonth();
    const line = container.querySelector('path[fill="none"]');
    expect(line?.getAttribute('d')).toContain('L 25 0');
  });

  it('redondea el final del área cuando el mes sigue abierto', () => {
    const { container } = renderMonth();
    const area = container.querySelector('path[fill^="url"]');
    expect(area?.getAttribute('d')).toContain('Q 100');
  });

  it('no redondea el final del área cuando el mes está completo', () => {
    const { container } = render(
      <MonthBalance
        days={days}
        openingBalanceMinor={1200000}
        openingLabel="sáb 31 oct"
        openingTotal="12.000,00 €"
        openingAriaLabel="sábado 31 de octubre: saldo de cierre 12.000,00 €"
        elapsedDays={4}
        ariaLabel="Saldo del mes por día"
      />,
    );
    const area = container.querySelector('path[fill^="url"]');
    expect(area?.getAttribute('d')).not.toContain('Q 100');
    expect(area?.getAttribute('d')).toContain('L 100');
  });

  it('empieza en el cierre del mes anterior y sigue con el día 1', () => {
    const { container } = render(
      <MonthBalance
        days={days}
        openingBalanceMinor={1200000}
        openingLabel="sáb 31 oct"
        openingTotal="12.000,00 €"
        openingAriaLabel="sábado 31 de octubre: saldo de cierre 12.000,00 €"
        elapsedDays={1}
        ariaLabel="Saldo del mes por día"
      />,
    );
    const line = container.querySelector('path[fill="none"]');
    expect(line?.getAttribute('d')).toMatch(/^M 0 /);
    expect(line?.getAttribute('d')).toContain('L');
    expect(screen.queryByText(/31 oct/)).not.toBeInTheDocument();
  });

  it('no permite seleccionar días futuros y anuncia el día activo', async () => {
    const user = userEvent.setup();
    renderMonth();

    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('mar 3 nov')).toBeInTheDocument();
    expect(screen.queryByText('mié 4 nov')).not.toBeInTheDocument();
    expect(screen.getByText(/martes 3 de noviembre/)).toBeInTheDocument();
  });
});
