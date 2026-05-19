<!--
  Merci pour ta contribution à Passerelle !
  Remplis chaque section, supprime celles qui ne s'appliquent pas.
-->

## Résumé
<!-- En 1-2 phrases : qu'est-ce qui change et pourquoi ? -->

## Type de changement
- [ ] `feat` — nouvelle fonctionnalité
- [ ] `fix` — correction d'un bug
- [ ] `chore` — outillage, deps, refactor sans changement de comportement
- [ ] `docs` — documentation
- [ ] `test` — ajout/correction de tests
- [ ] `security` — fix de sécurité (à signaler en priorité)

## Captures
<!-- Pour les changements UI : un avant/après screenshot ou GIF -->

## Tests manuels effectués
<!-- Liste les parcours testés à la main pendant le développement -->
- [ ] …
- [ ] …

## Checklist avant merge
- [ ] `npm run typecheck` passe en local
- [ ] `npm run lint` passe en local
- [ ] `npm run bundle:check` passe en local
- [ ] CHANGELOG_MOBILE.md mis à jour si le changement est notable
- [ ] Pas de secret committé (clé API, mot de passe, URL avec token)
- [ ] Si le changement touche aux scopes de visibilité ou aux guards de sécurité : tests E2E `npm run test:parents` dans `tests-e2e/` passent

## Notes de revue
<!-- Tout ce qui mérite l'attention du reviewer : décisions de design, alternatives écartées, points encore ouverts -->
