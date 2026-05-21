# Guide démo Passerelle

Document pratique pour préparer et exécuter une présentation de Passerelle (15-30 min) sur téléphone ou laptop.

---

## TL;DR — Checklist 5 minutes avant la démo

- [ ] `mobile-app/.env.local` contient `EXPO_PUBLIC_USE_SUPABASE=false` (mode démo, aucun backend requis)
- [ ] URL Cloudflare Pages prête : `https://passerelle-demo.pages.dev` (à configurer une fois — cf. section déploiement)
- [ ] Backup : `npm start` lancé sur laptop, app Expo Go installée sur téléphone, même Wi-Fi
- [ ] Ouvrir l'URL sur le téléphone → cliquer « 🎭 Mode démo : tester un autre rôle » au bas du Welcome → vérifier que les 5 personnages apparaissent
- [ ] Faire un dossier de test depuis le côté parent et vérifier qu'il apparaît côté mairie après switch

---

## Comment ça marche en mode démo

### Authentification

L'authentification réelle Supabase magic link est **désactivée** quand `EXPO_PUBLIC_USE_SUPABASE=false` :

- Clic sur « Je suis une mairie » → atterrit directement sur `/mairie/dashboard` avec l'identité « Claire Moreau (mairie_admin) »
- Clic sur « Je suis une direction » → atterrit sur `/direction/home` comme « Mme Girard (direction) »
- « J'ai une clé école » → flow parent → reste « Nadia Benali (parent_admin) »
- Le sign-in (saisie email + envoi du lien) fonctionne en mode simulé : tape n'importe quel email, clique « Recevoir le lien », puis « Continuer la démo » sur l'écran de confirmation → arrive sur la zone du rôle choisi

### Sélecteur de personnage

Bouton **« 🎭 Mode démo : tester un autre rôle »** en bas du Welcome ouvre une sheet listant les 5 personnages :

| Personne | Email | Rôle | École |
| --- | --- | --- | --- |
| Nadia Benali | nadia.benali@example.org | Parent élu — Administrateur | Jean Jaurès |
| Marc Laurent | marc.laurent@example.org | Parent élu — Contributeur | Jean Jaurès |
| Claire Moreau | claire.moreau@montreuil-sur-seine.fr | Mairie — Agent | (aucune — vue collectivité) |
| Thomas Lefèvre | t.lefevre@montreuil-sur-seine.fr | Mairie — Élu | (aucune) |
| Mme Girard | direction.jaures@ac-versailles.fr | Direction d'école | Jean Jaurès |

Tap = bascule l'identité courante + redirige vers la home du rôle. Accessible aussi depuis profil parent → « Mode démo > Changer de personnage ».

### Actions qui fonctionnent (en mémoire)

| Action | Persistance | Visible où ? |
| --- | --- | --- |
| Parent crée un dossier | RAM (refresh = perdu) | `/parent/dossiers` immédiatement + `/mairie/dashboard` après switch |
| Direction crée un sujet | RAM | `/direction/dossiers` + `/mairie/dashboard` |
| Parent écrit à la mairie (message) | RAM | `/parent/messages` + `/mairie/messages` |
| Parent demande un RDV | RAM | `/parent/appointments` + `/mairie/rendez-vous` |
| Mairie répond à un dossier | RAM | Message + statut MAJ visibles côté parent |
| Mairie partage en tripartite | RAM | Bascule le scope, direction voit le dossier |
| Mairie confirme un RDV | RAM | RDV passe en « Confirmés » |
| Parent marque un message comme lu | RAM | Le badge « non lu » disparaît |
| Commentaires sur un dossier (parent/mairie) | RAM | Visible localement, perdu au switch d'écran |

**Limite assumée** : un refresh (F5 web ou kill app native) réinitialise tout. C'est OK pour une démo dirigée. Mentionne le si quelqu'un te le demande : « C'est une maquette, en prod ça persiste évidemment ».

---

## Scénarios de démo recommandés

### Scénario A — Parcours parent (5 min)

