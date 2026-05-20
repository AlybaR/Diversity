-- =============================================================================
-- Seed test user — ajoute l'email réel de l'utilisateur dans `personnes`
-- =============================================================================
-- À exécuter UNE FOIS dans le SQL Editor Supabase pour pouvoir se connecter à
-- l'app en Phase 2 avec un vrai magic link.
--
-- Comment ça marche :
--   1. Tu lances ce script → une ligne `personnes` est créée avec ton email
--      et le rôle `mairie_admin` (voit tous les scopes).
--   2. Tu lances le magic link depuis l'app (/sign-in)
--   3. Tu cliques sur le lien dans l'email
--   4. /auth/callback trouve ta personne par email, lie auth_user_id, redirige
--      vers /mairie/dashboard
--
-- Idempotent : peut être rejoué sans erreur grâce au ON CONFLICT.
-- =============================================================================

INSERT INTO personnes (
  id, prenom, nom, email, role, service, fonction, actif
) VALUES (
  'personne-kouceila',
  'Kouceila',
  'Moussaoui',
  'kouceila.moussaoui@ifjrpc.org',
  'mairie_admin',
  'Éducation',
  'Administrateur Passerelle',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  service = EXCLUDED.service,
  fonction = EXCLUDED.fonction;

-- Vérification : la personne doit être présente avec auth_user_id NULL (sera
-- rempli automatiquement à la première connexion magic link).
SELECT id, prenom, nom, email, role, auth_user_id
FROM personnes
WHERE email = 'kouceila.moussaoui@ifjrpc.org';
