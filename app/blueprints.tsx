import { Text, View } from 'react-native';
import {
  BlueprintScreen,
  type BlueprintMetric,
  type BlueprintSection,
} from '../components/BlueprintScreen';

type BlueprintId =
  | 'onboarding'
  | 'school-select'
  | 'profile'
  | 'notifications-settings'
  | 'notifications'
  | 'search'
  | 'documents'
  | 'conseil-ecole'
  | 'bilan-annuel'
  | 'transfert-admin'
  | 'invitation'
  | 'anciens-representants'
  | 'orientation'
  | 'dossiers-similaires'
  | 'brouillons'
  | 'mairie-dossier-detail'
  | 'mairie-messages'
  | 'mairie-rendez-vous'
  | 'hors-competence'
  | 'demande-precision'
  | 'action-programmee'
  | 'compte-rendu-rdv'
  | 'modeles-messages'
  | 'categories'
  | 'services'
  | 'carte-ecoles';

interface BlueprintConfig {
  title: string;
  subtitle: string;
  summary: string;
  metrics?: BlueprintMetric[];
  sections: BlueprintSection[];
  bottomNav?: 'parent' | 'mairie';
  primaryLabel?: string;
  secondaryLabel?: string;
}

const parent = 'parent' as const;
const mairie = 'mairie' as const;

