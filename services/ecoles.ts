import type { Ecole } from '../types';
import { ECOLES } from '../data/mockData';
import { mockAsync, USE_SUPABASE } from './_config';
import { getEcoleByIdFromSupabase, listEcolesFromSupabase } from './supabase/ecoles';

export function listEcoles(): Promise<Ecole[]> {
  if (USE_SUPABASE) return listEcolesFromSupabase();
  return mockAsync(ECOLES);
}

export function getEcoleById(id: string): Promise<Ecole | null> {
  if (USE_SUPABASE) return getEcoleByIdFromSupabase(id);
  const ecole = ECOLES.find((e) => e.id === id) ?? null;
  return mockAsync(ecole);
}
