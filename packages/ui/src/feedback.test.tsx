import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Banner, BottomSheet, Modal, ToastProvider, useToast } from './feedback.js';

function ModalHarness({ wide = false }: { wide?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirmar"
        width={wide ? 'wide' : 'default'}
        footer={<button type="button">Guardar</button>}
      >
        ¿Seguro?
      </Modal>
    </>
  );
}

function StackedModalHarness() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setFirst(true)}>
        Abrir
      </button>
      <Modal open={first} onClose={() => setFirst(false)} title="Primero">
        <button type="button" onClick={() => setSecond(true)}>
          Abrir segundo
        </button>
      </Modal>
      <Modal open={second} onClose={() => setSecond(false)} title="Segundo">
        Contenido
      </Modal>
    </>
  );
}

function BottomSheetHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir hoja
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Fecha">
        Contenido de la hoja
      </BottomSheet>
    </>
  );
}

function ToastHarness() {
  const { toast } = useToast();
  return (
    <button
      type="button"
      onClick={() =>
        toast({ title: 'Movimiento guardado', tone: 'success', actionLabel: 'Deshacer' })
      }
    >
      Mostrar
    </button>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe('feedback', () => {
  it('el modal atrapa el foco, cierra con Escape y lo devuelve', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Confirmar' });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass('max-w-modal');
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('el modal ancho amplía el panel', async () => {
    const user = userEvent.setup();
    render(<ModalHarness wide />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirmar' });
    expect(dialog).toHaveClass('max-w-2xl');
    expect(dialog).not.toHaveClass('max-w-modal');
  });

  it('el modal cierra al pulsar el scrim', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.mouseDown(overlay);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('atenúa y difumina el fondo del modal', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const overlay = screen.getByRole('dialog').parentElement!;
    expect(overlay.className).toContain('bg-overlay-scrim/50');
    expect(overlay.className).toContain('backdrop-blur-sm');
  });

  it('bloquea el scroll de body y html y lo restaura al cerrar', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');

    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('mantiene el bloqueo de scroll mientras quede un overlay abierto', async () => {
    const user = userEvent.setup();
    render(<StackedModalHarness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const first = screen.getByRole('dialog', { name: 'Primero' });
    await user.click(within(first).getByRole('button', { name: 'Abrir segundo' }));

    const second = screen.getByRole('dialog', { name: 'Segundo' });
    expect(document.documentElement.style.overflow).toBe('hidden');

    await user.click(within(second).getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog', { name: 'Segundo' })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    await user.click(within(first).getByRole('button', { name: 'Cerrar' }));
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('con modales apilados Escape cierra solo el superior', async () => {
    const user = userEvent.setup();
    render(<StackedModalHarness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const first = screen.getByRole('dialog', { name: 'Primero' });
    await user.click(within(first).getByRole('button', { name: 'Abrir segundo' }));
    expect(screen.getByRole('dialog', { name: 'Segundo' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Segundo' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Primero' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('la hoja inferior se ancla abajo, cierra con el scrim y devuelve el foco', async () => {
    const user = userEvent.setup();
    render(<BottomSheetHarness />);
    const trigger = screen.getByRole('button', { name: 'Abrir hoja' });

    await user.click(trigger);
    const sheet = screen.getByRole('dialog', { name: 'Fecha' });
    expect(sheet.className).toContain('rounded-t-3xl');
    expect(sheet.className).toContain('max-w-sheet');
    expect(sheet.parentElement?.className).toContain('items-end');

    fireEvent.mouseDown(sheet.parentElement!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Fecha' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('el toast confirma, ofrece deshacer y desaparece a los 5 s', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Movimiento guardado');
    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('banner informa con título y acción', () => {
    render(
      <Banner tone="warning" title="Sin conexión" action={<button type="button">Reintentar</button>}>
        Los cambios se guardarán al reconectar.
      </Banner>,
    );
    expect(screen.getByText('Sin conexión')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
