'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn.js';

type Variant = 'primary' | 'secondary' | 'tertiary';
type Size = 'sm' | 'md';

const variantClass: Record<Variant, string> = {
  primary:
    'bg-accent-default text-accent-ink hover:brightness-95 active:brightness-90 disabled:bg-surface-sunken disabled:text-text-disabled',
  secondary:
    'border border-border-subtle bg-surface-default text-text-primary hover:bg-surface-sunken disabled:border-border-subtle disabled:text-text-disabled',
  tertiary:
    'text-text-secondary hover:bg-surface-sunken hover:text-text-primary disabled:text-text-disabled',
};

const sizeClass: Record<Size, string> = {
  md: 'h-11 min-w-11 px-6',
  sm: 'h-10 min-w-10 px-4',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, icon, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full text-ui-14-strong transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas',
        'disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={loading && typeof children === 'string' ? `Cargando: ${children}` : props['aria-label']}
      {...props}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="sr-only">Cargando</span>
          <span aria-hidden="true" className="invisible">
            {children}
          </span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
});

type IconButtonSize = 'sm' | 'md' | 'lg';

const iconButtonSize: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-10 w-10',
};

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  'aria-label': string;
  icon: ReactNode;
  size?: IconButtonSize;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, icon, size = 'md', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-full text-text-secondary transition-colors duration-fast',
        iconButtonSize[size],
        'hover:bg-surface-sunken hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas',
        'disabled:cursor-not-allowed disabled:text-text-disabled',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
});

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

export function Link({ className, children, ...props }: LinkProps) {
  return (
    <a
      className={cn(
        'text-ui-14-strong text-accent-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function Fab({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={props.type ?? 'button'}
      className={cn(
        'inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-default text-accent-ink elevation-2',
        'transition-transform duration-fast hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
