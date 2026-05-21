# Notes juridiques — Passerelle

Ce fichier sert de **registre interne** des décisions juridiques en attente et des champs à compléter avant la mise en production publique. Il n'est pas destiné à être consulté par les utilisateurs (lien direct uniquement depuis la doc interne).

## Décisions juridiques en attente (avant production publique)

### Identité de l'éditeur

- [ ] Forme juridique : SAS / SARL / association loi 1901 / autre
- [ ] Raison sociale / dénomination
- [ ] Adresse du siège social
- [ ] SIRET (à immatriculer si pas encore fait)
- [ ] Capital social (si société)
- [ ] Directeur de la publication (représentant légal)
- [ ] Numéro TVA intracommunautaire (si applicable)

→ À reporter dans `app/legal/mentions.tsx` (marqueurs `[À COMPLÉTER]`).

### DPO

- [ ] Désignation interne ou externalisation (cabinet) ?
- [ ] Email dédié `dpo@passerelle.fr` à créer (alias de l'éditeur ou boîte dédiée)
- [ ] Déclaration éventuelle à la CNIL (seulement si traitement à risque élevé, à analyser via DPIA)

### Politique de confidentialité

- [ ] Validation finale par un juriste / DPO
- [ ] Décision sur la durée de conservation des dossiers post-mandat (actuellement : 3 ans, à confirmer)
- [ ] Liste exhaustive des sous-traitants techniques avec leur localisation et leurs garanties RGPD
- [ ] Analyse d'impact (DPIA / AIPD) sur les traitements identifiés à risque

### CGU

- [ ] Validation finale par un juriste
- [ ] Décision sur le modèle économique (B2B mairies, prix, durée d'engagement) → à intégrer dans une section dédiée
- [ ] Clauses de résiliation côté mairie cliente (préavis, sort des données à la résiliation)

### Marque & propriété intellectuelle

- [ ] Dépôt INPI de la marque « Passerelle » (en cours d'enregistrement)
- [ ] Vérification de disponibilité du nom de domaine `passerelle.fr` (plan B : `passerelle.app`, `mapasserelle.fr`)
- [ ] Logo : à designer ou commander
- [ ] Charte graphique : palette définitive (actuelle : bleu primary + teal mairie + indigo direction)

### Hébergement & infrastructure (RGPD)

- [x] Hébergement données : Supabase région eu-west-3 (Paris) ✅
- [x] CDN web : Cloudflare PoP européen (Paris) ✅
- [ ] Vérifier que Sentry est configuré sur la région EU (sentry.io EU) avant activation prod
- [ ] Backups : Supabase quotidien automatique (rétention 7j en free, 30j en pro) — passer en pro avant prod

### Conformité accessibilité (RGAA / WCAG)

- [ ] Audit accessibilité WCAG 2.1 niveau AA (cible Phase 5)
- [ ] Déclaration d'accessibilité (obligatoire en France pour les services publics → potentiellement applicable à Passerelle si client institutionnel)

## Choix de rédaction faits (à valider mais argumentés)

| Choix | Argument | Validation |
| --- | --- | --- |
| Tutoiement utilisateur dans les écrans | Cohérent avec le ton de l'app, public principalement bénévole (parents élus). | À débattre — formel possible côté mairie |
| Conservation données : 3 ans après mandat | Compromis entre continuité institutionnelle et minimisation RGPD. | À valider DPO |
| Suppression différée 30 jours | Standard du marché (Google, Apple). Permet la rétractation. | OK |
| Anonymisation post-suppression (« Un parent élu ») | Préserve l'historique pour les successeurs sans conserver l'identité. | À valider DPO |
| Pas de cookies tiers, pas de tracking publicitaire | Engagement fort différenciant. Aucun consentement cookies bannière à afficher (seul cookie technique). | OK |
| Magic link, pas de mot de passe | Réduit la surface d'attaque + meilleure UX. | OK |

## Fichiers à mettre à jour quand les décisions seront prises

| Fichier | Champ |
| --- | --- |
| `app/legal/mentions.tsx` | Identité éditeur, hébergeur, directeur publication |
| `app/legal/cgu.tsx` | Nom de l'éditeur (article 1) |
| `app/legal/privacy.tsx` | Responsable de traitement (section 1), DPO email (section 8) |
| `app/aide/contact.tsx` | `SUPPORT_EMAIL` et `DPO_EMAIL` (constantes en tête) |
| `app/legal/*` (3 fichiers) | Date de dernière mise à jour à actualiser à chaque révision |

## Process de mise à jour

1. Modification proposée par produit ou juriste → ouverture d'une issue GitHub avec label `legal`
2. Validation par le DPO + représentant légal
3. PR `legal(privacy|cgu|mentions):` qui modifie le ou les écrans concernés + actualise la date
4. Notification utilisateurs si modification substantielle (banner in-app + email)

## Références utiles

- Guide CNIL pour la rédaction de politique de confidentialité : https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on
- Mentions légales obligatoires (LCEN art. 6.III) : https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000037837030
- RGPD texte intégral : https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Référentiel RGAA (accessibilité) : https://accessibilite.numerique.gouv.fr/
