import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { Button } from './buttons.js';
import { TextField } from './fields.js';
import { Badge, BalanceSummary, ChartBars, MovementRow, ProgressInstallments } from './data-display.js';
import { StatePage } from './states.js';
import { Logo } from './logo.js';

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
        <TextField label="Concepto" help="Ej. Cena" />
        <Button>Guardar</Button>
        <StatePage type="empty" title="Sin movimientos" description="Añade el primero para empezar." />
      </main>,
    );

    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results).toHaveNoViolations();
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
});
