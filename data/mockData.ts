// Données fictives centralisées — Autour de l'École
// Aucune donnée réelle. Utilisé pour la démonstration de l'app.

import type {
  AncienAdmin,
  Categorie,
  CommentaireDossier,
  ContactMairie,
  Dossier,
  Ecole,
  Mairie,
  Message,
  Personne,
  PieceJointe,
  RendezVous,
  StatutDossier,
  Urgence,
} from '../types';

// Helper visuel — la mairie a son propre service éducation listé comme contact
// (importé en données pour les nouveaux dossiers privés mairie ↔ direction).

// ============================================================================
// Collectivité
// ============================================================================
export const MAIRIE: Mairie = {
  id: 'mairie-montreuil',
  nom: 'Ville de Montreuil-sur-Seine',
};

// ============================================================================
// Écoles
// ============================================================================
export const ECOLES: Ecole[] = [
  {
    id: 'ecole-jaures',
    nom: 'École élémentaire Jean Jaurès',
    adresse: '12 rue Jean Jaurès, Montreuil-sur-Seine',
    cle: 'JAURES-2026',
    directionNom: 'Mme Girard',
    collectiviteId: 'mairie-montreuil',
    anneeScolaire: '2026-2027',
  },
  {
    id: 'ecole-louise-michel',
    nom: 'École maternelle Louise Michel',
    adresse: '5 place Louise Michel, Montreuil-sur-Seine',
    cle: 'LOUISEM-2026',
    directionNom: 'M. Bardot',
    collectiviteId: 'mairie-montreuil',
    anneeScolaire: '2026-2027',
  },
  {
    id: 'ecole-hugo',
    nom: 'École primaire Victor Hugo',
    adresse: '21 avenue Victor Hugo, Montreuil-sur-Seine',
    cle: 'HUGO-2026',
    directionNom: 'Mme Lemoine',
    collectiviteId: 'mairie-montreuil',
    anneeScolaire: '2026-2027',
  },
  {
    id: 'ecole-veil',
    nom: 'École élémentaire Simone Veil',
    adresse: '8 rue Simone Veil, Montreuil-sur-Seine',
    cle: 'VEIL-2026',
    directionNom: 'M. Renard',
    collectiviteId: 'mairie-montreuil',
    anneeScolaire: '2026-2027',
  },
];

// ============================================================================
// Personnes (parents élus, agents mairie, élus, direction)
// ============================================================================
export const PERSONNES: Personne[] = [
  {
    id: 'personne-nadia',
    prenom: 'Nadia',
    nom: 'Benali',
    email: 'nadia.benali@example.org',
    role: 'parent_admin',
    association: 'Parents Indépendants',
    ecoleId: 'ecole-jaures',
    actif: true,
  },
  {
    id: 'personne-marc',
    prenom: 'Marc',
    nom: 'Laurent',
    email: 'marc.laurent@example.org',
    role: 'parent_contributeur',
    association: 'FCPE',
    ecoleId: 'ecole-jaures',
    actif: true,
  },
  {
    id: 'personne-claire',
    prenom: 'Claire',
    nom: 'Moreau',
    email: 'claire.moreau@montreuil-sur-seine.fr',
    role: 'mairie_admin',
    service: 'Éducation',
    actif: true,
  },
  {
    id: 'personne-thomas',
    prenom: 'Thomas',
    nom: 'Lefèvre',
    email: 't.lefevre@montreuil-sur-seine.fr',
    role: 'elu',
    fonction: "Adjoint à l'éducation",
    actif: true,
  },
  {
    id: 'personne-girard',
    prenom: 'Mme',
    nom: 'Girard',
    email: 'direction.jaures@ac-versailles.fr',
    role: 'direction',
    fonction: 'Directrice',
    ecoleId: 'ecole-jaures',
    actif: true,
  },
];

export const UTILISATEUR_COURANT = PERSONNES[0]; // Nadia Benali (parent administrateur)

