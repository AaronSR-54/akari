-- Akari · 0003 · Row Level Security
-- Aplicar después de 20261126100100_cloud_functions.sql.
-- Cada usuario solo puede leer y escribir sus propias filas.
-- La clave anónima del cliente nunca puede saltarse estas políticas.

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.movements enable row level security;
alter table public.recurrences enable row level security;
alter table public.installment_plans enable row level security;
alter table public.groups enable row level security;
alter table public.group_expenses enable row level security;
alter table public.transfers enable row level security;

-- Permisos de tabla para usuarios autenticados; sin acceso anónimo.
revoke all on public.profiles from anon;
revoke all on public.accounts from anon;
revoke all on public.movements from anon;
revoke all on public.recurrences from anon;
revoke all on public.installment_plans from anon;
revoke all on public.groups from anon;
revoke all on public.group_expenses from anon;
revoke all on public.transfers from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.accounts to authenticated;
grant select, insert, update, delete on public.movements to authenticated;
grant select, insert, update, delete on public.recurrences to authenticated;
grant select, insert, update, delete on public.installment_plans to authenticated;
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.group_expenses to authenticated;
grant select, insert, update, delete on public.transfers to authenticated;

-- Perfil: id = auth.uid().
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Tablas con user_id: propietario = auth.uid().
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'accounts',
    'movements',
    'recurrences',
    'installment_plans',
    'groups',
    'group_expenses',
    'transfers'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_select_own', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)',
      table_name || '_select_own',
      table_name
    );

    execute format('drop policy if exists %I on public.%I', table_name || '_insert_own', table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (auth.uid() = user_id)',
      table_name || '_insert_own',
      table_name
    );

    execute format('drop policy if exists %I on public.%I', table_name || '_update_own', table_name);
    execute format(
      'create policy %I on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      table_name || '_update_own',
      table_name
    );

    execute format('drop policy if exists %I on public.%I', table_name || '_delete_own', table_name);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (auth.uid() = user_id)',
      table_name || '_delete_own',
      table_name
    );
  end loop;
end;
$$;
