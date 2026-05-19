# Maquette MVP corrigée — Autour de l'École

État au 19 mai 2026.

## Objectif

La maquette mobile sert maintenant de source de vérité pour un MVP simple : améliorer la relation parents élus ↔ mairie autour des dossiers, messages, rendez-vous, écoles et bons interlocuteurs.

Ce qui n'aide pas directement cette relation est conservé dans le code uniquement pour mémoire, sans lien depuis les hubs principaux.

## Parcours Visible MVP

### Parent élu

| Parcours          | Routes principales                                                  | Statut  |
| ----------------- | ------------------------------------------------------------------- | ------- |
| Onboarding        | `/`, `/join-school`, `/create-account`                              | Visible |
| Accueil           | `/parent/home`                                                      | Visible |
| Dossiers          | `/parent/dossiers`, `/parent/dossier-detail`, `/parent/new-request` | Visible |
| Messages          | `/parent/messages`, `/parent/message-detail`                        | Visible |
| Rendez-vous       | `/parent/appointments`                                              | Visible |
| Annuaire central  | `/parent/directory`                                                 | Visible |
| Historique rapide | `/parent/historique`                                                | Visible |
| Profil/réglages   | `/parent/profile` via l'avatar `NB`                                 | Discret |

L'accueil parent ne contient plus de bloc "Outils école". Il montre seulement les dossiers en cours, le dernier message mairie, le prochain rendez-vous et l'historique rapide.

L'annuaire parent est le point central pour :

- les parents élus actifs de l'école ;
- les contacts mairie/services ;
- les anciens présidents/administrateurs uniquement.

La clé école et l'invitation restent disponibles comme actions admin dans l'annuaire, sans écran séparé mis en avant.

### Mairie

| Parcours           | Routes principales                                | Statut  |
| ------------------ | ------------------------------------------------- | ------- |
| Tableau de bord    | `/mairie/dashboard`                               | Visible |
| Écoles             | `/mairie/schools`, `/mairie/school-detail?id=...` | Visible |
| Messages mairie    | `/mairie/messages`                                | Visible |
| Rendez-vous mairie | `/mairie/rendez-vous`                             | Visible |
| Réponse dossier    | `/mairie/reply`                                   | Visible |

Le dashboard mairie ne contient plus de bloc "Outils mairie", ni d'accès visible vers statistiques, mode élu, carte, modèles, catégories, services, hors compétence ou écrans de précision.

La fiche école conserve les représentants, derniers dossiers, rendez-vous et l'action d'envoi de message.

## Documents

Il n'y a plus de rubrique autonome "Documents" dans les parcours visibles.

Les pièces jointes existent seulement dans leur contexte :

- dossier ;
- message ;
- rendez-vous.

## Données Mockées Ajoutées

Les mocks contiennent maintenant des contacts mairie structurés :

- nom ;
- fonction ;
- service ;
- email ;
- téléphone optionnel ;
- périmètre ;
- catégories liées.

Les anciens visibles sont limités aux anciens présidents/administrateurs. Les anciens contributeurs ne sont pas affichés.

## Réserve / Non Retenu MVP

Ces fichiers peuvent rester dans `mobile-app/app`, mais ne sont plus liés depuis l'accueil parent, le dashboard mairie ou la documentation produit principale :

| Zone                  | Routes en réserve                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parent outils         | `/parent/keys`, `/parent/validation`, `/parent/contacts`, `/parent/passage-annee`, `/parent/export`, `/parent/search`, `/parent/documents`, `/parent/conseil-ecole`, `/parent/bilan-annuel`, `/parent/transfert-admin`, `/parent/invitation`, `/parent/anciens-representants`, `/parent/orientation`, `/parent/dossiers-similaires`, `/parent/brouillons`, `/parent/notifications`, `/parent/notifications-settings` |
| Mairie avancé         | `/mairie/stats`, `/mairie/mode-elu`, `/mairie/carte-ecoles`, `/mairie/modeles-messages`, `/mairie/categories`, `/mairie/services`, `/mairie/dossier-detail`, `/mairie/hors-competence`, `/mairie/demande-precision`, `/mairie/action-programmee`, `/mairie/compte-rendu-rdv`                                                                                                                                         |
| Onboarding secondaire | `/onboarding`, `/school-select`                                                                                                                                                                                                                                                                                                                                                                                      |

## Scénarios À Vérifier

### Parent

1. Accueil → Dossiers → Détail dossier.
2. Accueil → Messages → Détail message.
3. Accueil → Rendez-vous.
4. Accueil → Annuaire → onglets Parents élus / Contacts mairie / Anciens admins.
5. Avatar `NB` → Profil/réglages discret.

### Mairie

1. Dashboard → Écoles → Fiche école.
2. Dashboard → Messages mairie.
3. Dashboard → Rendez-vous mairie.
4. Dossier mairie → Réponse structurée.

## Vérifications Techniques

À lancer après chaque passe de correction :

- `npm run typecheck`
- `npm run lint`
- `npm run bundle:check`
- smoke test navigateur sur les routes principales visibles.

La maquette doit rester imparfaite seulement sur ce qui est volontairement mocké : backend, auth, stockage réel des fichiers, notifications et envoi email.
