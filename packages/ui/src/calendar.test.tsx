import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Calendar, MonthDayPicker } from './calendar.js';
import { formatBusinessDate, parseBusinessDate, todayBusinessKey, type BusinessDateRange } from './dates.js';

const NOVEMBER_25 = '2026-11-25';

function renderCalendar(props: Partial<Parameters<typeof Calendar>[0]> = {}) {
  const onSelect = vi.fn();
  const onCancel = vi.fn();
  render(<Calendar value={NOVEMBER_25} onSelect={onSelect} onCancel={onCancel} {...props} />);
  return { onSelect, onCancel };
}

function renderRangeCalendar(props: Partial<Parameters<typeof Calendar>[0]> = {}) {
  const onRangeChange = vi.fn();
  const onCancel = vi.fn();
  render(
    <Calendar
      range={{ start: '2026-11-10' }}
      onRangeChange={onRangeChange}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onRangeChange, onCancel };
}

function StatefulRangeCalendar({ initial }: { initial: BusinessDateRange }) {
  const [range, setRange] = useState<BusinessDateRange>(initial);
  return <Calendar range={range} onRangeChange={setRange} onCancel={() => {}} />;
}

describe('calendar', () => {
  it('dibuja 42 días desde el lunes y permite elegir los meses contiguos', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderCalendar();
    expect(screen.getByRole('grid', { name: 'Noviembre 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
    expect(screen.getByRole('columnheader', { name: 'lunes' })).toBeInTheDocument();

    const previousMonth = screen.getByRole('button', { name: '26 oct 2026' });
    const nextMonth = screen.getByRole('button', { name: '06 dic 2026' });
    expect(previousMonth).toBeEnabled();
    expect(nextMonth).toBeEnabled();
    expect(previousMonth.className).toContain('text-text-tertiary');

    await user.click(previousMonth);
    expect(onSelect).toHaveBeenCalledWith('2026-10-26');
  });

  it('marca la fecha elegida y el día de hoy', () => {
    renderCalendar();
    const selected = screen.getByRole('button', { name: '25 nov 2026' }).parentElement;
    expect(selected).toHaveAttribute('role', 'gridcell');
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('button', { name: formatBusinessDate(todayBusinessKey()) }),
    ).toHaveAttribute('aria-current', 'date');
  });

  it('navega entre meses sin cambiar la fecha elegida', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderCalendar();

    await user.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByRole('grid', { name: 'Diciembre 2026' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getByRole('grid', { name: 'Noviembre 2026' })).toBeInTheDocument();
    const selected = screen.getByRole('button', { name: '25 nov 2026' }).parentElement;
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('camina por días, semanas y meses con el teclado', async () => {
    const user = userEvent.setup();
    renderCalendar();

    expect(screen.getByRole('button', { name: '25 nov 2026' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: '26 nov 2026' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: '03 dic 2026' })).toHaveFocus();
    expect(screen.getByRole('grid', { name: 'Diciembre 2026' })).toBeInTheDocument();

    await user.keyboard('{PageUp}');
    expect(screen.getByRole('button', { name: '03 nov 2026' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: '02 nov 2026' })).toHaveFocus();

    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: '08 nov 2026' })).toHaveFocus();
  });

  it('elige con Enter y cancela con Escape', async () => {
    const user = userEvent.setup();
    const { onSelect, onCancel } = renderCalendar();

    await user.keyboard('{ArrowRight}{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('2026-11-26');

    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('desde la cabecera muestra los meses del año y después el selector de años', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('button', { name: /Elegir mes y año/ }));
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'Noviembre de 2026' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: /Elegir año de 2026/ }));
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
    expect(screen.getByRole('button', { name: '2026' })).toHaveFocus();
    expect(screen.getByRole('button', { name: '2019' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2030' })).toBeInTheDocument();
  });

  it('elige mes y año y vuelve a la rejilla de días', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('button', { name: /Elegir mes y año/ }));
    await user.click(screen.getByRole('button', { name: 'Marzo de 2026' }));
    expect(screen.getByRole('grid', { name: 'Marzo 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
    expect(screen.getByRole('button', { name: '25 mar 2026' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: /Elegir mes y año/ }));
    await user.click(screen.getByRole('button', { name: /Elegir año de 2026/ }));
    await user.click(screen.getByRole('button', { name: '2028' }));
    expect(screen.getByRole('button', { name: 'Marzo de 2028' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Julio de 2028' }));
    expect(screen.getByRole('grid', { name: 'Julio 2028' })).toBeInTheDocument();
  });

  it('navega años y décadas con las flechas de la cabecera', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('button', { name: /Elegir mes y año/ }));
    await user.click(screen.getByRole('button', { name: 'Año siguiente' }));
    expect(screen.getByRole('button', { name: 'Noviembre de 2027' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Elegir año de 2027/ }));
    await user.click(screen.getByRole('button', { name: 'Década siguiente' }));
    expect(screen.getByRole('button', { name: '2029' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2040' })).toBeInTheDocument();
  });

  it('mantiene el mismo tamaño al cambiar entre días, meses y años', async () => {
    const user = userEvent.setup();
    renderCalendar();
    const body = screen.getByTestId('calendar-body');
    expect(body).toHaveClass('min-h-80');

    await user.click(screen.getByRole('button', { name: /Elegir mes y año/ }));
    expect(screen.getByTestId('calendar-body')).toHaveClass('min-h-80');

    await user.click(screen.getByRole('button', { name: /Elegir año/ }));
    expect(screen.getByTestId('calendar-body')).toHaveClass('min-h-80');
  });

  it('un tercer clic en la cabecera vuelve a la rejilla de días', async () => {
    const user = userEvent.setup();
    renderCalendar();

    await user.click(screen.getByRole('button', { name: /Elegir mes y año/ }));
    await user.click(screen.getByRole('button', { name: /Elegir año/ }));
    await user.click(screen.getByRole('button', { name: 'Volver a la rejilla de días' }));
    expect(screen.getByRole('grid', { name: 'Noviembre 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('el botón Hoy selecciona la fecha actual', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderCalendar();
    await user.click(screen.getByRole('button', { name: 'Hoy' }));
    expect(onSelect).toHaveBeenCalledWith(todayBusinessKey());
  });

  it('con valor vacío sitúa el mes actual y no marca ningún día', () => {
    renderCalendar({ value: undefined });
    const today = formatBusinessDate(todayBusinessKey());
    expect(screen.getByRole('button', { name: today })).toHaveFocus();
    expect(document.querySelector('[role="gridcell"][aria-selected="true"]')).toBeNull();
  });

  it('completa un rango con el segundo clic y destaca los días intermedios', async () => {
    const user = userEvent.setup();
    const { onRangeChange } = renderRangeCalendar();

    await user.click(screen.getByRole('button', { name: '20 nov 2026' }));
    expect(onRangeChange).toHaveBeenCalledWith({ start: '2026-11-10', end: '2026-11-20' });
  });

  it('reordena los extremos cuando la segunda fecha es anterior', async () => {
    const user = userEvent.setup();
    const { onRangeChange } = renderRangeCalendar({ range: { start: '2026-11-20' } });

    await user.click(screen.getByRole('button', { name: '10 nov 2026' }));
    expect(onRangeChange).toHaveBeenCalledWith({ start: '2026-11-10', end: '2026-11-20' });
  });

  it('permite cerrar el rango en un día del mes contiguo', async () => {
    const user = userEvent.setup();
    const { onRangeChange } = renderRangeCalendar();

    await user.click(screen.getByRole('button', { name: '03 dic 2026' }));
    expect(onRangeChange).toHaveBeenCalledWith({ start: '2026-11-10', end: '2026-12-03' });
  });

  it('mantiene correcta la selección al volver a un mes anterior', async () => {
    const user = userEvent.setup();
    const { onRangeChange } = renderRangeCalendar();

    await user.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getByRole('grid', { name: 'Octubre 2026' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '05 oct 2026' }));
    expect(onRangeChange).toHaveBeenCalledWith({ start: '2026-10-05', end: '2026-11-10' });
  });

  it('muestra marcado el día contiguo al navegar a su mes', async () => {
    const user = userEvent.setup();
    render(<StatefulRangeCalendar initial={{ start: '2026-11-10' }} />);

    await user.click(screen.getByRole('button', { name: '26 oct 2026' }));
    await user.click(screen.getByRole('button', { name: 'Mes anterior' }));

    expect(screen.getByRole('grid', { name: 'Octubre 2026' })).toBeInTheDocument();
    const start = screen.getByRole('button', { name: '26 oct 2026' });
    expect(start.parentElement).toHaveAttribute('aria-selected', 'true');
    expect(start).toHaveFocus();
  });

  it('usa el color de selección en un extremo del mes contiguo', () => {
    renderRangeCalendar({ range: { start: '2026-10-26', end: '2026-11-05' } });

    const start = screen.getByRole('button', { name: '26 oct 2026' });
    expect(start).toHaveClass('bg-accent-default');
    expect(start).toHaveClass('text-accent-ink');
    expect(start).not.toHaveClass('text-text-tertiary');
  });

  it('marca los extremos y los días incluidos de un rango completo', () => {
    renderRangeCalendar({ range: { start: '2026-11-10', end: '2026-11-20' } });

    expect(screen.getByRole('button', { name: '10 nov 2026' }).parentElement).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('button', { name: '20 nov 2026' }).parentElement).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const middle = screen.getByRole('button', { name: '15 nov 2026' });
    expect(middle.parentElement).toHaveAttribute('data-in-range', 'true');
    expect(middle.className).toContain('bg-accent-soft');
  });

  it('dibuja la banda continua y redondea solo los bordes exteriores y de semana', () => {
    renderRangeCalendar({ range: { start: '2026-11-07', end: '2026-11-10' } });

    const start = screen.getByRole('button', { name: '07 nov 2026' });
    expect(start).toHaveClass('rounded-l-lg');
    expect(start).not.toHaveClass('rounded-r-lg');

    const sunday = screen.getByRole('button', { name: '08 nov 2026' });
    expect(sunday).toHaveClass('rounded-r-lg');
    expect(sunday).not.toHaveClass('rounded-l-lg');

    const monday = screen.getByRole('button', { name: '09 nov 2026' });
    expect(monday).toHaveClass('rounded-l-lg');
    expect(monday).not.toHaveClass('rounded-r-lg');

    const end = screen.getByRole('button', { name: '10 nov 2026' });
    expect(end).toHaveClass('rounded-r-lg');
    expect(end).not.toHaveClass('rounded-l-lg');
  });

  it('mantiene rectos los cortes de semana en rangos de más de dos semanas', () => {
    renderRangeCalendar({ range: { start: '2026-11-04', end: '2026-11-24' } });

    const start = screen.getByRole('button', { name: '04 nov 2026' });
    expect(start).toHaveClass('rounded-l-lg');
    expect(start).not.toHaveClass('rounded-r-lg');

    for (const day of ['08 nov 2026', '15 nov 2026', '22 nov 2026']) {
      expect(screen.getByRole('button', { name: day })).not.toHaveClass('rounded-r-lg');
    }
    for (const day of ['09 nov 2026', '16 nov 2026', '23 nov 2026']) {
      expect(screen.getByRole('button', { name: day })).not.toHaveClass('rounded-l-lg');
    }

    const end = screen.getByRole('button', { name: '24 nov 2026' });
    expect(end).toHaveClass('rounded-r-lg');
    expect(end).not.toHaveClass('rounded-l-lg');
  });

  it('redondea ambos lados cuando solo hay un día de inicio', () => {
    renderRangeCalendar({ range: { start: '2026-11-10' } });
    const start = screen.getByRole('button', { name: '10 nov 2026' });
    expect(start).toHaveClass('rounded-l-lg');
    expect(start).toHaveClass('rounded-r-lg');
  });

  it('inicia un rango nuevo al pulsar con el rango completo', async () => {
    const user = userEvent.setup();
    const { onRangeChange } = renderRangeCalendar({
      range: { start: '2026-11-10', end: '2026-11-20' },
    });

    await user.click(screen.getByRole('button', { name: '15 nov 2026' }));
    expect(onRangeChange).toHaveBeenCalledWith({ start: '2026-11-15' });
  });

  it('Hoy fija ambos extremos en el rango', async () => {
    const user = userEvent.setup();
    const { onRangeChange } = renderRangeCalendar();

    await user.click(screen.getByRole('button', { name: 'Hoy' }));
    expect(onRangeChange).toHaveBeenCalledWith({
      start: todayBusinessKey(),
      end: todayBusinessKey(),
    });
  });
});

describe('month day picker', () => {
  it('elige un día del mes y navega con el teclado', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MonthDayPicker value={25} onSelect={onSelect} label="Día del ingreso" />);

    expect(screen.getByRole('grid', { name: 'Día del ingreso' })).toBeInTheDocument();
    const selected = screen.getByRole('button', { name: 'Día 25 de cada mes' }).parentElement;
    expect(selected).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('button', { name: 'Día 31 de cada mes' }));
    expect(onSelect).toHaveBeenCalledWith(31);

    screen.getByRole('button', { name: 'Día 31 de cada mes' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Día 30 de cada mes' })).toHaveFocus();
  });

  it('coloca el día 1 según el día de la semana del mes actual', () => {
    const today = parseBusinessDate(todayBusinessKey());
    const offset = (new Date(today.getFullYear(), today.getMonth(), 1).getDay() + 6) % 7;
    render(<MonthDayPicker value={null} onSelect={vi.fn()} label="Día del ingreso" />);

    const cells = screen.getAllByRole('gridcell', { hidden: true });
    const firstDayIndex = cells.findIndex((cell) => cell.textContent === '1');
    expect(firstDayIndex).toBe(offset);
    expect(
      cells.slice(0, firstDayIndex).every((cell) => cell.getAttribute('aria-hidden') === 'true'),
    ).toBe(true);
  });
});
