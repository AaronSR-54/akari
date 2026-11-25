import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { bankCatalog } from '@akari/domain';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BankIcon } from './bank-icon.js';

const banksDir = resolve(process.cwd(), 'apps/web/public/banks');
const appBanks = bankCatalog.filter((bank) => bank.icon === 'app');

describe('iconos de bancos', () => {
  it('tiene el icono de la app móvil para cada banco del catálogo', () => {
    const files = readdirSync(banksDir)
      .filter((file) => file.endsWith('.png'))
      .sort();
    expect(files).toEqual(
      appBanks
        .map((bank) => `${bank.id}.png`)
        .sort(),
    );
  });

  it('documenta la app de origen de todos los iconos', () => {
    const doc = readFileSync(
      resolve(process.cwd(), 'docs/desarrollo/iconos-bancos.md'),
      'utf8',
    );
    for (const bank of appBanks) {
      expect(doc).toContain(`${bank.id}.png`);
    }
    expect(doc).toContain('App Store');
  });

  it('los iconos son PNG cuadrados válidos', () => {
    for (const bank of appBanks) {
      const png = readFileSync(resolve(banksDir, `${bank.id}.png`));
      expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(png.readUInt32BE(16)).toBe(png.readUInt32BE(20));
    }
  });
});

describe('BankIcon', () => {
  it('renderiza el icono de la app dentro de un círculo de 24 px', () => {
    const { container } = render(<BankIcon bankId="bbva" />);
    const wrapper = container.querySelector('[data-bank="bbva"]') as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.style.width).toBe('24px');
    expect(wrapper.style.height).toBe('24px');
    expect(wrapper).toHaveClass('rounded-full', 'overflow-hidden');
    expect(wrapper.querySelector('img')).toHaveAttribute('src', '/banks/bbva.png');
    expect(wrapper.querySelector('img')).toHaveClass('h-full', 'w-full', 'object-cover');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('puede ocupar el círculo de 32 px de los últimos movimientos', () => {
    const { container } = render(<BankIcon bankId="bbva" size={32} />);
    const wrapper = container.querySelector('[data-bank="bbva"]') as HTMLElement;
    expect(wrapper.style.width).toBe('32px');
    expect(wrapper.style.height).toBe('32px');
    expect(wrapper.querySelector('img')).toHaveClass('h-full', 'w-full', 'object-cover');
  });

  it('usa un distintivo propio para efectivo y el icono genérico para los demás', () => {
    const { container } = render(
      <>
        <BankIcon bankId="cash" />
        <BankIcon bankId="other" />
        <BankIcon />
      </>,
    );
    for (const id of ['cash', 'other']) {
      const icon = container.querySelector(`[data-bank="${id}"]`);
      expect(icon).toHaveClass('bg-surface-sunken', 'text-text-secondary');
      expect(icon?.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
      expect(icon?.querySelector('svg')?.innerHTML).not.toMatch(/#[0-9a-f]{6}/i);
    }
    expect(container.querySelectorAll('[data-bank="other"] svg')).toHaveLength(2);
    expect(container.querySelectorAll('.rounded-full')).toHaveLength(3);
  });
});