1. **Welcome** → « J'ai une clé école » (effet pédagogique : on entre côté parent)
2. **`/parent/home`** : montre les KPIs animés (dossiers ouverts, urgents), l'alerte « X dossiers attendent une réponse »
3. **`/parent/dossiers`** : filtres (Tous / Ouverts / Urgents), tap sur « Passage piéton effacé » → détail complet
4. **`/parent/new-request`** : créer un dossier « Cantine — repas vegan » (catégorie restauration, urgence moyenne)
5. **Retour `/parent/dossiers`** : le nouveau dossier apparaît en tête ✨
6. **`/parent/messages`** : montrer un message reçu, ouvrir le composer « Écrire à la mairie » (sans envoyer)
7. **`/parent/appointments`** : demander un RDV pour le dossier qu'on vient de créer
8. **`/parent/profile`** → « Mode démo > Changer de personnage » → sélectionner Claire (mairie)

### Scénario B — Vue mairie (5 min, suite directe du A)

1. **`/mairie/dashboard`** : tableau de bord, stats activité + performance
2. **`/mairie/schools`** : liste des 4 écoles avec compteurs par école
3. **`/mairie/school-detail` (Jean Jaurès)** : détail école avec dossiers, RDV, représentants
4. **Retour dashboard → tap sur « Cantine — repas vegan »** (le dossier créé en scénario A)
5. **`/mairie/dossier-detail`** : voir l'historique, les commentaires, le scope
6. **Tap « Répondre au dossier » → `/mairie/reply`** : choisir un statut, taper une réponse, envoyer
7. **Tap « Partager en tripartite »** sur un dossier `parents_mairie` → confirmer → le dossier devient visible à la direction
8. **`/mairie/messages`** : boîte de réception (Phase 4 démo, créée pour cette démo)
9. **`/mairie/rendez-vous`** : agenda mairie, confirmer le RDV demandé en scénario A

### Scénario C — Vue direction (3 min)

