import type {
  CommentaireDossier,
  Dossier,
  HistoriqueEvent,
  Role,
  StatutDossier,
  VisibilityScope,
} from '../types';
import { canRoleSeeScope } from '../types';
import { DOSSIERS, DOSSIERS_TEST_VISIBILITE } from '../data/mockData';
import { mockAsync, USE_SUPABASE } from './_config';
import { getDossierByIdFromSupabase, listDossiersFromSupabase } from './supabase/dossiers';

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
  if (USE_SUPABASE) return listDossiersFromSupabase(filter);
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
  if (USE_SUPABASE) return getDossierByIdFromSupabase(id);
  const dossier =
    DOSSIERS.find((d) => d.id === id) ?? DOSSIERS_TEST_VISIBILITE.find((d) => d.id === id) ?? null;
  return mockAsync(dossier);
}

// =============================================================================
// MUTATIONS — mode démo uniquement
// =============================================================================
// En mode mock, on mute directement les arrays exportés depuis `data/mockData.ts`.
// L'invalidation React Query (côté hooks) garantit que les écrans se re-rendent
// avec les nouveaux éléments. État volatile : refresh = reset.
// En mode Supabase, ces mutations devront aller dans `services/supabase/dossiers.ts`
// (pas implémenté car la démo se contente du mock).

export interface CreateDossierInput {
  titre: string;
  categorie: Dossier['categorie'];
  urgence: Dossier['urgence'];
  description: string;
  ecoleId: string;
  createurId: string;
  createurNomComplet: string; // pour l'historique
  visibilityScope: VisibilityScope;
}

/**
 * Crée un dossier en mode démo (mock). Génère un id, pose le statut
 * `transmis_mairie` (l'utilisateur vient d'appuyer sur "transmettre"), ajoute
 * un event "creation" dans l'historique, et l'insère en tête de la liste.
 */
export function createDossier(input: CreateDossierInput): Promise<Dossier> {
  if (USE_SUPABASE) {
    return Promise.reject(new Error('createDossier non implémenté en mode Supabase (démo only)'));
  }
  const now = new Date();
  const id = `dossier-${now.getTime()}`;
  const event: HistoriqueEvent = {
    id: `event-${now.getTime()}`,
    date: now.toISOString(),
    type: 'creation',
    acteurNom: input.createurNomComplet,
    description: `Dossier ouvert : ${input.titre}`,
  };
  const dossier: Dossier = {
    id,
    titre: input.titre,
    categorie: input.categorie,
    statut: 'transmis_mairie',
    urgence: input.urgence,
    description: input.description,
    ecoleId: input.ecoleId,
    createurId: input.createurId,
    derniereMaj: now.toISOString(),
    nbPiecesJointes: 0,
    nbCommentaires: 0,
    historique: [event],
    visibilityScope: input.visibilityScope,
  };
  DOSSIERS.unshift(dossier);
  return mockAsync(dossier);
}

export interface AddCommentaireInput {
  dossierId: string;
  auteurNom: string;
  roleLabel: string;
  contenu: string;
  important?: boolean;
  visibilityScope?: VisibilityScope;
}

/**
 * Ajoute un commentaire à un dossier existant. Met à jour `nbCommentaires` et
 * `derniereMaj` du dossier. Retourne le commentaire créé.
 *
 * Les commentaires eux-mêmes sont stockés dans `app/parent/dossier-detail.tsx`
 * en local React state — ici on ne stocke pas une liste globale. On expose
 * juste la mutation pour que d'autres rôles puissent ajouter des commentaires
 * via un mécanisme partagé. (Si on veut un vrai partage cross-rôle, créer
 * `COMMENTAIRES` array dans mockData et le pousser ici.)
 */
export function addCommentaire(input: AddCommentaireInput): Promise<CommentaireDossier> {
  if (USE_SUPABASE) {
    return Promise.reject(new Error('addCommentaire non implémenté en mode Supabase (démo only)'));
  }
  const now = new Date();
  const commentaire: CommentaireDossier = {
    id: `commentaire-${now.getTime()}`,
    dossierId: input.dossierId,
    auteurNom: input.auteurNom,
    roleLabel: input.roleLabel,
    date: now.toISOString(),
    contenu: input.contenu,
    important: input.important,
    visibilityScope: input.visibilityScope,
  };
  const dossier = DOSSIERS.find((d) => d.id === input.dossierId);
  if (dossier) {
    dossier.nbCommentaires += 1;
    dossier.derniereMaj = now.toISOString();
  }
  return mockAsync(commentaire);
}

export interface UpdateDossierStatutInput {
  dossierId: string;
  statut: StatutDossier;
  acteurNom: string;
  description?: string;
}

/**
 * Met à jour le statut d'un dossier + ajoute un event dans l'historique.
 * Utilisé par mairie/reply pour passer le dossier en `en_cours_analyse`,
 * `resolu`, etc.
 */
export function updateDossierStatut(input: UpdateDossierStatutInput): Promise<Dossier | null> {
  if (USE_SUPABASE) {
    return Promise.reject(
      new Error('updateDossierStatut non implémenté en mode Supabase (démo only)'),
    );
  }
  const dossier = DOSSIERS.find((d) => d.id === input.dossierId);
  if (!dossier) return mockAsync(null);
  const now = new Date();
  const eventType: HistoriqueEvent['type'] =
    input.statut === 'resolu'
      ? 'resolution'
      : input.statut === 'action_programmee'
        ? 'action'
        : input.statut === 'rdv_propose'
          ? 'rdv'
          : 'analyse';
  const event: HistoriqueEvent = {
    id: `event-${now.getTime()}`,
    date: now.toISOString(),
    type: eventType,
    acteurNom: input.acteurNom,
    description: input.description ?? `Statut passé à « ${input.statut} »`,
  };
  dossier.statut = input.statut;
  dossier.derniereMaj = now.toISOString();
  dossier.historique = [...dossier.historique, event];
  return mockAsync(dossier);
}

/**
 * Bascule le scope d'un dossier vers `partage_tripartite` (utilisé par le
 * workflow "Partager avec la direction" côté mairie).
 */
export function shareDossierTripartite(input: {
  dossierId: string;
  acteurNom: string;
}): Promise<Dossier | null> {
  if (USE_SUPABASE) {
    return Promise.reject(
      new Error('shareDossierTripartite non implémenté en mode Supabase (démo only)'),
    );
  }
  const dossier = DOSSIERS.find((d) => d.id === input.dossierId);
  if (!dossier) return mockAsync(null);
  const now = new Date();
  dossier.visibilityScope = 'partage_tripartite';
  dossier.derniereMaj = now.toISOString();
  dossier.historique = [
    ...dossier.historique,
    {
      id: `event-${now.getTime()}`,
      date: now.toISOString(),
      type: 'partage',
      acteurNom: input.acteurNom,
      description: 'Dossier partagé en tripartite (parents + direction + mairie)',
    },
  ];
  return mockAsync(dossier);
}
