# Passerelle — Maquette mobile (`mobile-app/`)

> **Statut produit (depuis 2026-05-25, étape 31)** : maquette mobile **Expo React Native** servant de **référence UX active** pour la fusion progressive vers le produit principal `web-admin/`. Plus considérée comme « pivot abandonné » : on en porte les bonnes idées (bottom navigation, annuaire parents 3 onglets, etc.) au fil des étapes. Le suivi détaillé vit dans le workspace local, côté `SYNC_MOBILE_WEB.md`.
>
> **Pour la démo officielle Passerelle (présentation mairie)** : utiliser le repo principal [`AlybaR/passerelle-web-admin`](https://github.com/AlybaR/passerelle-web-admin), pas ce projet.

Application mobile **Expo React Native + NativeWind + TypeScript** pour le projet _Passerelle_ — outil de coordination institutionnelle entre parents élus, écoles et mairie.

**Baseline** : le lien direct entre parents élus, écoles et mairie.
**Phrase produit** : aider les collectivités à intervenir avant la crise, et aider les parents élus à ne jamais repartir de zéro.

---

## Stack

### Cœur

- [Expo](https://expo.dev) SDK 54
- [Expo Router](https://docs.expo.dev/router/introduction/) v6 (file-based routing, typed routes)
- [React Native](https://reactnative.dev) 0.81
- [NativeWind](https://www.nativewind.dev) v4 (Tailwind dans React Native)
- TypeScript strict

### Données & état

- [`@tanstack/react-query`](https://tanstack.com/query) v5 — cache, loading/error states, mutations
- [`@supabase/supabase-js`](https://supabase.com) v2 — backend Postgres + auth magic link + RLS (feature flag `EXPO_PUBLIC_USE_SUPABASE` — `false` par défaut = mode mock local)
- `@react-native-async-storage/async-storage` — persistance session natif
- `@react-native-community/netinfo` — détection offline

### UI & animation

- `expo-linear-gradient` pour les dégradés institutionnels
- `expo-blur` pour les effets de transparence
- `lucide-react-native` pour les icônes (parité avec la version web)
- `react-native-svg` pour les SVG inline
- `react-native-reanimated` + `react-native-worklets` pour les animations (pulse urgent, layout animations)
- `react-native-safe-area-context` pour les zones de sécurité iOS/Android
- `expo-notifications` — collecte des tokens Expo Push (Phase 5)

### Web target (mode démo navigateur)

- `react-dom` + `react-native-web` + `@expo/metro-runtime`
- `PhoneFrame` simulateur iPhone activé automatiquement sur écrans ≥ 600 px

### Outillage qualité

- ESLint + Prettier (config Expo)
- `babel-preset-expo` (devDep)
- `cross-env` + `rimraf` (scripts portables Windows/Unix)

---

## Installation et lancement

```bash
cd mobile-app
npm install --legacy-peer-deps
npx expo start
```

Puis :

- Scanner le QR code avec **Expo Go** (Android/iOS)
- Ou appuyer sur `w` dans le terminal pour ouvrir la **version web** dans le navigateur
- Ou appuyer sur `a` / `i` pour lancer un simulateur

> **Note** : le flag `--legacy-peer-deps` est nécessaire car certaines dépendances ont des peer deps incompatibles.

### Validation que le bundle compile

Pour vérifier rapidement (en CI ou en local) que le projet bundle correctement sans lancer l'UI :

```bash
EXPO_OFFLINE=1 CI=1 npx expo export --platform web --output-dir .test-build
# puis nettoyer :
rm -rf .test-build
```

Cette commande est non-interactive, surface toutes les erreurs Metro/Babel/NativeWind et exit avec un statut clair.

### Scripts npm utiles

| Commande               | Action                                                 |
| ---------------------- | ------------------------------------------------------ |
| `npm start`            | Démarre Expo (interactive : web / iOS / Android)       |
| `npm run web`          | Démarre Expo en mode web uniquement                    |
| `npm run typecheck`    | Vérifie TS sans émettre de fichiers (`tsc --noEmit`)   |
| `npm run lint`         | ESLint sur tout le code (`.ts/.tsx`)                   |
| `npm run lint:fix`     | Auto-correction des règles fixables                    |
| `npm run format`       | Prettier réécrit les fichiers `.ts/.tsx/.js/.json/.md` |
| `npm run format:check` | Prettier en mode vérification (CI-friendly)            |
| `npm run bundle:check` | Bundle web non-interactif (smoke test, idéal en CI)    |

Avant de commit, lancer la combo : `npm run typecheck && npm run lint && npm run format:check`.

### Couche données : services + hooks React Query

L'app utilise une **couche d'abstraction** entre l'UI et les données :

```
écran → useDossiers() (hook React Query) → dossiersService.listDossiers() (service) → mockData (ou backend plus tard)
```

| Couche   | Rôle                                                                      | Localisation           |
| -------- | ------------------------------------------------------------------------- | ---------------------- |
| Services | Fonctions async pures qui renvoient les données                           | `services/<entity>.ts` |
| Hooks    | Wrappers React Query (loading, error, cache)                              | `hooks/use<Entity>.ts` |
| Écrans   | Consomment les hooks, jamais mockData directement (sauf cas de référence) | `app/**/*.tsx`         |

**Pourquoi ce design** : à l'arrivée du backend, seuls les services changent (`fetch()` au lieu de `mockAsync()`). Les hooks et écrans restent identiques. Toutes les clés de cache sont centralisées dans `services/_config.ts` (`QUERY_KEYS`).

**Tester avec une latence** : passer `MOCK_LATENCY_MS = 300` dans `services/_config.ts` pour voir les états de loading apparaître.

### Typed routes Expo Router

`experiments.typedRoutes: true` dans `app.json` génère `.expo/types/router.d.ts` avec **tous les chemins de l'app typés**. Bénéfices :

- `router.push('/parent/dossiers')` → typé, autocomplétion, erreur si la route n'existe pas
- `router.push({ pathname: '/parent/dossier-detail', params: { id } })` → préférer cette forme pour les routes paramétrées
- Si tu supprimes/renommes un écran, TypeScript pointe immédiatement tous les appels obsolètes

---

## Écrans disponibles

La maquette principale est recentrée sur le MVP : dossiers, messages, rendez-vous, écoles et annuaire des bons interlocuteurs mairie/parents. Les autres routes existent encore dans le code pour mémoire, mais elles sont sorties des parcours visibles et classées en réserve dans [`MAQUETTE_COMPLETE.md`](MAQUETTE_COMPLETE.md).

### Parcours principal visible

| Espace      | Écran                         | Route                           |
| ----------- | ----------------------------- | ------------------------------- |
| Transversal | Accueil / choix du profil     | `/`                             |
| Transversal | Saisie clé école              | `/join-school`                  |
| Transversal | Création compte parent élu    | `/create-account`               |
| Parent élu  | Accueil MVP                   | `/parent/home`                  |
| Parent élu  | Liste des dossiers            | `/parent/dossiers`              |
| Parent élu  | Détail dossier                | `/parent/dossier-detail?id=...` |
| Parent élu  | Nouvelle demande              | `/parent/new-request`           |
| Parent élu  | Messages mairie               | `/parent/messages`              |
| Parent élu  | Détail message                | `/parent/message-detail?id=...` |
| Parent élu  | Rendez-vous                   | `/parent/appointments`          |
| Parent élu  | Annuaire Parents/Mairie/Admin | `/parent/directory`             |
| Parent élu  | Historique rapide             | `/parent/historique`            |
| Parent élu  | Profil/réglages discrets      | `/parent/profile`               |
| Mairie      | Tableau de bord               | `/mairie/dashboard`             |
| Mairie      | Liste des écoles              | `/mairie/schools`               |
| Mairie      | Fiche école                   | `/mairie/school-detail?id=...`  |
| Mairie      | Messages mairie               | `/mairie/messages`              |
| Mairie      | Rendez-vous mairie            | `/mairie/rendez-vous`           |
| Mairie      | Réponse structurée dossier    | `/mairie/reply`                 |

---

## Parcours testables

### Parcours parent élu

1. Ouvrir l'app → écran d'accueil
2. Tapoter « J'ai une clé école »
3. Saisir `JAURES-2026` → « Continuer » → carte école → « Confirmer et créer mon compte »
4. Écran de création de compte (placeholder) → « Continuer vers mon espace »
5. Accueil parent élu avec dossiers en cours, dernier message mairie, prochain RDV et historique rapide
6. Navigation via bottom nav vers Dossiers, Messages, Rendez-vous, Annuaire
7. Annuaire → onglets Parents élus, Contacts mairie, Anciens admins

### Parcours mairie

1. Ouvrir l'app → tapoter « Je suis une mairie »
2. Tableau de bord mairie centré sur écoles, messages, rendez-vous et dossiers
3. Navigation : Dashboard → Écoles → Détail école
4. Dashboard → Messages mairie / Rendez-vous mairie
5. Dossier mairie → Réponse structurée

---

## Architecture

```
mobile-app/
├── app/                      # Routes Expo Router (file-based)
│   ├── _layout.tsx           # Stack racine
│   ├── index.tsx             # Welcome
│   ├── join-school.tsx       # Clé école
│   ├── create-account.tsx    # Création compte (placeholder)
│   ├── parent/               # Espace parent élu
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── dossiers.tsx
│   │   ├── dossier-detail.tsx
│   │   ├── new-request.tsx
│   │   ├── directory.tsx
│   │   ├── messages.tsx
│   │   ├── message-detail.tsx
│   │   ├── appointments.tsx
│   │   ├── historique.tsx
│   │   └── profile.tsx        # Entrée discrète via avatar NB
│   └── mairie/               # Espace mairie
│       ├── _layout.tsx
│       ├── dashboard.tsx
│       ├── schools.tsx
│       ├── school-detail.tsx
│       ├── messages.tsx
│       ├── rendez-vous.tsx
│       └── reply.tsx
├── components/               # 15 composants UI réutilisables
├── constants/theme.ts        # Palette et gradients (parité web)
├── data/mockData.ts          # Données fictives centralisées
├── types/index.ts            # Types TS partagés
├── tailwind.config.js        # Palette répliquée de mockups-app
├── babel.config.js
├── metro.config.js
├── global.css                # Directives Tailwind
└── nativewind-env.d.ts
```

Les autres fichiers de routes restent dans `app/` en réserve, mais ne font pas partie du parcours principal visible.

---

## Données fictives

Toutes les données sont mockées dans [`data/mockData.ts`](data/mockData.ts) :

- **Collectivité** : Ville de Montreuil-sur-Seine
- **4 écoles** : Jean Jaurès (école de référence), Louise Michel, Victor Hugo, Simone Veil
- **5 personnes** : Nadia Benali (parent admin), Marc Laurent (parent contributeur FCPE), Claire Moreau (mairie), Thomas Lefèvre (adjoint éducation), Mme Girard (direction)
- **5 contacts mairie structurés** : éducation, voirie, bâtiment, restauration/périscolaire, cabinet élu
- **2 anciens admins uniquement** : anciens présidents/administrateurs, sans anciens contributeurs
- **4 dossiers** : passage piéton, sanitaires, sectorisation, RDV conseil
- **2 rendez-vous**, **2 messages mairie**, avec pièces jointes uniquement liées aux dossiers/messages/RDV
- **Référentiels** : 11 statuts dossier, 12 catégories, 3 niveaux d'urgence

---

## Limites actuelles

- Pas de backend réel — toutes les données sont en mémoire
- Pas d'authentification réelle (pas de SecureStore, pas de Firebase, pas de Supabase)
- Pas de notifications push
- Pas de stockage réel des pièces jointes : affichage mocké uniquement dans les dossiers, messages et rendez-vous liés
- Pas de drag-and-drop pour les pièces jointes
- Les formulaires (création compte, nouvelle demande, réponse mairie) sont des placeholders enrichis
- L'animation de pulse sur le badge urgent utilise `react-native-reanimated` — peut nécessiter un rebuild natif sur certaines configurations
- Les SVG icônes inline sur le Welcome reproduisent les SVG du web pour fidélité visuelle

---

## Prochaines étapes

Voir [`TODO.md`](TODO.md) pour la roadmap détaillée. En résumé :

1. Authentification (probable Supabase ou Firebase)
2. Backend de persistance des dossiers et messages
3. Notifications push (expo-notifications)
4. Stockage de fichiers (pièces jointes)
5. Exports PDF réels côté backend ou `expo-print`
6. Tests (Jest + React Native Testing Library)
7. Publication App Store / Google Play

---

## Note importante

Cette application est **strictement isolée** du prototype web (`mockups-app/`) — aucun fichier n'a été modifié, supprimé, déplacé ou renommé en dehors de `mobile-app/`. Voir [`MIGRATION_NOTES.md`](MIGRATION_NOTES.md) pour le détail.
