# TODO — mobile-app

Roadmap après recentrage MVP (mise à jour 2026-05-21, post Phase 4).

> La maquette visible est centrée sur dossiers, messages, rendez-vous, écoles et annuaire parents/mairie. Les anciennes routes restent en réserve dans [`MAQUETTE_COMPLETE.md`](MAQUETTE_COMPLETE.md), sans lien depuis les hubs principaux.

## État global

| Phase | Statut | Détail |
| --- | --- | --- |
| **Phase 0** — CI GitHub Actions + templates PR | ✅ Fait | `.github/workflows/ci.yml`, templates Issues/PR, `CONTRIBUTING.md` |
| **Phase 1** — Fondations Supabase | ✅ Fait | Client + 4 migrations + RLS + 7 mappers, feature flag `USE_SUPABASE` |
| **Phase 2** — Auth magic link | ✅ Fait | `app/sign-in/`, `app/auth/callback.tsx`, `useSession`, `AuthGuard` |
| **Phase 3** — Robustesse prod | ✅ Fait | `EmptyState`, `ErrorBanner`, `LoadingState`, `OfflineBanner`, Sentry stub |
| **Phase 4** — Légal & RGPD | ✅ Fait | `app/legal/{cgu,privacy,mentions}`, `app/aide/{comment-ca-marche,faq,contact}` |
| **Démo 3 jours** — visite guidée + reset + annuaire éditable | ✅ Fait | `useGuidedTour` (9 étapes), `DemoPersonneSelector` avec reset universel, `useCreatePersonne` mutation |
| **Phase 5** — Push notifications serveur + exports PDF | ⏳ À faire | Côté client : `lib/notifications.ts` collecte les tokens. Côté serveur : Edge Function Supabase + génération PDF |
| **Phase 6** — Publication App Store / Play | ⏳ À faire | EAS Build, comptes développeurs, captures d'écran |

---

## 1. Parcours MVP à maintenir

| Écran                           | Statut  | À surveiller                                                                  |
| ------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `app/parent/home.tsx`           | ✅ Fait | Ne pas réintroduire de grille outils ; garder dossiers/message/RDV/historique |
| `app/parent/directory.tsx`      | ✅ Fait | Onglets Parents élus / Contacts mairie / Anciens admins uniquement            |
| `app/parent/dossiers.tsx`       | ✅ Fait | Liste et filtres dossiers                                                     |
| `app/parent/dossier-detail.tsx` | ✅ Fait | Pièces jointes liées au dossier                                               |
| `app/parent/messages.tsx`       | ✅ Fait | Messages mairie + détail message avec pièces jointes liées                    |
| `app/parent/appointments.tsx`   | ✅ Fait | RDV liés à un dossier quand nécessaire                                        |
| `app/mairie/dashboard.tsx`      | ✅ Fait | Accès visibles limités à écoles, messages, rendez-vous et dossiers            |
| `app/mairie/school-detail.tsx`  | ✅ Fait | Représentants, dossiers, rendez-vous, message                                 |
| `app/mairie/reply.tsx`          | ✅ Fait | Réponse structurée depuis un dossier                                          |

---

## 2. Réserve / non retenu MVP

Ces fichiers existent encore pour mémoire, mais ne doivent pas revenir dans la navigation principale sans décision produit :

- Parent : documents, export, bilan, conseil école, validation, passage année, anciens représentants, invitation, transfert admin, orientation, brouillons, recherche, contacts séparés.
- Mairie : statistiques, mode élu, carte, modèles, catégories, services, précision, hors compétence, action programmée, compte rendu RDV.

---

## 3. Backend — Supabase (✅ Fondations, ⏳ Activation)

### Décision actée — Supabase

Choix retenu : **Supabase** pour Postgres + auth + storage + realtime + Edge Functions, hébergement EU disponible (`eu-west-3` pour Paris).

### Statut