export const CONTACTS_MAIRIE: ContactMairie[] = [
  {
    id: 'contact-education',
    nom: 'Claire Moreau',
    fonction: 'Référente écoles élémentaires',
    service: 'Service Éducation',
    email: 'claire.moreau@montreuil-sur-seine.fr',
    telephone: '01 42 00 10 23',
    perimetre: 'Coordination mairie-écoles, dossiers transverses et rendez-vous',
    categoriesLiees: ['communication', 'rendez_vous', 'carte_scolaire'],
  },
  {
    id: 'contact-voirie',
    nom: 'Samir Aït',
    fonction: 'Chargé des abords scolaires',
    service: 'Service Voirie',
    email: 'samir.ait@montreuil-sur-seine.fr',
    telephone: '01 42 00 11 08',
    perimetre: 'Sécurité piétonne, circulation, signalisation et cheminements',
    categoriesLiees: ['securite', 'voirie', 'accessibilite'],
  },
  {
    id: 'contact-batiment',
    nom: 'Hélène Petit',
    fonction: 'Responsable maintenance écoles',
    service: 'Service Bâtiment',
    email: 'helene.petit@montreuil-sur-seine.fr',
    telephone: '01 42 00 12 41',
    perimetre: 'Bâtiments scolaires, sanitaires, travaux et interventions techniques',
    categoriesLiees: ['batiment', 'travaux', 'sanitaires'],
  },
  {
    id: 'contact-restauration',
    nom: 'Nora Vidal',
    fonction: 'Coordinatrice pause méridienne',
    service: 'Restauration et périscolaire',
    email: 'nora.vidal@montreuil-sur-seine.fr',
    telephone: '01 42 00 13 15',
    perimetre: 'Cantine, accueils périscolaires et organisation du temps du midi',
    categoriesLiees: ['restauration', 'periscolaire'],
  },
  {
    id: 'contact-cabinet',
    nom: 'Thomas Lefèvre',
    fonction: "Adjoint à l'éducation",
    service: 'Cabinet de l’élu',
    email: 't.lefevre@montreuil-sur-seine.fr',
    perimetre: 'Arbitrages politiques, sectorisation et sujets nécessitant une décision élue',
    categoriesLiees: ['carte_scolaire', 'autre'],
  },
];

export const ANCIENS_ADMINS: AncienAdmin[] = [
  {
    id: 'ancien-marie-dupont',
    nom: 'Marie Dupont',
    fonction: 'Ancienne présidente',
    association: 'FCPE',
    annees: '2024-2026',
    note: 'Passation utile sur les dossiers sécurité aux abords.',
  },
  {
    id: 'ancien-karim-saidi',
    nom: 'Karim Saïdi',
    fonction: 'Ancien administrateur',
    association: 'Parents Indépendants',
    annees: '2023-2024',
    note: 'Ancien référent restauration, accès révoqué.',
  },
];

