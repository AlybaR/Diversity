-- =============================================================================
-- Migration 0002 — Row Level Security (RLS)
-- =============================================================================
-- Réplique côté PostgreSQL la matrice `canRoleSeeScope` de types/index.ts.
--
-- Principe : la sécurité n'est PAS dans le code applicatif. Elle est matérialisée
-- dans la base. Même un bug applicatif (mauvais filtre, oubli d'un `visibleByRole`)
-- ne peut pas faire fuiter un dossier d'un autre scope, car PostgreSQL lui-même
-- renvoie 0 ligne quand le rôle de l'utilisateur connecté n'est pas autorisé.
--
-- Cette migration prépare aussi le terrain pour Phase 2 (auth magic link) en
-- ajoutant la colonne `auth_user_id` qui relie `personnes` à `auth.users` de
-- Supabase Auth.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Lien personnes ↔ auth.users (préparation Phase 2)
-- -----------------------------------------------------------------------------

ALTER TABLE personnes
  ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX personnes_auth_user_idx ON personnes(auth_user_id);

-- -----------------------------------------------------------------------------
-- Fonctions utilitaires
-- -----------------------------------------------------------------------------

-- Retourne le rôle de l'utilisateur courant (depuis le JWT Supabase Auth).
-- Renvoie NULL si pas authentifié → toutes les policies refusent l'accès par défaut.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS role_utilisateur AS $$
  SELECT role
  FROM public.personnes
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Retourne l'école d'appartenance de l'utilisateur courant (utile pour scoper
-- aussi par école, pas seulement par scope de visibilité).
CREATE OR REPLACE FUNCTION public.current_user_ecole_id()
RETURNS TEXT AS $$
  SELECT ecole_id
  FROM public.personnes
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Implémentation SQL de canRoleSeeScope. Réplique exactement la logique TS de
-- mobile-app/types/index.ts.
CREATE OR REPLACE FUNCTION public.user_can_see_scope(scope visibility_scope)
RETURNS BOOLEAN AS $$
DECLARE
  user_role role_utilisateur;
BEGIN
  user_role := public.current_user_role();

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN CASE scope
    WHEN 'parents_mairie' THEN
      user_role IN ('parent_admin', 'parent_contributeur', 'mairie_admin', 'elu')
    WHEN 'direction_mairie' THEN
      user_role IN ('direction', 'mairie_admin', 'elu')
    WHEN 'partage_tripartite' THEN
      TRUE
    WHEN 'mairie_interne' THEN
      user_role IN ('mairie_admin', 'elu')
  END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Activer RLS sur toutes les tables
-- -----------------------------------------------------------------------------

ALTER TABLE mairies              ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecoles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts_mairie      ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces_jointes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires_dossier ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE anciens_admins       ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- POLICIES SELECT — la pièce maîtresse de l'isolation
-- -----------------------------------------------------------------------------

-- DOSSIERS : visibles seulement si le rôle de l'utilisateur autorise le scope
CREATE POLICY "dossiers_select" ON dossiers FOR SELECT
  USING (public.user_can_see_scope(visibility_scope));

-- HISTORIQUE_EVENTS : visibles si le dossier parent est visible
CREATE POLICY "historique_select" ON historique_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dossiers d
      WHERE d.id = historique_events.dossier_id
        AND public.user_can_see_scope(d.visibility_scope)
    )
  );

-- PIECES_JOINTES : visibles si le scope propre OU (à défaut) le scope du dossier parent
CREATE POLICY "pieces_jointes_select" ON pieces_jointes FOR SELECT
  USING (
    CASE
      WHEN pieces_jointes.visibility_scope IS NOT NULL THEN
        public.user_can_see_scope(pieces_jointes.visibility_scope)
      ELSE
        EXISTS (
          SELECT 1 FROM dossiers d
          WHERE d.id = pieces_jointes.dossier_id
            AND public.user_can_see_scope(d.visibility_scope)
        )
    END
  );

-- COMMENTAIRES_DOSSIER : visibles si le scope propre OU (à défaut) le scope du dossier parent
CREATE POLICY "commentaires_select" ON commentaires_dossier FOR SELECT
  USING (
    CASE
      WHEN commentaires_dossier.visibility_scope IS NOT NULL THEN
        public.user_can_see_scope(commentaires_dossier.visibility_scope)
      ELSE
        EXISTS (
          SELECT 1 FROM dossiers d
          WHERE d.id = commentaires_dossier.dossier_id
            AND public.user_can_see_scope(d.visibility_scope)
        )
    END
  );

-- RENDEZ_VOUS : visibles selon le scope
CREATE POLICY "rendez_vous_select" ON rendez_vous FOR SELECT
  USING (public.user_can_see_scope(visibility_scope));

-- MESSAGES : visibles selon le scope
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (public.user_can_see_scope(visibility_scope));

