import { render, screen, within } from '@testing-library/react';
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
import { Modal } from './feedback.js';

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const queryList = {
    matches,
    media: '(max-width: 767px)',
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(() => queryList),
  });
  return {
    listeners,
    restore() {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: undefined,
      });
    },
  };
}

function DateFieldHarness({ initial = '2026-11-25' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <DateField label="Fecha" value={value} onValueChange={setValue} required />;
}

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
        <DateField label="Fecha" value="2026-11-25" onValueChange={() => undefined} />
        <SearchField aria-label="Buscar" placeholder="Buscar" />
        <TextareaField label="Nota" />
        <Checkbox label="Acepto" />
      </>,
    );
    expect(screen.getByRole('combobox', { name: /Tipo/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha/)).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Nota/ }).tagName).toBe('TEXTAREA');
    expect(screen.getByRole('checkbox', { name: 'Acepto' })).toBeInTheDocument();
  });

  it('muestra el icono de cada opción y del valor seleccionado', async () => {
    const user = userEvent.setup();
    const options = [
      { value: 'a', label: 'Opción A', icon: <span data-testid="icono-a" /> },
      { value: 'b', label: 'Opción B', icon: <span data-testid="icono-b" /> },
    ];
    render(<SelectField label="Banco" value="a" onValueChange={() => undefined} options={options} />);
    const trigger = screen.getByRole('combobox', { name: 'Banco' });
    expect(trigger.querySelector('[data-testid="icono-a"]')).toBeInTheDocument();

    await user.click(trigger);
    const option = screen.getByRole('option', { name: 'Opción B' });
    expect(option.querySelector('[data-testid="icono-b"]')).toBeInTheDocument();
    expect(option).toHaveTextContent('Opción B');
  });

  it('muestra la fecha formateada y abre el panel propio en escritorio', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateFieldHarness />);
    const trigger = screen.getByRole('button', { name: /Fecha/ });

    expect(container.querySelector('input[type="date"]')).toBeNull();
    expect(trigger).toHaveTextContent('25 nov 2026');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('dialog', { name: /Fecha/ });
    expect(panel.className).not.toContain('rounded-t-xl');
    expect(panel.style.maxHeight).toBe('460px');
    expect(screen.getByRole('button', { name: '25 nov 2026' })).toHaveFocus();
  });

  it('elige un día, cierra el panel y comunica el valor una sola vez', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateField label="Fecha" value="2026-11-25" onValueChange={onValueChange} />);

    await user.click(screen.getByRole('button', { name: 'Fecha' }));
    await user.click(screen.getByRole('button', { name: '27 nov 2026' }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('2026-11-27');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cierra con Escape y con un clic fuera sin cambiar la fecha', async () => {
    const user = userEvent.setup();
    render(<DateFieldHarness />);
    const trigger = screen.getByRole('button', { name: /Fecha/ });

    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent('25 nov 2026');

    await user.click(trigger);
    await user.click(document.body);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('25 nov 2026');
  });

  it('en móvil abre una hoja inferior y no el panel flotante', async () => {
    const media = stubMatchMedia(true);
    const user = userEvent.setup();
    try {
      render(<DateFieldHarness />);
      const trigger = screen.getByRole('button', { name: /Fecha/ });

      await user.click(trigger);
      const sheet = screen.getByRole('dialog', { name: /Fecha/ });
      expect(sheet).toHaveAttribute('aria-modal', 'true');
      expect(sheet.className).toContain('rounded-t-xl');
      expect(screen.getByRole('button', { name: '25 nov 2026' })).toHaveFocus();

      await user.click(screen.getByRole('button', { name: '28 nov 2026' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).toHaveTextContent('28 nov 2026');
      expect(trigger).toHaveFocus();
    } finally {
      media.restore();
    }
  });

  it('dentro de un modal, Escape cierra solo la hoja de fecha', async () => {
    const media = stubMatchMedia(true);
    const user = userEvent.setup();
    const onClose = vi.fn();
    try {
      render(
        <Modal open onClose={onClose} title="Editar movimiento">
          <DateFieldHarness />
        </Modal>,
      );
      await user.click(screen.getByRole('button', { name: /Fecha/ }));
      expect(screen.getByRole('dialog', { name: /Fecha/ })).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog', { name: /Fecha/ })).not.toBeInTheDocument();
      const parent = screen.getByRole('dialog', { name: 'Editar movimiento' });
      expect(parent).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();

      await user.click(within(parent).getByRole('button', { name: /Fecha/ }));
      const reopened = screen.getByRole('dialog', { name: /Fecha/ });
      within(reopened).getByRole('button', { name: 'Cerrar' }).focus();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog', { name: /Fecha/ })).not.toBeInTheDocument();
      expect(screen.getByRole('dialog', { name: 'Editar movimiento' })).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      media.restore();
    }
  });

  it('mantiene error, obligatoriedad y deshabilitado', async () => {
    const user = userEvent.setup();
    render(
      <DateField
        label="Fecha"
        value="2026-11-25"
        onValueChange={() => undefined}
        error="Elige otra fecha"
        required
        disabled
      />,
    );
    const trigger = screen.getByRole('button', { name: /Fecha/ });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByText(/obligatorio/).length).toBeGreaterThan(0);
    expect(trigger).toHaveAccessibleDescription('Elige otra fecha');

    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