- ✅ Client initialisé (`lib/supabase.ts`) avec persistance AsyncStorage (natif) + localStorage (web)
- ✅ 4 migrations SQL versionnées (`supabase/migrations/0001` à `0004`)
- ✅ Row Level Security configurée par rôle
- ✅ 7 mappers Supabase dans `services/supabase/` (dossiers, messages, personnes, rendez-vous, écoles, auth, _mappers)
- ✅ Seed pour parité avec `data/mockData.ts`
- ✅ Feature flag `EXPO_PUBLIC_USE_SUPABASE` (actuellement `false` = mode mock)
- ⏳ **Activer le projet Supabase** : appliquer les migrations, charger le seed, basculer `USE_SUPABASE=true`, tester chaque parcours
- ⏳ **Mutations write-side** : pour l'instant les services Supabase couvrent surtout les SELECT. Les INSERT/UPDATE/DELETE doivent être branchés via `useMutation` (cf. `useCreateRendezVous`, `useCreatePersonne` qui existent déjà en mode mock).

### Procédure d'activation (quand prêt)

```bash
# 1. Dans Supabase Studio : importer migrations/0001..0004 + seed
# 2. Vérifier RLS et test user via 0003_auth_link_rpc
# 3. Dans .env.local :
EXPO_PUBLIC_USE_SUPABASE=true
# 4. npm run web → tester le parcours auth + chaque hub
```

---

## 4. Authentification — Magic link (✅ Fait)

Statut : **implémenté en mode Supabase**.

- ✅ Magic link via `supabase.auth.signInWithOtp()` (cf. `app/sign-in/`)
- ✅ Callback handler `app/auth/callback.tsx` avec linking `auth.users ↔ personnes` via RPC `link_current_user_to_personne`
- ✅ Session persistante via `lib/supabase.ts` (AsyncStorage natif + localStorage web)
- ✅ `useSession()` expose `personne` + `signOut()`
- ✅ `AuthGuard` composant pour protéger les routes (à utiliser quand `USE_SUPABASE=true`)
- ✅ Page debug `app/auth/debug.tsx` pour inspecter la session
- ✅ Page no-access `app/auth/no-access.tsx` si l'utilisateur n'est lié à aucune personne
- ⏳ **France Connect** : OAuth optionnel selon politique collectivité (Phase 6+)
- ⏳ **Rôles dans le JWT** : la RLS actuelle lit le rôle depuis `personnes` ; à confirmer pour la production

---

## 5. Rôles et permissions

À implémenter côté backend ET côté app :

| Rôle                        | Permissions                                                  |
| --------------------------- | ------------------------------------------------------------ |
| Parent élu — Administrateur | CRUD dossiers + gestion représentants + génération clés      |
| Parent élu — Contributeur   | Lecture/écriture dossiers, pas de gestion clés               |
| Mairie — Administrateur     | Vision multi-écoles + diffusion messages + réponses dossiers |
| Élu / cabinet               | Vue d'ensemble en lecture, mode briefing                     |
| Direction d'école           | Vue dossiers de son école + commentaires                     |

---

## 6. RGPD (✅ Phase 4 — partiellement fait)

- ✅ Page Politique de confidentialité : `app/legal/privacy.tsx`
- ✅ Page CGU : `app/legal/cgu.tsx`
- ✅ Mentions légales : `app/legal/mentions.tsx`
- ✅ Centre d'aide / FAQ / contact : `app/aide/{comment-ca-marche,faq,contact}.tsx`
- ✅ Export de ses données : Row dans `/parent/profile` qui appelle `addBreadcrumb` + `captureMessage` Sentry (placeholder visuel, le ZIP sera généré en Phase 5)
- ✅ Suppression de compte : modal de confirmation double (texte exact "supprimer" à taper) dans `/parent/profile`
- ⏳ **DPO référencé** : email dans `app/aide/contact.tsx` ligne 18 (`dpo@passerelle.fr` placeholder, à remplacer Phase 4 finale)
- ⏳ **Pas de tracking analytics** : à valider quand on choisira un outil de mesure (objectif : pas de Google Analytics, plutôt Plausible/Matomo self-hosted)
- ⏳ **Hébergement EU** : à confirmer côté Supabase (région `eu-west-3` Paris recommandée)
- ⏳ **Anonymisation logs** : à implémenter côté Edge Functions (purge auto au-delà de 30 jours)
- ⏳ **Pipeline d'export ZIP** : Edge Function Supabase Phase 5

