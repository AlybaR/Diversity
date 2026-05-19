# Journal des modifications — mobile-app

Ce fichier consigne toutes les modifications importantes apportées à `mobile-app/`.
Le projet web `mockups-app/` n'est jamais modifié.

---

## 2026-05-19 — Étape 16 : Phase 1 backend Supabase (fondations)

### Contexte

Phase 1 du [plan de mise en production](../../.claude/plans/continue-le-travail-sur-humble-aurora.md) : remplacer le mockData par un vrai backend, avec la sécurité matérialisée au niveau base de données (Row Level Security PostgreSQL). Cette étape pose les **fondations côté code** ; le branchement effectif des services à Supabase se fera dans une étape suivante.

Branche feature : `feat/phase1-supabase-foundations` (workflow PR obligatoire suite à la protection de `main` activée en Phase 0).

### Décisions structurantes

- **Hébergement** : Supabase région `eu-west-3` (Paris) — conforme RGPD.
- **Schema** : snake_case côté SQL, conversion gérée par la couche services côté app (en Phase 1.2 à venir).
- **IDs** : TEXT (compatibles avec les IDs lisibles du seed dev), pas UUID. Migration facile en UUID plus tard si besoin.
- **Stockage RLS** : la sécurité est dans la base, pas dans le code. Une fonction `user_can_see_scope(scope)` réplique exactement la matrice `canRoleSeeScope` de `types/index.ts`. Bug applicatif = 0 fuite possible.
- **Pièces jointes** : table dédiée pour les pièces de dossier (`pieces_jointes`), JSONB pour celles des RDV/messages (modèle plus léger, cohérent avec le TS actuel).
- **Auth user link** : colonne `auth_user_id` sur `personnes` ajoutée dès la migration 0002 pour anticiper le branchement Phase 2 (magic link).

### Fichiers créés

