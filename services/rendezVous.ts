import type { RendezVous, Role, StatutRDV, VisibilityScope } from '../types';
import { canRoleSeeScope } from '../types';
import { RENDEZ_VOUS, RENDEZ_VOUS_TEST_VISIBILITE } from '../data/mockData';
import { mockAsync } from './_config';

export interface RdvFilter {
  ecoleId?: string;
  statut?: StatutRDV;
  scope?: VisibilityScope;
  visibleByRole?: Role;
}

export function listRendezVous(filter: RdvFilter = {}): Promise<RendezVous[]> {
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
  const rdv =
    RENDEZ_VOUS.find((r) => r.id === id) ??
    RENDEZ_VOUS_TEST_VISIBILITE.find((r) => r.id === id) ??
    null;
  return mockAsync(rdv);
}
