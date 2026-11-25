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

  it('el círculo hace de punto final apoyado en la línea base', () => {
    for (const format of ['initial', 'expanded'] as const) {
      const { unmount } = render(<Logo format={format} size="M" />);
      const logo = screen.getByRole('img', { name: 'akari' });
      const adornos = Array.from(logo.children).filter(
        (child) => child.getAttribute('aria-hidden') === 'true',
      );
      const circle = adornos.at(-1);

      expect(adornos).toHaveLength(2);
      expect(logo.lastElementChild).toBe(circle);
      expect(circle).toHaveClass('bg-accent-default');
      expect(circle).toHaveClass('translate-y-[1px]');
      expect(circle).not.toHaveClass('mt-[0.18em]');
      expect(circle).not.toHaveClass('-translate-y-1/2');
      expect(circle).not.toHaveClass('mb-[0.12em]');
      expect(logo).toHaveClass('items-baseline');
      expect(logo).not.toHaveClass('items-start');
      expect(logo).not.toHaveClass('items-end');
      unmount();
    }
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
