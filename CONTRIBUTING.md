# Contribuer à Passerelle

Bienvenue ! Ce document décrit les conventions de travail sur le repo Passerelle (`AlybaR/Diversity`).

## Démarrage

```bash
# Récupérer le repo
git clone https://github.com/AlybaR/Diversity.git
cd Diversity

# Installer (toujours avec --legacy-peer-deps : conflit react-dom/expo-router connu)
npm install --legacy-peer-deps

# Lancer le serveur web dev
EXPO_OFFLINE=1 CI=1 npx expo start --web --port 8081
# Puis ouvrir http://localhost:8081 dans Chrome (device toolbar iPhone 14 Pro recommandé)
```

## Workflow Git

### Branches

- `main` est protégée. **On ne push jamais directement.**
- Pour toute modification : créer une branche à partir de `main` :
  ```bash
  git checkout main && git pull
  git checkout -b feat/nom-court-explicite
  ```
- Préfixes recommandés :
  - `feat/` — nouvelle fonctionnalité
  - `fix/` — correction de bug
  - `chore/` — outillage, dépendances, refactor sans changement de comportement
  - `docs/` — documentation
  - `test/` — ajout/correction de tests

### Commits — Conventional Commits

On utilise [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/) :

```
<type>(<scope optionnel>): <résumé en français, < 72 caractères>

<corps optionnel, expliquant le POURQUOI plus que le QUOI>
```

Types autorisés :

| Type | Quand l'utiliser |
| --- | --- |
| `feat` | Nouvelle fonctionnalité visible par l'utilisateur |
| `fix` | Correction d'un bug |
| `chore` | Outillage, dépendances, config |
| `docs` | Documentation, commentaires |
| `test` | Ajout / amélioration de tests |
| `refactor` | Refactor sans changement de comportement |
| `style` | Formatage, espaces (rare) |
| `security` | Fix de sécurité (à signaler en priorité) |

Exemples :

```
feat(direction): ajouter l'écran de création de sujet institutionnel
fix(parent): empêcher l'accès aux dossiers direction via URL directe
chore: monter Playwright à 1.50
docs: ajouter section auth dans le README
security(rls): durcir la policy de lecture sur la table dossiers
```

Bénéfice : le `CHANGELOG_MOBILE.md` peut être généré automatiquement plus tard à partir de ces commits.

### Pull Requests

- **Toujours via PR**, même quand on travaille seul. Ça permet de :
  - Avoir l'historique des décisions
  - Déclencher la CI automatique
  - Permettre une review humaine (le futur toi te remerciera)
- Utilise le template fourni dans `.github/PULL_REQUEST_TEMPLATE.md`
- Une PR ne doit pas dépasser **~400 lignes** modifiées (sinon découpe-la)
- La CI doit être verte pour merger

## Conventions code

### TypeScript

- TypeScript strict est activé. Aucun `any` sans commentaire justifiant.
- Préfixe `_` pour les paramètres volontairement non utilisés (`_event`).
- Pas de `console.log` qui resterait en prod. Si nécessaire pour debug, retirer avant la PR.

### Naming

- Composants React : `PascalCase` (`ScopeSelector`, `BottomNav`)
- Fichiers de composants : `PascalCase.tsx`
- Hooks : `useCamelCase`
- Fichiers d'écrans (`app/`) : `kebab-case.tsx` (convention Expo Router)
- Constantes : `SCREAMING_SNAKE_CASE`
- Variables et fonctions : `camelCase`

### Visibility scope — règle d'or

Le modèle de visibilité par canal (`VisibilityScope`) est défini dans [`types/index.ts`](types/index.ts) avec le helper `canRoleSeeScope`. **C'est la source unique de vérité de la sécurité.**

- Quand tu ajoutes une nouvelle entité visible (dossier, message, RDV, etc.), elle DOIT avoir un champ `visibilityScope`.
- Quand tu crées un écran de détail, il DOIT vérifier `canRoleSeeScope(currentRole, entity.visibilityScope)` AVANT d'afficher quoi que ce soit (titre y compris).
- Les services qui listent des données DOIVENT filtrer via `visibleByRole`.
- Tests E2E de sécurité côté URL directe → `tests-e2e/tests/parents/parents.spec.ts` (section "3. Sécurité").

## Tests

### En local avant de pousser

```bash
npm run typecheck      # TypeScript
npm run lint           # ESLint
npm run bundle:check   # Bundle Metro complet (catche les erreurs Babel/NativeWind)
```

### Tests E2E (browser réel)

Le dossier `tests-e2e/` est **hors de ce repo** (séparé pour ne pas polluer mobile-app). Pour y lancer les tests :

```bash
cd ../tests-e2e
npm install
npx playwright install chromium

# Pré-requis : le serveur Expo doit tourner (commande plus haut)
npm run test:parents          # 7 tests parents, headless, ~1m30
npm run test:parents:headed   # avec browser visible et slowMo 800ms
npm run test:parents:ui       # mode UI Playwright (timeline + scrubber)
npm run report                # ouvre le rapport HTML du dernier run
```

Le rapport Markdown lisible est dans `tests-e2e/RAPPORT-DERNIER.md`.

## Versioning et releases

- [Semver](https://semver.org/lang/fr/) : `vMAJOR.MINOR.PATCH`
- Tag à chaque fin de phase du plan de mise en production
  - `v0.1.0` actuel — MVP mockData
  - `v0.2.0` — Phase 0 CI/CD
  - `v0.3.0` — Phase 1 backend Supabase
  - …
- Release GitHub avec notes (peut être auto-générée plus tard depuis les Conventional Commits)

## Sécurité — comment signaler une faille

**Ne PAS créer d'issue publique** pour une faille de sécurité. Envoie un email à l'adresse listée dans `.github/ISSUE_TEMPLATE/config.yml`. Réponse sous 48h.

## Protection de la branche `main` (à activer côté GitHub)

À activer manuellement dans **Settings → Branches → Branch protection rules** sur GitHub :

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Sélectionner le check `Quality (typecheck + lint + bundle)` une fois la CI lancée au moins une fois
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

À configurer une seule fois après le premier push qui contient `.github/workflows/ci.yml`.

## Outillage recommandé (extensions VS Code)

- ESLint
- Prettier
- Expo Tools
- Tailwind CSS IntelliSense (pour NativeWind)
- GitLens

## Liens utiles

- [Plan de mise en production](../../.claude/plans/continue-le-travail-sur-humble-aurora.md) (local)
- [CHANGELOG_MOBILE.md](CHANGELOG_MOBILE.md) — journal en continu
- [TEST_SCENARIOS.md](TEST_SCENARIOS.md) — checklist manuelle
- [README.md](README.md) — vue d'ensemble
