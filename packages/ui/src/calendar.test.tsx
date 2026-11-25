import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from './calendar.js';
import { formatBusinessDate, todayBusinessKey } from './dates.js';

const NOVEMBER_25 = '2026-11-25';

function renderCalendar(props: Partial<Parameters<typeof Calendar>[0]> = {}) {
  const onSelect = vi.fn();
  const onCancel = vi.fn();
  render(<Calendar value={NOVEMBER_25} onSelect={onSelect} onCancel={onCancel} {...props} />);
  return { onSelect, onCancel };
}

describe('calendar', () => {
  it('dibuja 42 días desde el lunes y deshabilita los meses contiguos', () => {
    renderCalendar();
    expect(screen.getByRole('grid', { name: 'Noviembre 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
    expect(screen.getByRole('columnheader', { name: 'lunes' })).toBeInTheDocument();

    const previousMonth = screen.getByRole('button', { name: '26 oct 2026' });
    const nextMonth = screen.getByRole('button', { name: '06 dic 2026' });
    expect(previousMonth).toBeDisabled();
    expect(nextMonth).toBeDisabled();
  });

  it('marca la fecha elegida y el día de hoy', () => {
    renderCalendar();
    const selected = screen.getByRole('button', { name: '25 nov 2026' }).parentElement;
    expect(selected).toHaveAttribute('role', 'gridcell');
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: formatBusinessDate(todayBusinessKey()) })).toHaveAttribute(
      'aria-current',
      'date',
    );
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
});
