# Descriptions de PR — Phase 1 / 2 / 3

Fichier temporaire. Copie-colle chaque bloc dans le formulaire GitHub correspondant, puis supprime ce fichier.

**Ordre de merge recommandé :**

1. PR Phase 1 (`feat/phase1-supabase-foundations` → `main`) — fondations Supabase
2. PR Phase 2 (`feat/phase2-auth-magic-link` → `main`) — magic link + guards, après merge Phase 1
3. PR Phase 3 (`feat/phase3-robustesse-prod` → `main`) — robustesse, après merge Phase 2

Pour chaque PR : créer via https://github.com/AlybaR/Diversity/pulls → New pull request → choisir la branche source et `main` en cible.

---

## PR 1 — `feat/phase1-supabase-foundations` → `main`

**Titre :**

```
feat(supabase): Phase 1 — fondations backend (schema + RLS + seed + flag USE_SUPABASE)
```

**Description :**

```markdown
## Résumé

Pose les fondations backend Supabase (PostgreSQL eu-west-3) sans casser le mode mock. Le schéma réplique les types TypeScript existants, les politiques RLS matérialisent `canRoleSeeScope` au niveau base de données (sécurité par défaut, plus seulement au niveau code), et un feature flag `EXPO_PUBLIC_USE_SUPABASE` permet de basculer mock ↔ Supabase sans branche divergente.

## Type de changement
- [x] `feat` — nouvelle fonctionnalité
- [ ] `fix`
- [ ] `chore`
- [x] `docs` — `supabase/README.md` + section CHANGELOG
- [ ] `test`
- [ ] `security`

## Ce qui est livré

### 3 migrations versionnées dans `supabase/migrations/`

- **`0001_init.sql`** — 11 tables (personnes, mairies, ecoles, dossiers, messages, rendez_vous, pieces_jointes, commentaires_dossier, historique_events, …) + enums (role_utilisateur, visibility_scope, statut_dossier, urgence) + indexes principaux.
- **`0002_rls_policies.sql`** — Row Level Security activée sur les 11 tables. Politiques `SELECT/INSERT/UPDATE/DELETE` qui répliquent la matrice `canRoleSeeScope` (parents_mairie / direction_mairie / partage_tripartite / mairie_interne). Fonctions helper `current_user_role()` et `current_user_ecole_id()` en `SECURITY DEFINER` pour éviter la récursion RLS.
- **`seed.sql`** — données démo idempotentes (TRUNCATE CASCADE initial) qui reproduisent les 5 personnes + 4 dossiers + 8 messages + 5 RDV du mockData.

### Client Supabase + feature flag

- `lib/supabase.ts` — client `@supabase/supabase-js` (anon key) avec `persistSession`/`autoRefreshToken`/`detectSessionInUrl` configurés selon plateforme (web vs RN).
- `services/_config.ts` — constante `USE_SUPABASE = process.env.EXPO_PUBLIC_USE_SUPABASE === 'true'`. Lue par chaque service métier.
- 6 services métier (`dossiers.ts`, `messages.ts`, etc.) routent vers Supabase si le flag est `true`, sinon continuent de servir `mockData` comme avant.
- Sous-couche `services/supabase/` avec mappers snake_case ↔ camelCase.

### Documentation

- `supabase/README.md` détaille : provisionnement projet, exécution des migrations, dashboard URL, debug RLS.

## Tests manuels effectués
- [x] Mode mock par défaut (`USE_SUPABASE=false`) : app inchangée, 20/20 E2E Playwright verts
- [x] Migrations 0001 + 0002 + seed exécutées sur projet Supabase eu-west-3
- [x] Vérification SQL : `SELECT count(*) FROM dossiers` retourne 4
- [x] Vérification RLS : SELECT sans JWT retourne 0 lignes (interdit par défaut)

## Checklist avant merge
- [x] `npm run typecheck` passe
- [x] `npm run lint` passe
- [x] `npm run bundle:check` passe
- [x] CHANGELOG_MOBILE.md mis à jour (étape 16 + 17)
- [x] Pas de secret committé (URL + anon key dans `.env.example`, jamais `.env.local`)
- [x] Tests E2E mock toujours verts (20/20)

## Notes de revue

- **Décision-clé** : RLS au niveau base, pas seulement au niveau code. Si un futur bug applicatif tente de lire un dossier non autorisé, PostgreSQL renvoie 0 ligne. Impossible de fuiter par accident.
- **Feature flag** : le flag `USE_SUPABASE` permet de pousser le code Supabase sur main sans risque de régression. La bascule effective se fera quand Phase 2 (auth) sera également mergée.
- **Helpers SECURITY DEFINER** : `current_user_role()` et `current_user_ecole_id()` bypass RLS pour éviter la récursion infinie qu'on aurait avec des sous-requêtes EXISTS sur la même table. À garder en tête pour les futures policies.
- **Migrations versionnées dans le repo** : un `supabase db reset` reproduit exactement l'état attendu. Pas de drift entre dev et prod.
```

