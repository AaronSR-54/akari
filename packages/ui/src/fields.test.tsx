import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  AmountField,
  Checkbox,
  DateField,
  SearchField,
  SelectField,
  Switch,
  TextField,
  TextareaField,
} from './fields.js';

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
        <SelectField
          label="Tipo"
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'deposit', label: 'Depósito' },
          ]}
        />
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