---

## 7. Notifications push (✅ Phase 3 — collecte tokens, ⏳ Phase 5 — envoi serveur)

- ✅ `lib/notifications.ts` : `registerForPushNotifications(personneId)` demande permission + récupère token Expo + persiste dans `personnes.push_token` (migration `0004`)
- ✅ Idempotent : peut être appelé à chaque login
- ✅ `hooks/usePushRegistration.ts` côté client
- ⏳ **Envoi côté serveur** : Edge Function Supabase qui consomme le bus d'événements et envoie les notifications via Expo Push API
- ⏳ Événements à brancher :
  - Nouveau message mairie
  - Mise à jour statut d'un dossier
  - Proposition de rendez-vous
  - Confirmation d'un rendez-vous
  - Rappel J-1 avant un rendez-vous
- ⏳ Centre de notifications in-app + page paramètres (placeholders dans le profil)

---

## 8. Stockage fichiers (pièces jointes)

- **Supabase Storage** ou S3 compatible
- Types acceptés : PDF, JPEG, PNG, max 10 Mo
- Antivirus côté backend (ClamAV ou équivalent)
- Affichage des pièces jointes dans le détail dossier
- Téléchargement local via `expo-file-system` + `expo-sharing`

---

## 9. Exports PDF

- Synthèse école : tous les dossiers + statuts + dernière mise à jour
- Compte-rendu de rendez-vous
- Bilan annuel
- Génération côté backend (Puppeteer ou pdfkit) ou côté client (`expo-print`)

---

## 10. Tests

- **Jest** + **@testing-library/react-native**
- Couvrir :
  - Components purs (Badge, Card, DossierCard, etc.)
  - Données mockées (cohérence des types)
  - Logique d'écran (transitions d'états sur `join-school`)
  - Navigation (Expo Router test helpers)
- Tests E2E avec **Detox** sur les parcours critiques (welcome → join → home parent)

---

## 11. Publication App Store / Google Play

- **EAS Build** pour les builds natifs
- Comptes développeur :
  - Apple Developer Program (99 USD/an)
  - Google Play Console (25 USD une fois)
- Captures d'écran (5 par taille de device)
- Description en français + anglais
- Politique de confidentialité publique (URL stable)
- Tests internes via TestFlight + Play Console Internal
- App Privacy Manifest (iOS 17+)
- Versionning automatisé via EAS

---

## 12. Améliorations UX à prévoir

- États de chargement (skeletons) sur les listes
- Pull-to-refresh sur Dossiers, Messages, RDV
- Toasts / Snackbars pour les actions (création réussie, erreur réseau)
- Recherche globale (route `/search`)
- Mode hors-ligne avec cache (queries SWR ou react-query)
- Animations d'entrée/sortie d'écran soignées (Reanimated)
- Mode sombre (`useColorScheme()` + variantes Tailwind `dark:*`)
- Internationalisation prête pour multi-collectivités (i18n-js)

---

## 13. Améliorations techniques

- ✅ **ESLint + Prettier** : config Expo standard, scripts `npm run lint`, `lint:fix`, `format`, `format:check`, `typecheck`, `bundle:check`
- ✅ **Typed routes Expo Router** : `experiments.typedRoutes: true` dans `app.json` (régénération auto à chaque `expo start`)
- ✅ **Sentry stub** : `lib/sentry.ts` avec `addBreadcrumb`, `captureMessage`, `captureException`, `setUser`, `clearUser` — branché en mode console.log, à activer Phase 3+
- ✅ **CI GitHub Actions** : `.github/workflows/ci.yml` (lint + typecheck + bundle)
- ✅ **Cross-platform scripts** : `cross-env` + `rimraf` pour Windows/Unix
- ⏳ **Husky + lint-staged** : hooks pre-commit pour bloquer les fichiers mal formés
- ⏳ **EAS Build** sur push tags : workflow CD pour générer les binaires App Store / Play
- ⏳ **Sentry production** : remplacer le stub par `@sentry/react-native` quand le projet Sentry sera créé (Phase 3+)
- ⏳ **Expo Updates** : mises à jour OTA hors store (Phase 6+)
- ⏳ **Tests Jest + RNTL** : voir section 10

