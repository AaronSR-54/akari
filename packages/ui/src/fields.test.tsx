import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  AmountField,
  Checkbox,
  DateField,
  SearchField,
  SelectField,
  SelectPill,
  Switch,
  TextField,
  TextareaField,
} from './fields.js';

const typeOptions = [
  { value: 'personal', label: 'Personal' },
  { value: 'deposit', label: 'Depósito' },
];

function SelectHarness({ initial = 'personal' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <SelectField label="Tipo" value={value} onValueChange={setValue} options={typeOptions} />;
}

describe('fields', () => {
  it('muestra etiqueta visible, obligatoriedad y error en texto', () => {
    render(<TextField label="Nombre" required error="El nombre es obligatorio" />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getAllByText(/obligatorio/).length).toBeGreaterThan(0);
    const input = screen.getByRole('textbox', { name: /Nombre/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('El nombre es obligatorio');
  });

  it('mantiene el espacio de ayuda al mostrar un error', () => {
    const { container } = render(<TextField label="Nombre" help="Tu nombre" error="Revisa" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa');
    expect(container.querySelector('.min-h-4')).toBeInTheDocument();
  });

  it('renderiza cantidad con símbolo y cifras tabulares', () => {
    render(<AmountField label="Importe" value="12,50" currency="EUR" onChange={() => undefined} />);
    const input = screen.getByRole('textbox', { name: /Importe/ });
    expect(input).toHaveValue('12,50');
    expect(input.className).toContain('font-tabular');
    expect(screen.getByText('€')).toBeInTheDocument();
  });

  it('select, fecha, búsqueda, textarea y checkbox son accesibles', () => {
    render(
      <>
        <SelectField label="Tipo" value="personal" onValueChange={() => undefined} options={typeOptions} />
        <DateField label="Fecha" />
        <SearchField aria-label="Buscar" placeholder="Buscar" />
        <TextareaField label="Nota" />
        <Checkbox label="Acepto" />
      </>,
    );
    expect(screen.getByRole('combobox', { name: /Tipo/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha')).toHaveAttribute('type', 'date');
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Nota/ }).tagName).toBe('TEXTAREA');
    expect(screen.getByRole('checkbox', { name: 'Acepto' })).toBeInTheDocument();
  });

  it('abre un panel propio, elige una opción y lo cierra sin select nativo', async () => {
    const user = userEvent.setup();
    const { container } = render(<SelectHarness />);
    const trigger = screen.getByRole('combobox', { name: 'Tipo' });

    expect(trigger).toHaveTextContent('Personal');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('select')).toBeNull();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox', { name: 'Tipo' })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Depósito' }));
    expect(trigger).toHaveTextContent('Depósito');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('cierra con Escape o pulsando fuera sin cambiar el valor', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SelectField label="Tipo" value="personal" onValueChange={onValueChange} options={typeOptions} />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Tipo' });

    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('muestra error, obligatoriedad y estado deshabilitado', async () => {
    const user = userEvent.setup();
    render(
      <SelectField
        label="Cuenta"
        value=""
        onValueChange={() => undefined}
        options={[{ value: '', label: 'Sin cuenta' }]}
        error="Elige una cuenta"
        required
        disabled
      />,
    );
    const trigger = screen.getByRole('combobox', { name: /Cuenta/ });

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-required', 'true');
    expect(trigger).toHaveAccessibleDescription('Elige una cuenta');

    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('gira el chevron al abrir y respeta el movimiento reducido', async () => {
    const user = userEvent.setup();
    render(<SelectHarness />);
    const trigger = screen.getByRole('combobox', { name: 'Tipo' });
    const chevron = trigger.querySelector('svg');

    expect(chevron?.getAttribute('class')).toContain('motion-reduce:transition-none');
    expect(chevron?.getAttribute('class')).not.toContain('rotate-180');

    await user.click(trigger);
    expect(chevron?.getAttribute('class')).toContain('rotate-180');
  });

  it('recorre las opciones con el teclado y elige con Enter', async () => {
    const user = userEvent.setup();
    render(<SelectHarness />);
    const trigger = screen.getByRole('combobox', { name: 'Tipo' });
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Personal' }).id,
    );

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Depósito' }).id,
    );

    await user.keyboard('{End}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Depósito' }).id,
    );

    await user.keyboard('{Home}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Personal' }).id,
    );

    await user.keyboard('{Enter}');
    expect(trigger).toHaveTextContent('Personal');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('cierra con Tab y busca opciones al escribir', async () => {
    const user = userEvent.setup();
    render(<SelectHarness />);
    const trigger = screen.getByRole('combobox', { name: 'Tipo' });
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('d');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Depósito' }).id,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    await user.tab();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('la píldora comparte el panel accesible', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SelectPill
        ariaLabel="Tema"
        value="light"
        onChange={onChange}
        options={[
          { value: 'light', label: 'Claro' },
          { value: 'dark', label: 'Oscuro' },
        ]}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Tema' });

    expect(trigger).toHaveTextContent('Claro');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Oscuro' }));
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('Switch cambia con click y teclado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} label="Incluir en total" />);
    const control = screen.getByRole('switch', { name: 'Incluir en total' });
    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
    control.focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
