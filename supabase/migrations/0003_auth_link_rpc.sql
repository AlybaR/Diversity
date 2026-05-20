-- =============================================================================
-- Migration 0003 — RPC link_current_user_to_personne + policy update
-- =============================================================================
-- Crée la fonction qui lie auth.users à personnes à la première connexion
-- magic link, en bypassant RLS via SECURITY DEFINER.
--
-- Pourquoi cette fonction :
--   À la première connexion, l'utilisateur a un auth.uid() valide mais sa ligne
--   `personnes` a `auth_user_id = NULL`. Les policies RLS SELECT sur `personnes`
--   exigent que `auth_user_id = auth.uid()`, donc impossible de lire sa propre
--   ligne avant la liaison. Chicken-and-egg.
--
-- Solution : une fonction SECURITY DEFINER qui s'exécute avec les droits du
-- créateur (postgres), bypass RLS, fait le UPDATE atomic, retourne la ligne.
--
-- Points subtils gérés :
--   - Paramètres OUT renommés `personne_id`/`personne_role` pour éviter
--     l'ambiguïté avec la colonne `role` de la table (PostgreSQL renvoyait
--     "ERROR: 42702: column reference \"role\" is ambiguous").
--   - `auth.email()` privilégié sur `auth.jwt() ->> 'email'` (fonction officielle
--     Supabase, plus robuste aux changements de format JWT).
--   - `search_path = public` pour que l'enum `role_utilisateur` soit résolu
--     correctement même en SECURITY DEFINER.
-- =============================================================================

DROP FUNCTION IF EXISTS public.link_current_user_to_personne();

CREATE OR REPLACE FUNCTION public.link_current_user_to_personne()
RETURNS TABLE(personne_id TEXT, personne_role role_utilisateur) AS $$
DECLARE
  v_email TEXT;
  v_user_id UUID;
  v_id TEXT;
  v_role role_utilisateur;
BEGIN
  v_user_id := auth.uid();
  v_email := lower(coalesce(auth.email(), auth.jwt() ->> 'email'));

  IF v_user_id IS NULL OR v_email IS NULL THEN
    RAISE EXCEPTION 'no_session';
  END IF;

  -- 1) Déjà lié ? retourne directement la personne.
  SELECT p.id, p.role INTO v_id, v_role
  FROM personnes p
  WHERE p.auth_user_id = v_user_id
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    personne_id := v_id;
    personne_role := v_role;
    RETURN NEXT;
    RETURN;
  END IF;

  -- 2) Sinon, lier par email (qualif explicite des colonnes pour éviter
  --    l'ambiguïté avec les paramètres OUT).
  UPDATE personnes
  SET auth_user_id = v_user_id
  WHERE lower(personnes.email) = v_email
    AND personnes.auth_user_id IS NULL
  RETURNING personnes.id, personnes.role
  INTO v_id, v_role;

  IF v_id IS NOT NULL THEN
    personne_id := v_id;
    personne_role := v_role;
    RETURN NEXT;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.link_current_user_to_personne() TO authenticated;

-- -----------------------------------------------------------------------------
-- Policy SELECT sur `personnes` — sans récursion.
--
-- BUG initial (migration 0002) : la policy faisait `EXISTS (SELECT FROM personnes me ...)`
-- ce qui re-déclenchait la policy sur la sous-requête → "infinite recursion detected
-- in policy for relation personnes" dès qu'un client tentait `SELECT * FROM personnes`.
--
-- Fix : remplacer les EXISTS par des appels aux fonctions `current_user_ecole_id()`
-- et `current_user_role()` qui sont SECURITY DEFINER (migration 0002). Étant
-- SECURITY DEFINER, elles s'exécutent avec les droits postgres et BYPASS RLS,
-- donc pas de récursion.
--
-- En bonus : ajout du cas "auth_user_id IS NULL + email match" pour autoriser
-- la première connexion magic link à voir sa propre ligne avant la liaison.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "personnes_select" ON personnes;
CREATE POLICY "personnes_select" ON personnes FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- L'utilisateur se voit lui-même (cas standard, personne déjà liée)
    auth_user_id = auth.uid()
    -- Ou cas première connexion : pas encore lié, match par email JWT
    OR (
      auth_user_id IS NULL
      AND lower(email) = lower(coalesce(auth.email(), auth.jwt() ->> 'email'))
    )
    -- Ou même école (via fonction SECURITY DEFINER, pas de récursion)
    OR ecole_id = public.current_user_ecole_id()
    -- Ou agent mairie / élu (idem)
    OR public.current_user_role() IN ('mairie_admin', 'elu')
  )
);