const configs: Record<BlueprintId, BlueprintConfig> = {
  onboarding: {
    title: 'Bienvenue',
    subtitle: 'Prise en main parent élu',
    summary:
      'Séquence courte après création de compte pour expliquer les règles de travail collectif, la confidentialité et les premiers gestes utiles.',
    metrics: [
      { label: 'Étapes', value: 4 },
      { label: 'Durée', value: '2 min' },
    ],
    sections: [
      {
        title: 'Parcours',
        rows: [
          {
            title: 'Comprendre le mandat',
            detail: 'Rôle parent élu, périmètre école, ton institutionnel.',
          },
          {
            title: 'Créer un premier dossier',
            detail: 'Catégorie, urgence, validation collective avant mairie.',
          },
          {
            title: 'Inviter son binôme',
            detail: 'Lien sécurisé et validation par administrateur école.',
          },
        ],
      },
    ],
    primaryLabel: 'Commencer',
  },
  'school-select': {
    title: 'Choix école',
    subtitle: 'Compte multi-écoles',
    summary:
      'Écran pour les représentants ou agents liés à plusieurs établissements, avec changement de contexte explicite.',
    metrics: [
      { label: 'Écoles disponibles', value: 4 },
      { label: 'École active', value: 'Jean Jaurès' },
    ],
    sections: [
      {
        title: 'Établissements',
        rows: [
          {
            title: 'École élémentaire Jean Jaurès',
            detail: '12 rue Jean Jaurès',
            badge: 'Active',
            tone: 'success',
          },
          {
            title: 'École maternelle Louise Michel',
            detail: '5 place Louise Michel',
            badge: 'Accès mairie',
          },
          {
            title: 'École primaire Victor Hugo',
            detail: '21 avenue Victor Hugo',
            badge: 'Lecture',
          },
        ],
      },
    ],
    primaryLabel: 'Continuer avec cette école',
  },
  profile: {
    title: 'Profil',
    subtitle: 'Nadia Benali',
    summary:
      'Gestion des coordonnées, du rôle, de la visibilité annuaire et des préférences de mandat parent élu.',
    bottomNav: parent,
    metrics: [
      { label: 'Rôle', value: 'Admin' },
      { label: 'Mandat', value: '2026-27' },
    ],
    sections: [
      {
        title: 'Identité',
        rows: [
          { title: 'Nadia Benali', detail: 'Parent élu administrateur · Parents Indépendants' },
          {
            title: 'nadia.benali@example.org',
            detail: 'Visible par la mairie et les représentants',
          },
          {
            title: 'Téléphone masqué',
            detail: 'Visible uniquement par les administrateurs école',
            badge: 'Privé',
          },
        ],
      },
      {
        title: 'Données personnelles',
        rows: [
          {
            title: 'Exporter mes données',
            detail: 'Prépare un ZIP RGPD avec profil, dossiers, messages et fichiers.',
          },
          {
            title: 'Demander suppression',
            detail: 'Conserve les traces institutionnelles anonymisées.',
          },
        ],
      },
    ],
    primaryLabel: 'Enregistrer les changements',
  },
  'notifications-settings': {
    title: 'Paramètres notifications',
    subtitle: 'Préférences parent élu',
    summary:
      'Réglage fin des notifications push et email pour éviter le bruit tout en gardant les alertes critiques.',
    bottomNav: parent,
    metrics: [
      { label: 'Canaux actifs', value: 2 },
      { label: 'Digest', value: 'Vendredi' },
    ],
    sections: [
      {
        title: 'Événements',
        rows: [
          {
            title: 'Nouveau message mairie',
            detail: 'Push + email immédiat',
            badge: 'Actif',
            tone: 'success',
          },
          {
            title: 'Changement statut dossier',
            detail: 'Push si urgence élevée, sinon résumé hebdo',
          },
          { title: 'Rappel rendez-vous', detail: 'J-1 et H-2 pour les rendez-vous confirmés' },
        ],
      },
    ],
    primaryLabel: 'Sauvegarder',
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Centre de suivi',
    summary:
      'Boîte de réception interne des événements importants, séparée des messages mairie longs.',
    bottomNav: parent,
    metrics: [
      { label: 'Non lues', value: 3, tone: 'warning' },
      { label: 'Cette semaine', value: 9 },
    ],
    sections: [
      {
        title: 'Aujourd’hui',
        rows: [
          {
            title: 'Réponse mairie reçue',
            detail: 'Passage piéton dangereux · Service Voirie',
            badge: 'Important',
            tone: 'warning',
          },
          { title: 'Rendez-vous confirmé', detail: '23 mai 2026 · 18h00 · Mairie' },
        ],
      },
      {
        title: 'Plus ancien',
        rows: [
          { title: 'Marc a commenté un dossier', detail: 'Sanitaires du premier étage' },
          { title: 'Invitation ouverte', detail: 'samira.ali@example.org' },
        ],
      },
    ],
    primaryLabel: 'Tout marquer comme lu',
  },
  search: {
    title: 'Recherche',
    subtitle: 'Globale école',
    summary:
      'Recherche transversale dans les dossiers, messages, pièces jointes, rendez-vous et représentants.',
    bottomNav: parent,
    metrics: [
      { label: 'Résultats récents', value: 12 },
      { label: 'Sources', value: 5 },
    ],
    sections: [
      {
        title: 'Résultats pour “sécurité”',
        rows: [
          {
            title: 'Passage piéton dangereux',
            detail: 'Dossier · urgence élevée',
            badge: 'Dossier',
            tone: 'danger',
          },
          { title: 'Point sécurité abords école', detail: 'Rendez-vous · 23 mai 2026' },
          { title: 'Travaux rue de l’École', detail: 'Message mairie · 18 mai 2026' },
        ],
      },
    ],
  },
  documents: {
    title: 'Documents',
    subtitle: 'Pièces jointes école',
    summary:
      'Bibliothèque des fichiers déposés sur les dossiers, avec statut antivirus, taille, type et origine.',
    bottomNav: parent,
    metrics: [
      { label: 'Fichiers', value: 18 },
      { label: 'Poids total', value: '32 Mo' },
    ],
    sections: [
      {
        title: 'Derniers fichiers',
        rows: [
          {
            title: 'passage-pieton-efface.jpg',
            detail: 'Dossier sécurité · 1,8 Mo',
            badge: 'Image',
          },
          { title: 'signalements-familles.pdf', detail: 'Dossier sécurité · 642 Ko', badge: 'PDF' },
          { title: 'compte-rendu-rdv.pdf', detail: 'Rendez-vous · 220 Ko', badge: 'PDF' },
        ],
      },
    ],
    primaryLabel: 'Ajouter un document',
  },
  'conseil-ecole': {
    title: "Conseil d'école",
    subtitle: 'Préparation collective',
    summary:
      'Prépare les points à porter en conseil, relie les dossiers concernés et produit une synthèse partageable.',
    bottomNav: parent,
    metrics: [
      { label: 'Points prêts', value: 5 },
      { label: 'À arbitrer', value: 2 },
    ],
    sections: [
      {
        title: 'Ordre du jour proposé',
        rows: [
          { title: 'Sécurité aux abords', detail: 'Relier dossier passage piéton + photos' },
          { title: 'Sanitaires étage', detail: 'Demander calendrier bâtiment' },
          { title: 'Sectorisation 2026', detail: 'Clarifier les prochaines étapes mairie' },
        ],
      },
    ],
    primaryLabel: 'Générer note conseil',
  },
  'bilan-annuel': {
    title: 'Bilan annuel',
    subtitle: 'Fin de mandat école',
    summary:
      "Récapitulatif de l'année scolaire : dossiers, réponses mairie, rendez-vous, décisions et sujets à transmettre.",
    bottomNav: parent,
    metrics: [
      { label: 'Dossiers', value: 32 },
      { label: 'Résolus', value: 18, tone: 'success' },
      { label: 'RDV', value: 6 },
      { label: 'À transmettre', value: 4, tone: 'warning' },
    ],
    sections: [
      {
        title: 'À retenir',
        rows: [
          {
            title: 'Sécurité piétonne',
            detail: 'Sujet prioritaire non clos, à suivre à la rentrée.',
          },
          { title: 'Sanitaires', detail: 'Amélioration partielle, action bâtiment programmée.' },
          { title: 'Dialogue mairie', detail: 'Délais moyens en baisse sur le dernier trimestre.' },
        ],
      },
    ],
    primaryLabel: 'Préparer le bilan PDF',
  },
  'transfert-admin': {
    title: 'Transfert administrateur',
    subtitle: 'Passage de relais',
    summary:
      'Permet à un parent administrateur sortant de transférer les droits de gestion à un autre élu validé.',
    bottomNav: parent,
    metrics: [
      { label: 'Admins actuels', value: 1 },
      { label: 'Candidats', value: 2 },
    ],
    sections: [
      {
        title: 'Candidats',
        rows: [
          {
            title: 'Marc Laurent',
            detail: 'Parent contributeur · FCPE',
            badge: 'Recommandé',
            tone: 'primary',
          },
          { title: 'Sophie Girard', detail: 'Invitation ouverte · en attente validation' },
        ],
      },
      {
        title: 'Sécurité',
        rows: [
          {
            title: 'Double confirmation',
            detail: 'Le transfert demande confirmation de l’ancien et du nouveau responsable.',
          },
          {
            title: 'Journalisation',
            detail: 'L’historique conserve le changement d’administrateur.',
          },
        ],
      },
    ],
    primaryLabel: 'Initier le transfert',
  },
  invitation: {
    title: 'Invitation',
    subtitle: 'Nouvel élu parent',
    summary:
      "Écran de suivi détaillé d'une invitation : destinataire, lien, expiration, rôle demandé et relances.",
    bottomNav: parent,
    metrics: [
      { label: 'Expire dans', value: '13j' },
      { label: 'Relances', value: 0 },
    ],
    sections: [
      {
        title: 'Invitation active',
        rows: [
          {
            title: 'samira.ali@example.org',
            detail: 'Rôle demandé : contributeur',
            badge: 'Envoyée',
            tone: 'primary',
          },
          { title: 'Lien sécurisé', detail: 'Valable uniquement pour l’école Jean Jaurès' },
        ],
      },
    ],
    primaryLabel: 'Relancer',
    secondaryLabel: 'Révoquer le lien',
  },
  'anciens-representants': {
    title: 'Anciens représentants',
    subtitle: 'Mémoire école',
    summary:
      'Liste les représentants des années précédentes, leurs rôles et les dossiers dont ils étaient référents.',
    bottomNav: parent,
    metrics: [
      { label: 'Anciens élus', value: 12 },
      { label: 'Années', value: 4 },
    ],
    sections: [
      {
        title: '2025-2026',
        rows: [
          { title: 'Marie Dupont', detail: 'Administratrice · 9 dossiers suivis' },
          { title: 'Pierre Martin', detail: 'Contributeur · référent sécurité' },
        ],
      },
      {
        title: 'Accès',
        rows: [
          {
            title: 'Accès révoqués',
            detail: 'Les anciens élus n’ont plus accès aux données nominatives.',
            badge: 'RGPD',
            tone: 'success',
          },
        ],
      },
    ],
  },
  orientation: {
    title: 'Orientation demande',
    subtitle: 'Aide au routage',
    summary:
      'Assistant de qualification pour choisir catégorie, urgence, service cible et pièces utiles avant création du dossier.',
    bottomNav: parent,
    metrics: [
      { label: 'Catégories', value: 12 },
      { label: 'Services', value: 7 },
    ],
    sections: [
      {
        title: 'Recommandations',
        rows: [
          {
            title: 'Sécurité / abords',
            detail: 'Service Voirie + Direction école',
            badge: 'Urgence possible',
            tone: 'danger',
          },
          { title: 'Sanitaires', detail: 'Service Bâtiment · joindre photos et localisation' },
          {
            title: 'Carte scolaire',
            detail: 'Cabinet adjoint éducation · privilégier synthèse collective',
          },
        ],
      },
    ],
    primaryLabel: 'Créer avec ces paramètres',
  },
  'dossiers-similaires': {
    title: 'Dossiers similaires',
    subtitle: 'Capitalisation',
    summary:
      'Compare un nouveau dossier aux cas précédents pour éviter de repartir de zéro et reprendre les formulations utiles.',
    bottomNav: parent,
    metrics: [
      { label: 'Similarités', value: 3 },
      { label: 'Résolus', value: 2 },
    ],
    sections: [
      {
        title: 'Cas proches',
        rows: [
          {
            title: 'Passage piéton 2025',
            detail: 'Résolu après intervention Voirie · délai 21 jours',
            badge: 'Résolu',
            tone: 'success',
          },
          { title: 'Stationnement gênant', detail: 'Action programmée avec police municipale' },
          { title: 'Signalisation école Victor Hugo', detail: 'Réponse mairie réutilisable' },
        ],
      },
    ],
    primaryLabel: 'Reprendre la structure',
  },
  brouillons: {
    title: 'Brouillons',
    subtitle: 'Demandes non transmises',
    summary:
      'Espace de travail pour préparer des dossiers sans les envoyer, puis les soumettre à validation collective.',
    bottomNav: parent,
    metrics: [
      { label: 'Brouillons', value: 4 },
      { label: 'À compléter', value: 2, tone: 'warning' },
    ],
    sections: [
      {
        title: 'En cours',
        rows: [
          {
            title: 'Arceaux vélo devant l’école',
            detail: 'Manque une photo et catégorie à confirmer',
          },
          {
            title: 'Organisation sortie piscine',
            detail: 'Prêt pour validation collective',
            badge: 'Prêt',
            tone: 'success',
          },
          { title: 'Question menus végétariens', detail: 'À reformuler sans donnée individuelle' },
        ],
      },
    ],
    primaryLabel: 'Nouveau brouillon',
  },
  'mairie-dossier-detail': {
    title: 'Dossier mairie',
    subtitle: 'Instruction interne',
    summary:
      'Vue détaillée côté mairie avec qualification, historique, service responsable, risques et prochaine action.',
    bottomNav: mairie,
    metrics: [
      { label: 'Urgence', value: 'Élevée' },
      { label: 'Âge dossier', value: '9j' },
    ],
    sections: [
      {
        title: 'Analyse',
        rows: [
          {
            title: 'Passage piéton dangereux',
            detail: 'Signalement collectif parent + direction école',
          },
          {
            title: 'Service pressenti',
            detail: 'Voirie, avec copie service éducation',
            badge: 'À assigner',
            tone: 'warning',
          },
          { title: 'Pièces jointes', detail: '2 fichiers validés antivirus' },
        ],
      },
    ],
    primaryLabel: 'Répondre au dossier',
  },
  'mairie-messages': {
    title: 'Messages mairie',
    subtitle: 'Diffusions écoles',
    summary:
      'Messages envoyés par la mairie aux directions et représentants d’une ou plusieurs écoles.',
    bottomNav: mairie,
    metrics: [
      { label: 'Envoyés ce mois', value: 12 },
      { label: 'Écoles ciblées', value: 4 },
    ],
    sections: [
      {
        title: 'Derniers envois',
        rows: [
          {
            title: 'Travaux rue de l’École',
            detail: 'École Jean Jaurès · important',
            badge: 'Envoyé',
            tone: 'success',
          },
          { title: 'Réunion sectorisation', detail: 'Multi-écoles · normal' },
          {
            title: 'Information restauration',
            detail: 'Écoles maternelles · normal',
            badge: 'Envoyé',
            tone: 'success',
          },
        ],
      },
    ],
    primaryLabel: 'Créer un message',
  },
  'mairie-rendez-vous': {
    title: 'Rendez-vous mairie',
    subtitle: 'Agenda école',
    summary: 'Suivi des demandes, propositions de créneaux et confirmations de rendez-vous.',
    bottomNav: mairie,
    metrics: [
      { label: 'À venir', value: 5 },
      { label: 'Demandés', value: 2, tone: 'warning' },
    ],
    sections: [
      {
        title: 'À traiter',
        rows: [
          {
            title: 'Point sécurité Jean Jaurès',
            detail: '23 mai · 18h00 · Mairie',
            badge: 'Confirmé',
            tone: 'success',
          },
          {
            title: "Préparation conseil d'école",
            detail: 'Créneaux à proposer',
            badge: 'Demande',
            tone: 'warning',
          },
        ],
      },
    ],
    primaryLabel: 'Proposer créneaux',
  },
  'hors-competence': {
    title: 'Hors compétence',
    subtitle: 'Réponse structurée',
    summary:
      'Gère les demandes qui ne relèvent pas de la mairie tout en orientant correctement les parents.',
    bottomNav: mairie,
    metrics: [
      { label: 'Cas ce mois', value: 2 },
      { label: 'Orientations', value: 2 },
    ],
    sections: [
      {
        title: 'Réponse type',
        rows: [
          {
            title: 'Compétence Éducation nationale',
            detail: 'Formulation claire + contact direction / inspection',
          },
          {
            title: 'Compétence département',
            detail: 'Transport scolaire ou voirie départementale',
          },
        ],
      },
    ],
    primaryLabel: 'Envoyer orientation',
  },
  'demande-precision': {
    title: 'Demande de précision',
    subtitle: 'Compléter un dossier',
    summary: 'Permet à la mairie de demander des informations manquantes sans clore le dossier.',
    bottomNav: mairie,
    metrics: [
      { label: 'Questions', value: 3 },
      { label: 'Délai réponse', value: '7j' },
    ],
    sections: [
      {
        title: 'Informations à demander',
        rows: [
          {
            title: 'Localisation précise',
            detail: 'Entrée principale, portail secondaire ou rue adjacente ?',
          },
          {
            title: 'Photos complémentaires',
            detail: 'Demander une photo large + une photo détail',
          },
          { title: 'Créneau constaté', detail: 'Matin, midi, soir, jour de semaine' },
        ],
      },
    ],
    primaryLabel: 'Demander précision',
  },
  'action-programmee': {
    title: 'Action programmée',
    subtitle: 'Suivi opérationnel',
    summary:
      'Publie une action concrète avec service responsable, échéance, statut et preuve attendue.',
    bottomNav: mairie,
    metrics: [
      { label: 'Actions ouvertes', value: 7 },
      { label: 'En retard', value: 1, tone: 'danger' },
    ],
    sections: [
      {
        title: 'Action',
        rows: [
          {
            title: 'Repassage marquage au sol',
            detail: 'Service Voirie · semaine 24',
            badge: 'Programmé',
            tone: 'primary',
          },
          { title: 'Signalisation lumineuse', detail: 'Chiffrage demandé avant arbitrage' },
        ],
      },
    ],
    primaryLabel: 'Publier action',
  },
  'compte-rendu-rdv': {
    title: 'Compte rendu RDV',
    subtitle: 'Après réunion',
    summary:
      'Formalise les décisions, engagements, participants et prochaines étapes après un rendez-vous mairie.',
    bottomNav: mairie,
    metrics: [
      { label: 'Participants', value: 4 },
      { label: 'Actions', value: 3 },
    ],
    sections: [
      {
        title: 'Décisions',
        rows: [
          { title: 'Voirie se déplace sur site', detail: 'Avant le 31 mai 2026' },
          { title: 'Direction relaie consigne familles', detail: 'Message court avant travaux' },
          { title: 'Point de suivi', detail: 'À programmer après intervention' },
        ],
      },
    ],
    primaryLabel: 'Publier compte rendu',
  },
  'modeles-messages': {
    title: 'Modèles messages',
    subtitle: 'Bibliothèque mairie',
    summary:
      'Modèles réutilisables pour répondre vite avec un ton homogène, validé institutionnellement.',
    bottomNav: mairie,
    metrics: [
      { label: 'Modèles', value: 9 },
      { label: 'Utilisés ce mois', value: 18 },
    ],
    sections: [
      {
        title: 'Modèles disponibles',
        rows: [
          {
            title: 'Travaux à proximité école',
            detail: 'Information calendrier + contact service',
          },
          { title: 'Demande de précision', detail: 'Questions structurées selon type dossier' },
          { title: 'Hors compétence', detail: 'Réorientation sans rupture de dialogue' },
        ],
      },
    ],
    primaryLabel: 'Créer un modèle',
  },
  categories: {
    title: 'Catégories',
    subtitle: 'Référentiel mairie',
    summary:
      'Administration des catégories de dossiers, règles de routage, urgence par défaut et service cible.',
    bottomNav: mairie,
    metrics: [
      { label: 'Catégories', value: 12 },
      { label: 'Actives', value: 11 },
    ],
    sections: [
      {
        title: 'Routage',
        rows: [
          { title: 'Sécurité', detail: 'Voirie + Éducation · urgence élevée possible' },
          { title: 'Bâtiment', detail: 'Service Bâtiment · délai cible 15 jours' },
          { title: 'Restauration', detail: 'Service Restauration · délai cible 10 jours' },
        ],
      },
    ],
    primaryLabel: 'Ajouter catégorie',
  },
  services: {
    title: 'Services mairie',
    subtitle: 'Responsables internes',
    summary:
      'Liste des services destinataires, contacts, délais cibles et périmètres de compétence.',
    bottomNav: mairie,
    metrics: [
      { label: 'Services', value: 7 },
      { label: 'SLA moyen', value: '12j' },
    ],
    sections: [
      {
        title: 'Services',
        rows: [
          { title: 'Service Voirie', detail: 'Abords école, sécurité piétons, marquage' },
          { title: 'Service Bâtiment', detail: 'Sanitaires, travaux, accessibilité' },
          { title: 'Service Éducation', detail: 'Coordination écoles, rendez-vous, diffusion' },
        ],
      },
    ],
    primaryLabel: 'Ajouter service',
  },
  'carte-ecoles': {
    title: 'Carte écoles',
    subtitle: 'Vue géographique',
    summary:
      'Carte fonctionnelle des établissements, dossiers urgents, zones récurrentes et signaux faibles.',
    bottomNav: mairie,
    metrics: [
      { label: 'Écoles', value: 4 },
      { label: 'Zones à surveiller', value: 2, tone: 'warning' },
    ],
    sections: [
      {
        title: 'Points carte',
        rows: [
          {
            title: 'Jean Jaurès',
            detail: '1 dossier urgent · sécurité abords',
            badge: 'Priorité',
            tone: 'danger',
          },
          { title: 'Louise Michel', detail: 'Aucun dossier urgent' },
          { title: 'Victor Hugo', detail: 'Signalement bâtiment à vérifier' },
        ],
      },
    ],
    primaryLabel: 'Ouvrir fiche école',
  },
};

export function BlueprintRoute({ id }: { id: BlueprintId }) {
  const config = configs[id];
  return (
    <BlueprintScreen
      title={config.title}
      subtitle={config.subtitle}
      summary={config.summary}
      metrics={config.metrics}
      sections={config.sections}
      bottomNav={config.bottomNav}
      primaryAction={
        config.primaryLabel
          ? { label: config.primaryLabel, message: `${config.primaryLabel} simulé.` }
          : undefined
      }
      secondaryAction={
        config.secondaryLabel
          ? { label: config.secondaryLabel, message: `${config.secondaryLabel} simulé.` }
          : undefined
      }
      rightElement={<ScreenStatus />}
    />
  );
}

function ScreenStatus() {
  return (
    <View className="rounded-full bg-emerald-50 px-3 py-1">
      <Text className="text-emerald-700 text-[10px] font-bold">Mock complet</Text>
    </View>
  );
}