---

## 15. Migration mockData → hooks (✅ Quasi terminée, ⏳ 5 écrans restants)

Architecture cible : tous les composants consomment les données via `hooks/use<Entity>.ts` (React Query) qui appellent `services/<entity>.ts`. Bénéfice : cache partagé + réactivité aux mutations + migration vers Supabase = changer uniquement les services.

| Statut | Écrans migrés (hooks) | Restant (import direct mockData) |
| --- | --- | --- |
| ✅ | parent/home, parent/dossiers, parent/dossier-detail, parent/directory, parent/messages, parent/appointments, parent/export, parent/validation | parent/passage-annee, parent/new-request (UTILISATEUR_COURANT, CATEGORIES — légitime) |
| ✅ | mairie/dashboard, mairie/schools, mairie/school-detail, mairie/equipe, mairie/reply (partiel) | mairie/mode-elu, mairie/stats, mairie/dossier-detail (PERSONNES seulement) |
| ✅ | direction/home, direction/directory | direction/dossiers, direction/dossier-detail, direction/appointments, direction/new-request (PERSONNES) |

**Imports légitimes restants** : `CATEGORIES`, `URGENCES`, `STATUTS_DOSSIER`, `CONTACTS_MAIRIE`, `ANCIENS_ADMINS`, `MAIRIE`, `UTILISATEUR_COURANT`, `resetMockData`, `setCurrentUser`, `getCurrentUser` — ce sont des enums, constants ou helpers démo qui n'ont pas vocation à passer par hooks.

---

## 16. Démo 3 jours (✅ Fait)

- ✅ Visite guidée par bulles 9 étapes (`useGuidedTour`) couvrant les 3 hubs + les 2 annuaires éditables
- ✅ QR code de partage (`DemoQrCode`)
- ✅ Sélecteur de personnage démo (`DemoPersonneSelector`) avec bouton reset intégré
- ✅ Reset démo universel via `resetMockData()` + `queryClient.invalidateQueries()` accessible depuis parent/profile, mairie/dashboard, direction/home
- ✅ Annuaires éditables : `useCreatePersonne` mutation, ajout d'agents/élus/enseignants en temps réel
- ✅ Pas de cadre iPhone sur desktop (`PhoneFrame` désactivé sous 600px)

---

## 14. Stratégie web admin pour les mairies (orientation produit à valider)

L'app cible est mobile-first (parents élus en mobilité). Mais les **agents mairie** ont des cas d'usage typiquement desktop : tableau de bord large, réponses structurées longues, vues croisées multi-écoles, exports, statistiques.

### Pistes possibles

**Piste A — Une seule app Expo Router responsive (recommandée pour démarrer)**

- Garder le code unique
- Détecter `Platform.OS === 'web'` + `useWindowDimensions().width >= 1024` pour activer un layout desktop dans les routes `/mairie/*` uniquement
- Mêmes données, mêmes composants base, layouts adaptés (sidebar permanente au lieu de bottom nav, grille large, modales centrées)
- Avantage : code partagé, déploiement Vercel/Cloudflare Pages possible (`expo export --platform web`)
- Inconvénient : compromis sur l'ergonomie desktop (RN web n'a pas tous les patterns d'un Next.js)

**Piste B — App mobile Expo + admin web séparé (Next.js ou Vite)**

- Mobile : Expo (parents)
- Web admin : Next.js dédié (mairie), branché sur la même API
- Composants partagés via un package monorepo (Turborepo / Nx)
- Avantage : ergonomie desktop optimale, équipes potentiellement spécialisées
- Inconvénient : double maintenance UI, plus de complexité de déploiement

### Décision à prendre

Choix dépendant de :

- Volume d'agents mairie utilisateurs (si < 10, piste A suffit)
- Niveau de personnalisation desktop voulu
- Équipe disponible
- Budget de maintenance

À ce stade : le **PhoneFrame web simule un device** pour la démo. À discuter avec le commanditaire avant de basculer en piste A ou B. Indication par défaut → piste A pour démarrer (un seul produit à maintenir, ergonomie acceptable côté mairie pour un MVP).
