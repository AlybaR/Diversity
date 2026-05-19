import type { Dossier, Role, StatutDossier, VisibilityScope } from '../types';
import { canRoleSeeScope } from '../types';
import { DOSSIERS } from '../data/mockData';
import { mockAsync } from './_config';

export interface DossierFilter {
  ecoleId?: string;
  statut?: StatutDossier;
  ouvert?: boolean;
  urgent?: boolean;
  // Filtre par scope explicite (utile pour pages dédiées : « notes internes »).
  scope?: VisibilityScope;
  // Filtre par rôle qui consulte : ne renvoie que les dossiers visibles pour ce rôle.
  // Source de vérité : helper canRoleSeeScope. Toute exposition direct sans ce filtre
  // doit rester limitée aux écrans mairie qui voient tout.
  visibleByRole?: Role;
}

const OPEN_STATUTS: StatutDossier[] = [
  'transmis_mairie',
  'recu',
  'en_cours_analyse',
  'en_attente_information',
  'rdv_propose',
  'action_programmee',
];

export function listDossiers(filter: DossierFilter = {}): Promise<Dossier[]> {
  let result = DOSSIERS;
  if (filter.ecoleId) {
    result = result.filter((d) => d.ecoleId === filter.ecoleId);
  }
  if (filter.statut) {
    result = result.filter((d) => d.statut === filter.statut);
  }
  if (filter.ouvert) {
    result = result.filter((d) => OPEN_STATUTS.includes(d.statut));
  }
  if (filter.urgent) {
    result = result.filter((d) => d.urgence === 'elevee' && d.statut !== 'resolu');
  }
  if (filter.scope) {
    result = result.filter((d) => d.visibilityScope === filter.scope);
  }
  if (filter.visibleByRole) {
    const role = filter.visibleByRole;
    result = result.filter((d) => canRoleSeeScope(role, d.visibilityScope));
  }
  return mockAsync(result);
}

export function getDossierById(id: string): Promise<Dossier | null> {
  const dossier = DOSSIERS.find((d) => d.id === id) ?? null;
  return mockAsync(dossier);
}