-- -----------------------------------------------------------------------------
-- POLICIES SELECT — données de contexte (école, personnes, contacts)
-- -----------------------------------------------------------------------------

-- MAIRIES : visibles à tous les utilisateurs authentifiés appartenant à cette mairie
CREATE POLICY "mairies_select" ON mairies FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM personnes p
      WHERE p.auth_user_id = auth.uid()
        AND (
          -- Agent mairie ou élu : voit sa propre collectivité (à raffiner avec multi-mairies)
          p.role IN ('mairie_admin', 'elu')
          -- Parent ou direction : voit la mairie de son école
          OR EXISTS (
            SELECT 1 FROM ecoles e
            WHERE e.id = p.ecole_id AND e.collectivite_id = mairies.id
          )
        )
    )
  );

-- ECOLES : visibles à l'utilisateur de cette école OU à la mairie qui la chapeaute
CREATE POLICY "ecoles_select" ON ecoles FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      -- L'utilisateur est rattaché à cette école
      EXISTS (
        SELECT 1 FROM personnes p
        WHERE p.auth_user_id = auth.uid() AND p.ecole_id = ecoles.id
      )
      -- Ou il est agent de la mairie qui chapeaute cette école
      OR EXISTS (
        SELECT 1 FROM personnes p
        WHERE p.auth_user_id = auth.uid()
          AND p.role IN ('mairie_admin', 'elu')
      )
    )
  );

-- PERSONNES : visibles aux utilisateurs de la même école ou à la mairie
CREATE POLICY "personnes_select" ON personnes FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      -- L'utilisateur se voit lui-même
      auth_user_id = auth.uid()
      -- Même école
      OR EXISTS (
        SELECT 1 FROM personnes me
        WHERE me.auth_user_id = auth.uid() AND me.ecole_id = personnes.ecole_id
      )
      -- Ou il est agent mairie
      OR EXISTS (
        SELECT 1 FROM personnes me
        WHERE me.auth_user_id = auth.uid()
          AND me.role IN ('mairie_admin', 'elu')
      )
    )
  );

-- CONTACTS_MAIRIE : visibles à tous les authentifiés de la mairie correspondante
CREATE POLICY "contacts_mairie_select" ON contacts_mairie FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM personnes p
      LEFT JOIN ecoles e ON e.id = p.ecole_id
      WHERE p.auth_user_id = auth.uid()
        AND (
          e.collectivite_id = contacts_mairie.collectivite_id
          OR p.role IN ('mairie_admin', 'elu')
        )
    )
  );

-- ANCIENS_ADMINS : visibles aux représentants actifs de la même école
CREATE POLICY "anciens_admins_select" ON anciens_admins FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM personnes p
      WHERE p.auth_user_id = auth.uid()
        AND p.ecole_id = anciens_admins.ecole_id
        AND p.role IN ('parent_admin', 'parent_contributeur', 'mairie_admin', 'elu', 'direction')
    )
  );

-- -----------------------------------------------------------------------------
-- POLICIES INSERT / UPDATE / DELETE (squelette — à raffiner en Phase 2)
-- -----------------------------------------------------------------------------

-- Pour la Phase 1, on autorise les agents mairie et les utilisateurs créateurs
-- à insérer/modifier. À raffiner finement en Phase 2 selon les workflows.

CREATE POLICY "dossiers_insert" ON dossiers FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.current_user_role() IS NOT NULL
    AND public.user_can_see_scope(visibility_scope)
  );

CREATE POLICY "dossiers_update" ON dossiers FOR UPDATE
  USING (public.user_can_see_scope(visibility_scope));

CREATE POLICY "commentaires_insert" ON commentaires_dossier FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM dossiers d
      WHERE d.id = commentaires_dossier.dossier_id
        AND public.user_can_see_scope(d.visibility_scope)
    )
  );

CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.current_user_role() IN ('mairie_admin', 'elu')
    AND public.user_can_see_scope(visibility_scope)
  );

CREATE POLICY "rendez_vous_insert" ON rendez_vous FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND public.user_can_see_scope(visibility_scope)
  );

-- -----------------------------------------------------------------------------
-- Notes pour Phase 2
-- -----------------------------------------------------------------------------
-- - Les policies ci-dessus présupposent que la table `personnes` a une ligne
--   par utilisateur connecté avec `auth_user_id` rempli.
-- - Workflow d'invitation (Phase 2) :
--   1. Mairie crée une `personne` avec email mais sans auth_user_id
--   2. Email magic link envoyé via Supabase Auth (signInWithOtp)
--   3. À la première connexion, on lie auth.uid() à la ligne personnes via email match
-- - Pour tester ces policies en Phase 1 (sans auth) : utiliser la clé `service_role`
--   qui bypass RLS. Pour simuler un rôle en dev : `SET LOCAL ROLE` n'est pas adapté,
--   utiliser plutôt des tests de policies avec un JWT mocké.