// ============================================================================
// Dossiers fictifs
// ============================================================================
export const DOSSIERS: Dossier[] = [
  {
    id: 'dossier-passage-pieton',
    titre: "Passage piéton dangereux devant l'école",
    categorie: 'securite',
    statut: 'transmis_mairie',
    urgence: 'elevee',
    description:
      "Plusieurs familles signalent une difficulté récurrente à traverser devant l'école aux horaires d'entrée et de sortie. Le marquage au sol est effacé et il n'y a plus de signalisation lumineuse.",
    ecoleId: 'ecole-jaures',
    createurId: 'personne-nadia',
    interlocuteurCible: 'Service Voirie',
    derniereMaj: '17 mai 2026',
    nbPiecesJointes: 2,
    nbCommentaires: 5,
    historique: [
      {
        id: 'h1',
        date: '10 mai 2026',
        type: 'creation',
        acteurNom: 'Nadia Benali',
        description: 'Dossier créé',
      },
      {
        id: 'h2',
        date: '12 mai 2026',
        type: 'envoi',
        acteurNom: 'Nadia Benali',
        description: 'Partagé aux représentants',
      },
      {
        id: 'h3',
        date: '15 mai 2026',
        type: 'envoi',
        acteurNom: 'Nadia Benali',
        description: 'Transmis à la mairie',
      },
      {
        id: 'h4',
        date: '17 mai 2026',
        type: 'reception',
        acteurNom: 'Service Éducation',
        description: 'Reçu — analyse en cours',
      },
    ],
    visibilityScope: 'partage_tripartite',
  },
  {
    id: 'dossier-sanitaires',
    titre: 'Sanitaires du premier étage régulièrement fermés',
    categorie: 'sanitaires',
    statut: 'en_cours_analyse',
    urgence: 'moyenne',
    description:
      'Les représentants souhaitent comprendre pourquoi les sanitaires du premier étage sont régulièrement fermés et identifier les solutions possibles pour rétablir un accès permanent.',
    ecoleId: 'ecole-jaures',
    createurId: 'personne-marc',
    interlocuteurCible: 'Service Bâtiment',
    derniereMaj: '14 mai 2026',
    nbPiecesJointes: 1,
    nbCommentaires: 3,
    historique: [
      {
        id: 'h1',
        date: '5 mai 2026',
        type: 'creation',
        acteurNom: 'Marc Laurent',
        description: 'Dossier créé',
      },
      {
        id: 'h2',
        date: '8 mai 2026',
        type: 'envoi',
        acteurNom: 'Marc Laurent',
        description: 'Transmis à la mairie',
      },
      {
        id: 'h3',
        date: '14 mai 2026',
        type: 'analyse',
        acteurNom: 'Service Bâtiment',
        description: "En cours d'analyse",
      },
    ],
    visibilityScope: 'parents_mairie',
  },
  {
    id: 'dossier-sectorisation',
    titre: 'Besoin de clarification sur la sectorisation 2026',
    categorie: 'carte_scolaire',
    statut: 'resolu',
    urgence: 'faible',
    description:
      'Plusieurs familles demandent des précisions sur les changements possibles de sectorisation pour la rentrée 2026 et leur impact sur le quartier.',
    ecoleId: 'ecole-jaures',
    createurId: 'personne-nadia',
    interlocuteurCible: 'Cabinet adjoint éducation',
    derniereMaj: '11 mai 2026',
    nbPiecesJointes: 0,
    nbCommentaires: 8,
    historique: [
      {
        id: 'h1',
        date: '20 avril 2026',
        type: 'creation',
        acteurNom: 'Nadia Benali',
        description: 'Dossier créé',
      },
      {
        id: 'h2',
        date: '25 avril 2026',
        type: 'envoi',
        acteurNom: 'Nadia Benali',
        description: 'Transmis à la mairie',
      },
      {
        id: 'h3',
        date: '2 mai 2026',
        type: 'reception',
        acteurNom: 'Cabinet adjoint éducation',
        description: 'Réponse publiée',
      },
      {
        id: 'h4',
        date: '11 mai 2026',
        type: 'resolution',
        acteurNom: 'Cabinet adjoint éducation',
        description: 'Dossier résolu',
      },
    ],
    visibilityScope: 'parents_mairie',
  },
  {
    id: 'dossier-rdv-conseil',
    titre: "Demande de rendez-vous avant le prochain conseil d'école",
    categorie: 'rendez_vous',
    statut: 'rdv_propose',
    urgence: 'moyenne',
    description:
      "Les parents élus souhaitent préparer les sujets prioritaires avant le prochain conseil d'école avec la direction et le service éducation.",
    ecoleId: 'ecole-jaures',
    createurId: 'personne-nadia',
    interlocuteurCible: 'Service Éducation',
    derniereMaj: '16 mai 2026',
    nbPiecesJointes: 0,
    nbCommentaires: 2,
    historique: [
      {
        id: 'h1',
        date: '13 mai 2026',
        type: 'creation',
        acteurNom: 'Nadia Benali',
        description: 'Dossier créé',
      },
      {
        id: 'h2',
        date: '14 mai 2026',
        type: 'envoi',
        acteurNom: 'Nadia Benali',
        description: 'Transmis à la mairie',
      },
      {
        id: 'h3',
        date: '16 mai 2026',
        type: 'rdv',
        acteurNom: 'Claire Moreau',
        description: 'Créneaux proposés',
      },
    ],
    visibilityScope: 'partage_tripartite',
  },
  {
    id: 'dossier-batiment-salle12',
    titre: 'Intervention bâtiment urgente — salle 12',
    categorie: 'batiment',
    statut: 'transmis_mairie',
    urgence: 'moyenne',
    description:
      "La direction signale une infiltration au plafond de la salle 12 après les pluies du week-end. Demande d'intervention du service Bâtiment pour expertise et sécurisation avant la reprise de la semaine.",
    ecoleId: 'ecole-jaures',
    createurId: 'personne-girard',
    interlocuteurCible: 'Service Bâtiment',
    derniereMaj: '18 mai 2026',
    nbPiecesJointes: 1,
    nbCommentaires: 1,
    historique: [
      {
        id: 'h1',
        date: '18 mai 2026',
        type: 'creation',
        acteurNom: 'Mme Girard',
        description: 'Dossier créé par la direction',
      },
      {
        id: 'h2',
        date: '18 mai 2026',
        type: 'envoi',
        acteurNom: 'Mme Girard',
        description: 'Transmis à la mairie — service Bâtiment',
      },
    ],
    visibilityScope: 'partage_tripartite',
  },
];

