# Notes de migration — mobile-app

**Date de migration** : 2026-05-19
**Source** : prototype web React + Vite + Tailwind dans `../mockups-app/`
**Cible** : `./mobile-app/` (Expo SDK 54 + Expo Router + NativeWind v4 + TypeScript)

---

## 1. Confirmation d'isolation

**Aucun fichier en dehors de `mobile-app/` n'a été modifié, supprimé, déplacé ou renommé pendant cette migration.**

Le prototype web `mockups-app/` est intégralement préservé :

- `mockups-app/package.json` — non modifié
- `mockups-app/src/index.css` — non modifié (lu uniquement pour répliquer la palette)
- `mockups-app/src/components/*.jsx` — non modifiés (lus uniquement pour s'inspirer)
- `mockups-app/src/screens/*.jsx` — non modifiés (3 écrans lus pour la réplique pixel-perfect)
- `mockups-app/vite.config.js`, `mockups-app/index.html` — non touchés
- `package.json` racine du projet — non touché
- `25.docx` à la racine — non touché

---

## 2. État initial du dossier mobile-app/

Le dossier `mobile-app/` existait déjà au lancement de la migration, scaffolding d'une session précédente :

```
mobile-app/
├── .git/                    (repo git du dossier, préservé)
├── .gitignore
├── App.tsx                  (template Expo blank, conservé)
├── app.json                 (déjà configuré pour expo-router)
├── assets/                  (4 PNG icônes, conservés)
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── index.ts                 (entrée Expo classique, conservée)
├── node_modules/            (présent, préservé)
├── package.json             (Expo 54, expo-router 6, RN 0.81)
├── package-lock.json
└── tsconfig.json            (extends expo/tsconfig.base + strict)
```

**Règle appliquée** : aucun fichier de cet état initial n'a été supprimé ni renommé. Le seul fichier modifié dans cet état initial est `package.json` (champ `main` basculé de `index.ts` vers `expo-router/entry`) — modification strictement nécessaire pour activer Expo Router.

---

## 3. Sources consultées (lecture seule)

| Fichier source                                 | Usage                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `mockups-app/src/index.css`                    | Palette + gradients répliqués dans `tailwind.config.js` et `constants/theme.ts` |
| `mockups-app/package.json`                     | Vérification des versions et dépendances (lecture seule)                        |
| `mockups-app/src/screens/WelcomeScreen.jsx`    | Réplique → `app/index.tsx`                                                      |
| `mockups-app/src/screens/SchoolKeyScreen.jsx`  | Réplique → `app/join-school.tsx` (4 états)                                      |
| `mockups-app/src/screens/ParentHomeScreen.jsx` | Réplique → `app/parent/home.tsx`                                                |
| `mockups-app/src/components/MobileFrame.jsx`   | Référence (non répliqué — l'app est déjà mobile)                                |
| `mockups-app/src/components/TabBar.jsx`        | Référence pour `components/BottomNav.tsx`                                       |

---

## 4. Écrans migrés (réplique pixel-perfect)

| Écran web        | Écran mobile          | Statut                                                                     |
| ---------------- | --------------------- | -------------------------------------------------------------------------- |
| WelcomeScreen    | `app/index.tsx`       | Complet (gradient header, 3 boutons profil, SVG icons inline, glass-card)  |
| SchoolKeyScreen  | `app/join-school.tsx` | Complet (4 états : input/valid/invalid/expired, useState local)            |
| ParentHomeScreen | `app/parent/home.tsx` | Complet (gradient header, 5 cartes, pulse urgent animé, 2 FABs, BottomNav) |

---

## 5. Écrans à structure fonctionnelle (placeholders enrichis et navigables)

| Route                    | Écran                                                                         |
| ------------------------ | ----------------------------------------------------------------------------- |
| `/create-account`        | Création compte parent élu                                                    |
| `/parent/dossiers`       | Liste des dossiers (avec filtres + DossierCard utilisant les données mockées) |
| `/parent/dossier-detail` | Détail dossier (titre, statut, urgence, historique, actions)                  |
| `/parent/new-request`    | Nouvelle demande (placeholder)                                                |
| `/parent/directory`      | Annuaire représentants (cartes complètes depuis mockData)                     |
| `/parent/messages`       | Messages mairie (MessageCard complets)                                        |
| `/parent/appointments`   | Rendez-vous (à venir, demandés, passés)                                       |
| `/mairie/dashboard`      | Tableau de bord mairie (gradient teal, stats, derniers dossiers)              |
| `/mairie/schools`        | Liste des écoles avec compteurs dossiers                                      |
| `/mairie/school-detail`  | Fiche école (direction, clé, représentants, dossiers, RDV)                    |
| `/mairie/reply`          | Réponse mairie (placeholder)                                                  |

---

## 6. Composants créés (15)

Tous dans `components/` :

| Composant                           | Rôle                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `GradientHeader`                    | Header LinearGradient avec safe area, back, titre, sous-titre (variantes parent/mairie) |
| `AppHeader`                         | Header neutre blanc pour les écrans secondaires                                         |
| `BottomNav`                         | Tab bar fixe en bas — parent (5 onglets) ou mairie (3 onglets)                          |
| `Card`                              | Carte blanche avec shadow et border-slate-100                                           |
| `Badge`                             | Pilule avec tons : primary, success, danger, warning, slate, indigo, emerald            |
| `StatusBadge` (avec `UrgenceBadge`) | Badges contextuels selon statut dossier ou niveau d'urgence                             |
| `PrimaryButton`                     | Bouton LinearGradient bleu institutionnel                                               |
| `SecondaryButton`                   | Bouton outline / ghost / slate                                                          |
| `TextInputField`                    | TextInput avec label, helper, focus state, support monospace                            |
| `DossierCard`                       | Carte dossier (titre + catégorie + statut + urgence + métriques)                        |
| `SchoolCard`                        | Carte école (nom, adresse, direction, compteurs dossiers)                               |
| `RepresentativeCard`                | Carte représentant (initiales avatar + rôle + email + actif)                            |
| `MessageCard`                       | Carte message (titre + priorité + date + extrait + indicateur lu)                       |
| `AppointmentCard`                   | Carte rendez-vous (titre + date/heure/lieu + participants + statut)                     |
| `Placeholder`                       | Écran « à venir » avec liste éléments prévus + CTAs                                     |

---

## 7. Choix techniques

### Gradients

Les `bg-gradient-to-br` Tailwind du web sont remplacés par `<LinearGradient>` (expo-linear-gradient) avec les **mêmes stops de couleurs** que `mockups-app/src/index.css` :

- `gradient-header` : `#1e3a8a → #2563eb → #6366f1`
- `gradient-primary` : `#2563eb → #1d4ed8 → #7c3aed`
- `gradient-mairie` : `#0f766e → #0d9488 → #2dd4bf`

### Glass-card

L'effet `backdrop-blur` Tailwind n'existe pas en React Native pur. On simule via couleur translucide (`rgba(255,255,255,0.15)`) + bordure blanche translucide, sans BlurView pour éviter le surcoût sur Android. `expo-blur` est installé en cas de besoin futur.

### Icônes

- **Icônes web** : `lucide-react` (chaînes JSX)
- **Icônes mobile** : `lucide-react-native` (même nommage, parité API)
- **Cas spécifique du Welcome** : les SVG `School`, `BuildingIcon`, `GraduationIcon` étaient des composants custom inline dans le web → ils sont répliqués via `react-native-svg` dans `app/index.tsx`

### Animations

- `pulse-urgent` (web : keyframe CSS) → `useSharedValue` + `withRepeat` + `useAnimatedStyle` de `react-native-reanimated` dans `PulseNumber` (utilisé sur la home parent pour le badge dossier urgent)
- `animate-slide-up` et `stagger-children` : non répliquées (priorité au fond, dégradation acceptable visuellement)
- `hover:*` Tailwind : supprimées (pas de hover sur mobile)
- `active:scale-[0.98]` : remplacé par `Pressable` avec `style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}`

### Palette

Recopiée intégralement depuis `mockups-app/src/index.css` dans :

- `tailwind.config.js` (utilisable via `className`)
- `constants/theme.ts` (utilisable par `LinearGradient` et autres styles JS — variantes en hex)

### Données mockées

Centralisées dans `data/mockData.ts` (le web les avait dispersées dans chaque écran). L'app mobile lit les données via imports nommés (`DOSSIERS`, `RENDEZ_VOUS`, `MESSAGES`, `ECOLES`, `PERSONNES`, `STATS_PARENT`, `STATS_MAIRIE`).

---

## 8. Problèmes rencontrés

### 8.1 Peer dependency conflicts npm

- **Symptôme** : `npm install nativewind tailwindcss` échouait avec `ERESOLVE` (react-dom@19 vs react@19 vs expo-router peer deps)
- **Cause** : NativeWind, expo-router et react-dom ont des contraintes croisées non strictement compatibles
- **Solution** : utilisation systématique de `--legacy-peer-deps` pour les installs npm. Documenté dans le README.

### 8.2 Échec `npx expo install`

- **Symptôme** : `npx expo install expo-linear-gradient expo-blur lucide-react-native react-native-svg` échouait avec `TypeError: fetch failed` (Expo CLI ne pouvait pas joindre son API de versioning)
- **Cause** : restriction réseau / proxy / sandbox
- **Solution** : installation directe avec `npm install` et versions explicites compatibles Expo SDK 54 :
  ```
  npm install expo-linear-gradient@~15.0.7 expo-blur@~15.0.7 lucide-react-native@^0.469.0 react-native-svg@~15.12.1 --save --legacy-peer-deps
  ```

### 8.3 Switch d'entrée Expo Router

- **Symptôme** : l'app utilisait `index.ts` → `App.tsx` (template classique), pas Expo Router
- **Solution** : changement du champ `main` du `package.json` de `"index.ts"` à `"expo-router/entry"`. Les fichiers `App.tsx` et `index.ts` sont conservés (règle « ne supprime rien ») mais ne sont plus l'entrée principale.

---

## 9. Éléments non migrés

### Écrans

Sur les 44 écrans du prototype web, seuls les 13 prioritaires sont représentés (3 complets + 10 placeholders). Les 31 autres sont à migrer plus tard (voir TODO.md). En particulier :

- Notifications (settings + centre)
- Recherche globale
- Documents
- Export
- Conseil d'école
- Bilan annuel
- Passage d'année
- Transfert administrateur
- Invitation, anciens représentants
- Orientation, dossiers similaires, brouillons
- Validation collective
- Hors compétence, demande précision, action programmée, compte rendu RDV (mairie)
- Modèles messages, catégories, services mairie
- Statistiques, carte écoles, mode élu

### Composants

- `MobileFrame` du web : non répliqué (l'app est nativement mobile)
- Décorations spécifiques web (effets de blur circulaires) : partiellement répliquées sur le Welcome (cercles décoratifs)

### Animations

- `animate-slide-up` et `stagger-children` : non implémentées (visuellement non bloquant)
- L'animation `pulse-urgent` est implémentée uniquement sur le badge dossier urgent du parent home

---

## 10. Vérifications effectuées

- ✅ `mobile-app/` créé/utilisé sans toucher au reste
- ✅ `mockups-app/` non modifié (vérifié par listing des fichiers — pas d'écriture en dehors de mobile-app)
- ✅ `npm install --legacy-peer-deps` réussit (824 packages, 4 vulns moderate non bloquantes)
- ✅ `npx tsc --noEmit` exit 0 (compilation TypeScript propre)
- ✅ `npx expo export --platform web` réussit : **2604 modules bundlés en 10.9 s, CSS NativeWind 14.5 kB contenant toutes nos classes custom** (voir CHANGELOG Étape 8). Garantit que NativeWind + Reanimated + Babel sont correctement configurés.
- ⏳ `npx expo start` (Expo Go ou web) à valider visuellement par l'utilisateur sur un device/navigateur
- ✅ Structure complète des fichiers cible
- ✅ Navigation Expo Router fonctionnelle (file-based routing)

### Dépendances ajoutées en post-vérification (étape 8)

Pour que le bundle web fonctionne (et le mode web Expo Go), 5 packages supplémentaires ont été installés :

- `react-dom@19.1.0`
- `react-native-web@~0.21.0`
- `@expo/metro-runtime`
- `react-native-worklets` (peer dep Reanimated 4.x)
- `babel-preset-expo` (devDep, requis par notre `babel.config.js`)

---

## Confirmation finale

**Aucune écriture, suppression, déplacement ou renommage de fichier n'a été effectué en dehors de `mobile-app/` pendant cette migration.**
