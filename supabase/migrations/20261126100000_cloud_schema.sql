-- Akari · 0001 · Esquema base de la nube
-- Aplicar primero este archivo en el proyecto de Supabase (SQL Editor o CLI).
-- No contiene secretos. No borra datos: usa CREATE ... IF NOT EXISTS.

-- Perfil público del usuario. La fila la crea el trigger de 0002.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Marta'
    check (char_length(btrim(display_name)) between 1 and 40),
  currency text not null default 'EUR'
    check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cuentas: personales, conjuntas o depósitos.
create table if not exists public.accounts (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('personal', 'joint', 'deposit')),
  currency text not null default 'EUR',
  initial_balance_minor bigint not null default 0,
  tae_bps integer,
  bank_id text,
  include_in_total boolean not null default true,
  members jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

-- Movimientos: importe siempre positivo; el tipo decide el signo.
create table if not exists public.movements (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id text not null,
  type text not null check (type in ('expense', 'income')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'EUR',
  date date not null,
  concept text not null,
  category text not null,
  note text,
  member_id text,
  recurrence_id text,
  installment_plan_id text,
  group_expense_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

-- Recurrencias: suscripciones e ingresos periódicos.
create table if not exists public.recurrences (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id text not null,
  type text not null check (type in ('expense', 'income')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'EUR',
  concept text not null,
  category text not null,
  frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  next_date date not null,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

-- Planes de cuotas.
create table if not exists public.installment_plans (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id text not null,
  concept text not null,
  total_minor bigint not null check (total_minor >= 0),
  currency text not null default 'EUR',
  installments integer not null check (installments > 0),
  paid_installments integer not null default 0 check (paid_installments >= 0),
  first_due_date date not null,
  frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

-- Grupos y sus miembros (JSONB con id, nombre y rol).
create table if not exists public.groups (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  currency text not null default 'EUR',
  members jsonb not null default '[]'::jsonb,
  settlement_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

-- Gastos de grupo y reparto por miembro (JSONB).
create table if not exists public.group_expenses (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  group_id text not null,
  payer_member_id text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'EUR',
  original_amount_minor bigint,
  original_currency text,
  exchange_rate numeric(18, 8),
  account_id text,
  split_mode text not null check (split_mode in ('equal', 'percentage', 'fixed')),
  shares jsonb not null default '[]'::jsonb,
  date date not null,
  concept text not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

-- Transferencias y liquidaciones de grupo.
create table if not exists public.transfers (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  group_id text not null,
  from_member_id text not null,
  to_member_id text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'EUR',
  status text not null check (status in ('pending', 'settled')),
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

-- Índices de lectura por usuario y orden de modificación.
create index if not exists accounts_user_updated_idx
  on public.accounts (user_id, updated_at);
create index if not exists movements_user_updated_idx
  on public.movements (user_id, updated_at);
create index if not exists movements_account_date_idx
  on public.movements (account_id, date desc);
create index if not exists recurrences_user_updated_idx
  on public.recurrences (user_id, updated_at);
create index if not exists installments_user_updated_idx
  on public.installment_plans (user_id, updated_at);
create index if not exists groups_user_updated_idx
  on public.groups (user_id, updated_at);
create index if not exists group_expenses_user_updated_idx
  on public.group_expenses (user_id, updated_at);
create index if not exists group_expenses_group_date_idx
  on public.group_expenses (group_id, date desc);
create index if not exists transfers_user_updated_idx
  on public.transfers (user_id, updated_at);
create index if not exists transfers_group_status_idx
  on public.transfers (group_id, status);
