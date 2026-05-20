import type { RendezVous } from '../../types';
import { supabase } from '../../lib/supabase';
import type { RdvFilter } from '../rendezVous';
import { mapRendezVous } from './_mappers';

export async function listRendezVousFromSupabase(filter: RdvFilter = {}): Promise<RendezVous[]> {
  let query = supabase.from('rendez_vous').select('*').order('cree_le', { ascending: false });

  if (filter.statut) {
    query = query.eq('statut', filter.statut);
  }
  if (filter.scope) {
    query = query.eq('visibility_scope', filter.scope);
  }
  // ecoleId : pas encore relié côté schema RDV (cf. note 0001)
  // visibleByRole : géré par RLS

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRendezVous);
}

export async function getRendezVousByIdFromSupabase(id: string): Promise<RendezVous | null> {
  const { data, error } = await supabase.from('rendez_vous').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRendezVous(data) : null;
}