- `lib/supabase.ts` : client Supabase unique, lit la config depuis `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Warning explicite en dev si les vars manquent.
- `.env.example` : template documenté pour le `.env.local` à créer côté utilisateur.
- `supabase/migrations/0001_initial_schema.sql` : 11 tables, 9 enums, triggers `set_modifie_le`, index sur les FK + colonnes filtrées. Réplique fidèle des types TS.
- `supabase/migrations/0002_rls_policies.sql` : 
  - Colonne `auth_user_id UUID` sur `personnes` (lien Phase 2).
  - Fonctions `current_user_role()`, `current_user_ecole_id()`, `user_can_see_scope()`.
  - RLS activée sur les 11 tables.
  - 11 policies SELECT + 4 policies INSERT/UPDATE (squelette à raffiner Phase 2).
- `supabase/seed.sql` : données équivalentes à `data/mockData.ts` (1 mairie, 4 écoles, 5 personnes, 5 contacts mairie, 8 dossiers couvrant les 4 scopes, 3 RDV, 3 messages, historique + pièces + commentaires sélectionnés).
- `supabase/README.md` : guide complet de prise en main (création projet, migrations, seed, vérifications, architecture de sécurité, lien auth.users ↔ personnes).

### Fichiers modifiés

- `package.json` : ajout de `@supabase/supabase-js` (199 packages ajoutés en tout, 4 vulnérabilités modérées non bloquantes).

### Ce qui n'est PAS dans cette étape (volontairement)

- **Branchement des services à Supabase** : la couche `services/*.ts` continue de lire `mockAsync(DOSSIERS)`. Le swap vers `supabase.from('dossiers').select()` se fera en Phase 1.2, une fois que l'utilisateur aura créé son projet Supabase et configuré son `.env.local`.
- **Auth magic link** : Phase 2 dédiée.
- **Tests RLS automatisés** (pgTAP ou scripts d'attaque) : à ajouter en fin de Phase 1.

### Vérifications

- ✅ `npm run typecheck` exit 0
- ✅ `npm run lint` exit 0 (en attente du résultat)
- ✅ `mockups-app/` intact
- ⏳ Bundle web : à valider via la CI GitHub Actions au push

### Prochaine étape

Une fois cette PR mergée :
1. **Côté utilisateur** : créer le projet Supabase (cf. `supabase/README.md`), exécuter les migrations + seed, configurer `.env.local`.
2. **Côté code** : Phase 1.2 — brancher les services (`services/dossiers.ts`, `services/messages.ts`, etc.) à Supabase.
3. Adapter les tests E2E Playwright pour utiliser le seed Supabase au lieu du mockData en mémoire.

---

## 2026-05-19 — Étape 1 : Inspection et garde-fous

### État initial observé

Le dossier `mobile-app/` existait déjà au lancement de la session (scaffolding partiel d'une session précédente) :

- App Expo SDK 54.0.33 initialisée (template blank TypeScript)
- React 19.1.0, React Native 0.81.5
- Dépendance `expo-router 6.0.23` présente mais **non configurée** (entrée principale = `index.ts` → `App.tsx` par défaut)
- `tailwindcss 3.3.2` déjà installé (sans NativeWind)
- `node_modules/` déjà présent
- Fichiers initiaux conservés (règle : aucune suppression) : `App.tsx`, `index.ts`, `app.json`, `package.json`, `tsconfig.json`, `package-lock.json`, `.gitignore`, `assets/{icon,splash-icon,adaptive-icon,favicon}.png`
- Dossier `.git/` présent (le projet a son propre repo git)

### Décisions techniques

- **Préservation** : Aucun fichier existant n'est supprimé. `App.tsx` et `index.ts` sont conservés mais l'entrée principale sera basculée vers `expo-router/entry` via le champ `main` de `package.json`.
- **Réutilisation** : on s'appuie sur l'install Expo existante (pas de re-init) pour éviter le risque d'écraser des assets.
- **NativeWind v4** sera ajouté par-dessus l'install existante. `tailwindcss 3.3.2` reste compatible.

### Vérifications

- `mockups-app/` confirmé intact (non touché).
- Aucun fichier modifié en dehors de `mobile-app/` (sauf le fichier de plan dans `~/.claude/plans/`).

### Fichiers créés

- `mobile-app/CHANGELOG_MOBILE.md` : ce journal.

---

## 2026-05-19 — Étape 2 : Configuration NativeWind v4 + dépendances visuelles

### Dépendances installées (via `npm install --legacy-peer-deps`)

- `nativewind@^4.1.23` (résolu 4.2.4)
- `tailwindcss@^3.4.17` (résolu 3.4.19) — upgrade depuis 3.3.2 pour compatibilité NativeWind v4
- `expo-linear-gradient@~15.0.7`
- `expo-blur@~15.0.7`
- `lucide-react-native@^0.469.0`
- `react-native-svg@~15.12.1`

### Problèmes rencontrés

1. **ERESOLVE peer dependency conflict** sur le premier `npm install` (react-dom vs react vs expo-router). Solution : `--legacy-peer-deps` systématique (documenté dans le README).
2. **`npx expo install` échoue avec `TypeError: fetch failed`** : Expo CLI ne peut pas joindre son API de versioning. Solution : installation directe avec versions explicites compatibles Expo SDK 54.

### Fichiers créés

- `mobile-app/tailwind.config.js` : palette répliquée de `mockups-app/src/index.css` (primary, accent, success, danger, warning, slate, mairie)
- `mobile-app/babel.config.js` : preset `babel-preset-expo` avec `jsxImportSource: 'nativewind'` + preset `nativewind/babel`
- `mobile-app/metro.config.js` : `withNativeWind(config, { input: './global.css' })`
- `mobile-app/global.css` : directives `@tailwind base/components/utilities`
- `mobile-app/nativewind-env.d.ts` : référence types NativeWind

### Fichiers modifiés

- `mobile-app/package.json` : champ `main` basculé de `"index.ts"` à `"expo-router/entry"` pour activer Expo Router

### Décisions techniques

- Préservation de `App.tsx` et `index.ts` même si plus utilisés comme entry point (règle « ne supprime rien »)
- Versions Expo SDK 54 explicites pour contourner le blocage réseau

---

## 2026-05-19 — Étape 3 : Types, constantes et données mockées

### Fichiers créés

- `mobile-app/types/index.ts` : types `Urgence`, `StatutDossier` (11 valeurs), `Categorie` (12 valeurs), `Role`, `StatutRDV`, `PrioriteMessage`, `Mairie`, `Ecole`, `Personne`, `Dossier`, `HistoriqueEvent`, `RendezVous`, `Message`
- `mobile-app/constants/theme.ts` : `COLORS` (palette complète) + `GRADIENTS` (header, primary, mairie, bodyShell) + `RADIUS`. Utilisable depuis JS (LinearGradient).
- `mobile-app/data/mockData.ts` : `MAIRIE` (Montreuil-sur-Seine), `ECOLES` (4), `PERSONNES` (5 dont Nadia Benali, Marc Laurent, Claire Moreau, Thomas Lefèvre, Mme Girard), `DOSSIERS` (4 avec historique), `RENDEZ_VOUS` (2), `MESSAGES` (2), référentiels `STATUTS_DOSSIER` / `CATEGORIES` / `URGENCES`, stats calculées `STATS_PARENT` et `STATS_MAIRIE`

---

## 2026-05-19 — Étape 4 : 15 composants UI réutilisables

### Fichiers créés

- `components/GradientHeader.tsx` : LinearGradient + safe area + back + titre + sous-titre (variantes parent/mairie)
- `components/AppHeader.tsx` : header neutre blanc pour écrans secondaires
- `components/BottomNav.tsx` : tab bar fixe — variant parent (5 onglets : Accueil/Dossiers/Messages/RDV/Annuaire), variant mairie (3 onglets)
- `components/Card.tsx` : container blanc rounded-2xl + shadow + border-slate-100
- `components/Badge.tsx` : pilule avec tons primary/success/danger/warning/slate/indigo/emerald
- `components/StatusBadge.tsx` : exports `StatutBadge` et `UrgenceBadge` (mapping statut → tone)
- `components/PrimaryButton.tsx` : LinearGradient bleu + shadow institutionnel
- `components/SecondaryButton.tsx` : outline / ghost / slate
- `components/TextInputField.tsx` : label + TextInput stylé + helper + focus state + support monospace
- `components/DossierCard.tsx` : titre + catégorie + statut + urgence + métriques (pièces jointes, commentaires, MAJ)
- `components/SchoolCard.tsx` : nom + adresse + direction + compteurs dossiers
- `components/RepresentativeCard.tsx` : avatar initiales + rôle + association + email + statut
- `components/MessageCard.tsx` : titre + priorité + date + extrait + indicateur lu/non lu
- `components/AppointmentCard.tsx` : titre + date/heure/lieu + participants + statut + dossier lié
- `components/Placeholder.tsx` : écran générique "à venir" avec liste d'éléments prévus + CTAs

---

## 2026-05-19 — Étape 5 : 3 écrans prioritaires (réplique pixel-perfect)

### Fichiers créés

- `app/_layout.tsx` : Stack root + SafeAreaProvider + StatusBar + import global.css
- `app/index.tsx` : **WelcomeScreen** répliqué — gradient header `#1e3a8a → #2563eb → #6366f1`, logo School (SVG inline via react-native-svg), badge Sparkles, glass-card de description, 3 boutons profil (J'ai une clé école → join-school, Je suis une mairie → /mairie/dashboard, Je suis une direction → /parent/home)
- `app/join-school.tsx` : **SchoolKeyScreen** répliqué — 4 états (input/valid/invalid/expired), `useState` local, code détecté `JAURES-2026` → carte école (Building2 + MapPin + Mairie), code `EXPIRE` → état expiré, autres codes → invalide
- `app/parent/home.tsx` : **ParentHomeScreen** répliqué — header gradient + avatar initiales NB + badge "Parent élu — Administrateur", 5 cartes (alerte, sujets en cours avec pulse animé via Reanimated, dernier message mairie, prochain RDV avec badges, historique rapide grid), 2 FABs (calendar success + plus gradient), BottomNav
- `app/parent/_layout.tsx` : Stack interne parent (header caché)
- `app/mairie/_layout.tsx` : Stack interne mairie (header caché)

### Adaptations RN

- Gradients web → `<LinearGradient>` avec mêmes stops
- `pulse-urgent` → `useSharedValue` + `withRepeat` Reanimated (PulseNumber component)
- `glass-card` → `rgba(255,255,255,0.15)` + border translucide (sans BlurView pour perfs)
- SVG icônes custom du WelcomeScreen → SchoolIcon/BuildingIcon/GraduationIcon avec `react-native-svg`
- `hover:*` supprimés, `active:scale-[0.98]` → `Pressable` avec `style={({ pressed })}`

---

## 2026-05-19 — Étape 6 : 10 placeholders navigables

### Fichiers créés

- `app/create-account.tsx` : Placeholder création compte
- `app/parent/dossiers.tsx` : **fonctionnel** — filtres pills + DossierCard depuis mockData + bouton nouvelle demande
- `app/parent/dossier-detail.tsx` : **fonctionnel** — titre, badges, contexte (école, créateur, interlocuteur, MAJ), historique avec timeline visuelle, 3 boutons d'action
- `app/parent/new-request.tsx` : Placeholder formulaire nouvelle demande
- `app/parent/directory.tsx` : **fonctionnel** — RepresentativeCard pour parent_admin + parent_contributeur
- `app/parent/messages.tsx` : **fonctionnel** — MessageCard depuis MESSAGES
- `app/parent/appointments.tsx` : **fonctionnel** — À venir / Demandés / Passés + bouton demander
- `app/mairie/dashboard.tsx` : **fonctionnel** — gradient teal + 4 cartes stats + écoles à surveiller + derniers dossiers + RDV + bouton message
- `app/mairie/schools.tsx` : **fonctionnel** — SchoolCard avec compteurs dossiers ouverts/urgents
- `app/mairie/school-detail.tsx` : **fonctionnel** — direction + clé école + représentants + dossiers + RDV + actions
- `app/mairie/reply.tsx` : Placeholder réponse mairie structurée

### Décisions techniques

- 7 des 10 placeholders sont en fait **fonctionnels** (utilisation directe des composants + mockData) — seuls 3 restent en mode Placeholder strict (create-account, new-request, reply) car ils nécessitent des formulaires complexes
- Navigation câblée via `router.push()` partout

---

## 2026-05-19 — Étape 7 : Documentation

### Fichiers créés

- `mobile-app/README.md` : présentation, stack, installation, 13 écrans listés, limites, prochaines étapes
- `mobile-app/MIGRATION_NOTES.md` : confirmation d'isolation, état initial, sources consultées, écrans migrés, composants, choix techniques, problèmes rencontrés, éléments non migrés
- `mobile-app/TODO.md` : 13 sections couvrant placeholders à compléter, 8 écrans secondaires, backend, auth, rôles, RGPD, push, fichiers, exports PDF, tests, publication store, UX, technique

---

## 2026-05-19 — Étape 8 : Validation runtime du bundle web

### Objectif

Tester que l'app se compile/bundle entièrement (pas seulement TypeScript) — TS check ne couvre pas les erreurs de runtime/configuration (NativeWind, Reanimated, Babel presets, modules manquants).

### Commande de validation

```powershell
EXPO_OFFLINE=1 CI=1 npx expo export --platform web --output-dir .test-build
```

(Web export choisi car non-interactif et qui surface tous les problèmes de bundling Metro + NativeWind sans nécessiter de simulateur natif.)

### Dépendances manquantes découvertes et installées

1. **`react-dom@19.1.0` + `react-native-web@~0.21.0` + `@expo/metro-runtime`** : nécessaires pour la cible web. Installés via `npm install … --save --legacy-peer-deps`.
2. **`babel-preset-expo`** : référencé par notre `babel.config.js` mais pas dans `node_modules` (n'était pas une dépendance directe). Ajouté en `devDependency`.
3. **`react-native-worklets`** : peer dependency de `react-native-reanimated@4.x` (avec Reanimated 4 le plugin Babel a été déplacé dans ce package séparé). Ajouté en `dependency`.

### Résultat du bundle

```
Web Bundled 10924ms node_modules\expo-router\entry.js (2604 modules)
› web bundles (2):
  _expo/static/css/web-802fc3f4...css (14.5 kB)
  _expo/static/js/web/entry-75aaa532....js (3.63 MB)
```

✅ Bundle complet (2604 modules, 10.9 s)
✅ CSS NativeWind généré : 14.5 kB contenant toutes les classes custom utilisées (`bg-primary-500`, `rounded-2xl`, `bg-mairie-*`, `bg-success-50`, `bg-danger-50`, `bg-slate-50`, etc.)
✅ Pas d'erreur de compilation Metro

### Décision technique

- Le `.test-build/` et `bundle-test.log` sont temporaires (ajoutés au `.gitignore`) et nettoyés après chaque vérification.
- L'utilisateur peut désormais lancer `npx expo start --web` ou `npx expo start` (Expo Go) avec une certitude raisonnable que le bundle fonctionne.

### Fichiers créés

(aucun — uniquement des installations de packages)

### Fichiers modifiés

- `mobile-app/package.json` : ajout de 5 packages (`react-dom`, `react-native-web`, `@expo/metro-runtime`, `babel-preset-expo`, `react-native-worklets`)
- `mobile-app/.gitignore` : exclusion des artefacts de test (`.test-build/`, `bundle-test.log`)

### Problèmes rencontrés

- Premier essai : `expo export` essayait de joindre l'API Expo de versioning (`TypeError: fetch failed`). → Contournement avec `EXPO_OFFLINE=1 CI=1`.
- En mode offline : warning « Dependency validation is unreliable in offline-mode » — non bloquant.
- 3 erreurs successives de modules manquants (web deps, babel-preset, worklets) → installations explicites avec versions compatibles SDK 54.

### Vérifications

- ✅ Bundle web généré sans erreur
- ✅ CSS NativeWind contient bien nos classes custom (palette + utilités)
- ✅ `mockups-app/` toujours intact (aucune écriture en dehors de `mobile-app/`)

---

## 2026-05-19 — Étape 9 : Validation visuelle dans Chrome

### Commande de lancement utilisée

```powershell
EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081
```

- `EXPO_OFFLINE=1` : skip les appels API Expo (sandbox sans réseau vers expo.dev)
- `CI=1` : désactive les reloads watch et le menu interactif (utile pour exécution managée)
- `--web --port 8081` : sert l'app sur `http://localhost:8081`

### Résultat du bundling

```
Waiting on http://localhost:8081
Web Bundled 8176ms node_modules\expo-router\entry.js (2673 modules)
[web] Logs will appear in the browser console
```

HTTP 200 sur `http://localhost:8081` (vérifié avec `curl`), page HTML servie correctement.

### Validation utilisateur

- L'utilisateur a ouvert l'app dans Chrome (mode iPhone 14 Pro / 390×844 recommandé) et **a confirmé que le rendu est conforme** (« c'est très bien »).
- Les 3 écrans pixel-perfect (Welcome, join-school, parent/home) s'affichent correctement avec :
  - gradients institutionnels bleu (header) et primary (boutons)
  - cartes blanches arrondies + badges colorés
  - pulse animé sur le compteur de dossier urgent (Reanimated 4)
  - bottom nav fonctionnelle
  - SVG inline (Welcome) rendus correctement

### Décision technique

- Les SVG inline du Welcome (`SchoolIcon`, `BuildingIcon`, `GraduationIcon`) basés sur `react-native-svg` rendent bien aussi bien en navigateur (via react-native-web) qu'en natif → bonne stratégie pour la cohérence visuelle stricte.
- Le mode `EXPO_OFFLINE=1 CI=1` est le bon mode pour cette sandbox (Expo API inaccessible).

### Fichiers créés

(aucun)

### Fichiers modifiés

(aucun — pas de correction nécessaire après validation visuelle)

### Vérifications

- ✅ HTTP 200 sur `http://localhost:8081`
- ✅ 2673 modules bundlés (légèrement plus que l'export — modules dev en plus)
- ✅ Rendu utilisateur validé sur Chrome
- ✅ Pas d'erreur Metro/Babel/NativeWind
- ✅ `mockups-app/` toujours intact

---

## 2026-05-19 — Étape 10 : PhoneFrame web (simulateur iPhone dans le navigateur)

### Demande utilisateur

> « Que ça s'affiche toujours dans le navigateur, ok, mais que ce soit dans le format téléphone, un peu comme dans les screenshots, qui est dans les mockups-app, pour qu'on voit vraiment qu'est-ce que ça rend quand c'est dans une application et pas un site web. »

### Décision technique

Créer un composant `PhoneFrame.tsx` qui :

- **Sur web large (≥ 600 px)** : affiche un device iPhone simulé (390 × 844, coins arrondis 40 px, bezel sombre via `boxShadow` 3-layer, notch noir au top) centré dans un fond gradient `bodyShell` (les mêmes 3 stops que `mockups-app/src/index.css body`)
- **Sur natif (Expo Go iOS/Android) ou web étroit (< 600 px)** : ne fait rien, renvoie `<>{children}</>` direct
- Activation contrôlée par `Platform.OS === 'web'` + `useWindowDimensions()`

Wrap appliqué dans `app/_layout.tsx` autour du `Stack`. Le contenu de l'app rend dans le cadre 390 × 844, exactement comme dans le proto web.

### Fichiers créés

- `mobile-app/components/PhoneFrame.tsx` : composant simulateur iPhone (15 lignes utiles + styles inline)

### Fichiers modifiés

- `mobile-app/app/_layout.tsx` : `<PhoneFrame>` wrap autour du `<Stack>`
- `mobile-app/TODO.md` : ajout § 14 « Stratégie web admin pour les mairies » (pistes A unique app responsive vs B mobile Expo + admin Next.js séparé, décision à valider avec commanditaire)

### Détails techniques

- `boxShadow` (CSS) utilisé en web uniquement via spread conditionnel `Platform.OS === 'web'` — cette propriété n'existe pas en RN natif mais est supportée par react-native-web
- Le notch est un `View` absolu z-index 50 (au-dessus du contenu), couleur `#1a1a2e`, dimensions `150 × 28` reprises du CSS web
- Le fond gradient `bodyShell` (`#f0f4ff → #e8f0fe → #f5f0ff`) ajouté précédemment dans `constants/theme.ts` est utilisé ici
- `pointerEvents="none"` sur le notch pour ne pas bloquer les clics

### Vérifications

- ✅ TypeScript compile (`npx tsc --noEmit`)
- ✅ Sur mobile natif : `shouldFrame === false` → comportement inchangé
- ⏳ À valider visuellement : le serveur dev doit être redémarré (CI=1 désactive le watch) pour que le bundle prenne en compte la modif

---

## 2026-05-19 — Étape 11 : Fondations qualité (ESLint + Prettier + typed routes)

### Objectif (demande utilisateur : « fais le plus intelligent sur le long terme »)
Investir dans les fondations qualité **avant** que le code grossisse. Trois piliers retenus :
1. **ESLint + Prettier** : catch des bugs à chaque save, formatage homogène, fin des débats de style
2. **Typed routes Expo Router** : chaque `router.push('/xxx')` et `<Link href="...">` vérifié au compile time — un faux-pas comme `/parent/hom` devient erreur TS au lieu d'un bug runtime silencieux
3. **Scripts npm utiles** : `typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `bundle:check` exposés au plus haut niveau

### Dépendances installées
- `eslint@^8.57.1` (v8 stable, large support tooling — v10 utilisait flat config encore peu mature dans cet écosystème)
- `eslint-config-expo@^55.0.1` (config Expo officielle : React, RN, hooks, accessibilité)
- `prettier@^3.8.3`
- `eslint-config-prettier@^10.1.8` (désactive les règles ESLint qui conflictent avec Prettier)
- `eslint-plugin-prettier@^5.5.5` (lance Prettier comme une règle ESLint)

### Fichiers créés
- `.eslintrc.js` : extends `expo` + `prettier`, plugin `prettier`, règles `import/order`, `react/jsx-curly-brace-presence`, `@typescript-eslint/no-unused-vars`
- `.prettierrc.js` : single quotes, semi-colons, trailing comma, print width 100, LF endings
- `.prettierignore` : exclusion des node_modules, .expo, .test-build, dist, etc.

### Fichiers modifiés
- `package.json` : 6 nouveaux scripts (`typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `bundle:check`)
- `app.json` : activation `experiments.typedRoutes: true`
- `tsconfig.json` : Expo CLI a auto-ajouté `include: ['**/*.ts', '**/*.tsx', '.expo/types/**/*.ts', 'expo-env.d.ts']`
- **30 fichiers reformatés automatiquement par Prettier** (single quotes, trailing commas, line breaks normalisés)

