# TODO — mobile-app

Roadmap après recentrage MVP.

> La maquette visible est centrée sur dossiers, messages, rendez-vous, écoles et annuaire parents/mairie. Les anciennes routes restent en réserve dans [`MAQUETTE_COMPLETE.md`](MAQUETTE_COMPLETE.md), sans lien depuis les hubs principaux.

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

## 3. Backend à prévoir

### Options

- **Supabase** : Postgres + auth + storage + realtime (recommandé pour ce type de cas — RGPD, hébergement EU possible)
- **Firebase** : alternative globale (mais data hors UE par défaut)
- **Solution custom** : Node.js + Postgres + auth maison (plus de contrôle, plus de travail)

### Endpoints minimums

- `GET /schools/:id` — détail école
- `GET /dossiers?ecoleId=...&statut=...` — listing avec filtres
- `POST /dossiers` — créer dossier
- `PATCH /dossiers/:id` — mettre à jour statut
- `POST /dossiers/:id/comments` — ajouter commentaire
- `GET /messages?ecoleId=...` — messages mairie pour une école
- `POST /messages` — diffuser un message mairie
- `GET /rendez-vous?ecoleId=...`
- `POST /rendez-vous` + workflow validation
- `GET /personnes?ecoleId=...` — annuaire
- `POST /invitations` — inviter représentant (génère un lien + email)

---

## 4. Authentification

- **Choix** : auth par email + mot de passe + clé école au premier accès
- **Stockage local** : `expo-secure-store` (token JWT chiffré)
- **OAuth optionnel** : France Connect (selon politique de la collectivité)
- Gestion du rôle dans le token JWT côté backend

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

## 6. RGPD

- Bandeau cookies / consentement
- Page « Mes données » avec export et suppression de compte
- DPA / DPO de la collectivité référencé
- Pas de tracking analytics tiers sans consentement
- Hébergement des données en France (Scaleway, OVH, ou région EU de cloud provider)
- Anonymisation des logs au-delà de 30 jours
- Politique de confidentialité accessible depuis l'app (lien web ou page in-app)

---

## 7. Notifications push

- **expo-notifications** pour iOS + Android
- Événements à notifier :
  - Nouveau message mairie
  - Mise à jour statut d'un dossier
  - Proposition de rendez-vous
  - Confirmation d'un rendez-vous
  - Rappel J-1 avant un rendez-vous
- Centre de notifications in-app + page paramètres

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

- Ajouter ESLint + Prettier (config Expo standard)
- Husky + lint-staged pour les hooks git
- CI : EAS Build sur push tags
- Sentry pour l'error monitoring (avec respect RGPD)
- Mise à jour OTA via Expo Updates (déploiements rapides hors store)

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
