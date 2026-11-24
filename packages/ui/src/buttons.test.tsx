import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, Fab, IconButton, Link } from './buttons.js';
import { IconHome } from './icons.js';

describe('buttons', () => {
  it('renderiza variantes y responde al teclado', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <Button onClick={onClick}>Guardar</Button>
        <Button variant="secondary">Cancelar</Button>
        <Button variant="tertiary">Saltar</Button>
      </>,
    );
    const primary = screen.getByRole('button', { name: 'Guardar' });
    expect(primary.className).toContain('bg-accent-default');
    expect(primary.className).toContain('h-11');
    await user.tab();
    expect(primary).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('mantiene el ancho y bloquea el envío en loading', () => {
    render(<Button loading>Guardar</Button>);
    const button = screen.getByRole('button', { name: /Cargando: Guardar/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.className).toContain('min-w-11');
  });

  it('IconButton y Fab exponen nombre accesible', () => {
    render(
      <>
        <IconButton aria-label="Añadir cuenta" icon={<IconHome />} />
        <Fab aria-label="Nuevo movimiento">+</Fab>
        <Link href="/movimientos">Ver movimientos</Link>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Añadir cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo movimiento' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver movimientos' })).toHaveAttribute('href', '/movimientos');
  });
});
