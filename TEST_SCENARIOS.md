# Scénarios de test — Autour de l'École

> Checklist manuelle pour valider que l'application tient son concept à 3 profils utilisateurs (Parent élu, Mairie, Direction) avec **4 canaux de visibilité** strictement séparés.
>
> **Mode d'emploi** : ouvre l'app dans Chrome (`EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081`), exécute chaque scénario, coche les vérifications. Si un point échoue, copie le bloc « Rapport de test » en bas du fichier et remplis-le.

---

## Modèle de visibilité — Rappel

Chaque dossier, message, RDV, pièce jointe et commentaire a un champ **`visibilityScope`** :

| Scope | Visible par | Usage |
| --- | --- | --- |
| `parents_mairie` | parents élus + mairie | Difficultés avec la direction, médiation, demandes collectives privées |
| `direction_mairie` | direction + mairie | Tensions parents, arbitrages, alertes internes école |
| `partage_tripartite` | parents + direction + mairie | Travaux, sécurité, conseils d'école, messages officiels |
| `mairie_interne` | mairie uniquement | Notes de service, instruction inter-services |

**Source de vérité** : helper `canRoleSeeScope(role, scope)` dans `types/index.ts`.

---

## Jeu de données de référence (mockData)

| Objet | Créateur | Scope | Visible par |
| --- | --- | --- | --- |
| `dossier-passage-pieton` | Nadia (parent) | partage_tripartite | Tous |
| `dossier-sanitaires` | Marc (parent) | parents_mairie | Parents + mairie |
| `dossier-sectorisation` | Nadia (parent) | parents_mairie | Parents + mairie |
| `dossier-rdv-conseil` | Nadia (parent) | partage_tripartite | Tous |
| `dossier-batiment-salle12` | Mme Girard (direction) | partage_tripartite | Tous |
| `dossier-communication-direction` | Nadia (parent) | parents_mairie | Parents + mairie |
| `dossier-tensions-representants` | Mme Girard (direction) | direction_mairie | Direction + mairie |
| `dossier-note-budget` | Claire (mairie) | mairie_interne | Mairie uniquement |
| `message-travaux` | mairie | partage_tripartite | Tous |
| `message-sectorisation` | mairie | parents_mairie | Parents + mairie |
| `message-vigipirate` | mairie | direction_mairie | Direction + mairie |

---

## 1. Profil Parent élu

### P1 — Première connexion avec clé école valide
**Objectif** : un parent rejoint son école avec une clé valide.

Étapes :
- [ ] Ouvrir l'app
- [ ] Cliquer sur « J'ai une clé école »
- [ ] Saisir `JAURES-2026`
- [ ] Vérifier que l'école détectée est « Jean Jaurès »
- [ ] Cliquer « Créer un compte »
- [ ] Atterrir sur `/parent/home`

Vérifications :
- [ ] Clé reconnue, message de validation visible
- [ ] Bonne école affichée avec adresse et mairie
- [ ] Pas d'écran bloquant
- [ ] BottomNav variant parent active (bleu)

---

### P2 — Clé école invalide / expirée
**Objectif** : gestion d'erreur sur clé incorrecte.

Étapes :
- [ ] Cliquer « J'ai une clé école »
- [ ] Saisir `XYZ-WRONG` puis `EXPIRE`
- [ ] Valider à chaque essai

Vérifications :
- [ ] `XYZ-WRONG` → état « invalide » avec message clair
- [ ] `EXPIRE` → état « expirée » avec proposition d'action
- [ ] Pas de crash, pas de redirection erronée
- [ ] Possibilité de réessayer

---

### P3 — Création d'une demande tripartite (cas tout-le-monde-voit)
**Objectif** : un parent crée un dossier partagé avec la direction et la mairie.

Étapes :
- [ ] Connexion parent (`/parent/home`)
- [ ] FAB « + » → `/parent/new-request`
- [ ] Catégorie : Sécurité
- [ ] Titre : « Passage piéton à repeindre rue de l'École »
- [ ] Description : « Le marquage au sol est usé, plusieurs familles le signalent. »
- [ ] Urgence : Moyenne
- [ ] **Scope : Parents + direction + mairie** (par défaut)
- [ ] Cliquer « Transmettre à la mairie »

