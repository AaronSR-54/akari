import type { IconName } from '@akari/ui';

export type NavItem = { href: string; label: string; icon: IconName };

export const navItems: NavItem[] = [
  { href: '/', label: 'Resumen', icon: 'home' },
  { href: '/movimientos', label: 'Movimientos', icon: 'arrows' },
  { href: '/grupos', label: 'Grupos', icon: 'users' },
  { href: '/ajustes', label: 'Ajustes', icon: 'sliders' },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const routeTitles: Record<string, string> = {
  '/': 'Resumen',
  '/movimientos': 'Movimientos',
  '/grupos': 'Grupos',
  '/ajustes': 'Ajustes',
  '/preguntas': 'Preguntas rápidas',
};