// Fixtures de test pour les scripts d'isolation des rôles.
// Elles ne sont pas listées dans les parcours visibles, mais restent accessibles
// via getDossierById pour vérifier les guards d'URL directe.
export const DOSSIERS_TEST_VISIBILITE: Dossier[] = [
  {
    // Canal PARENTS_MAIRIE — invisible direction.
    // Cas 1 du briefing utilisateur : « difficulté de communication avec la direction ».
    id: 'dossier-communication-direction',
    titre: 'Difficulté de communication avec la direction',
    categorie: 'communication',
    statut: 'transmis_mairie',
    urgence: 'moyenne',
    description:
      'Plusieurs familles signalent des difficultés à obtenir un rendez-vous avec la direction et un manque de retour sur leurs sollicitations. Nous souhaitons en parler avec la mairie pour identifier les leviers de médiation possibles avant tout échange tripartite.',
    ecoleId: 'ecole-jaures',
    createurId: 'personne-nadia',
    interlocuteurCible: 'Service Éducation',
    derniereMaj: '15 mai 2026',
    nbPiecesJointes: 0,
    nbCommentaires: 2,
    historique: [
      {
        id: 'h1',
        date: '13 mai 2026',
        type: 'creation',
        acteurNom: 'Nadia Benali',
        description: 'Dossier créé — canal privé parents/mairie',
      },
      {
        id: 'h2',
        date: '14 mai 2026',
        type: 'envoi',
        acteurNom: 'Nadia Benali',
        description: 'Transmis à la mairie',
      },
      {
        id: 'h3',
        date: '15 mai 2026',
        type: 'reception',
        acteurNom: 'Claire Moreau',
        description: 'Reçu — analyse en cours, médiation envisagée',
      },
    ],
    visibilityScope: 'parents_mairie',
  },
  {
    // Canal DIRECTION_MAIRIE — invisible parents.
    // Cas 2 du briefing utilisateur : « tensions avec certains représentants ».
    id: 'dossier-tensions-representants',
    titre: 'Tensions récurrentes avec certains représentants',
    categorie: 'communication',
    statut: 'transmis_mairie',
    urgence: 'moyenne',
    description:
      'La direction sollicite la mairie sur des échanges difficiles avec deux représentants de parents qui contournent les canaux institutionnels et publient des informations partielles. Nous souhaitons un point de cadrage avant de répondre publiquement.',
    ecoleId: 'ecole-jaures',
    createurId: 'personne-girard',
    interlocuteurCible: "Cabinet de l'adjoint à l'éducation",
    derniereMaj: '17 mai 2026',
    nbPiecesJointes: 0,
    nbCommentaires: 1,
    historique: [
      {
        id: 'h1',
        date: '16 mai 2026',
        type: 'creation',
        acteurNom: 'Mme Girard',
        description: 'Dossier créé — canal privé direction/mairie',
      },
      {
        id: 'h2',
        date: '16 mai 2026',
        type: 'envoi',
        acteurNom: 'Mme Girard',
        description: 'Transmis à la mairie',
      },
      {
        id: 'h3',
        date: '17 mai 2026',
        type: 'reception',
        acteurNom: 'Thomas Lefèvre',
        description: 'Reçu — arbitrage à programmer',
      },
    ],
    visibilityScope: 'direction_mairie',
  },
  {
    // Canal MAIRIE_INTERNE — invisible parents ET direction.
    id: 'dossier-note-budget',
    titre: 'Arbitrage budgétaire — écoles élémentaires 2026-2027',
    categorie: 'autre',
    statut: 'en_cours_analyse',
    urgence: 'faible',
    description:
      "Note interne au service éducation pour préparer l'arbitrage du budget travaux des écoles élémentaires. Synthèse des demandes terrain et propositions de priorisation avant présentation à l'adjoint.",
    ecoleId: 'ecole-jaures',
    createurId: 'personne-claire',
    interlocuteurCible: "Cabinet de l'adjoint à l'éducation",
    derniereMaj: '12 mai 2026',
    nbPiecesJointes: 0,
    nbCommentaires: 0,
    historique: [
      {
        id: 'h1',
        date: '10 mai 2026',
        type: 'creation',
        acteurNom: 'Claire Moreau',
        description: 'Note interne créée',
      },
      {
        id: 'h2',
        date: '12 mai 2026',
        type: 'analyse',
        acteurNom: 'Thomas Lefèvre',
        description: 'En cours de relecture',
      },
    ],
    visibilityScope: 'mairie_interne',
  },
];

