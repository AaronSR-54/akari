'use client';

import { cn } from './cn.js';

export type SegmentedOption<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  variant = 'chip',
  className,
  scrollable = false,
  fill = false,
}: {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'chip' | 'plain';
  className?: string;
  scrollable?: boolean;
  fill?: boolean;
}) {
  const sizeClass = {
    sm: 'h-8 px-3 text-ui-10-strong',
    md: 'h-[34px] px-3.5 text-ui-11-strong',
    lg: 'h-[38px] px-4 text-ui-11-strong',
  }[size];

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'flex items-center gap-2.5',
        scrollable ? 'no-scrollbar overflow-x-auto' : 'flex-wrap',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center rounded-full transition-colors duration-fast',
              fill ? 'flex-1' : 'shrink-0',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas',
              sizeClass,
              active
                ? 'bg-text-primary text-text-inverse'
                : variant === 'chip'
                  ? 'border border-border-subtle bg-surface-default text-text-primary hover:bg-surface-sunken'
                  : 'bg-surface-canvas text-text-primary hover:bg-surface-sunken',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
