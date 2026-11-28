'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar, Icon, IconBell, IconButton, IconSearch, Logo, cn, type IconSize } from '@akari/ui';
import { defaultProfile, initialsFromName } from '../../lib/profile';
import { isActivePath, navItems, type NavItem } from '../nav';

export function NotificationsMenu({
  open,
  onToggle,
  count,
  iconSize = 18,
  size = 'lg',
  className,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  count: number;
  iconSize?: IconSize;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative">
      <IconButton
        aria-label={
          count === 0 ? 'Avisos' : count === 1 ? 'Avisos, 1 pendiente' : `Avisos, ${count} pendientes`
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        size={size}
        onClick={onToggle}
        icon={
          <span className="relative inline-flex">
            <IconBell size={iconSize} />
            {count > 0 ? (
              <span
                aria-hidden="true"
                data-notification-count={count}
                className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger-text px-1 text-ui-9 text-text-inverse"
              >
                {count > 9 ? '9+' : count}
              </span>
            ) : null}
          </span>
        }
        className={className}
      />
      {children}
    </div>
  );
}

function NavLogo({ format }: { format: 'expanded' | 'initial' }) {
  return (
    <span className="inline-block origin-bottom-left scale-[0.8]">
      <Logo format={format} size="M" />
    </span>
  );
}

function NavList({
  expanded = true,
  onNavigate,
}: {
  expanded?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <ul className="flex flex-col gap-3">
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
              className={cn(
                'flex items-center rounded-full text-ui-12-strong transition-colors duration-fast',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
                'h-11 w-full',
                expanded ? 'gap-3 px-3' : 'justify-center',
                active
                  ? 'bg-text-primary text-text-inverse'
                  : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary',
              )}
            >
              <Icon name={item.icon} size={20} />
              <span className={cn('truncate', !expanded && 'sr-only')}>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({
  pinned,
  onPinnedChange,
  displayName = defaultProfile.displayName,
}: {
  pinned: boolean;
  onPinnedChange: (value: boolean) => void;
  displayName?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const expanded = hovered || pinned || focusWithin;
  const floating = expanded && !pinned;

  useEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;
    const onFocusIn = () => setFocusWithin(true);
    const onFocusOut = (event: FocusEvent) => {
      if (!aside.contains(event.relatedTarget as Node)) setFocusWithin(false);
    };
    aside.addEventListener('focusin', onFocusIn);
    aside.addEventListener('focusout', onFocusOut);
    return () => {
      aside.removeEventListener('focusin', onFocusIn);
      aside.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return (
    <>
      {floating ? (
        <div
          data-sidebar-scrim
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-30 bg-overlay-scrim/20"
        />
      ) : null}
      <aside
        ref={asideRef}
        role="navigation"
        aria-label="Navegación principal"
        data-expanded={expanded}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-default px-3 py-5 transition-[width] duration-base lg:flex',
          floating ? 'elevation-3' : 'elevation-1',
          expanded ? 'w-60' : 'w-[76px]',
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className={cn('flex h-10 items-center gap-2', expanded ? 'justify-between px-1' : 'justify-center')}>
            {expanded ? (
              <Link
                href="/"
                aria-label="akari, ir al resumen"
                className="rounded-lg focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <NavLogo format="expanded" />
              </Link>
            ) : (
              <Link
                href="/"
                aria-label="akari, ir al resumen"
                className="rounded-lg focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <NavLogo format="initial" />
              </Link>
            )}
            {expanded ? (
              <button
                type="button"
                aria-label={pinned ? 'Colapsar navegación' : 'Expandir navegación'}
                aria-expanded={expanded}
                onClick={() => onPinnedChange(!pinned)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-sunken text-ui-13-strong text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                «
              </button>
            ) : null}
          </div>
          <NavList expanded={expanded} onNavigate={() => setHovered(false)} />
        </div>
        <Link
          href="/ajustes"
          aria-label="Ajustes"
          title="Ajustes"
          className={cn(
            'mt-4 flex items-center gap-3 rounded-lg p-1 transition-colors duration-fast hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
            !expanded && 'justify-center',
          )}
        >
          <Avatar size="md" initials={initialsFromName(displayName)} label={displayName} />
          <span className={cn('min-w-0', !expanded && 'sr-only')}>
            <span className="block truncate text-ui-12-strong text-text-primary">{displayName}</span>
            <span className="block truncate text-ui-10 text-text-secondary">{defaultProfile.subtitle}</span>
          </span>
        </Link>
      </aside>
    </>
  );
}

export function DesktopHeader({
  title,
  meta,
  onOpenSearch,
  onToggleNotifications,
  notificationCount,
  notificationsOpen,
  notificationsPanel,
}: {
  title: string;
  meta: string;
  onOpenSearch: () => void;
  onToggleNotifications: () => void;
  notificationCount: number;
  notificationsOpen: boolean;
  notificationsPanel?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 hidden h-[72px] shrink-0 items-center justify-between gap-6 bg-surface-canvas px-8 lg:-mt-4 lg:flex">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <h1 className="truncate text-ui-28-bold text-text-primary">{title}</h1>
        {meta ? <p className="truncate text-ui-11 text-text-secondary">{meta}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-10 w-60 items-center gap-2 rounded-full border border-border-subtle bg-surface-default px-3.5 text-left text-ui-11 text-text-tertiary transition-colors duration-fast hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <IconSearch size={16} />
          <span className="flex-1">Buscar</span>
          <kbd className="rounded border border-border-subtle px-1 text-ui-9">⌘K</kbd>
        </button>
        <NotificationsMenu
          open={notificationsOpen}
          onToggle={onToggleNotifications}
          count={notificationCount}
          className="bg-surface-default text-text-primary"
        >
          {notificationsPanel}
        </NotificationsMenu>
      </div>
    </header>
  );
}

export function HeaderNav({
  onOpenSearch,
  displayName = defaultProfile.displayName,
  onToggleNotifications,
  notificationCount,
  notificationsOpen,
  notificationsPanel,
}: {
  onOpenSearch: () => void;
  displayName?: string;
  onToggleNotifications: () => void;
  notificationCount: number;
  notificationsOpen: boolean;
  notificationsPanel?: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 hidden w-full bg-surface-canvas lg:-mt-4 lg:block">
      <div className="mx-auto flex h-[72px] w-full max-w-content items-center justify-between gap-4 px-4">
        <Link
          href="/"
          aria-label="akari, ir al resumen"
          className="rounded-lg focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <NavLogo format="expanded" />
        </Link>
        <nav aria-label="Navegación principal" className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-11 items-center rounded-full px-4 text-ui-13-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                  active
                    ? 'bg-accent-default text-accent-ink'
                    : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <IconButton aria-label="Buscar" icon={<IconSearch size={20} />} onClick={onOpenSearch} />
          <NotificationsMenu
            open={notificationsOpen}
            onToggle={onToggleNotifications}
            count={notificationCount}
            iconSize={20}
          >
            {notificationsPanel}
          </NotificationsMenu>
          <Link
            href="/ajustes"
            aria-label="Ajustes"
            title="Ajustes"
            className="inline-flex rounded-full p-1 transition-colors duration-fast hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          >
            <Avatar size="md" initials={initialsFromName(displayName)} label={displayName} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function TabletHeader({ displayName = defaultProfile.displayName }: { displayName?: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border-subtle bg-surface-default md:block lg:hidden">
      <div className="flex h-16 items-center justify-between gap-6 px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            aria-label="akari, ir al resumen"
            className="rounded-lg focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <NavLogo format="expanded" />
          </Link>
          <nav aria-label="Navegación principal" className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-11 items-center rounded-full px-3.5 text-ui-11-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                    active ? 'bg-text-primary text-text-inverse' : 'text-text-tertiary hover:text-text-primary',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          href="/ajustes"
          aria-label="Ajustes"
          title="Ajustes"
          className="inline-flex rounded-full p-1 transition-colors duration-fast hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
        >
          <Avatar size="md" initials={initialsFromName(displayName)} tone="strong" label={displayName} />
        </Link>
      </div>
    </header>
  );
}

export function MobileTopBar({
  onOpenSearch,
  displayName = defaultProfile.displayName,
  onToggleNotifications,
  notificationCount,
  notificationsOpen,
  notificationsPanel,
  scrolled = false,
}: {
  onOpenSearch: () => void;
  displayName?: string;
  onToggleNotifications: () => void;
  notificationCount: number;
  notificationsOpen: boolean;
  notificationsPanel?: ReactNode;
  scrolled?: boolean;
}) {
  return (
    <>
      <header
        className={cn(
          'sticky top-0 -mb-14 flex h-14 items-center px-5 md:hidden',
          notificationsOpen ? 'z-50' : 'z-30',
        )}
      >
        <Link
          href="/"
          aria-label="akari, ir al resumen"
          aria-hidden={scrolled}
          tabIndex={scrolled ? -1 : undefined}
          className={cn(
            'rounded-lg transition-opacity duration-fast focus-visible:ring-2 focus-visible:ring-focus-ring',
            scrolled ? 'pointer-events-none opacity-0' : 'opacity-100',
          )}
        >
          <NavLogo format="expanded" />
        </Link>
      </header>
      <div
        className={cn(
          'fixed right-5 top-3 z-30 flex items-center gap-0 rounded-full px-1 py-0.5 transition-colors duration-fast md:hidden',
          scrolled && 'bg-surface-raised/90 elevation-2 backdrop-blur-sm',
          notificationsOpen && 'z-50',
        )}
      >
        <IconButton
          aria-label="Buscar"
          icon={<IconSearch size={24} />}
          onClick={onOpenSearch}
          className="!h-12 !w-12"
        />
        <NotificationsMenu
          open={notificationsOpen}
          onToggle={onToggleNotifications}
          count={notificationCount}
          iconSize={24}
          size="md"
          className="!h-12 !w-12"
        >
          {notificationsPanel}
        </NotificationsMenu>
        <Link
          href="/ajustes"
          aria-label="Ajustes"
          title="Ajustes"
          className="ml-2 inline-flex rounded-full p-1 transition-colors duration-fast hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
        >
          <Avatar size="md" initials={initialsFromName(displayName)} tone="strong" label={displayName} />
        </Link>
      </div>
    </>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const addActive = isActivePath(pathname, '/movimientos/nuevo');
  const activeIndex = navItems.findIndex((item) => isActivePath(pathname, item.href));
  const oculto = addActive || activeIndex < 0;

  // Tres columnas: los dos destinos de la izquierda, el botón central y los dos de la
  // derecha. Cada columna reparte 1:2, así que el activo se expande y el inactivo se
  // encoge sin tocar el botón central. La geometría es CSS puro: 88 px = padding (16)
  // + botón central (56) + sus márgenes (16), y el ancho útil se divide entre columnas.
  const columna = '(100% - 5.5rem)';
  const izquierda =
    activeIndex === 0
      ? '0.5rem'
      : activeIndex === 1
        ? `calc(0.5rem + ${columna} / 6)`
        : activeIndex === 2
          ? `calc(0.5rem + ${columna} / 2 + 4.5rem)`
          : `calc(0.5rem + ${columna} / 2 + 4.5rem + ${columna} / 6)`;

  const renderTab = (item: NavItem) => {
    const active = isActivePath(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative z-10 flex h-14 basis-0 min-w-0 items-center justify-center rounded-full text-ui-9-strong transition-[flex-grow,color] duration-base ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
          active ? 'grow-[2] text-text-primary' : 'grow text-text-tertiary',
        )}
      >
        <span
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-base ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none',
            active ? '-translate-y-1.5' : 'translate-y-0',
          )}
        >
          <Icon name={item.icon} size={20} />
        </span>
        <span
          className={cn(
            'absolute inset-x-0 bottom-1.5 truncate text-center transition-opacity duration-base motion-reduce:transition-none',
            active ? 'opacity-100' : 'opacity-0',
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  };
  return (
    <nav
      aria-label="Navegación principal"
      data-floating-nav="true"
      className="safe-bottom fixed inset-x-5 bottom-3 z-40 md:hidden"
    >
      <ul className="relative mx-auto flex items-center rounded-full border border-border-subtle bg-surface-raised/90 px-2 py-1.5 elevation-3 backdrop-blur-sm">
        <span
          data-active-indicator
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 top-1.5 rounded-full bg-surface-sunken transition-[left,width,opacity] duration-base ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none"
          style={{
            left: activeIndex < 0 ? '0.5rem' : izquierda,
            width: `calc(${columna} / 3)`,
            opacity: oculto ? 0 : 1,
          }}
        />
        <li className="flex min-w-0 flex-1 items-center">
          {navItems.slice(0, 2).map(renderTab)}
        </li>
        <li className="mx-2 flex w-14 shrink-0 justify-center">
          <Link
            href="/movimientos/nuevo"
            aria-label="Añadir movimiento"
            aria-current={addActive ? 'page' : undefined}
            className="bg-accent-default text-accent-ink relative z-10 flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          >
            <Icon name="add" size={24} />
          </Link>
        </li>
        <li className="flex min-w-0 flex-1 items-center">
          {navItems.slice(2).map(renderTab)}
        </li>
      </ul>
    </nav>
  );
}