export const PIECES_JOINTES: PieceJointe[] = [
  {
    id: 'piece-passage-photo-1',
    dossierId: 'dossier-passage-pieton',
    nom: 'passage-pieton-efface.jpg',
    type: 'image',
    taille: '1,8 Mo',
    ajoutePar: 'Nadia Benali',
    date: '10 mai 2026',
  },
  {
    id: 'piece-passage-pdf-1',
    dossierId: 'dossier-passage-pieton',
    nom: 'signalements-familles.pdf',
    type: 'pdf',
    taille: '642 Ko',
    ajoutePar: 'Nadia Benali',
    date: '12 mai 2026',
  },
  {
    id: 'piece-sanitaires-photo-1',
    dossierId: 'dossier-sanitaires',
    nom: 'affichage-fermeture-sanitaire.png',
    type: 'image',
    taille: '920 Ko',
    ajoutePar: 'Marc Laurent',
    date: '6 mai 2026',
  },
];

export const COMMENTAIRES_DOSSIER: CommentaireDossier[] = [
  {
    id: 'comment-passage-1',
    dossierId: 'dossier-passage-pieton',
    auteurNom: 'Marc Laurent',
    roleLabel: 'Parent élu',
    date: '12 mai 2026',
    contenu:
      "Même constat côté maternelle : les familles traversent souvent entre deux voitures aux heures d'entrée.",
    important: true,
  },
  {
    id: 'comment-passage-2',
    dossierId: 'dossier-passage-pieton',
    auteurNom: 'Mme Girard',
    roleLabel: 'Direction école',
    date: '13 mai 2026',
    contenu:
      'La direction confirme avoir reçu trois signalements en une semaine. Un rappel de vigilance a été fait aux familles.',
  },
  {
    id: 'comment-passage-3',
    dossierId: 'dossier-passage-pieton',
    auteurNom: 'Claire Moreau',
    roleLabel: 'Service éducation',
    date: '17 mai 2026',
    contenu:
      'Le dossier est transmis au service Voirie pour vérification du marquage et chiffrage de la signalisation.',
  },
  {
    id: 'comment-sanitaires-1',
    dossierId: 'dossier-sanitaires',
    auteurNom: 'Marc Laurent',
    roleLabel: 'Parent élu',
    date: '8 mai 2026',
    contenu:
      "Les fermetures semblent concentrées après la pause méridienne. Nous ajoutons la photo de l'affichage.",
  },
  {
    id: 'comment-sectorisation-1',
    dossierId: 'dossier-sectorisation',
    auteurNom: "Cabinet de l'adjoint",
    roleLabel: 'Mairie',
    date: '2 mai 2026',
    contenu:
      'Une réunion publique sera organisée avant toute modification de périmètre. Le calendrier sera partagé fin mai.',
  },
  {
    id: 'comment-rdv-1',
    dossierId: 'dossier-rdv-conseil',
    auteurNom: 'Claire Moreau',
    roleLabel: 'Service éducation',
    date: '16 mai 2026',
    contenu:
      'Deux créneaux sont proposés pour préparer le conseil avec les représentants volontaires.',
  },
];

