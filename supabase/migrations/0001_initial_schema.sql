-- =============================================================================
-- Migration 0001 — Schema initial Passerelle
-- =============================================================================
-- Réplique fidèlement les types TypeScript de mobile-app/types/index.ts.
--
-- Conventions :
--   - snake_case pour colonnes (convention PostgreSQL)
--   - TEXT pour les IDs (compatible avec les IDs lisibles du seed dev)
--   - Enums PostgreSQL pour les valeurs fermées (rôle, statut, scope, etc.)
--   - TIMESTAMPTZ pour les dates précises ; TEXT pour les dates "humaines" du modèle
--     (cf. dossier.derniere_maj = "17 mai 2026")
--
-- Politiques RLS : voir migration 0002.
-- Seed dev : voir supabase/seed.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMS — réplique exacte des union types TS
-- -----------------------------------------------------------------------------

CREATE TYPE urgence AS ENUM ('faible', 'moyenne', 'elevee');

CREATE TYPE statut_dossier AS ENUM (
  'brouillon',
  'partage_representants',
  'transmis_mairie',
  'recu',
  'en_cours_analyse',
  'en_attente_information',
  'rdv_propose',
  'action_programmee',
  'resolu',
  'classe_sans_suite',
  'hors_competence'
);

CREATE TYPE categorie AS ENUM (
  'securite',
  'voirie',
  'batiment',
  'travaux',
  'sanitaires',
  'restauration',
  'periscolaire',
  'carte_scolaire',
  'communication',
  'accessibilite',
  'rendez_vous',
  'autre'
);

CREATE TYPE role_utilisateur AS ENUM (
  'parent_admin',
  'parent_contributeur',
  'mairie_admin',
  'elu',
  'direction'
);

CREATE TYPE statut_rdv AS ENUM (
  'demande',
  'creneaux_proposes',
  'confirme',
  'passe',
  'annule'
);

CREATE TYPE priorite_message AS ENUM ('normale', 'importante', 'urgente');

CREATE TYPE visibility_scope AS ENUM (
  'parents_mairie',
  'direction_mairie',
  'partage_tripartite',
  'mairie_interne'
);

CREATE TYPE type_historique AS ENUM (
  'creation',
  'envoi',
  'reception',
  'analyse',
  'rdv',
  'action',
  'resolution',
  'partage'
);

CREATE TYPE type_piece_jointe AS ENUM ('image', 'pdf', 'document');

-- -----------------------------------------------------------------------------
-- MAIRIES (collectivités)
-- -----------------------------------------------------------------------------

