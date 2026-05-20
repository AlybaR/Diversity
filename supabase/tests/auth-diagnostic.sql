-- =============================================================================
-- Diagnostic auth — à lancer dans SQL Editor, UN BLOC À LA FOIS
-- =============================================================================
-- Sert à identifier précisément pourquoi un magic link valide finit sur
-- `/auth/no-access`. Plus de fixes aveugles.
--
-- À chaque bloc, copier les résultats et les partager pour analyse.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A1 — La ligne `personnes` existe-t-elle vraiment ?
-- Cherche tout email contenant 'kouceila' pour attraper des différences
-- de casse ou des espaces parasites.
-- -----------------------------------------------------------------------------

SELECT id, email, role, auth_user_id, length(email) AS email_len
FROM personnes
WHERE lower(email) LIKE '%kouceila%';

-- Résultat attendu : 1 ligne avec email="kouceila.moussaoui@ifjrpc.org",
-- role="mairie_admin", auth_user_id=NULL, email_len=29.
--
-- Si 0 ligne : la personne n'a pas été créée (cause = H1, ré-insérer).
-- Si email_len != 29 : il y a un caractère parasite (espace, tabulation).

-- -----------------------------------------------------------------------------
-- A2 — Que retournent les helpers Supabase auth.* dans une session simulée ?
-- -----------------------------------------------------------------------------

BEGIN;
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"f695959c-3bd8-4530-a750-1c6f0a972c0f","email":"kouceila.moussaoui@ifjrpc.org","role":"authenticated"}',
    true
  );

  SELECT
    auth.uid()                                 AS uid,
    auth.email()                               AS email_fn,
    auth.jwt() ->> 'email'                     AS email_jwt_root,
    auth.jwt() -> 'user_metadata' ->> 'email'  AS email_jwt_meta,
    auth.role()                                AS auth_role;
ROLLBACK;

-- Résultat attendu :
--   uid             = f695959c-3bd8-4530-a750-1c6f0a972c0f
--   email_fn        = kouceila.moussaoui@ifjrpc.org  (la fonction officielle)
--   email_jwt_root  = kouceila.moussaoui@ifjrpc.org  (si elle marche)
--   email_jwt_meta  = NULL (pas dans user_metadata)
--   auth_role       = authenticated
--
-- Si `email_jwt_root` est NULL mais `email_fn` est rempli → cause = H2.
--   Fix : utiliser auth.email() dans la RPC au lieu de auth.jwt() ->> 'email'.

-- -----------------------------------------------------------------------------
-- A3 — La RPC `link_current_user_to_personne` retourne quoi en session simulée ?
-- -----------------------------------------------------------------------------

BEGIN;
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"f695959c-3bd8-4530-a750-1c6f0a972c0f","email":"kouceila.moussaoui@ifjrpc.org","role":"authenticated"}',
    true
  );

  SELECT * FROM public.link_current_user_to_personne();
ROLLBACK;

-- Résultat attendu : 1 ligne (personne_id="personne-kouceila", role="mairie_admin")
--
-- Si 0 ligne sans exception : cause = H3 (bug PL/pgSQL early-return).
--   Fix : réécrire la RPC sans early-return `IF FOUND THEN RETURN`.
-- Si exception "no_session" : cause = H2 (auth.jwt() ->> 'email' = NULL).
-- Si exception SQL inconnue : copier le message exact.