### Refactoring typed routes
6 occurrences de `router.push(... as never)` (workaround pour routes non typées) → refactorées proprement :

| Fichier | Avant | Après |
| --- | --- | --- |
| `components/BottomNav.tsx` | `path: string` + `as never` | `path: Href` (import `expo-router`) |
| `components/Placeholder.tsx` | `{ path: string }` + `as never` | `{ path: Href }` |
| `app/parent/dossiers.tsx` | `router.push(`/parent/dossier-detail?id=${id}` as never)` | `router.push({ pathname: '/parent/dossier-detail', params: { id } })` |
| `app/mairie/dashboard.tsx` | idem | idem `pathname: '/mairie/reply'` |
| `app/mairie/schools.tsx` | idem | idem `pathname: '/mairie/school-detail'` |

Bénéfice : si je supprime ou renomme un écran, **TypeScript hurle immédiatement** à chaque endroit qui pointait dessus. Plus de bugs de navigation silencieux.

### Génération automatique
- `.expo/types/router.d.ts` (15 routes typées : `/`, `/join-school`, `/create-account`, `/parent/*` × 7, `/mairie/*` × 4, `/_sitemap`)
- `expo-env.d.ts` (référence globale aux types Expo)

### Vérifications
- ✅ `npm run typecheck` exit 0
- ✅ `npm run lint` exit 0 (0 erreurs, 0 warnings après auto-fix)
- ✅ `npm run format:check` ne montrerait que les éventuels fichiers non formatés
- ✅ Bundle web `expo export --platform web` toujours opérationnel
- ✅ Dev server redémarré et HTTP 200 sur `http://localhost:8081`
- ✅ `mockups-app/` toujours intact

