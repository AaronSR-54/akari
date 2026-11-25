import { bankCatalog, type AccountType, type Frequency, type MemberRole, type SplitMode } from '@akari/domain';

export const currencyOptions = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dólar (USD)' },
  { value: 'GBP', label: 'Libra (GBP)' },
  { value: 'JPY', label: 'Yen (JPY)' },
];

export const accountTypeOptions: Array<{ value: AccountType; label: string }> = [
  { value: 'personal', label: 'Personal' },
  { value: 'joint', label: 'Conjunta' },
  { value: 'deposit', label: 'Depósito' },
];

export const bankOptions = bankCatalog.map((bank) => ({ value: bank.id, label: bank.name }));

export const movementCategories = [
  'Alimentación',
  'Vivienda',
  'Transporte',
  'Ocio',
  'Compras',
  'Suscripciones',
  'Salud',
  'Ingresos',
  'Plazos',
  'Otros',
];

export const movementCategoryOptions = movementCategories.map((category) => ({
  value: category,
  label: category,
}));

export const frequencyOptions: Array<{ value: Frequency; label: string }> = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'yearly', label: 'Anual' },
];

export const memberRoleOptions: Array<{ value: MemberRole; label: string }> = [
  { value: 'admin', label: 'Administración' },
  { value: 'editor', label: 'Edición' },
  { value: 'viewer', label: 'Lectura' },
];

export const splitModeOptions: Array<{ value: SplitMode; label: string }> = [
  { value: 'equal', label: 'Partes iguales' },
  { value: 'percentage', label: 'Porcentaje' },
  { value: 'fixed', label: 'Cantidad fija' },
];
