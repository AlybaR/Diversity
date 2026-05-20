/**
 * Mappers Supabase → types TypeScript
 *
 * Convertit les lignes PostgreSQL (snake_case) en types TS (camelCase) définis
 * dans mobile-app/types/index.ts.
 *
 * Convention : un mapper par entité. Les champs optionnels SQL `NULL` sont
 * convertis en `undefined` côté TS.
 */

import type {
  AncienAdmin,
  CommentaireDossier,
  ContactMairie,
  Dossier,
  DocumentLie,
  Ecole,
  HistoriqueEvent,
  Mairie,
  Message,
  Personne,
  PieceJointe,
  RendezVous,
} from '../../types';

// =============================================================================
// Types des lignes Supabase brutes (snake_case, tels que PostgreSQL les renvoie)
// =============================================================================

interface MairieRow {
  id: string;
  nom: string;
}

interface EcoleRow {
  id: string;
  nom: string;
  adresse: string;
  cle: string;
  direction_nom: string;
  collectivite_id: string;
  annee_scolaire: string;
}

interface PersonneRow {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  role: Personne['role'];
  association: string | null;
  ecole_id: string | null;
  service: string | null;
  fonction: string | null;
  actif: boolean;
}

interface ContactMairieRow {
  id: string;
  nom: string;
  fonction: string;
  service: string;
  email: string;
  telephone: string | null;
  perimetre: string;
  categories_liees: ContactMairie['categoriesLiees'];
}

interface HistoriqueRow {
  id: string;
  date: string;
  type: HistoriqueEvent['type'];
  acteur_nom: string;
  description: string;
}

interface DossierRow {
  id: string;
  titre: string;
  categorie: Dossier['categorie'];
  statut: Dossier['statut'];
  urgence: Dossier['urgence'];
  description: string;
  ecole_id: string;
  createur_id: string;
  interlocuteur_cible: string | null;
  derniere_maj: string;
  nb_pieces_jointes: number;
  nb_commentaires: number;
  visibility_scope: Dossier['visibilityScope'];
  historique?: HistoriqueRow[] | null;
}

interface PieceJointeRow {
  id: string;
  dossier_id: string;
  nom: string;
  type: PieceJointe['type'];
  taille: string;
  ajoute_par: string;
  date: string;
  visibility_scope: PieceJointe['visibilityScope'] | null;
}

interface CommentaireRow {
  id: string;
  dossier_id: string;
  auteur_nom: string;
  role_label: string;
  date: string;
  contenu: string;
  important: boolean;
  visibility_scope: CommentaireDossier['visibilityScope'] | null;
}

interface RendezVousRow {
  id: string;
  titre: string;
  date: string;
  heure: string;
  lieu: string;
  participants_noms: string[];
  dossier_lie_id: string | null;
  dossier_lie_titre: string | null;
  statut: RendezVous['statut'];
  pieces_jointes: DocumentLie[];
  visibility_scope: RendezVous['visibilityScope'];
}

interface MessageRow {
  id: string;
  titre: string;
  expediteur: string;
  date: string;
  priorite: Message['priorite'];
  contenu: string;
  lu: boolean;
  pieces_jointes: DocumentLie[];
  visibility_scope: Message['visibilityScope'];
}

interface AncienAdminRow {
  id: string;
  nom: string;
  fonction: AncienAdmin['fonction'];
  association: string | null;
  annees: string;
  note: string | null;
}

// =============================================================================
// Fonctions de mapping
// =============================================================================

export function mapMairie(row: MairieRow): Mairie {
  return { id: row.id, nom: row.nom };
}

export function mapEcole(row: EcoleRow): Ecole {
  return {
    id: row.id,
    nom: row.nom,
    adresse: row.adresse,
    cle: row.cle,
    directionNom: row.direction_nom,
    collectiviteId: row.collectivite_id,
    anneeScolaire: row.annee_scolaire,
  };
}

export function mapPersonne(row: PersonneRow): Personne {
  return {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
    telephone: row.telephone ?? undefined,
    role: row.role,
    association: row.association ?? undefined,
    ecoleId: row.ecole_id ?? undefined,
    service: row.service ?? undefined,
    fonction: row.fonction ?? undefined,
    actif: row.actif,
  };
}

export function mapContactMairie(row: ContactMairieRow): ContactMairie {
  return {
    id: row.id,
    nom: row.nom,
    fonction: row.fonction,
    service: row.service,
    email: row.email,
    telephone: row.telephone ?? undefined,
    perimetre: row.perimetre,
    categoriesLiees: row.categories_liees,
  };
}

export function mapHistoriqueEvent(row: HistoriqueRow): HistoriqueEvent {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    acteurNom: row.acteur_nom,
    description: row.description,
  };
}

export function mapDossier(row: DossierRow): Dossier {
  return {
    id: row.id,
    titre: row.titre,
    categorie: row.categorie,
    statut: row.statut,
    urgence: row.urgence,
    description: row.description,
    ecoleId: row.ecole_id,
    createurId: row.createur_id,
    interlocuteurCible: row.interlocuteur_cible ?? undefined,
    derniereMaj: row.derniere_maj,
    nbPiecesJointes: row.nb_pieces_jointes,
    nbCommentaires: row.nb_commentaires,
    visibilityScope: row.visibility_scope,
    historique: (row.historique ?? []).map(mapHistoriqueEvent),
  };
}

export function mapPieceJointe(row: PieceJointeRow): PieceJointe {
  return {
    id: row.id,
    dossierId: row.dossier_id,
    nom: row.nom,
    type: row.type,
    taille: row.taille,
    ajoutePar: row.ajoute_par,
    date: row.date,
    visibilityScope: row.visibility_scope ?? undefined,
  };
}

export function mapCommentaire(row: CommentaireRow): CommentaireDossier {
  return {
    id: row.id,
    dossierId: row.dossier_id,
    auteurNom: row.auteur_nom,
    roleLabel: row.role_label,
    date: row.date,
    contenu: row.contenu,
    important: row.important,
    visibilityScope: row.visibility_scope ?? undefined,
  };
}

export function mapRendezVous(row: RendezVousRow): RendezVous {
  return {
    id: row.id,
    titre: row.titre,
    date: row.date,
    heure: row.heure,
    lieu: row.lieu,
    participantsNoms: row.participants_noms,
    dossierLieId: row.dossier_lie_id ?? undefined,
    dossierLieTitre: row.dossier_lie_titre ?? undefined,
    statut: row.statut,
    piecesJointes: row.pieces_jointes,
    visibilityScope: row.visibility_scope,
  };
}

export function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    titre: row.titre,
    expediteur: row.expediteur,
    date: row.date,
    priorite: row.priorite,
    contenu: row.contenu,
    lu: row.lu,
    piecesJointes: row.pieces_jointes,
    visibilityScope: row.visibility_scope,
  };
}

export function mapAncienAdmin(row: AncienAdminRow): AncienAdmin {
  return {
    id: row.id,
    nom: row.nom,
    fonction: row.fonction,
    association: row.association ?? undefined,
    annees: row.annees,
    note: row.note ?? undefined,
  };
}