1. Depuis Welcome → « Je suis une direction » (atterrit en Mme Girard direction)
2. **`/direction/home`** : bandeau « Espace direction confidentiel » + KPIs (différents des parents : pas de fuite)
3. **`/direction/dossiers`** : ne voit QUE les `direction_mairie` + `partage_tripartite` (pas les conversations privées parents↔mairie)
4. **Tap sur un dossier `partage_tripartite`** (celui qu'on vient de partager en scénario B) → voir l'historique
5. **`/direction/new-request`** : créer un sujet institutionnel (ex: « Demande d'intervention infiltration salle 12 »)
6. **`/direction/messages`** : ne voit que les messages adressés à la direction

### Bonus — Légal & RGPD (2 min)

- Depuis le footer du Welcome ou le profil parent → **`/legal/privacy`** → expliquer la matrice RLS, l'hébergement EU, les droits utilisateur
- **`/legal/mentions`** → cadre juridique (LCEN)
- **`/aide/comment-ca-marche`** → présentation des 4 canaux de visibilité avec matrice « visible par / invisible pour »

---

## Phrases-clés à dire en démo

- **Au début** : « Passerelle, c'est l'outil de coordination entre parents élus, mairie et direction d'école. Pour la première fois, ces 3 acteurs ont un canal traçable et sécurisé pour échanger sur la vie scolaire. »
- **Sur la séparation des canaux** : « Tout le mystère c'est ici : chaque dossier appartient à un canal de visibilité. Les conversations privées parents-mairie ne sont JAMAIS visibles par la direction, sauf si la mairie partage explicitement. »
- **Sur la sécurité** : « Cette isolation n'est pas juste cosmétique. Elle est matérialisée au niveau base de données — Row Level Security PostgreSQL. Même un bug applicatif ne peut pas fuiter un dossier. »
- **Sur le RGPD** : « Données hébergées en France, eu-west-3 Paris. Pas de cookies tiers, pas de tracking publicitaire. Tu peux exporter tes données ou supprimer ton compte en 2 clics depuis ton profil. »
- **Sur la phase actuelle** : « Aujourd'hui c'est une maquette fonctionnelle. Le back-end Supabase est conçu, l'auth magic link est prête, on est sur le point de l'activer pour un pilote avec 1-2 mairies. »

---

## Lancer la démo en local (Expo Go)

```bash
cd mobile-app
npm install --legacy-peer-deps   # première fois seulement
npm start
```

Un QR code apparaît dans le terminal. Sur ton téléphone :

1. Installe **Expo Go** depuis l'App Store / Play Store
2. Scanne le QR code (depuis Expo Go directement sur iOS, depuis l'appareil photo sur Android)
3. L'app charge en 10-30s

Conditions : laptop allumé + téléphone et laptop sur le même Wi-Fi. Si problème de réseau (Wi-Fi pro restrictif), passe en mode tunnel : `npm start --tunnel`.

---

## Déployer sur Cloudflare Pages (URL publique)

### Une seule fois — setup du projet

1. **Crée un compte Cloudflare** gratuit sur https://dash.cloudflare.com/sign-up
2. Dans le dashboard : **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Autorise Cloudflare à accéder à ton compte GitHub, sélectionne le repo `AlybaR/Diversity`
4. **Configuration du build** :
   - **Project name** : `passerelle-demo` (donnera `https://passerelle-demo.pages.dev`)
   - **Production branch** : `feat/demo-3-jours` (ou `main` après merge)
   - **Build command** : `cd mobile-app && npm install --legacy-peer-deps && npm run build:web`
   - **Build output directory** : `mobile-app/dist`
   - **Root directory** : laisser vide (racine du repo)
5. **Variables d'environnement** (Settings → Environment variables) :
   - `EXPO_PUBLIC_USE_SUPABASE=false` (force le mode démo, indépendamment du .env.local)
6. **Save and Deploy** : le premier build prend 3-5 minutes
7. Récupère l'URL `https://passerelle-demo.pages.dev` et teste-la sur ton téléphone

### À chaque push sur la branche

Le déploiement est **automatique**. Cloudflare détecte le push, rebuild, déploie. URL toujours stable.

### Custom domain (optionnel)

Dans le projet Cloudflare Pages → Custom domains → Add custom domain. Si tu as un nom de domaine personnel, c'est gratuit.

---

## Troubleshooting

| Problème | Solution |
| --- | --- |
| Welcome ne montre pas le bouton « Mode démo » | Vérifier que `.env.local` est bien `EXPO_PUBLIC_USE_SUPABASE=false`. Redémarrer Metro (`npm start`). |
| Tap sur « Je suis une mairie » redirige vers /sign-in au lieu de /mairie/dashboard | Idem : flag à `false`. Si tu viens de le changer, hard refresh (Ctrl+Shift+R). |
| Le dossier créé n'apparaît pas dans la liste | Bug. Ouvrir devtools (F12) console, screenshot et envoyer. Le hook `useCreateDossier` est censé invalider la query. |
| Sur téléphone l'URL Cloudflare met du temps à charger | Premier load = 4-5 MB. Ensuite cache. Acceptable pour démo. |
| L'app crashe en boucle dans Expo Go | Versions Expo / React Native incompatibles. Mettre à jour Expo Go depuis le store. |
| Le sélecteur de personnage ne change rien | Vérifier que le hook useDemoUser est bien monté côté DemoPersonneSelector. Le bouton du Welcome est visible UNIQUEMENT si !USE_SUPABASE. |

---

## Annexe — Architecture mode démo

- `.env.local` : `EXPO_PUBLIC_USE_SUPABASE=false`
- `services/_config.ts` exporte `USE_SUPABASE` lu à l'init de l'app
- `components/AuthGuard.tsx` : si `!USE_SUPABASE`, bypass total (laisse passer toutes les routes)
- `data/mockData.ts` : `UTILISATEUR_COURANT` est un Proxy qui délègue à `_currentUser` (let mutable)
- `hooks/useDemoUser.ts` : `switchTo(id)` met à jour `_currentUser` + invalide React Query + redirige vers la home du rôle
- Mutations : `createDossier`, `createMessage`, `createRendezVous`, `updateDossierStatut`, `shareDossierTripartite`, etc. mutent les tableaux exportés depuis `mockData.ts` (state volatile RAM)
- En mode Supabase (flag à `true`) : tout ça redevient inerte, AuthGuard reprend le contrôle, useSession.personne devient la source de vérité

Pour la prod réelle (Phase 5+) : remplacer les mutations mock par des appels Supabase dans `services/supabase/*.ts`.