// ============================================================================
// Rendez-vous fictifs
// ============================================================================
export const RENDEZ_VOUS: RendezVous[] = [
  {
    id: 'rdv-securite',
    titre: 'Point sécurité abords école',
    date: '23 mai 2026',
    heure: '18h00',
    lieu: 'Mairie',
    participantsNoms: ['Nadia Benali', 'Claire Moreau', 'Mme Girard'],
    dossierLieId: 'dossier-passage-pieton',
    dossierLieTitre: "Passage piéton dangereux devant l'école",
    statut: 'confirme',
    piecesJointes: [
      {
        id: 'rdv-securite-ordre-du-jour',
        nom: 'ordre-du-jour-securite.pdf',
        type: 'pdf',
        taille: '184 Ko',
      },
    ],
    visibilityScope: 'partage_tripartite',
  },
  {
    id: 'rdv-conseil',
    titre: "Préparation conseil d'école",
    date: '29 mai 2026',
    heure: '17h30',
    lieu: 'École Jean Jaurès',
    participantsNoms: ['Nadia Benali', 'Marc Laurent'],
    dossierLieId: 'dossier-rdv-conseil',
    dossierLieTitre: "Demande de rendez-vous avant le prochain conseil d'école",
    statut: 'demande',
    visibilityScope: 'parents_mairie',
  },
];

export const RENDEZ_VOUS_TEST_VISIBILITE: RendezVous[] = [
  {
    // RDV privé direction ↔ mairie sur le dossier de tensions parents.
    id: 'rdv-tensions',
    titre: 'Point de cadrage avec direction',
    date: '26 mai 2026',
    heure: '14h00',
    lieu: "Bureau de l'adjoint",
    participantsNoms: ['Mme Girard', 'Thomas Lefèvre'],
    dossierLieId: 'dossier-tensions-representants',
    dossierLieTitre: 'Tensions récurrentes avec certains représentants',
    statut: 'confirme',
    visibilityScope: 'direction_mairie',
  },
];

// ============================================================================
// Messages mairie fictifs
// ============================================================================
export const MESSAGES: Message[] = [
  {
    id: 'message-travaux',
    titre: "Travaux prévus rue de l'École",
    expediteur: 'Service éducation',
    date: '18 mai 2026',
    priorite: 'importante',
    contenu:
      "Des travaux de voirie sont prévus à proximité de l'école Jean Jaurès entre le 1er et le 15 juin. Une information complémentaire sera transmise aux représentants dans les prochains jours afin de coordonner la sécurité aux abords pendant la durée du chantier.",
    lu: false,
    piecesJointes: [
      {
        id: 'message-travaux-plan',
        nom: 'plan-emprise-travaux.pdf',
        type: 'pdf',
        taille: '318 Ko',
      },
    ],
    visibilityScope: 'partage_tripartite',
  },
  {
    id: 'message-sectorisation',
    titre: "Réunion d'information sectorisation 2026",
    expediteur: "Cabinet de l'adjoint à l'éducation",
    date: '15 mai 2026',
    priorite: 'normale',
    contenu:
      "Une réunion d'information sera organisée pour présenter les évolutions envisagées de la carte scolaire pour la rentrée 2026. Les représentants sont invités à y participer pour porter la voix des familles.",
    lu: true,
    visibilityScope: 'parents_mairie',
  },
  {
    id: 'message-vigipirate',
    titre: 'Consignes Vigipirate rentrée 2026-2027',
    expediteur: "Cabinet de l'adjoint à l'éducation",
    date: '16 mai 2026',
    priorite: 'importante',
    contenu:
      "Vous trouverez ci-joint la note de consignes Vigipirate à appliquer dès la rentrée 2026-2027 : contrôle des accès, accueil des familles, exercices PPMS et personnes-ressources mairie. Merci de relayer auprès de l'équipe enseignante et de confirmer la prise en compte avant le 15 juin.",
    lu: false,
    piecesJointes: [
      {
        id: 'message-vigipirate-note',
        nom: 'consignes-vigipirate-2026-2027.pdf',
        type: 'pdf',
        taille: '412 Ko',
      },
    ],
    visibilityScope: 'direction_mairie',
  },
];

