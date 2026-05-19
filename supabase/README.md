# Supabase — Passerelle

Backend PostgreSQL hébergé en Europe pour Passerelle, conforme RGPD. La sécurité de l'app repose en grande partie sur les **politiques Row Level Security** définies dans la migration 0002.

## Contenu de ce dossier

```
supabase/
  migrations/
    0001_initial_schema.sql   ← Schema initial (tables, enums, triggers)
    0002_rls_policies.sql     ← Row Level Security : matérialise canRoleSeeScope en SQL
  seed.sql                    ← Données de démo équivalentes à data/mockData.ts
  README.md                   ← Ce fichier
```

## Étape 1 — Créer le projet Supabase (5 min)

1. Va sur [https://app.supabase.com](https://app.supabase.com) et connecte-toi
2. **New project** :
   - Name : `passerelle-dev` (et plus tard un `passerelle-prod`)
   - Database Password : génère-en un fort, **garde-le précieusement**
   - **Region : `Europe (Paris)` (eu-west-3)** — obligatoire pour RGPD
   - Plan : Free pour démarrer (suffisant jusqu'à ~50 000 users/mois)
3. Attends ~1-2 min que le projet se provisionne

## Étape 2 — Récupérer les clés d'API

Dans le projet Supabase nouvellement créé :

1. **Settings** (menu de gauche, icône engrenage) → **API**
2. Note :
   - **Project URL** (ex: `https://abcdefghij.supabase.co`)
   - **Project API keys → `anon` `public`** (clé publique, OK dans le bundle client)
   - **Project API keys → `service_role` `secret`** (à NE JAMAIS exposer côté client — utilisée uniquement pour le seed et les scripts admin)

## Étape 3 — Configurer `.env.local`

À la racine de `mobile-app/`, crée un fichier `.env.local` (non versionné, exclu par `.gitignore`) :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

(remplace par tes vraies valeurs)

## Étape 4 — Lancer les migrations

Deux options selon ton préférence :

### Option A — Interface web (rapide, recommandé pour démarrer)

1. Dans Supabase, **SQL Editor** (icône `</>`)
2. **New query**
3. Colle le contenu de `migrations/0001_initial_schema.sql` → **Run**
4. **New query** à nouveau → colle `migrations/0002_rls_policies.sql` → **Run**
5. **New query** → colle `seed.sql` → **Run**

### Option B — Supabase CLI (mieux pour le développement à long terme)

```bash
# Installer la CLI (une seule fois)
npm install -g supabase

# Lier le projet local au projet Supabase distant
supabase login
supabase link --project-ref <ton-project-ref>

# Pousser les migrations
supabase db push

# Reset complet + seed (efface tout et recharge)
supabase db reset
```

## Étape 5 — Vérifier que tout est en place

Dans Supabase :

1. **Table editor** : tu dois voir les tables `mairies`, `ecoles`, `personnes`, `dossiers`, etc.
2. **Authentication → Policies** : tu dois voir les policies listées sur chaque table
3. Lance une requête de test dans **SQL Editor** :
   ```sql
   SELECT COUNT(*) FROM dossiers;  -- doit retourner 8
   SELECT COUNT(*) FROM personnes; -- doit retourner 5
   ```

## Architecture de sécurité

### Le modèle

Chaque objet visible (dossier, message, RDV, pièce jointe, commentaire) porte un champ `visibility_scope` à 4 valeurs :

| Scope                | Visible par                                |
| -------------------- | ------------------------------------------ |
| `parents_mairie`     | parents élus + mairie                      |
| `direction_mairie`   | direction + mairie                         |
| `partage_tripartite` | parents + direction + mairie               |
| `mairie_interne`     | mairie uniquement (agents + élus)          |

### Comment c'est garanti

Les politiques RLS de la migration 0002 utilisent la fonction `user_can_see_scope(scope)` qui réplique exactement la matrice `canRoleSeeScope` de `mobile-app/types/index.ts`. Concrètement :

- Quand un parent fait `SELECT * FROM dossiers`, PostgreSQL filtre automatiquement les lignes selon son rôle.
- Si un parent connaît l'`id` d'un dossier `direction_mairie` et tape `SELECT * FROM dossiers WHERE id = 'xxx'`, **PostgreSQL renvoie zéro ligne** — pas une erreur, juste rien. Aucune fuite.
- Même un bug applicatif (mauvais filtre côté code) ne peut pas casser cette garantie : la sécurité est dans la base, pas dans le code.

### Lien entre `auth.users` et `personnes`

Quand Supabase Auth créera un utilisateur (Phase 2 — magic link), il aura un `auth.users.id` (UUID). Ce UUID sera lié à la ligne `personnes` correspondante via la colonne `auth_user_id` (ajoutée par la migration 0002).

Workflow d'invitation (Phase 2, à venir) :
1. Mairie crée une `personne` avec email et rôle, mais `auth_user_id = NULL`
2. Supabase Auth envoie le magic link à l'email
3. À la première connexion, on lie automatiquement `auth.uid()` à la `personne` matchant l'email

## Bonnes pratiques

- **Ne JAMAIS exposer la clé `service_role`** côté client (commit, env public, etc.). C'est l'équivalent du mot de passe DB.
- **Sauvegardes** : Supabase fait des backups quotidiens automatiques (rétention 7j en Free, 30j en Pro).
- **Migrations** : numérote-les séquentiellement (`0003_...`, `0004_...`), jamais modifier une migration déjà appliquée — créer une nouvelle migration de modification.
- **Tester les policies** : avant chaque release, vérifier qu'un utilisateur d'un rôle ne peut PAS lire ce qui appartient à un autre canal. À automatiser avec des tests `pgTAP` (Phase 1 à étendre).

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI reference](https://supabase.com/docs/reference/cli/introduction)