Vérifications :
- [ ] Alerte de confirmation mentionne « Visible par la mairie, les parents élus et la direction »
- [ ] Redirection vers `/parent/dossiers`
- [ ] (Si on simulait persistance) le dossier serait visible côté direction

---

### P4 — Création d'une demande privée parents/mairie (cas 1 du briefing)
**Objectif** : un parent crée un dossier confidentiel avec la mairie, invisible direction.

Étapes :
- [ ] `/parent/new-request`
- [ ] Catégorie : Communication
- [ ] Titre : « Difficulté de communication avec la direction »
- [ ] Description : « Plusieurs familles n'obtiennent pas de retour sur leurs sollicitations »
- [ ] **Scope : Parents élus + mairie** (à sélectionner explicitement)
- [ ] Transmettre

Vérifications :
- [ ] Alerte de confirmation mentionne « Visible uniquement par la mairie et les parents élus »
- [ ] Le ScopeSelector explique clairement que la direction ne verra pas
- [ ] Pas d'option « Direction + mairie » dans le sélecteur (réservé au profil direction)

---

### P5 — Demande incomplète
**Objectif** : validations de formulaire.

Étapes :
- [ ] `/parent/new-request`
- [ ] Laisser titre vide
- [ ] Cliquer « Transmettre »
- [ ] Puis remplir titre avec 3 caractères
- [ ] Cliquer « Transmettre »

Vérifications :
- [ ] Alerte « Demande incomplète »
- [ ] Messages d'erreur sous les champs (catégorie, titre)
- [ ] Pas de dossier créé
- [ ] Bouton « Enregistrer en brouillon » fonctionne

---

### P6 — Consultation du dossier `passage-pieton` (tripartite)
**Objectif** : voir un dossier partagé avec historique et badges.

Étapes :
- [ ] `/parent/dossiers` → cliquer sur « Passage piéton dangereux »

Vérifications :
- [ ] **Badge « Parents + direction + mairie »** visible
- [ ] Catégorie, statut, urgence visibles
- [ ] Historique avec timeline (création → envoi → réception)
- [ ] Commentaires visibles (Marc, Mme Girard, Claire)
- [ ] Boutons : ajouter commentaire, demander RDV, relancer

---

### P7 — Tentative d'accès à un dossier `direction_mairie` (cas 6)
**Objectif** : un parent ne doit pas voir un dossier réservé à la direction.

Étapes :
- [ ] Ouvrir l'URL directe `http://localhost:8081/parent/dossier-detail?id=dossier-tensions-representants`

Vérifications :
- [ ] **Écran « Accès refusé »** s'affiche
- [ ] **Le titre du dossier n'apparaît PAS** (pas de fuite)
- [ ] Aucun contenu ni détail sensible
- [ ] Bouton « Retour à mes dossiers »
- [ ] Aucune trace dans la liste `/parent/dossiers`

---

### P8 — Tentative d'accès à un message `direction_mairie`
Étapes :
- [ ] Ouvrir l'URL directe `http://localhost:8081/parent/message-detail?id=message-vigipirate`

Vérifications :
- [ ] Écran « Accès refusé »
- [ ] Titre `Vigipirate` non visible
- [ ] Aucun contenu

---

### P9 — Consultation des messages mairie côté parent
Étapes :
- [ ] `/parent/messages`

Vérifications :
- [ ] **Visible** : « Travaux rue de l'École » (tripartite) + « Réunion sectorisation » (parents_mairie)
- [ ] **NON visible** : « Consignes Vigipirate » (direction_mairie)
- [ ] Badge de visibilité affiché dans chaque MessageCard ou via tap → message-detail

---

### P10 — Parent demande un rendez-vous
Étapes :
- [ ] `/parent/appointments` → « Demander un rendez-vous »
- [ ] Objet : « Point sécurité conseil d'école »
- [ ] Dossier lié : `dossier-passage-pieton`
- [ ] Créneau préféré : Mercredi 27 mai

Vérifications :
- [ ] Modal s'ouvre proprement
- [ ] RDV créé en statut « demandé »
- [ ] Pas de RDV `direction_mairie` visible dans la liste

---

## 2. Profil Mairie

### M1 — Connexion mairie et dashboard
Étapes :
- [ ] Welcome → « Je suis une mairie » → `/mairie/dashboard`

