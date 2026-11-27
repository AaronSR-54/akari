-- Akari · 0005 · Día de ingreso opcional
-- Aplicar después de 20261126100300_profile_preferences.sql.
-- Si el alta no envía income_day, el perfil se crea sin día en vez de asumir el 1.

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
    suggested_day := least(greatest((new.raw_user_meta_data ->> 'income_day')::integer, 1), 31);
  else
    suggested_day := null;
  end if;

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
