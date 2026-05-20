import type { Ecole } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapEcole } from './_mappers';

export async function listEcolesFromSupabase(): Promise<Ecole[]> {
  const { data, error } = await supabase.from('ecoles').select('*').order('nom');
  if (error) throw error;
  return (data ?? []).map(mapEcole);
}

export async function getEcoleByIdFromSupabase(id: string): Promise<Ecole | null> {
  const { data, error } = await supabase.from('ecoles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapEcole(data) : null;
}
