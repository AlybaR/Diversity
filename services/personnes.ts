import type { Personne, Role } from '../types';
import { PERSONNES } from '../data/mockData';
import { mockAsync, USE_SUPABASE } from './_config';
import { getPersonneByIdFromSupabase, listPersonnesFromSupabase } from './supabase/personnes';

export interface PersonneFilter {
  ecoleId?: string;
  role?: Role;
  representantsOnly?: boolean;
}

export function listPersonnes(filter: PersonneFilter = {}): Promise<Personne[]> {
  if (USE_SUPABASE) return listPersonnesFromSupabase(filter);
  let result = PERSONNES;
  if (filter.ecoleId) {
    result = result.filter((p) => p.ecoleId === filter.ecoleId);
  }
  if (filter.role) {
    result = result.filter((p) => p.role === filter.role);
  }
  if (filter.representantsOnly) {
    result = result.filter((p) => p.role === 'parent_admin' || p.role === 'parent_contributeur');
  }
  return mockAsync(result);
}

export function getPersonneById(id: string): Promise<Personne | null> {
  if (USE_SUPABASE) return getPersonneByIdFromSupabase(id);
  const personne = PERSONNES.find((p) => p.id === id) ?? null;
  return mockAsync(personne);
}