Vérifications :
- [ ] Section **Activité** : 4 stat cards avec icônes (Écoles, Représentants actifs, Dossiers ouverts, Dossiers urgents)
- [ ] Section **Performance ce mois** : 2 cards larges (Délai moyen 3.8j ↓, Dossiers traités 12 ↑)
- [ ] Card « Écoles à surveiller »
- [ ] Liens rapides : Écoles, Messages, RDV
- [ ] « Derniers dossiers » (3 cards) + « Prochains rendez-vous » (2)
- [ ] BottomNav variant mairie (teal)

---

### M2 — Mairie voit TOUS les dossiers
Étapes :
- [ ] `/mairie/dashboard` → « Derniers dossiers »
- [ ] Ou ouvrir un dossier `parents_mairie`, un `direction_mairie`, un `partage_tripartite`, un `mairie_interne`

Vérifications :
- [ ] **Tous les scopes sont visibles** côté mairie (4 dossiers existants + 3 nouveaux = 8 dossiers au total)
- [ ] Badge de visibilité sur chaque dossier détail
- [ ] `dossier-tensions-representants` (direction_mairie) → accessible
- [ ] `dossier-communication-direction` (parents_mairie) → accessible
- [ ] `dossier-note-budget` (mairie_interne) → accessible

---

### M3 — Mairie répond à un dossier parent
Étapes :
- [ ] Cliquer un dossier dans « Derniers dossiers » → `/mairie/reply`
- [ ] Saisir une réponse (≥ 10 caractères)
- [ ] Statut : « En cours d'analyse »
- [ ] Service : Voirie
- [ ] Délai : Sous 2 semaines
- [ ] Cliquer « Envoyer la réponse »

Vérifications :
- [ ] Récap du dossier en haut (titre, badges, scope visible)
- [ ] Validation : refus si champs manquants
- [ ] Alerte de confirmation
- [ ] Redirection vers dashboard

---

### M4 — Mairie propose un partage tripartite (cas 3)
**Objectif** : transformer un dossier privé en partagé.

Étapes :
- [ ] Ouvrir `dossier-communication-direction` (scope `parents_mairie`) via `/mairie/reply?id=dossier-communication-direction`
- [ ] Faire défiler jusqu'à la card **« Proposer le partage avec la direction »**
- [ ] Cliquer « Proposer le partage tripartite »

Vérifications :
- [ ] Card visible uniquement pour les dossiers `parents_mairie` ou `direction_mairie` (pas pour tripartite déjà ni mairie_interne)
- [ ] Alerte explique : « Tout l'historique deviendra visible par la direction »
- [ ] Confirmation → message « Proposition envoyée »
- [ ] Le badge en haut bascule de `Parents + mairie` à `Parents + direction + mairie`
- [ ] Le bouton de proposition disparaît (déjà proposé)

---

### M5 — Mairie crée une note interne (mairie_interne)
**Objectif** : note non visible par parents ni direction.

Étapes (UI à compléter — actuellement créé via mockData) :
- [ ] Ouvrir le dossier `dossier-note-budget` via le dashboard
- [ ] Vérifier scope `Mairie uniquement` en badge
- [ ] Confirmer qu'il n'apparaît pas côté parent ni direction (voir cas P7, D6)

---

### M6 — Mairie classe hors compétence
Étapes :
- [ ] Ouvrir un dossier transmis → `/mairie/reply`
- [ ] Choisir statut « Hors compétence »
- [ ] Cliquer envoyer

Vérifications :
- [ ] Statut bien enregistré
- [ ] Pas de disparition du dossier
- [ ] Côté parent : statut visible avec explication

---

### M7 — Mairie envoie un message école
Étapes (composer côté `/mairie/messages` — actuellement Blueprint) :
- [ ] Naviguer vers `/mairie/messages`

Vérifications :
- [ ] Page Blueprint « Messages mairie » s'affiche
- [ ] À implémenter : composer + sélection de scope (parents_mairie, direction_mairie, partage_tripartite, mairie_interne)

> **Note** : composer mairie non encore fonctionnel (Blueprint). À développer ultérieurement.

---

### M8 — Génération de clé école
Étapes :
- [ ] `/mairie/schools` → cliquer sur une école → `/mairie/school-detail`
- [ ] Vérifier visibilité de la clé école

