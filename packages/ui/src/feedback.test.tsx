import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Banner, Modal, ToastProvider, useToast } from './feedback.js';

function ModalHarness() {
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
        footer={<button type="button">Guardar</button>}
      >
        ¿Seguro?
      </Modal>
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
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('el modal cierra al pulsar el scrim', async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.mouseDown(overlay);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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
