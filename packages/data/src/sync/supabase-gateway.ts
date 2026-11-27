import type { SupabaseClient } from '@supabase/supabase-js';
import { REMOTE_TABLE, type CloudGateway, type CloudRow, type SyncTable } from './types.js';

const PAGE_SIZE = 1000;

function fail(context: string, message: string): Error {
  return new Error(`Supabase (${context}): ${message}`);
}

/**
 * Implementación real del transporte de sincronización. El cliente debe usar
 * la clave anónima y una sesión activa: RLS limita todo a auth.uid().
 */
export function createSupabaseGateway(client: SupabaseClient, userId: string): CloudGateway {
  const table = (name: SyncTable) => client.from(REMOTE_TABLE[name]);

  return {
    async fetchAll(name: SyncTable): Promise<CloudRow[]> {
      const rows: CloudRow[] = [];
      let start = 0;

      for (;;) {
        const { data, error } = await table(name)
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: true })
          .order('id', { ascending: true })
          .range(start, start + PAGE_SIZE - 1);

        if (error) throw fail(`leer ${REMOTE_TABLE[name]}`, error.message);

        const page = (data ?? []) as CloudRow[];
        rows.push(...page);
        if (page.length < PAGE_SIZE) break;
        start += PAGE_SIZE;
      }

      return rows;
    },

    async upsert(name: SyncTable, row: Record<string, unknown>): Promise<CloudRow> {
      const { data, error } = await table(name)
        .upsert({ ...row, user_id: userId }, { onConflict: 'user_id,id' })
        .select('*')
        .single();

      if (error) throw fail(`guardar ${REMOTE_TABLE[name]}`, error.message);
      return data as CloudRow;
    },

    async softDelete(name: SyncTable, id: string): Promise<CloudRow | null> {
      const { data, error } = await table(name)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();

      if (error) throw fail(`borrar ${REMOTE_TABLE[name]}`, error.message);
      return (data as CloudRow | null) ?? null;
    },
  };
}