Vérifications :
- [ ] Clé visible
- [ ] Bouton « Régénérer la clé » présent (peut être placeholder)

---

### M9 — Dashboard Performance affiche des tendances correctes
Étapes :
- [ ] `/mairie/dashboard`

Vérifications :
- [ ] Délai moyen 3.8j avec badge ↓ -0.5j (vert = amélioration)
- [ ] Dossiers traités 12 avec badge ↑ +3 (vert = amélioration)
- [ ] Icônes cohérentes : Clock et CheckCircle2
- [ ] Pas de duplication avec « Dossiers ouverts » (qui mesure le stock)

---

### M10 — Stats détaillées
Étapes :
- [ ] Naviguer manuellement vers `/mairie/stats`

Vérifications :
- [ ] Page « Statistiques » s'affiche
- [ ] Stats par école, par catégorie, délai moyen, urgents, sujets récurrents
- [ ] Ne révèle pas de dossiers cachés (pas de « 3 dossiers cachés »)

---

## 3. Profil Direction

### D1 — Direction accède à son espace
Étapes :
- [ ] Welcome → « Je suis une direction » → `/direction/home`

Vérifications :
- [ ] **Header gradient indigo** (distinct du bleu parent et du teal mairie)
- [ ] Avatar « MG » (Mme Girard)
- [ ] Bandeau de confidentialité : « Espace direction confidentiel »
- [ ] Cards : sujets institutionnels (compteur), messages mairie, prochain RDV
- [ ] FAB « + » → `/direction/new-request`
- [ ] BottomNav variant direction (indigo) : Accueil / Dossiers / Messages / RDV / Annuaire

---

### D2 — Direction voit uniquement ses sujets
Étapes :
- [ ] `/direction/dossiers`

Vérifications :
- [ ] **Visible** :
  - `dossier-passage-pieton` (partage_tripartite)
  - `dossier-rdv-conseil` (partage_tripartite)
  - `dossier-batiment-salle12` (partage_tripartite, créé par direction)
  - `dossier-tensions-representants` (direction_mairie, créé par direction)
- [ ] **NON visible** :
  - `dossier-sanitaires` (parents_mairie)
  - `dossier-sectorisation` (parents_mairie)
  - `dossier-communication-direction` (parents_mairie)
  - `dossier-note-budget` (mairie_interne)
- [ ] Filtre « Créés par moi » → `dossier-batiment-salle12` + `dossier-tensions-representants`

---

### D3 — Direction crée un dossier privé direction/mairie (cas 2)
Étapes :
- [ ] `/direction/new-request`
- [ ] Catégorie : Communication
- [ ] Titre : « Tensions récurrentes avec un représentant »
- [ ] Description : « Difficultés répétées dans les échanges avec un parent élu »
- [ ] **Scope : Direction + mairie** (par défaut)
- [ ] Urgence : Moyenne
- [ ] Transmettre

Vérifications :
- [ ] Sélecteur de scope montre 2 options : `Direction + mairie` et `Parents + direction + mairie`
- [ ] **AUCUNE option `parents_mairie`** (interdit côté direction)
- [ ] Alerte de confirmation : « Visible uniquement par la mairie. Les représentants des parents ne verront pas »
- [ ] Redirection vers `/direction/dossiers`

---

### D4 — Direction crée un sujet tripartite
Étapes :
- [ ] `/direction/new-request`
- [ ] **Scope : Parents + direction + mairie** (à sélectionner)
- [ ] Titre : « Demande d'éclairage cour de récré »
- [ ] Transmettre

Vérifications :
- [ ] Alerte mentionne « Visible par la mairie, les parents élus et la direction »

---

### D5 — Direction commente un dossier tripartite
Étapes :
- [ ] `/direction/dossiers` → ouvrir `dossier-passage-pieton`
- [ ] Saisir un commentaire (≥ 8 caractères) dans le fil
- [ ] Cliquer « Publier le commentaire »

Vérifications :
- [ ] Commentaire ajouté avec « Direction école » comme rôle
- [ ] Badge `Parents + direction + mairie` visible en haut
- [ ] Historique mis à jour

---

### D6 — Direction tente d'accéder à un dossier `parents_mairie` (cas 5)
Étapes :
- [ ] Ouvrir directement `http://localhost:8081/direction/dossier-detail?id=dossier-communication-direction`

