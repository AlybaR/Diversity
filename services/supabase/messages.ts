import type { Message } from '../../types';
import { supabase } from '../../lib/supabase';
import type { MessageFilter } from '../messages';
import { mapMessage } from './_mappers';

export async function listMessagesFromSupabase(filter: MessageFilter = {}): Promise<Message[]> {
  let query = supabase.from('messages').select('*').order('cree_le', { ascending: false });

  if (filter.ecoleId) {
    query = query.eq('ecole_id', filter.ecoleId);
  }
  if (filter.scope) {
    query = query.eq('visibility_scope', filter.scope);
  }
  // visibleByRole inutile : la RLS s'en charge.

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

export async function getMessageByIdFromSupabase(id: string): Promise<Message | null> {
  const { data, error } = await supabase.from('messages').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapMessage(data) : null;
}
