'use client';

import { cn } from './cn.js';

export type LogoFormat = 'expanded' | 'initial' | 'reduced';
export type LogoSize = 'XL' | 'M' | 'L' | 'S';

const expandedSizes: Record<Exclude<LogoSize, 'L'>, { text: string; circle: string; gap: string }> = {
  XL: { text: 'text-[92px] leading-none', circle: 'h-[18px] w-[18px]', gap: 'gap-[6px]' },
  M: { text: 'text-[40px] leading-none', circle: 'h-2.5 w-2.5', gap: 'gap-[3px]' },
  S: { text: 'text-[20px] leading-none', circle: 'h-[5px] w-[5px]', gap: 'gap-[2px]' },
};

const reducedSizes: Record<'L' | 'S', { box: string; text: string }> = {
  L: { box: 'h-24 w-24', text: 'text-[52px] leading-none' },
  S: { box: 'h-8 w-8', text: 'text-[18px] leading-none' },
};

export type LogoProps = {
  format?: LogoFormat;
  size?: LogoSize;
  className?: string;
  /** Color del texto; por defecto usa el token de texto principal. */
  tone?: 'default' | 'inverse';
};

export function Logo({ format = 'expanded', size = 'M', className, tone = 'default' }: LogoProps) {
  const color = tone === 'inverse' ? 'text-text-inverse' : 'text-text-primary';

  if (format === 'initial') {
    return (
      <span
        className={cn('inline-flex items-baseline gap-0.5', color, className)}
        role="img"
        aria-label="akari"
      >
        <span aria-hidden="true" className="text-[40px] font-bold leading-none tracking-[-0.02em]">
          ı
        </span>
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 translate-y-[1px] rounded-full bg-accent-default"
        />
      </span>
    );
  }

  if (format === 'reduced') {
    const safeSize = size === 'M' ? 'S' : (size as 'L' | 'S');
    const spec = reducedSizes[safeSize];
    return (
      <span
        className={cn('inline-flex items-center justify-center rounded-full bg-accent-default', spec.box, className)}
        aria-label="akari"
        role="img"
      >
        <span className={cn('font-bold', spec.text, 'text-accent-ink')}>a</span>
      </span>
    );
  }

  const safeSize = size === 'L' ? 'M' : (size as 'XL' | 'M' | 'S');
  const spec = expandedSizes[safeSize];
  return (
    <span
      className={cn('inline-flex items-baseline font-bold tracking-[-0.03em]', spec.text, spec.gap, color, className)}
      role="img"
      aria-label="akari"
    >
      <span aria-hidden="true">akarı</span>
      <span
        aria-hidden="true"
        className={cn('inline-block translate-y-[1px] rounded-full bg-accent-default', spec.circle)}
      />
    </span>
  );
}
