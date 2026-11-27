-- Akari · 0002 · Funciones y triggers
-- Aplicar después de 20261126100000_cloud_schema.sql.
-- Idempotente: se puede volver a ejecutar sin duplicar triggers.

-- Mantiene updated_at en UTC en cada modificación.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'accounts',
    'movements',
    'recurrences',
    'installment_plans',
    'groups',
    'group_expenses',
    'transfers'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

-- Crea el perfil al registrarse, usando el nombre enviado en el alta
-- (options.data.display_name) o la parte local del email como respaldo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  suggested_name text;
begin
  suggested_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Marta'
  );

  insert into public.profiles (id, display_name)
  values (new.id, left(suggested_name, 40))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