Vérifications :
- [ ] **Écran « Accès refusé »**
- [ ] **Titre `Difficulté de communication avec la direction` NON visible** (pas de fuite)
- [ ] Aucun contenu, aucun commentaire
- [ ] Bouton « Retour à mes sujets »

---

### D7 — Direction tente d'accéder à une note `mairie_interne`
Étapes :
- [ ] Ouvrir `http://localhost:8081/direction/dossier-detail?id=dossier-note-budget`

Vérifications :
- [ ] Écran « Accès refusé »
- [ ] Pas de titre visible

---

### D8 — Direction n'a pas accès au dashboard mairie
Étapes :
- [ ] Ouvrir `http://localhost:8081/mairie/dashboard` directement

Vérifications :
- [ ] L'app charge le dashboard (pas encore de check côté navigation), MAIS :
  - Si on étend la sécurité plus tard : redirection vers `/direction/home`
  - Pour l'instant : le BottomNav et le contexte indiquent qu'on est dans la zone mairie
- [ ] **À renforcer ultérieurement** : ajouter un guard de route au niveau du layout mairie

> **Limite connue** : dans cette démo, l'authentification est absente. La séparation se fait au niveau **du choix de l'utilisateur sur le Welcome**, pas au niveau d'un middleware d'authent. À renforcer quand le backend sera branché.

---

## 4. Scénarios cross-canal

### C1 — Le même dossier vu par les trois profils
**Objectif** : vérifier que `dossier-passage-pieton` (tripartite) est visible identiquement par parent / direction / mairie.

Étapes :
- [ ] Parent : `/parent/dossiers` → cliquer → voir détail
- [ ] Direction : `/direction/dossiers` → cliquer → voir détail
- [ ] Mairie : `/mairie/dashboard` → « Derniers dossiers » → cliquer

Vérifications :
- [ ] Titre, description, historique identiques
- [ ] Commentaires identiques
- [ ] Badge `Parents + direction + mairie` partout
- [ ] Pièces jointes identiques

---

### C2 — Un dossier `parents_mairie` n'apparaît jamais côté direction
**Objectif** : vérifier l'invisibilité totale (liste + recherche + URL).

Étapes :
- [ ] Direction : `/direction/dossiers` → vérifier absence de `dossier-communication-direction`
- [ ] Direction : ouvrir URL directe → écran « Accès refusé »
- [ ] Direction : pas de notification associée (mock — à valider quand notifications branchées)

---

### C3 — Un dossier `direction_mairie` n'apparaît jamais côté parent
Idem cas C2, mais inversé.

Étapes :
- [ ] Parent : `/parent/dossiers` → vérifier absence de `dossier-tensions-representants`
- [ ] Parent : URL directe → écran « Accès refusé »

---

### C4 — Un dossier `mairie_interne` n'apparaît ni côté parent ni côté direction
Étapes :
- [ ] `dossier-note-budget` : visible uniquement côté mairie
- [ ] Tester URL directe côté parent et direction

---

### C5 — Workflow de partage parents → tripartite (cas 3 du briefing)
**Objectif** : la mairie élargit un dossier privé. La direction le voit ensuite.

Étapes :
- [ ] Mairie : ouvrir `dossier-communication-direction` via `/mairie/reply`
- [ ] Cliquer « Proposer le partage tripartite »
- [ ] (Simulation locale) vérifier que le badge bascule à `partage_tripartite`
- [ ] (À implémenter avec backend) : direction reçoit notification et accède au dossier

Vérifications :
- [ ] Sur la session en cours, le scope change bien
- [ ] Historique mentionne le partage (à implémenter — actuellement événement non ajouté car mockData immuable)
- [ ] L'ancien historique reste visible (choix explicite du briefing : « tout l'historique dès le partage »)

> **Limite mock** : la persistance entre sessions n'est pas implémentée. Le partage est local au render.

---

### C6 — Tentatives d'accès URL directe — tous les cas
**Objectif** : valider que tous les guards bloquent proprement.

Matrice à tester :

