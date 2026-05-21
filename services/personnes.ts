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

// =============================================================================
// MUTATIONS — mode démo uniquement
// =============================================================================

export interface CreatePersonneInput {
  prenom: string;
  nom: string;
  email: string;
  role: Role;
  ecoleId?: string;
  fonction?: string;
  association?: string;
  service?: string;
}

/**
 * Ajoute une personne dans l'annuaire mock. Génère un id unique. En mode démo,
 * la personne devient immédiatement utilisable (visible dans le sélecteur de
 * personnage, dans les annuaires, etc.).
 */
export function createPersonne(input: CreatePersonneInput): Promise<Personne> {
  if (USE_SUPABASE) {
    return Promise.reject(new Error('createPersonne non implémenté en mode Supabase (démo only)'));
  }
  const now = Date.now();
  const personne: Personne = {
    id: `personne-${now}`,
    prenom: input.prenom.trim(),
    nom: input.nom.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    ecoleId: input.ecoleId,
    fonction: input.fonction,
    association: input.association,
    service: input.service,
    actif: true,
  };
  PERSONNES.push(personne);
  return mockAsync(personne);
}
