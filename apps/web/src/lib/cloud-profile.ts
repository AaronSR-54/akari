import type { SupabaseClient } from '@supabase/supabase-js';

export type CloudProfile = {
  displayName: string | null;
  currency: string | null;
  incomeDay: number | null;
};

type ProfileRow = {
  display_name?: string | null;
  currency?: string | null;
  income_day?: number | null;
};

export async function fetchProfile(
  client: SupabaseClient,
  userId: string,
): Promise<CloudProfile | null> {
  const { data, error } = await client
    .from('profiles')
    .select('display_name, currency, income_day')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(`No se ha podido leer el perfil: ${error.message}`);
  if (!data) return null;

  const row = data as ProfileRow;
  return {
    displayName: row.display_name?.trim() ? row.display_name.trim() : null,
    currency: row.currency ?? null,
    incomeDay: typeof row.income_day === 'number' ? row.income_day : null,
  };
}

export async function saveProfile(
  client: SupabaseClient,
  userId: string,
  profile: { displayName: string; currency: string; incomeDay: number },
): Promise<void> {
  const { error } = await client.from('profiles').upsert(
    {
      id: userId,
      display_name: profile.displayName,
      currency: profile.currency,
      income_day: profile.incomeDay,
    },
    { onConflict: 'id' },
  );

  if (error) throw new Error(`No se ha podido guardar el perfil: ${error.message}`);
}
