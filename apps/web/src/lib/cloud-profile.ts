import type { SupabaseClient } from '@supabase/supabase-js';

export async function fetchProfileName(
  client: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await client
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(`No se ha podido leer el perfil: ${error.message}`);
  const name = (data as { display_name?: string } | null)?.display_name;
  return name?.trim() ? name.trim() : null;
}

export async function saveProfileName(
  client: SupabaseClient,
  userId: string,
  displayName: string,
): Promise<void> {
  const { error } = await client
    .from('profiles')
    .upsert({ id: userId, display_name: displayName }, { onConflict: 'id' });

  if (error) throw new Error(`No se ha podido guardar el perfil: ${error.message}`);
}
