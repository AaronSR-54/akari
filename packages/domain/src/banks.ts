/** Identificadores estables del catálogo local de bancos. */
export const bankIds = [
  'bbva',
  'santander',
  'caixabank',
  'sabadell',
  'bankinter',
  'unicaja',
  'ibercaja',
  'abanca',
  'kutxabank',
  'imagin',
  'revolut',
  'pibank',
  'trade-republic',
  'cash',
  'other',
] as const;

export type BankId = (typeof bankIds)[number];

export type Bank = {
  id: BankId;
  name: string;
  /** `app` = icono oficial de la app móvil, `cash` = efectivo, `other` = genérico. */
  icon: 'app' | 'cash' | 'other';
};

export const bankCatalog: readonly Bank[] = [
  { id: 'bbva', name: 'BBVA', icon: 'app' },
  { id: 'santander', name: 'Santander', icon: 'app' },
  { id: 'caixabank', name: 'CaixaBank', icon: 'app' },
  { id: 'sabadell', name: 'Banco Sabadell', icon: 'app' },
  { id: 'bankinter', name: 'Bankinter', icon: 'app' },
  { id: 'unicaja', name: 'Unicaja', icon: 'app' },
  { id: 'ibercaja', name: 'Ibercaja', icon: 'app' },
  { id: 'abanca', name: 'Abanca', icon: 'app' },
  { id: 'kutxabank', name: 'Kutxabank', icon: 'app' },
  { id: 'imagin', name: 'imagin', icon: 'app' },
  { id: 'revolut', name: 'Revolut', icon: 'app' },
  { id: 'pibank', name: 'Pibank', icon: 'app' },
  { id: 'trade-republic', name: 'Trade Republic', icon: 'app' },
  { id: 'cash', name: 'Efectivo', icon: 'cash' },
  { id: 'other', name: 'Sin banco / Otro', icon: 'other' },
];

/** Comprueba que un valor procedente de datos locales pertenece al catálogo. */
export function isBankId(value: unknown): value is BankId {
  return typeof value === 'string' && (bankIds as readonly string[]).includes(value);
}

/** Normaliza datos procedentes de copias o versiones anteriores al catálogo actual. */
export function normalizeBankId(value: unknown): BankId {
  return isBankId(value) ? value : 'other';
}
