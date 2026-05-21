import type { RendezVous, Role, StatutRDV, VisibilityScope } from '../types';
import { canRoleSeeScope } from '../types';
import { RENDEZ_VOUS, RENDEZ_VOUS_TEST_VISIBILITE } from '../data/mockData';
import { mockAsync, USE_SUPABASE } from './_config';
import { getRendezVousByIdFromSupabase, listRendezVousFromSupabase } from './supabase/rendezVous';

export interface RdvFilter {
  ecoleId?: string;
  statut?: StatutRDV;
  scope?: VisibilityScope;
  visibleByRole?: Role;
}

export function listRendezVous(filter: RdvFilter = {}): Promise<RendezVous[]> {
  if (USE_SUPABASE) return listRendezVousFromSupabase(filter);
  let result = RENDEZ_VOUS;
  if (filter.statut) {
    result = result.filter((r) => r.statut === filter.statut);
  }
  if (filter.scope) {
    result = result.filter((r) => r.visibilityScope === filter.scope);
  }
  if (filter.visibleByRole) {
    const role = filter.visibleByRole;
    result = result.filter((r) => canRoleSeeScope(role, r.visibilityScope));
  }
  // ecoleId : non encore branché sur les RDV (modèle à compléter)
  return mockAsync(result);
}

export function getRendezVousById(id: string): Promise<RendezVous | null> {
  if (USE_SUPABASE) return getRendezVousByIdFromSupabase(id);
  const rdv =
    RENDEZ_VOUS.find((r) => r.id === id) ??
    RENDEZ_VOUS_TEST_VISIBILITE.find((r) => r.id === id) ??
    null;
  return mockAsync(rdv);
}

// =============================================================================
// MUTATIONS — mode démo uniquement
// =============================================================================

export interface CreateRendezVousInput {
  titre: string;
  date: string; // libellé lisible "Mercredi 27 mai" — ok pour la démo
  heure: string;
  lieu: string;
  participantsNoms: string[];
  dossierLieId?: string;
  dossierLieTitre?: string;
  visibilityScope: VisibilityScope;
  statut?: StatutRDV; // par défaut 'demande'
}

export function createRendezVous(input: CreateRendezVousInput): Promise<RendezVous> {
  if (USE_SUPABASE) {
    return Promise.reject(
      new Error('createRendezVous non implémenté en mode Supabase (démo only)'),
    );
  }
  const now = new Date();
  const rdv: RendezVous = {
    id: `rdv-${now.getTime()}`,
    titre: input.titre,
    date: input.date,
    heure: input.heure,
    lieu: input.lieu,
    participantsNoms: input.participantsNoms,
    dossierLieId: input.dossierLieId,
    dossierLieTitre: input.dossierLieTitre,
    statut: input.statut ?? 'demande',
    visibilityScope: input.visibilityScope,
  };
  RENDEZ_VOUS.unshift(rdv);
  return mockAsync(rdv);
}

export function updateRendezVousStatut(input: {
  id: string;
  statut: StatutRDV;
}): Promise<RendezVous | null> {
  if (USE_SUPABASE) {
    return Promise.reject(
      new Error('updateRendezVousStatut non implémenté en mode Supabase (démo only)'),
    );
  }
  const rdv = RENDEZ_VOUS.find((r) => r.id === input.id);
  if (!rdv) return mockAsync(null);
  rdv.statut = input.statut;
  return mockAsync(rdv);
}