---

## PR 2 — `feat/phase2-auth-magic-link` → `main`

**Titre :**

```
feat(auth): Phase 2 — magic link Supabase + guards de route + RPC de liaison
```

**Description :**

```markdown
## Résumé

Active l'authentification magic link via Supabase Auth. Au premier clic du lien, une RPC SECURITY DEFINER lie la ligne `personnes` à `auth.users` (bypass RLS pour casser le chicken-and-egg de la première connexion). Les 3 layouts (parent, direction, mairie) sont protégés par un guard `<AuthGuard />` qui redirige selon le rôle. Le mode mock (`USE_SUPABASE=false`) reste 100% fonctionnel — les 20/20 tests E2E continuent de passer.

## Type de changement
- [x] `feat` — nouvelle fonctionnalité
- [x] `fix` — 2 bugs critiques identifiés et corrigés via diagnostic systématique
- [ ] `chore`
- [x] `docs`
- [ ] `test`
- [x] `security` — guards de route + isolation RLS renforcée

## Ce qui est livré

### Flow d'authentification complet

- **`app/sign-in/index.tsx`** — saisie email, appel `signInWithOtp` avec `emailRedirectTo`
- **`app/sign-in/sent.tsx`** — confirmation envoi + bouton "Renvoyer"
- **`app/auth/callback.tsx`** — récupère la session, appelle la RPC `link_current_user_to_personne`, redirige vers `/parent/home`, `/direction/home` ou `/mairie/dashboard` selon le rôle
- **`app/auth/no-access.tsx`** — refus catégorique si email pas dans `personnes`. En `__DEV__` : affiche le reason + detail pour diagnostic
- **`app/auth/debug.tsx`** (nouveau) — page diagnostic 4 vérifications (session, RPC, SELECT personnes, count dossiers). Compilée uniquement en `__DEV__`

### Hook central de session

- **`hooks/useSession.ts`** — expose `{ session, user, personne, role, loading, isAuthorized, signOut }`. Charge `personnes` via React Query + abonne à `onAuthStateChange`.

### Guards de route

- **`components/AuthGuard.tsx`** — wrapper qui :
  - Bypass total en mode mock (préserve 20/20 E2E tests)
  - Sinon : loading screen → redirect `/sign-in` si pas de session → redirect vers la zone correcte si rôle mismatch → rend les children si autorisé
- Branché dans `app/parent/_layout.tsx`, `app/direction/_layout.tsx`, `app/mairie/_layout.tsx` avec les rôles autorisés

### Storage de session RN

- **`lib/supabase.ts`** : `AsyncStorage` côté RN, `localStorage` côté web, `persistSession: true`, `autoRefreshToken: true`

### Migration 0003 versionnée (corrige 2 bugs critiques)

**`supabase/migrations/0003_auth_link_rpc.sql`** :

1. **Bug RPC `column "role" ambiguous`** — Le `RETURNING role` du UPDATE déclenchait l'erreur `42702` car `role` désignait à la fois la colonne `personnes.role` ET le paramètre OUT. Fix : renommage en `personne_role`, qualification des colonnes (`personnes.role`).
2. **Bug RLS `infinite recursion`** — La policy SELECT `personnes` faisait `EXISTS (SELECT 1 FROM personnes me ...)`. Chaque évaluation déclenchait la re-évaluation → boucle infinie. Fix : remplacer les EXISTS par appels aux fonctions `current_user_role()` et `current_user_ecole_id()` (SECURITY DEFINER, bypass RLS).

Ces 2 bugs ont été identifiés via une enquête systématique (3 SELECTs SQL diagnostic + page `/auth/debug`) après 3 fix aveugles infructueux. Détaillé dans CHANGELOG étape 18b.

### Instrumentation permanente (livraison étape 18b)

- `app/auth/callback.tsx` : logs `[auth/callback]` en `__DEV__` à chaque étape + `?reason=...&detail=...` en query param vers `/auth/no-access`
- `supabase/tests/auth-diagnostic.sql` : 3 SELECTs reproductibles à coller dans SQL Editor
- `supabase/tests/rls-checks.sql` : 12 assertions automatisées qui simulent un JWT par rôle et vérifient les comptes attendus

## Tests manuels effectués
- [x] Mode mock : `npm run start` + parcours parent / direction / mairie — OK
- [x] Tests Playwright E2E (20/20 verts en mock)
- [x] SQL : `SELECT * FROM link_current_user_to_personne()` simulé avec JWT mock — retourne `personne-kouceila` + `mairie_admin`
- [x] Page `/auth/debug` : 4 blocs verts (session, RPC, personnes, dossiers)
- [ ] Test end-to-end magic link réel : **bloqué temporairement par rate limit Supabase free tier** (2 OTPs/h/email). À retester après merge si rate limit retombe.

## Checklist avant merge
- [x] `npm run typecheck` passe
- [x] `npm run lint` passe
- [x] `npm run bundle:check` passe
- [x] CHANGELOG_MOBILE.md mis à jour (étapes 18 + 18b)
- [x] Pas de secret committé (URL + anon key dans `.env.example` uniquement)
- [x] Tests E2E `npm run test:parents` toujours verts (vérifié en mode mock)
- [x] Migration 0003 versionnée dans le repo (pas créée à la main dans SQL Editor)

## Notes de revue

- **`AuthGuard` bypass en mode mock** : décision-clé pour ne pas casser les 20/20 E2E tests. Le bypass est juste `if (!USE_SUPABASE) return children`. En prod, le flag sera `true` et le guard s'activera.
- **RPC `SECURITY DEFINER`** : seul moyen propre de gérer le chicken-and-egg de la première connexion (auth.uid() valide mais `personnes.auth_user_id = NULL`). Le grant `EXECUTE` est limité au rôle `authenticated`.
- **Pas de tests E2E auth** : intercepter un magic link dans Playwright = compliqué. Plan : utiliser un compte SQL pré-lié en CI quand on activera `USE_SUPABASE=true` dans le pipeline (Phase 3+).
- **Bonnes pratiques tirées (CHANGELOG 18b)** :
  - Ne jamais nommer un paramètre OUT comme une colonne de la même table
  - Les policies RLS ne doivent jamais faire de SELECT direct sur la même table — utiliser SECURITY DEFINER
  - Instrumentation systématique des points sensibles (coût marginal, gain énorme en debug)
```