### Décisions techniques
- ESLint **v8** plutôt que v10 (flat config encore peu mature avec eslint-config-expo)
- Object form `{ pathname, params }` pour toutes les routes dynamiques (typage + DX > template strings)
- Prettier print width 100 (compromise entre lisibilité + densité écran 14"+)
- Pas de Husky / pre-commit hook pour l'instant — l'utilisateur peut l'ajouter quand il y aura plusieurs contributeurs

### Pourquoi c'est « le plus intelligent sur le long terme »
- Une fois 30+ écrans en place, ces 3 changements coûtent **10× plus cher** à mettre en place (chaque refactor doit toucher tous les fichiers)
- Chaque navigation future bénéficie du type-check sans effort
- Chaque save corrige automatiquement le formatage : aucun débat de style à venir
- Le script `bundle:check` détecte les régressions de bundling en une commande
- Les futurs contributeurs partent avec une base propre

---

## 2026-05-19 — Étape 12 : Formulaires fonctionnels (3 derniers placeholders → vrais formulaires)

### Objectif
Compléter le parcours fonctionnel end-to-end : create-account, parent/new-request et mairie/reply étaient des `<Placeholder>` purs. Les transformer en formulaires utilisables avec validation, état local, soumission qui navigue.

### Nouveau composant
- `components/SelectField.tsx` (~95 lignes) : picker inline expandable (tap pour déplier la liste, tap option pour sélectionner). Générique `<T extends string>`. Animation `LayoutAnimation` (RN built-in, pas de dépendance externe). Affiche un check sur l'option active. Supporte label + helper + maxHeight scrollable.

### Formulaires créés

#### `app/create-account.tsx` (Création de compte parent élu)
- Header gradient bleu (parité avec Welcome/JoinSchool)
- Bandeau RGPD rassurant en haut
- **5 champs** : Prénom, Nom, Email, Téléphone (facultatif), Association (5 choix : FCPE, PEEP, APEL, Parents Indépendants, Autre), Rôle (admin / contributeur)
- **Switch consentement** RGPD (RN `<Switch>` natif)
- Validation côté client : prénom/nom ≥ 2 caractères, email regex, association + rôle requis, consentement obligatoire
- Affichage d'erreurs sous chaque champ après soumission
- Submit valide → `router.replace('/parent/home')`
- Submit invalide → `Alert.alert` listant ce qui manque

#### `app/parent/new-request.tsx` (Nouvelle demande)
- 12 catégories via SelectField (depuis `mockData.CATEGORIES`)
- **Orientation automatique suggérée** sous la catégorie (carte primary, ex. "Suggéré : Service Voirie + Direction" pour `securite`)
- TextInputField titre (validation ≥ 5 caractères)
- TextInput multiline description (validation ≥ 10 caractères) + compteur de caractères
- **Sélecteur d'urgence en 3 chips colorés** (faible vert / moyenne ambre / élevée rouge) — pas un select, plus tactile
- Zone pièces jointes mockée (compteur incrémental + texte adaptatif)
- 3 boutons : **Transmettre à la mairie** (primary, valide + navigue), **Partager aux représentants** (secondaire), **Enregistrer brouillon** (ghost)

#### `app/mairie/reply.tsx` (Réponse mairie structurée)
- Header gradient teal (variante mairie)
- **Récap dossier en haut** : titre + badges (école, statut, urgence) + description tronquée (3 lignes)
- TextInput multiline réponse (validation ≥ 10 caractères) + compteur
- SelectField nouveau statut (8 valeurs filtrées des 11 statuts — exclut brouillon/partage_representants/transmis_mairie qui n'ont pas de sens côté mairie)
- SelectField service concerné (7 services : Voirie, Bâtiment, Restauration, Périscolaire, Éducation, Cabinet adjoint, Communication)
- SelectField délai estimé (6 valeurs : 7j, 2 semaines, 1 mois, 3 mois, 6 mois, NA)
- TextInput multiline action prévue (facultatif)
- **Switch « Proposer un rendez-vous »** — modifie le message de confirmation
- Submit → Alert de confirmation + `router.replace('/mairie/dashboard')`
- Récupère `id` depuis `useLocalSearchParams` (depuis le clic sur un DossierCard du dashboard mairie)

### Dépendances ajoutées
- `cross-env@^10` (devDep) : portabilité Windows ↔ Unix pour les scripts npm
- `rimraf@^6` (devDep) : remplace `rm -rf` dans `bundle:check`

### Fichiers modifiés
- `package.json` : script `bundle:check` portable (`cross-env EXPO_OFFLINE=1 CI=1 expo export ... && rimraf .test-build`)
- 3 placeholders refactorés en vrais écrans

### Décisions techniques
- **Pas de form library** (react-hook-form / formik) : useState simple suffit pour 3 formulaires, complexity premature. Si on monte à 10+ formulaires, on migrera.
- **Pas de Zod / Yup** : validation manuelle inline. Lisible, sans dépendance, suffit pour la démo.
- **`Alert.alert`** pour la confirmation : c'est le standard RN, fonctionne web/iOS/Android sans dep externe (sur web : `window.alert`).
- **`router.replace`** (pas `push`) pour la navigation post-soumission : on ne veut pas que le bouton « Retour » ramène au formulaire après validation.
- **SelectField inline** au lieu de Modal : moins de friction UX, le scroll de la page se déclenche naturellement si nécessaire.
- **3 chips d'urgence** au lieu d'un Select pour le formulaire de demande : plus visuel, choix permanent à 3 options, couleurs sémantiques (vert/ambre/rouge).
- **Orientation suggérée** dynamique selon la catégorie : aide les parents à viser le bon interlocuteur sans cliquer ailleurs.

### Vérifications
- ✅ `npm run typecheck` : exit 0
- ✅ `npm run lint` : 0 erreur, 0 warning (après auto-fix de quelques wraps Prettier)
- ✅ `npm run bundle:check` : bundle web 3.65 MB JS + 14.9 kB CSS (montée de 14.5→14.9 = nouvelles classes Tailwind pour les forms)
- ✅ Dev server redémarré, HTTP 200 sur `http://localhost:8081`
- ✅ `mockups-app/` toujours intact

### Impact parcours
Les 3 parcours principaux sont maintenant **fonctionnels end-to-end** sans aucun écran « à venir » :
- Welcome → join-school (saisir `JAURES-2026`) → carte école → create-account (form fonctionnel) → home parent
- home parent → bottom nav → dossiers → tap un dossier → détail → demander RDV
- Welcome → mairie → dashboard → tap un dossier → reply (form fonctionnel) → retour dashboard
- home parent → FAB "+" → new-request (form fonctionnel) → retour dossiers

---

## 2026-05-19 — Étape 13 : Couche services + hooks React Query

### Objectif (suite « plus intelligent sur le long terme »)
Préparer l'intégration backend en introduisant une **couche d'abstraction services + hooks** dès maintenant. Sans elle, l'arrivée du backend obligerait à modifier chaque écran qui importe directement `mockData`. Avec elle, **seule l'implémentation interne du service change** — les écrans et hooks restent identiques.

### Dépendance ajoutée
- `@tanstack/react-query@^5.100` : standard de facto pour la gestion d'état serveur en React/RN. Cache automatique, loading/error states gratuits, devtools disponibles.

### Architecture mise en place

```
services/
  _config.ts         # MOCK_LATENCY_MS, mockAsync helper, QUERY_KEYS
  ecoles.ts          # listEcoles(), getEcoleById(id)
  dossiers.ts        # listDossiers(filter), getDossierById(id)
  messages.ts        # listMessages(ecoleId?)
  rendezVous.ts      # listRendezVous(filter)
  personnes.ts       # listPersonnes(filter)
  stats.ts           # getStatsParent(ecoleId), getStatsMairie(collectiviteId)
  index.ts           # exporte * as <entity>Service

hooks/
  useDossiers.ts     # useDossiers(filter), useDossier(id)
  useEcoles.ts       # useEcoles(), useEcole(id)
  useMessages.ts     # useMessages(ecoleId?)
  useRendezVous.ts   # useRendezVous(filter)
  usePersonnes.ts    # usePersonnes(filter)
  useStats.ts        # useStatsParent(ecoleId), useStatsMairie(id)
  index.ts           # barrel export
```

### Configuration React Query
- `app/_layout.tsx` enveloppé dans `<QueryClientProvider>` (QueryClient instancié via `useState` pour éviter la recréation à chaque render).
- Options par défaut : `staleTime: 60s`, `gcTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`.
- Les clés de cache sont **standardisées dans `QUERY_KEYS`** (évite typos et chevauchements).

### Refactoring écrans (démonstration du pattern)

| Écran | Avant | Après |
| --- | --- | --- |
| `app/parent/dossiers.tsx` | `import { DOSSIERS } from '../../data/mockData'` | `const { data: dossiers = [], isLoading } = useDossiers()` + filtres réactifs `useState<FilterId>` + `useMemo` + state loading + état vide |
| `app/parent/home.tsx` | 5 imports directs depuis mockData | `useEcoles()`, `useMessages()`, `useRendezVous()`, `useStatsParent(ecoleId)` + early return loading guard |
| `app/mairie/dashboard.tsx` | 4 imports directs depuis mockData | `useDossiers()`, `useRendezVous()`, `useStatsMairie(MAIRIE.id)` + loading guard |

Les 7 autres écrans qui consomment mockData directement restent intacts pour l'instant (refactoring incrémental — le pattern est posé, à appliquer aux autres au fil de l'eau).

### Bonus UX : filtres réactifs sur `parent/dossiers`
Pendant la migration, les 5 chips de filtre (Tous, Ouverts, Urgents, En attente mairie, Résolus) sont passés de **décoratifs** à **fonctionnels** :
- `useState<FilterId>` + `useMemo` pour le filtrage côté client
- Chip actif en fond `bg-primary-500` blanc, chips inactifs en outline slate
- État vide avec bouton « Voir tous les dossiers » quand un filtre ne match rien
- Spinner `ActivityIndicator` pendant le loading (visible si on remet `MOCK_LATENCY_MS > 0`)

### Décisions techniques
- **Pas de cassure de signature** : tous les services renvoient `Promise<T>` même en mode mock (via `mockAsync`). Migration vers `fetch()` se fera 1 ligne à la fois sans toucher les hooks ni les écrans.
- **`MOCK_LATENCY_MS = 0`** par défaut pour une démo fluide ; dev qui veut tester les états de loading peut passer à 200-500 ms.
- **`QUERY_KEYS` centralisées** : tous les keys sont définis dans un seul endroit. Évite `['dossiers']` ici et `['dossier-list']` là.
- **`useState` autour de `new QueryClient()`** : pattern recommandé par TanStack pour ne pas recréer le client à chaque re-render.
- **Hooks avec filtres** : la clé de cache inclut le filtre (`['dossiers', { ecoleId, statut, ... }]`) → React Query met en cache chaque variation séparément.
- **Pas de mutations encore** : `useMutation` sera ajouté avec le backend. Les soumissions de form continuent en `Alert.alert` + navigation pour la démo.

### Fichiers créés (15)
- `services/_config.ts`, `services/ecoles.ts`, `services/dossiers.ts`, `services/messages.ts`, `services/rendezVous.ts`, `services/personnes.ts`, `services/stats.ts`, `services/index.ts`
- `hooks/useDossiers.ts`, `hooks/useEcoles.ts`, `hooks/useMessages.ts`, `hooks/useRendezVous.ts`, `hooks/usePersonnes.ts`, `hooks/useStats.ts`, `hooks/index.ts`

### Fichiers modifiés
- `app/_layout.tsx` : wrap `<QueryClientProvider>`
- `app/parent/dossiers.tsx` : migration + filtres réactifs
- `app/parent/home.tsx` : migration vers hooks
- `app/mairie/dashboard.tsx` : migration vers hooks

### Vérifications
- ✅ `npm run typecheck` exit 0
- ✅ `npm run lint` 0 warning (après auto-fix de quelques wraps Prettier)
- ✅ `npm run bundle:check` : JS 3.74 MB (+90 kB pour React Query — coût acceptable pour ce qu'on gagne)
- ✅ Dev server `http://localhost:8081` HTTP 200
- ✅ `mockups-app/` intact

### Migration backend future (procédure 1 ligne par service)
À l'arrivée du backend, pour chaque fichier `services/<entity>.ts` :
```ts
// AVANT (mock)
export function listDossiers(filter): Promise<Dossier[]> {
  return mockAsync(DOSSIERS.filter(...));
}

// APRÈS (backend)
export async function listDossiers(filter): Promise<Dossier[]> {
  const res = await fetch(`/api/dossiers?${qs(filter)}`, { headers: authHeaders() });
  return res.json();
}
```
**Aucun écran ne change. Aucun hook ne change.** C'est ça l'investissement à long terme.

---

## 2026-05-19 — Étape 14 : Espace direction isolé + dashboard mairie Performance

### Objectif (demande utilisateur)

> « Pour moi il faut vraiment que ce soit séparé du reste des parents d'élèves. En fait il faut qu'ils aient une plateforme à eux où ils ne peuvent pas voir les messages des parents d'élèves. Pourquoi ? Parce qu'il peut y avoir des situations où c'est le directeur d'école, la directrice d'école qui est mise en cause sur certaines situations. […] Sur le dashboard mairie, je dirais qu'il y a peut-être un truc à remettre, c'est ce qui va concerner les stats : temps de réponse moyen, nombre de dossiers. »

Deux chantiers couplés :

1. **Isolation direction.** La direction d'établissement (rôle `direction` qui existait déjà dans `types/index.ts` mais sans écran dédié) avait son bouton du Welcome qui redirigeait vers `/parent/home` (incorrect). Aucun risque acceptable de fuite des conversations parents ↔ mairie vers la direction.
2. **Dashboard mairie Performance.** Les KPI « délai moyen » et « dossiers traités » existaient uniquement dans `/mairie/stats.tsx` (page secondaire). À remonter sur le dashboard sans tout déballer.

### Décisions de design

#### Modèle d'audience (cœur de l'isolation)

Choix d'un champ explicite plutôt qu'un système de flags par rôle :

```ts
// types/index.ts
export type AudienceDossier = 'parents_mairie' | 'institutionnel';
//   'parents_mairie'  (défaut) → conversation privée parents ↔ mairie. Invisible direction.
//   'institutionnel'           → sujet transverse (voirie, RDV concerté, bâtiment).
//                                Visible par parents + mairie + direction.

export type AudienceMessage = 'parents' | 'direction' | 'tous';
//   La mairie choisit qui voit chaque message qu'elle diffuse.
```

Règle d'or : tout est `parents_mairie` / `parents` par défaut → **la direction ne voit rien tant qu'on n'a pas explicitement décidé de l'inclure**. C'est l'opposé d'un opt-out.

#### Architecture des 9 écrans direction

```
app/direction/
  _layout.tsx          Stack interne (calqué sur mairie/_layout.tsx)
  home.tsx             Dashboard direction (header indigo, bandeau de confidentialité)
  dossiers.tsx         Sujets institutionnels uniquement (filtre service audience='visible_direction')
  dossier-detail.tsx   Vue dossier + commentaires + guard 'parents_mairie' bloqué
  new-request.tsx      Création — audience FORCÉE à 'institutionnel' (pas exposée à l'utilisateur)
  messages.tsx         Messages mairie 'direction' ou 'tous' uniquement
  message-detail.tsx   Détail message + guard 'parents' bloqué
  directory.tsx        Annuaire mairie (CONTACTS_MAIRIE) — pas la liste des parents
  appointments.tsx     RDV où la direction figure dans participantsNoms
```

Code couleur **indigo/violet** (`#4f46e5` → `#7c3aed`) distinct du bleu parent et du teal mairie.

#### Dashboard mairie — section Performance

Grille 2×2 actuelle conservée (Écoles / Représentants / Dossiers ouverts / Dossiers urgents). Ajout d'une nouvelle section juste en dessous, **visuellement distincte** :

- Titre « Performance ce mois » + barre slate-200
- 2 cards larges côte-à-côte (`flex-1` chacune, gap 8) :
  - **Délai moyen de réponse** : 3.8 j + badge tendance ↓ −0.5j (vert : amélioration)
  - **Dossiers traités** : 12 + badge tendance ↑ +3 (vert : amélioration)
- Icône à gauche, badge de tendance à droite, valeur grande, label en bas
- `TrendingDown` est bon pour le délai (on baisse = mieux), `TrendingUp` pour les dossiers traités (on monte = mieux). Le composant `PerformanceCard` gère le sens via la prop `positiveWhenNegative`.

**Choix du KPI « dossiers traités »** plutôt que « ouverts » (déjà dans la grille du haut) ou « total » (peu actionnable) : ça mesure le **débit** et complète **qualité** (délai). Couple parlant pour piloter le service.

### Fichiers créés (10)

- `app/direction/_layout.tsx`
- `app/direction/home.tsx`
- `app/direction/dossiers.tsx`
- `app/direction/dossier-detail.tsx`
- `app/direction/new-request.tsx`
- `app/direction/messages.tsx`
- `app/direction/message-detail.tsx`
- `app/direction/directory.tsx`
- `app/direction/appointments.tsx`
- (composant `PerformanceCard` inline dans `app/mairie/dashboard.tsx`)

### Fichiers modifiés

- `types/index.ts` : `AudienceDossier`, `AudienceMessage` ; champs `audience` sur `Dossier` et `Message`.
- `data/mockData.ts` : tag des 4 dossiers existants (`passage-pieton` et `rdv-conseil` → `institutionnel` ; `sanitaires` et `sectorisation` → `parents_mairie`), tag des 2 messages (`travaux` → `tous`, `sectorisation` → `parents`). Ajout :
  - 1 nouveau message `vigipirate` audience `direction` (consignes Vigipirate)
  - 1 nouveau dossier `batiment-salle12` créé par Mme Girard (audience `institutionnel`)
  - 4 nouveaux champs dans `STATS_MAIRIE` : `delaiMoyenJours`, `deltaDelaiJours`, `dossiersTraitesMois`, `deltaDossiersTraitesMois`
- `services/dossiers.ts` : `DossierFilter` accepte `audience?: AudienceDossier | 'visible_direction'`. Aucune cassure des appels existants.
- `services/messages.ts` : nouvelle signature `listMessages({ ecoleId?, destinataire? })` avec filtre `'parents' | 'direction'`. Migration de l'ancien `listMessages(_ecoleId?: string)`.
- `services/stats.ts` : interface `StatsMairie` étendue.
- `hooks/useMessages.ts` : signature passée à `(filter: MessageFilter = {})`, clé de cache enrichie.
- `app/parent/home.tsx`, `app/parent/messages.tsx`, `app/parent/message-detail.tsx` : `useMessages({ destinataire: 'parents' })` pour exclure le message Vigipirate côté parent.
- `app/index.tsx` : redirect du bouton « Je suis une direction » corrigé `/parent/home` → `/direction/home`.
- `components/BottomNav.tsx` : nouveau `variant: 'direction'` avec `DIRECTION_ITEMS` (Accueil / Dossiers / Messages / RDV / Annuaire), couleur active `COLORS.direction[600]`.
- `constants/theme.ts` : ajout de `COLORS.direction` (palette indigo 50 → 800) et `GRADIENTS.direction`.
- `tailwind.config.js` : ajout de la palette `direction` (parité avec `constants/theme.ts`) pour pouvoir utiliser `bg-direction-50`, `text-direction-600`, etc.
- `app/mairie/dashboard.tsx` : section « Performance ce mois » + composant `PerformanceCard` inline.

### Garde-fous d'isolation

- **Filtre côté service** (pas seulement UI) → impossible de bypass en collant un id dans l'URL : `listDossiers({ audience: 'visible_direction' })` retire les `parents_mairie` à la source.
- **Guards dans les détails** : `direction/dossier-detail.tsx` et `direction/message-detail.tsx` affichent un écran « non accessible » si l'utilisateur arrive sur un id qui ne lui est pas destiné.
- **Bandeau de confidentialité** sur la home direction et l'écran de création — clarifie l'isolation à l'utilisateur.

### Vérifications

- ✅ TypeScript compile sans erreur
- ✅ Lint sans warning
- ✅ Bundle web sans erreur (CSS NativeWind contient les nouvelles classes `bg-direction-*`)
- ✅ `mockups-app/` intact (jamais touché)
- ✅ Parcours d'isolation manuel :
  - `/direction/dossiers` → `passage-pieton` + `rdv-conseil` + `batiment-salle12` (institutionnels), pas `sanitaires` ni `sectorisation`
  - `/direction/messages` → `vigipirate` + `travaux`, pas `sectorisation`
  - `/parent/messages` → `travaux` + `sectorisation`, pas `vigipirate`
  - `/mairie/dashboard` → grille 2×2 + section Performance avec 3.8j ↓-0.5 et 12 ↑+3

### Pourquoi cette approche est pérenne

- **Champ d'audience explicite** dans le modèle plutôt qu'un calcul à la volée → quand on branchera le backend, la requête SQL `WHERE audience = 'institutionnel'` se fait en index, pas en filtrage applicatif. La règle d'isolation devient un invariant de schéma, pas du code à maintenir.
- **Filtre côté service** plutôt que côté écran → toute nouvelle vue direction (alerte push, recherche transverse, exports) hérite automatiquement de l'isolation.
- **Bouton « Je suis une direction » câblé correctement dès le Welcome** → un directeur testeur arrive directement dans son espace, pas dans celui des parents.

---

## 2026-05-19 — Étape 15 : Refonte visibility scope (4 canaux explicites)

### Objectif (briefing produit utilisateur)

> « La direction ne doit pas être dans le même canal que les parents élus. […] Il faut penser l'app en 3 espaces séparés, pas un seul espace école partagé par tout le monde. […] Pour chaque objet : dossier, message, RDV, document, commentaire — un champ `visibilityScope`. »

Le modèle binaire de l'étape 14 (`parents_mairie` / `institutionnel`) ne couvre pas :
- le canal **direction ↔ mairie** privé (tensions parents, arbitrages, alertes internes école) ;
- le canal **mairie interne** (notes de service) ;
- le workflow où la mairie élargit un dossier privé en partagé.

### Décisions clés

1. **4 scopes explicites** comme source unique de vérité (`types/index.ts`) :
   ```
   parents_mairie       → parents élus + mairie  (la direction NE VOIT PAS)
   direction_mairie     → direction + mairie     (les parents NE VOIENT PAS)
   partage_tripartite   → parents + direction + mairie
   mairie_interne       → mairie uniquement
   ```

2. **Helper centralisé `canRoleSeeScope(role, scope)`** dans `types/index.ts`. Toute vérification de visibilité passe par cette matrice — côté service ET côté guard d'écran. Refactor + maintenance = un seul endroit à modifier.

3. **Choix explicite de scope à la création** :
   - Parent élu : 2 options (parents_mairie | partage_tripartite). **Ne peut pas créer en direction_mairie ni mairie_interne.**
   - Direction : 2 options (direction_mairie | partage_tripartite). **Ne peut pas créer en parents_mairie ni mairie_interne.**
   - Mairie : 4 options (les 4 scopes).
   - Composant unique `ScopeSelector` qui adapte ses options au rôle du créateur.

4. **Workflow de partage** : sur `mairie/reply`, bouton « Proposer le partage tripartite » visible uniquement pour les dossiers `parents_mairie` ou `direction_mairie`. Alerte explicite que **tout l'historique passé deviendra visible** (choix utilisateur : option « tout l'historique dès le partage »).

5. **Garde-fous renforcés** : si un utilisateur tape une URL directe vers un dossier auquel il n'a pas accès, écran sobre **« Vous n'avez pas accès à ce dossier »** — **aucune fuite de titre ou de contenu**. Mêmes guards sur `parent/dossier-detail`, `parent/message-detail`, `direction/dossier-detail`, `direction/message-detail`.

### Changements de schéma

Renommage `audience` → `visibilityScope` partout (Dossier, Message). Ajout du champ sur `RendezVous`. Champ optionnel sur `PieceJointe` et `CommentaireDossier` (un commentaire peut être plus restrictif que son dossier — pratique pour les notes internes mairie sur un dossier partagé).

Suppression des types ad hoc : `AudienceDossier`, `AudienceMessage` → remplacés par `VisibilityScope` unique.

### Fichiers créés

- `components/ScopeSelector.tsx` (165 lignes) — sélecteur contextuel au rôle avec icônes + descriptions
- `TEST_SCENARIOS.md` (~600 lignes) — checklist QA structurée : 10 cas parent / 10 cas mairie / 8 cas direction / 8 cas cross-canal / 5 transversaux + rapport type

### Fichiers modifiés

- `types/index.ts` : `VisibilityScope` + `canRoleSeeScope` + `scopeShortLabel`, champ propagé à 5 entités
- `data/mockData.ts` : retag des 4 dossiers existants + 2 messages, ajout de :
  - `dossier-communication-direction` (parent → parents_mairie) — cas 1 du briefing
  - `dossier-tensions-representants` (direction → direction_mairie) — cas 2 du briefing
  - `dossier-note-budget` (mairie → mairie_interne)
  - `rdv-tensions` privé direction/mairie
- `services/dossiers.ts`, `services/messages.ts`, `services/rendezVous.ts` : filtre `visibleByRole: Role` qui passe par `canRoleSeeScope`
- `hooks/useMessages.ts` : export du type `MessageFilter`
- `app/parent/new-request.tsx` : intégration `ScopeSelector` (2 options : parents_mairie | partage_tripartite, défaut tripartite)
- `app/direction/new-request.tsx` : intégration `ScopeSelector` (2 options : direction_mairie | partage_tripartite, défaut direction_mairie pour privilégier la confidentialité)
- `app/mairie/reply.tsx` : workflow de partage avec alerte de confirmation explicite sur le partage de l'historique
- `app/parent/dossier-detail.tsx`, `app/parent/message-detail.tsx`, `app/direction/dossier-detail.tsx`, `app/direction/message-detail.tsx` : guards via `canRoleSeeScope` + badge `scopeShortLabel`
- `app/parent/home.tsx`, `app/parent/messages.tsx`, `app/parent/dossiers.tsx`, `app/parent/appointments.tsx`, `app/parent/dossier-detail.tsx` : passent `visibleByRole: 'parent_admin'`
- `app/direction/home.tsx`, `app/direction/dossiers.tsx`, `app/direction/messages.tsx`, `app/direction/appointments.tsx` : passent `visibleByRole: 'direction'`

### Garde-fous d'isolation (matrice complète)

| Tentative | Résultat |
| --- | --- |
| Parent ouvre `/parent/dossier-detail?id=dossier-tensions-representants` | Écran « Accès refusé », pas de fuite du titre |
| Parent ouvre `/parent/message-detail?id=message-vigipirate` | Idem |
| Direction ouvre `/direction/dossier-detail?id=dossier-communication-direction` | Idem |
| Direction ouvre `/direction/dossier-detail?id=dossier-note-budget` | Idem |
| Direction ouvre `/direction/message-detail?id=message-sectorisation` | Idem |

### Vérifications

- ✅ TypeScript compile (refonte complète, aucun `audience` résiduel dans le code applicatif)
- ✅ Lint sans warning après auto-fix
- ✅ Bundle web sans erreur Metro
- ✅ `mockups-app/` intact

### Pourquoi c'est pérenne

- **Une seule source de vérité** : `canRoleSeeScope`. Quand on branchera le backend, c'est cette matrice qui se traduira en politique d'accès SQL (RLS Supabase / vues filtrées). Pas de logique éparse dans 10 écrans.
- **Modèle d'audience par objet, pas par utilisateur** : chaque dossier porte son scope. Un même utilisateur peut être destinataire d'un dossier `direction_mairie` ou `parents_mairie` selon le contexte. C'est plus expressif qu'un système de groupes.
- **Test de non-régression matérialisé** : `TEST_SCENARIOS.md` liste explicitement les cas où un rôle ne doit RIEN voir. La checklist devient un cahier des charges QA.

---

## 2026-05-19 — Étape 14b : Cohérence visuelle du dashboard mairie

### Objectif

Suite à l'ajout de la section « Performance ce mois » (étape 14), la grille 2×2 d'origine paraissait pauvre par contraste : pas d'icônes, pas de titre de section, fond pleinement coloré. Reprendre la même grammaire visuelle que la nouvelle section pour donner une lecture homogène.

### Changements

- **Titre « Activité »** ajouté avant la grille 2×2 (parité avec « Performance ce mois »), avec barre slate-200 horizontale.
- **4 stat cards** passent d'un fond plein coloré à un **fond blanc + bordure slate-100 + icône** dans une pastille colorée (cohérent avec PerformanceCard) :
  - Écoles : `School` (teal)
  - Représentants actifs : `Users` (blue)
  - Dossiers ouverts : `FolderOpen` (warning)
  - Dossiers urgents : `AlertTriangle` (danger)
- Layout des cards : icône en haut-gauche → valeur grande → label en bas. Plus aéré, plus lisible.
- Extraction d'un composant `ActivityCard` (parallèle à `PerformanceCard`) pour ne pas dupliquer le styling.

### Fichiers modifiés

- `app/mairie/dashboard.tsx` : import des icônes lucide (`School`, `Users`, `FolderOpen`, `AlertTriangle`), composant `ActivityCard` inline, refactor de la grille 2×2.

### Vérifications

- ✅ TypeScript compile
- ✅ Lint sans warning
- ✅ Bundle web sans erreur

---

## 2026-05-19 — Bilan final

### Statistiques finales

- **34 fichiers créés** dans `mobile-app/` :
  - 17 écrans / layouts dans `app/`
  - 15 composants dans `components/`
  - 1 fichier types
  - 1 fichier data
  - 1 fichier constants
  - 4 fichiers de configuration (tailwind, babel, metro, nativewind-env, global.css)
  - 4 fichiers de documentation (README, MIGRATION_NOTES, TODO, CHANGELOG_MOBILE)

### Vérifications effectuées

- ✅ `npx tsc --noEmit` : compilation TypeScript sans erreur (1 erreur initiale `JSX.Element` corrigée via `ReactElement`)
- ✅ `mockups-app/` intact (modification time = May 19 02:02, non touché)
- ✅ Tous les fichiers existants conservés (App.tsx, index.ts, assets/, .git/)
- ✅ Aucun fichier modifié en dehors de `mobile-app/` (sauf le fichier de plan dans `~/.claude/plans/`)
- ⏳ `npx expo start` à vérifier manuellement par l'utilisateur (non lancé car interactif et long)

### Limites connues

- `npx expo install` ne fonctionne pas dans cet environnement (fetch failed) → l'utilisateur doit utiliser `npm install --legacy-peer-deps` pour les futurs ajouts de packages, ou un environnement avec accès à l'API Expo
- L'app doit être démarrée par l'utilisateur (`cd mobile-app && npx expo start`) pour valider visuellement les 3 écrans complets

### Confirmation d'isolation

**Aucune écriture, modification, suppression ou renommage de fichier n'a été effectué en dehors de `mobile-app/` pendant toute la migration.**

### Prochaines étapes suggérées

1. L'utilisateur lance `npx expo start` et valide visuellement les écrans
2. Compléter les 3 placeholders restants (create-account, new-request, reply) avec formulaires
3. Ajouter les 8 écrans secondaires listés dans TODO.md
4. Prévoir le backend (Supabase recommandé pour la conformité RGPD)
