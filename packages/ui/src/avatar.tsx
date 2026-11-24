'use client';

import { cn } from './cn.js';

export type AvatarSize = 'xs' | 'sm' | 'md';
export type AvatarTone = 'soft' | 'strong' | 'sunken';

const sizeClass: Record<AvatarSize, string> = {
  xs: 'h-[30px] w-[30px] text-ui-9-strong',
  sm: 'h-9 w-9 text-ui-11-strong',
  md: 'h-10 w-10 text-ui-12-strong',
};

const toneClass: Record<AvatarTone, string> = {
  soft: 'bg-accent-soft text-accent-strong',
  strong: 'bg-text-primary text-text-inverse',
  sunken: 'bg-surface-sunken text-text-primary',
};

export function Avatar({
  initials,
  size = 'md',
  tone = 'soft',
  label,
  className,
}: {
  initials: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizeClass[size],
        toneClass[tone],
        className,
      )}
      aria-label={label}
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {initials}
    </span>
  );
}
