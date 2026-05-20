-- =============================================================================
-- Tests RLS — vérifications semi-manuelles à lancer dans SQL Editor
-- =============================================================================
-- À exécuter par bloc (chaque section indépendamment) dans le SQL Editor Supabase.
-- Chaque requête a un "résultat attendu" en commentaire — si ce que tu obtiens
-- diffère, c'est qu'une policy RLS est trop laxe ou trop stricte.
--
-- Pré-requis :
--   - Migrations 0001 + 0002 exécutées
--   - seed.sql exécuté
--   - seed-test-user.sql exécuté (au moins une personne avec ton email)
--
-- Mécanique du test :
--   On utilise `set_config('request.jwt.claims', '{"sub":"<uuid>"}', true)` pour
--   simuler une session authentifiée. On bascule aussi `SET LOCAL ROLE authenticated`
--   pour que les policies s'appliquent comme en prod.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Setup : créer des auth_user_id fictifs pour chaque rôle de test
-- (Idempotent : peut être rejoué)
-- -----------------------------------------------------------------------------

UPDATE personnes SET auth_user_id = '11111111-1111-1111-1111-111111111111'
  WHERE id = 'personne-nadia' AND auth_user_id IS NULL;

UPDATE personnes SET auth_user_id = '22222222-2222-2222-2222-222222222222'
  WHERE id = 'personne-girard' AND auth_user_id IS NULL;

UPDATE personnes SET auth_user_id = '33333333-3333-3333-3333-333333333333'
  WHERE id = 'personne-claire' AND auth_user_id IS NULL;

-- -----------------------------------------------------------------------------
-- TEST 1 : Parent (Nadia) ne voit PAS les dossiers direction_mairie / mairie_interne
-- -----------------------------------------------------------------------------

BEGIN;
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
    true
  );

  -- Attendu : 0 (les dossiers direction_mairie sont invisibles)
  SELECT COUNT(*) AS parent_voit_direction_mairie
  FROM dossiers WHERE visibility_scope = 'direction_mairie';

  -- Attendu : 0 (les notes mairie internes sont invisibles)
  SELECT COUNT(*) AS parent_voit_mairie_interne
  FROM dossiers WHERE visibility_scope = 'mairie_interne';

  -- Attendu : > 0 (les dossiers parents_mairie sont visibles)
  SELECT COUNT(*) AS parent_voit_parents_mairie
  FROM dossiers WHERE visibility_scope = 'parents_mairie';

  -- Attendu : > 0 (les dossiers tripartite sont visibles)
  SELECT COUNT(*) AS parent_voit_tripartite
  FROM dossiers WHERE visibility_scope = 'partage_tripartite';
ROLLBACK;

-- -----------------------------------------------------------------------------
-- TEST 2 : Direction (Mme Girard) ne voit PAS les dossiers parents_mairie / mairie_interne
-- -----------------------------------------------------------------------------

BEGIN;
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}',
    true
  );

  -- Attendu : 0
  SELECT COUNT(*) AS direction_voit_parents_mairie
  FROM dossiers WHERE visibility_scope = 'parents_mairie';

  -- Attendu : 0
  SELECT COUNT(*) AS direction_voit_mairie_interne
  FROM dossiers WHERE visibility_scope = 'mairie_interne';

  -- Attendu : > 0
  SELECT COUNT(*) AS direction_voit_direction_mairie
  FROM dossiers WHERE visibility_scope = 'direction_mairie';

  -- Attendu : > 0
  SELECT COUNT(*) AS direction_voit_tripartite
  FROM dossiers WHERE visibility_scope = 'partage_tripartite';
ROLLBACK;

-- -----------------------------------------------------------------------------
-- TEST 3 : Mairie (Claire) voit TOUS les scopes
-- -----------------------------------------------------------------------------

BEGIN;
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}',
    true
  );

  -- Attendu pour les 4 : > 0
  SELECT COUNT(*) AS mairie_voit_parents_mairie
  FROM dossiers WHERE visibility_scope = 'parents_mairie';

  SELECT COUNT(*) AS mairie_voit_direction_mairie
  FROM dossiers WHERE visibility_scope = 'direction_mairie';

  SELECT COUNT(*) AS mairie_voit_mairie_interne
  FROM dossiers WHERE visibility_scope = 'mairie_interne';

  SELECT COUNT(*) AS mairie_voit_tripartite
  FROM dossiers WHERE visibility_scope = 'partage_tripartite';
ROLLBACK;

-- -----------------------------------------------------------------------------
-- TEST 4 : URL directe vers dossier confidentiel (par id) — doit retourner NULL
-- -----------------------------------------------------------------------------

BEGIN;
  -- Simule la session de Nadia (parent)
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
    true
  );

  -- Attendu : 0 lignes (le dossier direction_mairie est invisible même par id)
  SELECT id, titre FROM dossiers WHERE id = 'dossier-tensions-representants';

  -- Attendu : 0 lignes (note interne mairie invisible)
  SELECT id, titre FROM dossiers WHERE id = 'dossier-note-budget';
ROLLBACK;

-- -----------------------------------------------------------------------------
-- TEST 5 : Tests sur messages (mêmes principes)
-- -----------------------------------------------------------------------------

BEGIN;
  -- Parent
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
    true
  );

  -- Attendu : 0 (message Vigipirate = direction_mairie)
  SELECT COUNT(*) AS parent_voit_vigipirate
  FROM messages WHERE id = 'message-vigipirate';
ROLLBACK;

BEGIN;
  -- Direction
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}',
    true
  );

  -- Attendu : 1 (direction voit Vigipirate)
  SELECT COUNT(*) AS direction_voit_vigipirate
  FROM messages WHERE id = 'message-vigipirate';

  -- Attendu : 0 (sectorisation = parents_mairie, invisible direction)
  SELECT COUNT(*) AS direction_voit_sectorisation
  FROM messages WHERE id = 'message-sectorisation';
ROLLBACK;

-- -----------------------------------------------------------------------------
-- TEST 6 : RDV
-- -----------------------------------------------------------------------------

BEGIN;
  -- Parent
  SET LOCAL ROLE authenticated;
  SELECT set_config(
    'request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}',
    true
  );

  -- Attendu : 0 (RDV tensions = direction_mairie)
  SELECT COUNT(*) AS parent_voit_rdv_tensions
  FROM rendez_vous WHERE id = 'rdv-tensions';
ROLLBACK;

-- =============================================================================
-- RÉSUMÉ ATTENDU
-- =============================================================================
-- TEST 1 (parent) : 0, 0, >0, >0  ✅
-- TEST 2 (direction) : 0, 0, >0, >0  ✅
-- TEST 3 (mairie) : >0, >0, >0, >0  ✅
-- TEST 4 (URL directe parent) : 0, 0  ✅
-- TEST 5 (messages parent) : 0  ✅
-- TEST 5 (messages direction) : 1, 0  ✅
-- TEST 6 (RDV parent) : 0  ✅
--
-- Si tout matche → l'isolation par scope tient au niveau base de données.
-- Si un résultat ne matche pas, regarde la migration 0002 et la fonction
-- public.user_can_see_scope.
-- =============================================================================