---

## PR 3 — `feat/phase3-robustesse-prod` → `main`

**Titre :**

```
feat(robustesse): Phase 3 partie 1 — UX d'état + ErrorBoundary + Sentry stub + offline + push tokens
```

**Description :**

```markdown
## Résumé

Passe l'app d'un démo "happy path" à une app robuste. Chaque écran sait maintenant gérer ses 4 états (loading / error / empty / OK) via des composants centralisés. Un `<ErrorBoundary />` global capture les erreurs React non-handlées. Un `<OfflineBanner />` s'affiche quand le device est hors-ligne. La couche Sentry est stubbée (activable en 1 fichier quand un DSN sera disponible). Les tokens push Expo sont collectés à chaque login (envoi serveur = Phase 5).

## Type de changement
- [x] `feat` — composants UX + monitoring + push collecte
- [x] `fix` — bug Rules of Hooks dans AuthGuard.tsx
- [ ] `chore`
- [x] `docs` — CHANGELOG étape 19 + .env.example
- [ ] `test`
- [ ] `security`

## Ce qui est livré

### 4 composants UX d'état (centralisés)

| Composant | Rôle |
| --- | --- |
| `<ErrorBanner />` | Bandeau rouge inline avec bouton Réessayer |
| `<EmptyState />` | Placeholder centré pour listes vides + CTA optionnel |
| `<LoadingState />` | Indicateur de chargement avec label contextuel |
| `<OfflineBanner />` | Bandeau global sticky top quand hors-ligne |

Avant Phase 3, chaque écran avait son propre `<Text>Chargement…</Text>` ad hoc. Inconsistant, invisible aux QA, dérive de wording. Maintenant : composants centralisés.

### Intégration dans 9 écrans clés

`parent/{home,dossiers,messages,appointments}`, `direction/{home,dossiers,messages,appointments}`, `mairie/{dashboard,schools}` — tous refactorés pour utiliser les nouveaux composants à la place des states ad hoc.

### Détection réseau cross-platform

- `@react-native-community/netinfo` installé
- `hooks/useNetworkStatus.ts` : web via `navigator.onLine` + events, natif via NetInfo (import dynamique pour ne pas alourdir le bundle web)

### ErrorBoundary global

- `components/ErrorBoundary.tsx` : capture les erreurs React non-handlées (sinon écran blanc). UI fallback avec stack trace en `__DEV__` + bouton "Recharger". `componentDidCatch` logue dans Sentry.
- Monté au-dessus de tout dans `_layout.tsx` (avant `QueryClientProvider`).

### Stub Sentry

- `lib/sentry.ts` : couche d'abstraction qui expose `captureException`, `captureMessage`, `setUser`, `clearUser`, `addBreadcrumb`. En `__DEV__` : `console.log` structuré. En prod sans DSN : no-op.
- **Migration future = remplacer les corps de fonctions dans `lib/sentry.ts` par les appels `@sentry/react-native`. Zéro changement aux 10+ sites d'appel.**
- Wiring : `useSession` (setUser/clearUser), `auth/callback.tsx` (breadcrumbs + captureException aux points sensibles)
- `/auth/debug` affiche maintenant l'état Sentry (`enabled` + `dsnConfigured`) en plus du diagnostic auth

### Push notifications — collecte uniquement

- `expo-notifications` installé
- `lib/notifications.ts` : `registerForPushNotifications(personneId)` demande la permission OS, récupère le token Expo Push, persiste dans `personnes.push_token`
- `hooks/usePushRegistration.ts` : déclenche l'enregistrement quand `isAuthorized` passe à `true`
- `<SessionEffects />` invisible monté dans `_layout.tsx` qui appelle le hook globalement (no-op tant que pas de session)
- **`supabase/migrations/0004_personnes_push_token.sql`** : ajoute la colonne + policy `personnes_update_self` qui autorise un user à patcher sa propre ligne + index partiel sur `push_token IS NOT NULL`
- **Envoi serveur** : pas dans cette PR. Phase 5 branchera l'Edge Function Supabase + Expo Push API.

### Bug fix bonus

`components/AuthGuard.tsx` — `useSession` était appelé conditionnellement après un early `return` (mode mock), violation Rules of Hooks. Corrigé en appelant le hook en tête, puis le check `USE_SUPABASE` après.

### Configuration

- `.env.example` : ajout `EXPO_PUBLIC_SENTRY_DSN=` (vide par défaut, à remplir quand le compte Sentry sera créé)

## Tests manuels effectués
- [x] Compilation : `npm run typecheck` exit 0
- [x] Lint : `npm run lint` exit 0 (0 erreur, 0 warning)
- [x] Bundle web : `npm run bundle:check` exit 0 (4.25 MB)
- [x] Démo visuelle des 4 composants d'état dans un écran existant
- [ ] Test offline mode (à faire sur device + Chrome DevTools "Offline" toggle)
- [ ] Test push permission (à faire sur iOS device)
- [ ] Test ErrorBoundary (forcer une erreur dans un screen + voir le fallback)

## Checklist avant merge
- [x] `npm run typecheck` passe
- [x] `npm run lint` passe
- [x] `npm run bundle:check` passe
- [x] CHANGELOG_MOBILE.md mis à jour (étape 19)
- [x] Pas de secret committé
- [ ] Tests E2E Playwright à relancer côté CI (devraient passer en mock mode)

## Notes de revue

- **Stub Sentry vs install direct** : le SDK officiel `@sentry/react-native` exige un plugin EAS + une config native qu'on ne veut pas pousser avant d'avoir un compte Sentry réel (DSN + projet créés). Le stub permet d'instrumenter le code aujourd'hui sans engagement infra.
- **Push : collecte ≠ envoi** : on stocke les tokens pour Phase 5. La permission OS est demandée à chaque login (idempotent). Sur web, no-op (Web Push API en Phase 3+).
- **OfflineBanner non-cliquable** : la connexion revient automatiquement, React Query refetch tout seul via onlineManager. Un bouton "Réessayer" créerait une fausse promesse.
- **ErrorBoundary fallback minimaliste** : on évite de faire un "vraiment beau" écran d'erreur. L'objectif est de ne pas planter, pas de proposer une expérience d'erreur.
- **Phase 3 partie 2 (à venir)** : DSN Sentry réel + plugin EAS + Edge Function Supabase + Expo Push API pour l'envoi côté serveur. Nécessite 2-3 actions user (créer compte Sentry, générer clé Expo Push).
```

---

## Une fois les 3 PRs créées et mergées

1. **Tag de release** : `git tag v0.3.0 && git push --tags` (Phase 3 = v0.3.0 selon le plan semver)
2. **Mettre à jour TODO.md** : marquer Phase 1 / 2 / 3 comme `done`
3. **Reprendre Phase 2 retest** : avec le rate limit retombé, valider le magic link end-to-end depuis main
4. **Décider Phase 4 vs Phase 3 partie 2** : Légal/contenu (pas de blocker infra) vs Sentry réel + push delivery (nécessite compte Sentry + Expo Push key)
