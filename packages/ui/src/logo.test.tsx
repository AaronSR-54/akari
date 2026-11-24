import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo } from './logo.js';
import { Icon, icons } from './icons.js';

describe('brand and icons', () => {
  it('el logo expandido usa la i sin punto y el círculo como punto final', () => {
    const { container } = render(<Logo format="expanded" size="M" />);
    expect(screen.getByRole('img', { name: 'akari' })).toBeInTheDocument();
    expect(container.textContent).toContain('akarı');
    expect(container.textContent).not.toContain('akari');
    expect(container.querySelectorAll('span[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2);
  });

  it('el logo reducido muestra el monograma en el círculo', () => {
    const { container } = render(<Logo format="reduced" size="L" />);
    expect(container.textContent).toContain('a');
    expect(container.firstElementChild).toHaveClass('bg-accent-default');
  });

  it('cada icono acepta nombre accesible y es decorativo si no lo tiene', () => {
    for (const [name, Component] of Object.entries(icons)) {
      const { unmount } = render(<Component label={`Icono ${name}`} />);
      expect(screen.getByRole('img', { name: `Icono ${name}` })).toBeInTheDocument();
      unmount();
      const { container, unmount: unmountDecorative } = render(<Component />);
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      unmountDecorative();
    }
    render(<Icon name="home" label="Inicio" size={20} />);
    expect(screen.getByRole('img', { name: 'Inicio' })).toHaveAttribute('width', '20');
  });
});
