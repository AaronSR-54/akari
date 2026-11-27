import { bankCatalog, type BankId } from '@akari/domain';

type BankIconSize = 16 | 20 | 24 | 28 | 32 | 36 | 48 | 56 | 64;

/** Billetes en trazo neutro: hereda el color del texto sin colores de marca. */
function CashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="2.8" y="6.4" width="15.2" height="10.4" rx="2.2" opacity="0.45" />
      <rect x="5.6" y="8.2" width="15.6" height="10.6" rx="2.2" />
      <circle cx="13.4" cy="13.5" r="2.4" />
      <path d="M7.6 13.5h1.2M18 13.5h1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Cartera genérica en trazo neutro para cuentas sin banco asignado. */
function OtherIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M5.5 7.2h11.8a1.8 1.8 0 0 1 1.8 1.8v1" strokeLinecap="round" />
      <rect x="3.8" y="9.6" width="16.4" height="7.8" rx="2.2" />
      <path d="M17.4 12.8h1.6v2.4h-1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Distintivo del banco asociado a la cuenta origen de un movimiento. */
export function BankIcon({ bankId, size = 24 }: { bankId?: BankId | null; size?: BankIconSize }) {
  const bank = bankCatalog.find((entry) => entry.id === bankId);
  const isAppIcon = bank?.icon === 'app';

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-sunken ${
        isAppIcon ? '' : 'text-text-secondary'
      }`}
      style={{ width: size, height: size }}
      data-bank={bank?.id ?? 'other'}
    >
      {isAppIcon ? (
        <img src={`/banks/${bank.id}.png`} alt="" className="h-full w-full object-cover" />
      ) : bank?.icon === 'cash' ? (
        <CashIcon />
      ) : (
        <OtherIcon />
      )}
    </span>
  );
}
