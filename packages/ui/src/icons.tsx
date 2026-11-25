'use client';

import type { SVGProps } from 'react';

export type IconSize = 16 | 18 | 20 | 24;

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: IconSize;
  /** Si se omite, el icono es decorativo (aria-hidden). */
  label?: string;
};

function baseProps({ size = 24, label, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }),
    ...props,
  };
}

export function IconHome(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5v10h13v-10" />
      <path d="M9.5 19.5v-6h5v6" />
    </svg>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3.5" y="6" width="17" height="13" rx="3" />
      <path d="M3.5 10h17" />
      <path d="M16.5 14.5h1.5" />
    </svg>
  );
}

export function IconArrows(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M7 4.5v15" />
      <path d="m3.5 8 3.5-3.5L10.5 8" />
      <path d="M17 19.5v-15" />
      <path d="m13.5 16 3.5 3.5 3.5-3.5" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5S14 16 14.5 19" />
      <path d="M15.5 6.2a3 3 0 0 1 0 5.6" />
      <path d="M17 14.8c2 .5 3.3 1.9 3.7 4.2" />
    </svg>
  );
}

export function IconAdd(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconInsights(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 19.5V4.5" />
      <path d="M4 19.5h16" />
      <path d="m7 15 3.5-4 3 2.5L19 7" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 4.5 4.5" />
    </svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 2 6.5H4.5c.5-1 2-2.5 2-6.5Z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

export function IconWarning(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v4" />
      <path d="M12 17.5v.01" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.5" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />
    </svg>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <circle cx="16" cy="7" r="2" />
      <path d="M4 17h4" />
      <path d="M12 17h8" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

export const icons = {
  home: IconHome,
  wallet: IconWallet,
  arrows: IconArrows,
  users: IconUsers,
  add: IconAdd,
  insights: IconInsights,
  search: IconSearch,
  bell: IconBell,
  warning: IconWarning,
  clock: IconClock,
  sliders: IconSliders,
};

export type IconName = keyof typeof icons;

export function Icon({ name, ...props }: IconProps & { name: IconName }) {
  const Component = icons[name];
  return <Component {...props} />;
}