| Profil testeur | URL ciblée | Scope cible | Résultat attendu |
| --- | --- | --- | --- |
| Parent | `/parent/dossier-detail?id=dossier-tensions-representants` | direction_mairie | Accès refusé |
| Parent | `/parent/dossier-detail?id=dossier-note-budget` | mairie_interne | Accès refusé |
| Parent | `/parent/message-detail?id=message-vigipirate` | direction_mairie | Accès refusé |
| Direction | `/direction/dossier-detail?id=dossier-sanitaires` | parents_mairie | Accès refusé |
| Direction | `/direction/dossier-detail?id=dossier-communication-direction` | parents_mairie | Accès refusé |
| Direction | `/direction/dossier-detail?id=dossier-note-budget` | mairie_interne | Accès refusé |
| Direction | `/direction/message-detail?id=message-sectorisation` | parents_mairie | Accès refusé |

Vérifications globales :
- [ ] **Aucune URL ne fuite le titre du dossier**
- [ ] **Aucun contenu sensible n'apparaît**
- [ ] Message sobre : « Vous n'avez pas accès à ce dossier »

---

### C7 — Recherche globale respecte la visibilité
> **Limite actuelle** : la recherche globale n'est pas encore implémentée (écran `/parent/search` est un Blueprint). Quand elle le sera, les résultats doivent passer par le filtre `visibleByRole`.

Vérifications à prévoir :
- [ ] Parent cherche « direction » → ne voit que ses dossiers (pas les `direction_mairie`)
- [ ] Direction cherche « parents » → ne voit que ses dossiers (pas les `parents_mairie`)
- [ ] Mairie cherche « direction » → voit tout

---

### C8 — Historique école filtré selon rôle
> **Limite actuelle** : l'historique global est par dossier, pas par école. Quand un écran d'historique école sera implémenté :

Vérifications à prévoir :
- [ ] Parent voit historique parents + tripartite
- [ ] Direction voit historique direction + tripartite
- [ ] Mairie voit tout
- [ ] **NE PAS afficher « X dossiers cachés »** (révélation indirecte)

---

## 5. Scénarios transversaux

### T1 — Cycle complet d'un dossier
Étapes :
- [ ] Parent crée → mairie reçoit → mairie demande précision → parent répond → mairie programme action → RDV → compte rendu → résolu

Vérifications :
- [ ] Tous les statuts s'enchaînent
- [ ] Historique complet
- [ ] Aucune perte de données
- [ ] Chaque rôle voit son scope

---

### T2 — Passage d'année scolaire
Hors scope MVP — à valider quand backend disponible.

---

### T3 — Mauvais rôle / accès interdit
Couvert par C6.

---

### T4 — Données manquantes / incohérentes
Étapes :
- [ ] (Hors mockData) tester un dossier sans description, sans statut, sans école

Vérifications :
- [ ] Pas de crash
- [ ] Valeurs par défaut / message « information non renseignée »

---

### T5 — Écrans vides
Étapes :
- [ ] Si la direction n'a aucun sujet → vérifier message d'état
- [ ] Si pas de message direction → message d'état
- [ ] Si pas de RDV → message d'état

Vérifications (déjà faites dans les écrans) :
- [ ] `/direction/dossiers` filtré vide → message « Aucun sujet ne correspond au filtre » + texte explicatif sur l'isolation
- [ ] `/direction/appointments` filtré vide → message contextuel
- [ ] `/direction/messages` filtré vide → message

---

## 6. Priorités

Ordre suggéré pour une session de QA :

1. **D2, D6, D7, C6** — isolation direction (le cœur du concept)
2. **P3, P4, D3, D4** — création avec choix de scope
3. **M4, C5** — workflow de partage
4. **C1, C2, C3, C4** — visibilité tripartite vs privé
5. **M2, M3, M9** — vision mairie complète
6. **P6, P7, P8** — guards côté parent
7. **M1, M10, D1** — confort de navigation

---

## Rapport de test (copier-coller)

```
Nom du test :
Profil testé :
Objectif :
Étapes exécutées :
Résultat attendu :
Résultat observé :
Statut :
- [ ] OK
- [ ] Bug
- [ ] Manquement
- [ ] Incohérence
- [ ] Amélioration

Problèmes détectés :
1.
2.
3.

Suggestions :
1.
2.
3.

Priorité :
- [ ] critique
- [ ] haute
- [ ] moyenne
- [ ] basse
```
