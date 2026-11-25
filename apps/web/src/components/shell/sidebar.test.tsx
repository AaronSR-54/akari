'use client';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

import { DesktopHeader, HeaderNav, MobileTopBar, Sidebar, TabletHeader } from './sidebar';

describe('DesktopHeader', () => {
  it('muestra título y subtítulo con buscador y avisos', () => {
    const onOpenNotifications = vi.fn();
    render(
      <DesktopHeader
        title="Buenos días, Marta"
        meta="domingo, 29 de noviembre · 3 cuentas en este dispositivo"
        onOpenSearch={vi.fn()}
        onToggleNotifications={onOpenNotifications}
        notificationCount={2}
        notificationsOpen={false}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Buenos días, Marta', level: 1 })).not.toBeNull();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('domingo, 29 de noviembre · 3 cuentas en este dispositivo')).not.toBeNull();
    expect(screen.getByRole('button', { name: /buscar/i })).not.toBeNull();
    const bell = screen.getByRole('button', { name: 'Avisos, 2 pendientes' });
    expect(bell.querySelector('[data-notification-count="2"]')?.textContent).toBe('2');
    fireEvent.click(bell);
    expect(onOpenNotifications).toHaveBeenCalledTimes(1);
  });

  it('omite el subtítulo cuando está vacío y no marca avisos sin pendientes', () => {
    render(
      <DesktopHeader
        title="Grupos"
        meta=""
        onOpenSearch={vi.fn()}
        onToggleNotifications={vi.fn()}
        notificationCount={0}
        notificationsOpen={false}
      />,
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByText(/domingo/i)).toBeNull();
    const bell = screen.getByRole('button', { name: 'Avisos' });
    expect(bell.querySelector('[data-notification-count]')).toBeNull();
  });
});

describe('destinos de la navegación principal', () => {
  it('no incluye Ajustes entre los destinos', () => {
    render(
      <HeaderNav
        onOpenSearch={vi.fn()}
        onToggleNotifications={vi.fn()}
        notificationCount={0}
        notificationsOpen={false}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(Array.from(nav.querySelectorAll('a'), (link) => link.textContent)).toEqual([
      'Resumen',
      'Movimientos',
      'Grupos',
    ]);
  });
});

describe('acceso a ajustes desde la identidad', () => {
  it('la sidebar expone el avatar como enlace a ajustes', () => {
    render(<Sidebar pinned={false} onPinnedChange={vi.fn()} />);
    expect(screen.getByRole('img', { name: 'Marta' })).not.toBeNull();
    const enlace = screen.getByRole('link', { name: 'Ajustes' });
    expect(enlace.getAttribute('href')).toBe('/ajustes');
    expect(enlace.getAttribute('title')).toBe('Ajustes');
  });

  it('el header expone el avatar como enlace a ajustes', () => {
    render(
      <HeaderNav
        onOpenSearch={vi.fn()}
        onToggleNotifications={vi.fn()}
        notificationCount={0}
        notificationsOpen={false}
      />,
    );
    expect(screen.getByRole('img', { name: 'Marta' })).not.toBeNull();
    const enlace = screen.getByRole('link', { name: 'Ajustes' });
    expect(enlace.getAttribute('href')).toBe('/ajustes');
    expect(enlace.getAttribute('title')).toBe('Ajustes');
  });

  it('la cabecera de tablet expone el avatar como enlace a ajustes', () => {
    render(<TabletHeader />);
    expect(screen.getByRole('img', { name: 'Marta' })).not.toBeNull();
    const enlace = screen.getByRole('link', { name: 'Ajustes' });
    expect(enlace.getAttribute('href')).toBe('/ajustes');
    expect(enlace.getAttribute('title')).toBe('Ajustes');
  });

  it('la barra móvil expone el avatar como enlace a ajustes', () => {
    render(<MobileTopBar onOpenSearch={vi.fn()} />);
    expect(screen.getByRole('img', { name: 'Marta' })).not.toBeNull();
    const enlace = screen.getByRole('link', { name: 'Ajustes' });
    expect(enlace.getAttribute('href')).toBe('/ajustes');
    expect(enlace.getAttribute('title')).toBe('Ajustes');
  });
});

describe('nombre del perfil en el shell', () => {
  it('muestra el nombre recibido y deriva sus iniciales', () => {
    render(<Sidebar pinned={false} onPinnedChange={vi.fn()} displayName="Ana Ruiz" />);
    const avatar = screen.getByRole('img', { name: 'Ana Ruiz' });
    expect(avatar.textContent).toBe('AR');
    expect(screen.getByText('Ana Ruiz')).not.toBeNull();
  });
});

describe('tamaños unificados de la navegación', () => {
  it('la sidebar usa logotipo M, ítems h-11 y avatar md', () => {
    render(<Sidebar pinned={false} onPinnedChange={vi.fn()} />);
    const aside = screen.getByRole('navigation', { name: 'Navegación principal' });
    fireEvent.mouseEnter(aside);

    expect(aside.className).toContain('fixed');
    expect(screen.getByRole('img', { name: 'akari' }).parentElement?.className).toContain('scale-[0.8]');
    expect(aside.querySelector('ul li a')?.className).toContain('h-11');
    expect(screen.getByRole('img', { name: 'Marta' }).className).toContain('h-10 w-10');
  });

  it('HeaderNav usa logotipo M, ítems h-11 y avatar md', () => {
    const onOpenNotifications = vi.fn();
    render(
      <HeaderNav
        onOpenSearch={vi.fn()}
        onToggleNotifications={onOpenNotifications}
        notificationCount={1}
        notificationsOpen={false}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });

    expect(screen.getByRole('img', { name: 'akari' }).parentElement?.className).toContain('scale-[0.8]');
    expect(nav.querySelector('a')?.className).toContain('h-11');
    expect(screen.getByRole('img', { name: 'Marta' }).className).toContain('h-10 w-10');
    fireEvent.click(screen.getByRole('button', { name: 'Avisos, 1 pendiente' }));
    expect(onOpenNotifications).toHaveBeenCalledTimes(1);
  });

  it('TabletHeader usa logotipo M, ítems h-11 y avatar md', () => {
    render(<TabletHeader />);
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });

    expect(screen.getByRole('img', { name: 'akari' }).parentElement?.className).toContain('scale-[0.8]');
    expect(nav.querySelector('a')?.className).toContain('h-11');
    expect(screen.getByRole('img', { name: 'Marta' }).className).toContain('h-10 w-10');
  });

  it('MobileTopBar usa logotipo M y avatar md', () => {
    render(<MobileTopBar onOpenSearch={vi.fn()} />);

    expect(screen.getByRole('img', { name: 'akari' }).parentElement?.className).toContain('scale-[0.8]');
    expect(screen.getByRole('img', { name: 'Marta' }).className).toContain('h-10 w-10');
  });
});
