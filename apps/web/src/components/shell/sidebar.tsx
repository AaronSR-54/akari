'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar, Icon, IconBell, IconButton, IconSearch, Logo, cn } from '@akari/ui';
import { isActivePath, navItems } from '../nav';

const initials = 'MR';
const displayName = 'Marta';

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
                expanded ? 'h-10 w-full gap-3 px-3' : active ? 'h-10 w-full justify-center' : 'h-9 w-full justify-center',
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

export function Sidebar() {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const expanded = hovered || pinned || focusWithin;

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
    <aside
      ref={asideRef}
      role="navigation"
      aria-label="Navegación principal"
      data-expanded={expanded}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-default px-3 py-5 elevation-1 transition-[width] duration-base lg:flex',
        expanded ? 'w-60' : 'w-[76px]',
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className={cn('flex h-8 items-center gap-2', expanded ? 'justify-between px-1' : 'justify-center')}>
          {expanded ? (
            <Link
              href="/"
              aria-label="akari, ir al resumen"
              className="rounded-lg focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <Logo format="expanded" size="M" />
            </Link>
          ) : (
            <Link
              href="/"
              aria-label="akari, ir al resumen"
              className="rounded-lg focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <Logo format="initial" />
            </Link>
          )}
          {expanded ? (
            <button
              type="button"
              aria-label={pinned ? 'Colapsar navegación' : 'Expandir navegación'}
              aria-expanded={expanded}
              onClick={() => setPinned((value) => !value)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-sunken text-ui-13-strong text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              «
            </button>
          ) : null}
        </div>
        <NavList expanded={expanded} onNavigate={() => setHovered(false)} />
      </div>
      <div className={cn('mt-4 flex items-center gap-3', !expanded && 'justify-center')}>
        <Avatar initials={initials} label={displayName} />
        <span className={cn('min-w-0', !expanded && 'sr-only')}>
          <span className="block truncate text-ui-12-strong text-text-primary">{displayName}</span>
          <span className="block truncate text-ui-10 text-text-secondary">Cuenta local</span>
        </span>
      </div>
    </aside>
  );
}

export function DesktopHeader({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <header className="sticky top-0 z-20 hidden h-[72px] shrink-0 items-center justify-end gap-6 bg-surface-canvas px-8 lg:-mt-4 lg:flex">
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
        <IconButton
          aria-label="Avisos"
          size="lg"
          icon={<IconBell size={18} />}
          className="bg-surface-default text-text-primary"
        />
      </div>
    </header>
  );
}

export function HeaderNav({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 hidden w-full bg-surface-canvas lg:-mt-4 lg:block">
      <div className="mx-auto flex h-[72px] w-full max-w-content items-center justify-between gap-4 px-4">
        <Link
          href="/"
          aria-label="akari, ir al resumen"
          className="rounded-lg focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <Logo format="expanded" size="S" />
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
          <IconButton aria-label="Avisos" icon={<IconBell size={20} />} />
          <Avatar initials={initials} label={displayName} />
        </div>
      </div>
    </header>
  );
}

export function TabletHeader() {
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
            <Logo format="expanded" size="S" />
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
                    'flex h-9 items-center rounded-full px-3.5 text-ui-11-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                    active ? 'bg-text-primary text-text-inverse' : 'text-text-tertiary hover:text-text-primary',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Avatar initials={initials} size="sm" tone="strong" label={displayName} />
      </div>
    </header>
  );
}

export function MobileTopBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface-default px-5 md:hidden">
      <Link
        href="/"
        aria-label="akari, ir al resumen"
        className="rounded-lg focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <Logo format="expanded" size="S" />
      </Link>
      <div className="flex items-center gap-2">
        <IconButton aria-label="Buscar" icon={<IconSearch size={20} />} onClick={onOpenSearch} />
        <Avatar initials={initials} size="xs" tone="strong" label={displayName} />
      </div>
    </header>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación principal"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-surface-default md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-ui-9-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                  active ? 'text-text-primary' : 'text-text-tertiary',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-12 items-center justify-center rounded-full',
                    active && 'bg-text-primary text-text-inverse',
                  )}
                >
                  <Icon name={item.icon} size={20} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
