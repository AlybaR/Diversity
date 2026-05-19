// Types partagés de l'application "Autour de l'École" — données fictives

export type Urgence = 'faible' | 'moyenne' | 'elevee';

export type StatutDossier =
  | 'brouillon'
  | 'partage_representants'
  | 'transmis_mairie'
  | 'recu'
  | 'en_cours_analyse'
  | 'en_attente_information'
  | 'rdv_propose'
  | 'action_programmee'
  | 'resolu'
  | 'classe_sans_suite'
  | 'hors_competence';

export type Categorie =
  | 'securite'
  | 'voirie'
  | 'batiment'
  | 'travaux'
  | 'sanitaires'
  | 'restauration'
  | 'periscolaire'
  | 'carte_scolaire'
  | 'communication'
  | 'accessibilite'
  | 'rendez_vous'
  | 'autre';

export type Role = 'parent_admin' | 'parent_contributeur' | 'mairie_admin' | 'elu' | 'direction';

export type StatutRDV = 'demande' | 'creneaux_proposes' | 'confirme' | 'passe' | 'annule';

export type PrioriteMessage = 'normale' | 'importante' | 'urgente';

// Scope de visibilité d'un objet (dossier, message, RDV, pièce jointe, commentaire).
// Chaque école a 4 canaux distincts — l'école est le CONTEXTE, pas le canal de visibilité.
//
// 'parents_mairie'      : canal privé parents élus ↔ mairie. La direction ne voit RIEN.
//                         Sujets : demandes collectives, médiation, difficultés avec la direction.
//
// 'direction_mairie'    : canal privé direction ↔ mairie. Les parents ne voient RIEN.
//                         Sujets : tensions avec représentants, arbitrages, alertes internes.
//
// 'partage_tripartite'  : canal partagé parents + direction + mairie. Tout le monde voit.
//                         Sujets : travaux, sécurité, conseils d'école, messages officiels.
//
// 'mairie_interne'      : canal interne à la mairie (agents + élus). Personne d'autre ne voit.
//                         Sujets : notes de service, instruction inter-services.
export type VisibilityScope =
  | 'parents_mairie'
  | 'direction_mairie'
  | 'partage_tripartite'
  | 'mairie_interne';

// Matrice d'accès rôle × scope. Source unique de vérité de l'isolation.
// Toute vérification de visibilité passe par ce helper côté service ET côté guard d'écran.
export function canRoleSeeScope(role: Role, scope: VisibilityScope): boolean {
  switch (scope) {
    case 'parents_mairie':
      return (
        role === 'parent_admin' ||
        role === 'parent_contributeur' ||
        role === 'mairie_admin' ||
        role === 'elu'
      );
    case 'direction_mairie':
      return role === 'direction' || role === 'mairie_admin' || role === 'elu';
    case 'partage_tripartite':
      return true;
    case 'mairie_interne':
      return role === 'mairie_admin' || role === 'elu';
  }
}

// Libellé court d'un scope pour l'UI (badge).
export function scopeShortLabel(scope: VisibilityScope): string {
  switch (scope) {
    case 'parents_mairie':
      return 'Parents + mairie';
    case 'direction_mairie':
      return 'Direction + mairie';
    case 'partage_tripartite':
      return 'Parents + direction + mairie';
    case 'mairie_interne':
      return 'Mairie interne';
  }
}

export interface Mairie {
  id: string;
  nom: string;
}

export interface Ecole {
  id: string;
  nom: string;
  adresse: string;
  cle: string;
  directionNom: string;
  collectiviteId: string;
  anneeScolaire: string;
}

export interface Personne {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role: Role;
  association?: string;
  ecoleId?: string;
  service?: string;
  fonction?: string;
  actif: boolean;
}

export interface ContactMairie {
  id: string;
  nom: string;
  fonction: string;
  service: string;
  email: string;
  telephone?: string;
  perimetre: string;
  categoriesLiees: Categorie[];
}

export interface AncienAdmin {
  id: string;
  nom: string;
  fonction:
    | 'Ancien président'
    | 'Ancienne présidente'
    | 'Ancien administrateur'
    | 'Ancienne administratrice';
  association?: string;
  annees: string;
  note?: string;
}

export interface DocumentLie {
  id: string;
  nom: string;
  type: 'image' | 'pdf' | 'document';
  taille: string;
}

export interface Dossier {
  id: string;
  titre: string;
  categorie: Categorie;
  statut: StatutDossier;
  urgence: Urgence;
  description: string;
  ecoleId: string;
  createurId: string;
  interlocuteurCible?: string;
  derniereMaj: string;
  nbPiecesJointes: number;
  nbCommentaires: number;
  historique: HistoriqueEvent[];
  visibilityScope: VisibilityScope;
}

export interface PieceJointe {
  id: string;
  dossierId: string;
  nom: string;
  type: 'image' | 'pdf' | 'document';
  taille: string;
  ajoutePar: string;
  date: string;
  // Optionnel : un commentaire/pièce jointe peut être plus restrictif que son dossier
  // (par ex. note interne mairie sur un dossier partagé). Si absent → hérite du scope du dossier.
  visibilityScope?: VisibilityScope;
}

export interface CommentaireDossier {
  id: string;
  dossierId: string;
  auteurNom: string;
  roleLabel: string;
  date: string;
  contenu: string;
  important?: boolean;
  // Hérite du scope du dossier si absent. Permet d'avoir des commentaires plus restrictifs
  // (note mairie interne sur un dossier partage_tripartite).
  visibilityScope?: VisibilityScope;
}

export interface HistoriqueEvent {
  id: string;
  date: string;
  type:
    | 'creation'
    | 'envoi'
    | 'reception'
    | 'analyse'
    | 'rdv'
    | 'action'
    | 'resolution'
    | 'partage';
  acteurNom: string;
  description: string;
}

export interface RendezVous {
  id: string;
  titre: string;
  date: string;
  heure: string;
  lieu: string;
  participantsNoms: string[];
  dossierLieId?: string;
  dossierLieTitre?: string;
  statut: StatutRDV;
  piecesJointes?: DocumentLie[];
  visibilityScope: VisibilityScope;
}

export interface Message {
  id: string;
  titre: string;
  expediteur: string;
  date: string;
  priorite: PrioriteMessage;
  contenu: string;
  lu: boolean;
  piecesJointes?: DocumentLie[];
  visibilityScope: VisibilityScope;
}