CREATE TABLE mairies (
  id   TEXT PRIMARY KEY,
  nom  TEXT NOT NULL,
  cree_le      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ECOLES
-- -----------------------------------------------------------------------------

CREATE TABLE ecoles (
  id                TEXT PRIMARY KEY,
  nom               TEXT NOT NULL,
  adresse           TEXT NOT NULL,
  cle               TEXT NOT NULL UNIQUE,         -- clé d'invitation parents (ex: JAURES-2026)
  direction_nom     TEXT NOT NULL,                -- nom affiché de la direction (ex: "Mme Girard")
  collectivite_id   TEXT NOT NULL REFERENCES mairies(id) ON DELETE RESTRICT,
  annee_scolaire    TEXT NOT NULL,
  cree_le           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ecoles_collectivite_idx ON ecoles(collectivite_id);

-- -----------------------------------------------------------------------------
-- PERSONNES (parents élus, agents mairie, élus, directions)
-- -----------------------------------------------------------------------------

CREATE TABLE personnes (
  id            TEXT PRIMARY KEY,
  prenom        TEXT NOT NULL,
  nom           TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  telephone     TEXT,
  role          role_utilisateur NOT NULL,
  association   TEXT,                              -- ex: 'FCPE', 'PEEP', 'APEL'
  ecole_id      TEXT REFERENCES ecoles(id) ON DELETE SET NULL,
  service       TEXT,                              -- ex: 'Éducation' (côté mairie)
  fonction      TEXT,                              -- ex: 'Directrice', 'Adjoint éducation'
  actif         BOOLEAN NOT NULL DEFAULT TRUE,
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX personnes_ecole_idx ON personnes(ecole_id);
CREATE INDEX personnes_role_idx  ON personnes(role);

-- -----------------------------------------------------------------------------
-- CONTACTS_MAIRIE (annuaire des référents par service)
-- -----------------------------------------------------------------------------

CREATE TABLE contacts_mairie (
  id                TEXT PRIMARY KEY,
  collectivite_id   TEXT NOT NULL REFERENCES mairies(id) ON DELETE CASCADE,
  nom               TEXT NOT NULL,
  fonction          TEXT NOT NULL,
  service           TEXT NOT NULL,
  email             TEXT NOT NULL,
  telephone         TEXT,
  perimetre         TEXT NOT NULL,
  categories_liees  categorie[] NOT NULL DEFAULT '{}',
  cree_le           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX contacts_mairie_collectivite_idx ON contacts_mairie(collectivite_id);

-- -----------------------------------------------------------------------------
-- DOSSIERS — la pièce maîtresse, avec scope de visibilité
-- -----------------------------------------------------------------------------

CREATE TABLE dossiers (
  id                    TEXT PRIMARY KEY,
  titre                 TEXT NOT NULL,
  categorie             categorie NOT NULL,
  statut                statut_dossier NOT NULL,
  urgence               urgence NOT NULL,
  description           TEXT NOT NULL,
  ecole_id              TEXT NOT NULL REFERENCES ecoles(id) ON DELETE RESTRICT,
  createur_id           TEXT NOT NULL REFERENCES personnes(id) ON DELETE RESTRICT,
  interlocuteur_cible   TEXT,
  derniere_maj          TEXT NOT NULL,             -- date "humaine" affichée (ex: "17 mai 2026")
  nb_pieces_jointes     INTEGER NOT NULL DEFAULT 0,
  nb_commentaires       INTEGER NOT NULL DEFAULT 0,
  visibility_scope      visibility_scope NOT NULL,
  cree_le               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX dossiers_ecole_idx       ON dossiers(ecole_id);
CREATE INDEX dossiers_createur_idx    ON dossiers(createur_id);
CREATE INDEX dossiers_scope_idx       ON dossiers(visibility_scope);
CREATE INDEX dossiers_statut_idx      ON dossiers(statut);
CREATE INDEX dossiers_urgence_idx     ON dossiers(urgence);

-- -----------------------------------------------------------------------------
-- HISTORIQUE_EVENTS (1-n sur dossier)
-- -----------------------------------------------------------------------------

CREATE TABLE historique_events (
  id            TEXT PRIMARY KEY,
  dossier_id    TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  date          TEXT NOT NULL,                     -- date "humaine"
  type          type_historique NOT NULL,
  acteur_nom    TEXT NOT NULL,
  description   TEXT NOT NULL,
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX historique_dossier_idx ON historique_events(dossier_id);

-- -----------------------------------------------------------------------------
-- PIECES_JOINTES (du dossier — liées dossier_id)
-- -----------------------------------------------------------------------------

CREATE TABLE pieces_jointes (
  id                TEXT PRIMARY KEY,
  dossier_id        TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  nom               TEXT NOT NULL,
  type              type_piece_jointe NOT NULL,
  taille            TEXT NOT NULL,                 -- taille "humaine" (ex: "1,8 Mo")
  ajoute_par        TEXT NOT NULL,
  date              TEXT NOT NULL,                 -- date "humaine"
  visibility_scope  visibility_scope,              -- optionnel : hérite du dossier si NULL
  storage_path      TEXT,                          -- futur : chemin Supabase Storage
  cree_le           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX pieces_jointes_dossier_idx ON pieces_jointes(dossier_id);

-- -----------------------------------------------------------------------------
-- COMMENTAIRES_DOSSIER
-- -----------------------------------------------------------------------------

CREATE TABLE commentaires_dossier (
  id                TEXT PRIMARY KEY,
  dossier_id        TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  auteur_nom        TEXT NOT NULL,
  role_label        TEXT NOT NULL,                 -- libellé du rôle au moment du commentaire
  date              TEXT NOT NULL,                 -- date "humaine"
  contenu           TEXT NOT NULL,
  important         BOOLEAN NOT NULL DEFAULT FALSE,
  visibility_scope  visibility_scope,              -- optionnel : hérite du dossier si NULL
  cree_le           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX commentaires_dossier_idx ON commentaires_dossier(dossier_id);

-- -----------------------------------------------------------------------------
-- RENDEZ_VOUS (avec scope et pièces jointes en JSONB)
-- -----------------------------------------------------------------------------

CREATE TABLE rendez_vous (
  id                  TEXT PRIMARY KEY,
  titre               TEXT NOT NULL,
  date                TEXT NOT NULL,               -- date "humaine"
  heure               TEXT NOT NULL,
  lieu                TEXT NOT NULL,
  participants_noms   TEXT[] NOT NULL DEFAULT '{}',
  dossier_lie_id      TEXT REFERENCES dossiers(id) ON DELETE SET NULL,
  dossier_lie_titre   TEXT,
  statut              statut_rdv NOT NULL,
  pieces_jointes      JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibility_scope    visibility_scope NOT NULL,
  cree_le             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_le          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX rendez_vous_scope_idx       ON rendez_vous(visibility_scope);
CREATE INDEX rendez_vous_dossier_lie_idx ON rendez_vous(dossier_lie_id);

-- -----------------------------------------------------------------------------
-- MESSAGES (diffusions mairie avec scope)
-- -----------------------------------------------------------------------------

CREATE TABLE messages (
  id                TEXT PRIMARY KEY,
  collectivite_id   TEXT NOT NULL REFERENCES mairies(id) ON DELETE CASCADE,
  ecole_id          TEXT REFERENCES ecoles(id) ON DELETE SET NULL,   -- NULL si multi-écoles
  titre             TEXT NOT NULL,
  expediteur        TEXT NOT NULL,
  date              TEXT NOT NULL,
  priorite          priorite_message NOT NULL,
  contenu           TEXT NOT NULL,
  lu                BOOLEAN NOT NULL DEFAULT FALSE,
  pieces_jointes    JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibility_scope  visibility_scope NOT NULL,
  cree_le           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_collectivite_idx ON messages(collectivite_id);
CREATE INDEX messages_ecole_idx        ON messages(ecole_id);
CREATE INDEX messages_scope_idx        ON messages(visibility_scope);

-- -----------------------------------------------------------------------------
-- ANCIENS_ADMINS (passation parents élus)
-- -----------------------------------------------------------------------------

CREATE TABLE anciens_admins (
  id            TEXT PRIMARY KEY,
  ecole_id      TEXT NOT NULL REFERENCES ecoles(id) ON DELETE CASCADE,
  nom           TEXT NOT NULL,
  fonction      TEXT NOT NULL,                     -- contraint applicativement (4 valeurs)
  association   TEXT,
  annees        TEXT NOT NULL,
  note          TEXT,
  cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX anciens_admins_ecole_idx ON anciens_admins(ecole_id);

-- -----------------------------------------------------------------------------
-- TRIGGER modifie_le auto-update (utilitaire commun)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_modifie_le()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modifie_le = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mairies_modifie_le      BEFORE UPDATE ON mairies      FOR EACH ROW EXECUTE FUNCTION set_modifie_le();
CREATE TRIGGER ecoles_modifie_le       BEFORE UPDATE ON ecoles       FOR EACH ROW EXECUTE FUNCTION set_modifie_le();
CREATE TRIGGER personnes_modifie_le    BEFORE UPDATE ON personnes    FOR EACH ROW EXECUTE FUNCTION set_modifie_le();
CREATE TRIGGER contacts_modifie_le     BEFORE UPDATE ON contacts_mairie FOR EACH ROW EXECUTE FUNCTION set_modifie_le();
CREATE TRIGGER dossiers_modifie_le     BEFORE UPDATE ON dossiers     FOR EACH ROW EXECUTE FUNCTION set_modifie_le();
CREATE TRIGGER rendez_vous_modifie_le  BEFORE UPDATE ON rendez_vous  FOR EACH ROW EXECUTE FUNCTION set_modifie_le();

-- Note : pieces_jointes, commentaires_dossier, historique_events, anciens_admins, messages
-- n'ont pas de trigger update car par convention ces objets sont immuables une fois créés
-- (audit trail).
