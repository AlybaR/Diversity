-- =============================================================================
-- Migration 0004 — Ajouter push_token à personnes
-- =============================================================================
-- Phase 3 (Robustesse production) : on collecte les tokens Expo Push à chaque
-- login pour pouvoir, en Phase 5, déclencher des notifications côté serveur
-- (Edge Function Supabase + Expo Push API).
--
-- La colonne est nullable car :
--   1) tous les utilisateurs existants n'ont pas encore de token
--   2) le web ne supporte pas encore expo-notifications (TBD Phase 3+)
--   3) l'utilisateur peut refuser la permission OS — c'est légitime
--
-- Politique RLS : l'utilisateur peut UPDATE sa propre ligne `personnes` pour
-- y écrire son push_token. On réutilise la policy existante "personne peut
-- modifier ses propres infos" si elle existe, sinon on l'ajoute ici.
-- =============================================================================

ALTER TABLE personnes
  ADD COLUMN IF NOT EXISTS push_token TEXT;

COMMENT ON COLUMN personnes.push_token IS
  'Token Expo Push (ExponentPushToken[xxx]) collecté à la première connexion sur device natif. Mis à jour à chaque login (rotation possible).';

-- Permettre à l'utilisateur de mettre à jour son propre push_token.
-- Si une policy UPDATE existe déjà sur personnes, ce DROP la remplace par une
-- version plus permissive (sans changer le scope : on reste sur "ma ligne").
DROP POLICY IF EXISTS "personnes_update_self" ON personnes;
CREATE POLICY "personnes_update_self" ON personnes FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Index NULL-safe pour le futur job d'envoi (filtrer "tokens non nuls")
CREATE INDEX IF NOT EXISTS idx_personnes_push_token_not_null
  ON personnes (id) WHERE push_token IS NOT NULL;