// ============================================================================
// Référentiels (statuts, catégories, urgences) — pour filtres et labels
// ============================================================================
export const STATUTS_DOSSIER: { value: StatutDossier; label: string }[] = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'partage_representants', label: 'Partagé aux représentants' },
  { value: 'transmis_mairie', label: 'Transmis à la mairie' },
  { value: 'recu', label: 'Reçu' },
  { value: 'en_cours_analyse', label: "En cours d'analyse" },
  { value: 'en_attente_information', label: "En attente d'information" },
  { value: 'rdv_propose', label: 'Rendez-vous proposé' },
  { value: 'action_programmee', label: 'Action programmée' },
  { value: 'resolu', label: 'Résolu' },
  { value: 'classe_sans_suite', label: 'Classé sans suite' },
  { value: 'hors_competence', label: 'Hors compétence' },
];

export const CATEGORIES: { value: Categorie; label: string }[] = [
  { value: 'securite', label: 'Sécurité' },
  { value: 'voirie', label: 'Voirie / abords' },
  { value: 'batiment', label: 'Bâtiment' },
  { value: 'travaux', label: 'Travaux' },
  { value: 'sanitaires', label: 'Sanitaires' },
  { value: 'restauration', label: 'Restauration' },
  { value: 'periscolaire', label: 'Périscolaire' },
  { value: 'carte_scolaire', label: 'Carte scolaire' },
  { value: 'communication', label: 'Communication' },
  { value: 'accessibilite', label: 'Accessibilité' },
  { value: 'rendez_vous', label: 'Rendez-vous' },
  { value: 'autre', label: 'Autre' },
];

export const URGENCES: { value: Urgence; label: string }[] = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'elevee', label: 'Élevée' },
];

// ============================================================================
// Statistiques tableau de bord (calculées sur les données ci-dessus)
// ============================================================================
export const STATS_PARENT = {
  dossiersOuverts: DOSSIERS.filter((d) => d.statut !== 'resolu' && d.statut !== 'classe_sans_suite')
    .length,
  dossiersUrgents: DOSSIERS.filter((d) => d.urgence === 'elevee' && d.statut !== 'resolu').length,
  enAttenteMairie: DOSSIERS.filter(
    (d) => d.statut === 'transmis_mairie' || d.statut === 'en_cours_analyse',
  ).length,
  dossiersArchives: 28,
  rdvRealises: 6,
  messagesMairie:
    MESSAGES.filter(
      (message) =>
        message.visibilityScope === 'parents_mairie' ||
        message.visibilityScope === 'partage_tripartite',
    ).length + 10,
};

export const STATS_MAIRIE = {
  nbEcoles: ECOLES.length,
  representantsActifs:
    PERSONNES.filter(
      (p) => (p.role === 'parent_admin' || p.role === 'parent_contributeur') && p.actif,
    ).length + 7,
  dossiersOuverts:
    DOSSIERS.filter((d) => d.statut !== 'resolu' && d.statut !== 'classe_sans_suite').length + 9,
  dossiersUrgents:
    DOSSIERS.filter((d) => d.urgence === 'elevee' && d.statut !== 'resolu').length + 2,
  ecolesASurveiller: 2,
  // Valeurs conservées pour de futurs tests de pilotage, non affichées dans le dashboard MVP.
  // delaiMoyenJours : moyenne du temps de première réponse mairie sur les dossiers traités ce mois.
  // deltaDelaiJours : variation par rapport au mois précédent (négatif = amélioration).
  // dossiersTraitesMois : nombre de dossiers passés à un statut "résolu" ou "classé sans suite" ce mois.
  // deltaDossiersTraitesMois : variation par rapport au mois précédent (positif = amélioration).
  delaiMoyenJours: 3.8,
  deltaDelaiJours: -0.5,
  dossiersTraitesMois: 12,
  deltaDossiersTraitesMois: 3,
};
