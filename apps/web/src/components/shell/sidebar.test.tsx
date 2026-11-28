'use client';

import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const ruta = vi.hoisted(() => ({ actual: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => ruta.actual }));

afterEach(() => {
  ruta.actual = '/';
});

import { DesktopHeader, HeaderNav, MobileNav, MobileTopBar, Sidebar, TabletHeader } from './sidebar';

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
    render(
      <MobileTopBar
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
});

describe('acciones de la cabecera móvil', () => {
  it('muestra buscador, avisos y avatar con el contador de pendientes', () => {
    const onToggleNotifications = vi.fn();
    render(
      <MobileTopBar
        onOpenSearch={vi.fn()}
        onToggleNotifications={onToggleNotifications}
        notificationCount={2}
        notificationsOpen={false}
      />,
    );

    const buscar = screen.getByRole('button', { name: 'Buscar' });
    expect(buscar).not.toBeNull();
    const pill = buscar.parentElement;
    expect(pill?.className).toContain('fixed');
    expect(pill?.className).toContain('right-5');
    expect(pill?.className).toContain('top-3');
    expect(pill?.className).toContain('gap-0');
    expect(buscar.className).toContain('!h-12');
    const avisos = screen.getByRole('button', { name: 'Avisos, 2 pendientes' });
    expect(avisos.className).toContain('!h-12');
    expect(avisos.getAttribute('aria-haspopup')).toBe('dialog');
    expect(avisos.querySelector('[data-notification-count="2"]')?.textContent).toBe('2');
    fireEvent.click(avisos);
    expect(onToggleNotifications).toHaveBeenCalledTimes(1);
    const perfil = screen.getByRole('link', { name: 'Ajustes' });
    expect(perfil.getAttribute('href')).toBe('/ajustes');
    expect(perfil.className).toContain('ml-2');
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
    render(
      <MobileTopBar
        onOpenSearch={vi.fn()}
        onToggleNotifications={vi.fn()}
        notificationCount={0}
        notificationsOpen={false}
      />,
    );

    expect(screen.getByRole('img', { name: 'akari' }).parentElement?.className).toContain('scale-[0.8]');
    expect(screen.getByRole('img', { name: 'Marta' }).className).toContain('h-10 w-10');
  });
});

describe('barra inferior flotante en móvil', () => {
  it('conserva los destinos, la acción central y el destino activo sin Ajustes', () => {
    render(<MobileNav />);
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    const enlaces = within(nav).getAllByRole('link');

    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual([
      '/',
      '/movimientos',
      '/movimientos/nuevo',
      '/grupos',
    ]);
    expect(within(nav).getByRole('link', { name: 'Añadir movimiento' })).not.toBeNull();
    const activo = within(nav).getByRole('link', { name: 'Resumen' });
    expect(activo).toHaveAttribute('aria-current', 'page');
    expect(activo.className).toContain('transition-[flex-grow,color]');
    expect(activo.className).toContain('items-center');
    const icono = activo.querySelector('span');
    expect(icono?.className).toContain('-translate-y-1.5');
    expect(icono?.className).toContain('transition-transform');
    const etiqueta = activo.querySelector('span:last-of-type');
    expect(etiqueta?.className).toContain('absolute');
    expect(etiqueta?.className).toContain('bottom-1.5');
    const indicador = nav.querySelector('[data-active-indicator]');
    expect(indicador?.className).toContain('bg-surface-sunken');
    expect(indicador?.className).toContain('rounded-full');
    expect(indicador?.getAttribute('style')).toContain('left: 0.5rem');
    expect(indicador?.getAttribute('style')).toContain('opacity: 1');
    expect(within(nav).queryByRole('link', { name: 'Ajustes' })).toBeNull();
    for (const pestana of enlaces.filter((enlace) => enlace.getAttribute('aria-label') !== 'Añadir movimiento')) {
      expect(pestana.className).toContain('h-14');
      expect(pestana.className).toContain('basis-0');
    }
  });

  it('muestra la etiqueta solo del activo sin perder el nombre accesible del resto', () => {
    render(<MobileNav />);
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });

    expect(within(nav).getByRole('link', { name: 'Movimientos' })).not.toBeNull();
    expect(within(nav).getByRole('link', { name: 'Grupos' })).not.toBeNull();
    for (const enlace of within(nav).getAllByRole('link')) {
      const etiqueta = enlace.querySelectorAll('span')[1];
      if (!etiqueta) continue; // la acción central solo tiene icono
      expect(etiqueta.textContent).toBeTruthy();
      expect(etiqueta.className).toContain(
        enlace.getAttribute('aria-current') === 'page' ? 'opacity-100' : 'opacity-0',
      );
    }
  });

  it('usa una superficie elevada y separada de los bordes', () => {
    render(<MobileNav />);
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });

    expect(nav.className).toContain('fixed');
    expect(nav.className).toContain('inset-x-5');
    expect(nav.className).toContain('bottom-3');
    const superficie = nav.querySelector('ul');
    expect(superficie?.className).toContain('rounded-full');
    expect(superficie?.className).toContain('elevation-3');
    expect(superficie?.className).toContain('backdrop-blur-sm');
  });
});
