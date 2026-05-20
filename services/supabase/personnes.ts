import type { Personne } from '../../types';
import { supabase } from '../../lib/supabase';
import type { PersonneFilter } from '../personnes';
import { mapPersonne } from './_mappers';

export async function listPersonnesFromSupabase(filter: PersonneFilter = {}): Promise<Personne[]> {
  let query = supabase.from('personnes').select('*').order('nom');

  if (filter.ecoleId) {
    query = query.eq('ecole_id', filter.ecoleId);
  }
  if (filter.role) {
    query = query.eq('role', filter.role);
  }
  if (filter.representantsOnly) {
    query = query.in('role', ['parent_admin', 'parent_contributeur']);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapPersonne);
}

export async function getPersonneByIdFromSupabase(id: string): Promise<Personne | null> {
  const { data, error } = await supabase.from('personnes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapPersonne(data) : null;
}
