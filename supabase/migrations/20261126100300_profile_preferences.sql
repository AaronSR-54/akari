  -- Akari · 0004 · Preferencias del perfil
  -- Aplicar después de 20261126100200_cloud_rls.sql.
  -- Añade el día de ingreso principal y guarda divisa/día al crear la cuenta.

  alter table public.profiles
    add column if not exists income_day smallint;

  do $$
  begin
    if not exists (
      select 1
      from pg_constraint
      where conname = 'profiles_income_day_check'
        and conrelid = 'public.profiles'::regclass
    ) then
      alter table public.profiles
        add constraint profiles_income_day_check
        check (income_day between 1 and 31);
    end if;
  end;
  $$;

  -- El alta envía display_name, currency e income_day en options.data.
  create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    suggested_name text;
    suggested_currency text;
    suggested_day integer;
  begin
    suggested_name := coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Marta'
    );

    suggested_currency := upper(coalesce(new.raw_user_meta_data ->> 'currency', 'EUR'));
    if suggested_currency !~ '^[A-Z]{3}$' then
      suggested_currency := 'EUR';
    end if;

    if coalesce(new.raw_user_meta_data ->> 'income_day', '') ~ '^[0-9]{1,2}$' then
      suggested_day := (new.raw_user_meta_data ->> 'income_day')::integer;
    else
      suggested_day := 1;
    end if;
    suggested_day := least(greatest(suggested_day, 1), 31);

    insert into public.profiles (id, display_name, currency, income_day)
    values (new.id, left(suggested_name, 40), suggested_currency, suggested_day)
    on conflict (id) do nothing;

    return new;
  end;
  $$;

  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
