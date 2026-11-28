import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@akari/ui';

type Variant = 'primary' | 'secondary' | 'tertiary';

const baseClass =
  'inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-5 text-ui-14-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas';

const variantClass: Record<Variant, string> = {
  primary: 'bg-accent-default text-accent-ink hover:brightness-95',
  secondary: 'border border-border-strong bg-surface-default text-text-primary hover:bg-surface-sunken',
  tertiary: 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary',
};

export function ActionLink({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(baseClass, variantClass[variant], className)}>
      {children}
    </Link>
  );
}

export function ActionButton({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button type={type} className={cn(baseClass, variantClass[variant], className)} {...props}>
      {children}
    </button>
  );
}
