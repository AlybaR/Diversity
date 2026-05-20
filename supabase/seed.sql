-- =============================================================================
-- Seed dev — données fictives pour Passerelle
-- =============================================================================
-- Reproduit les données de mobile-app/data/mockData.ts pour que les tests
-- Playwright et le développement local fonctionnent contre un vrai Supabase.
--
-- À exécuter APRÈS les migrations 0001 et 0002.
--
-- Utilisation :
--   - En local avec Supabase CLI : `supabase db reset` (recharge migrations + seed)
--   - Sur projet hosté : copier-coller dans SQL Editor de Supabase
--
-- IDEMPOTENT : peut être rejoué sans erreur grâce au TRUNCATE initial.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Reset : vide toutes les tables (CASCADE propage aux tables dépendantes via FK)
-- Si tu rejoues ce seed une 2e fois, tout est nettoyé proprement.
-- -----------------------------------------------------------------------------
TRUNCATE TABLE
  mairies,
  ecoles,
  personnes,
  contacts_mairie,
  dossiers,
  historique_events,
  pieces_jointes,
  commentaires_dossier,
  rendez_vous,
  messages,
  anciens_admins
CASCADE;

-- -----------------------------------------------------------------------------
-- MAIRIE
-- -----------------------------------------------------------------------------
INSERT INTO mairies (id, nom) VALUES
  ('mairie-montreuil', 'Ville de Montreuil-sur-Seine');

-- -----------------------------------------------------------------------------
-- ÉCOLES
-- -----------------------------------------------------------------------------
INSERT INTO ecoles (id, nom, adresse, cle, direction_nom, collectivite_id, annee_scolaire) VALUES
  ('ecole-jaures',        'École élémentaire Jean Jaurès',    '12 rue Jean Jaurès, Montreuil-sur-Seine',    'JAURES-2026',  'Mme Girard',  'mairie-montreuil', '2026-2027'),
  ('ecole-louise-michel', 'École maternelle Louise Michel',   '5 place Louise Michel, Montreuil-sur-Seine', 'LOUISEM-2026', 'M. Bardot',   'mairie-montreuil', '2026-2027'),
  ('ecole-hugo',          'École primaire Victor Hugo',       '21 avenue Victor Hugo, Montreuil-sur-Seine', 'HUGO-2026',    'Mme Lemoine', 'mairie-montreuil', '2026-2027'),
  ('ecole-veil',          'École élémentaire Simone Veil',    '8 rue Simone Veil, Montreuil-sur-Seine',     'VEIL-2026',    'M. Renard',   'mairie-montreuil', '2026-2027');

-- -----------------------------------------------------------------------------
-- PERSONNES
-- -----------------------------------------------------------------------------
INSERT INTO personnes (id, prenom, nom, email, role, association, ecole_id, service, fonction, actif) VALUES
  ('personne-nadia',  'Nadia',  'Benali',  'nadia.benali@example.org',           'parent_admin',        'Parents Indépendants', 'ecole-jaures', NULL,        NULL,                          TRUE),
  ('personne-marc',   'Marc',   'Laurent', 'marc.laurent@example.org',           'parent_contributeur', 'FCPE',                 'ecole-jaures', NULL,        NULL,                          TRUE),
  ('personne-claire', 'Claire', 'Moreau',  'claire.moreau@montreuil-sur-seine.fr', 'mairie_admin',      NULL,                   NULL,           'Éducation', NULL,                          TRUE),
  ('personne-thomas', 'Thomas', 'Lefèvre', 't.lefevre@montreuil-sur-seine.fr',   'elu',                 NULL,                   NULL,           NULL,        'Adjoint à l''éducation',      TRUE),
  ('personne-girard', 'Mme',    'Girard',  'direction.jaures@ac-versailles.fr',  'direction',           NULL,                   'ecole-jaures', NULL,        'Directrice',                  TRUE);

-- -----------------------------------------------------------------------------
-- CONTACTS_MAIRIE
-- -----------------------------------------------------------------------------
INSERT INTO contacts_mairie (id, collectivite_id, nom, fonction, service, email, telephone, perimetre, categories_liees) VALUES
  ('contact-education',    'mairie-montreuil', 'Claire Moreau',   'Référente écoles élémentaires',    'Service Éducation',         'claire.moreau@montreuil-sur-seine.fr', '01 42 00 10 23', 'Coordination mairie-écoles, dossiers transverses et rendez-vous',          ARRAY['communication','rendez_vous','carte_scolaire']::categorie[]),
  ('contact-voirie',       'mairie-montreuil', 'Samir Aït',       'Chargé des abords scolaires',      'Service Voirie',            'samir.ait@montreuil-sur-seine.fr',     '01 42 00 11 08', 'Sécurité piétonne, circulation, signalisation et cheminements',           ARRAY['securite','voirie','accessibilite']::categorie[]),
  ('contact-batiment',     'mairie-montreuil', 'Hélène Petit',    'Responsable maintenance écoles',   'Service Bâtiment',          'helene.petit@montreuil-sur-seine.fr',  '01 42 00 12 41', 'Bâtiments scolaires, sanitaires, travaux et interventions techniques',    ARRAY['batiment','travaux','sanitaires']::categorie[]),
  ('contact-restauration', 'mairie-montreuil', 'Nora Vidal',      'Coordinatrice pause méridienne',   'Restauration et périscolaire', 'nora.vidal@montreuil-sur-seine.fr', '01 42 00 13 15', 'Cantine, accueils périscolaires et organisation du temps du midi',         ARRAY['restauration','periscolaire']::categorie[]),
  ('contact-cabinet',      'mairie-montreuil', 'Thomas Lefèvre',  'Adjoint à l''éducation',           'Cabinet de l''élu',         't.lefevre@montreuil-sur-seine.fr',     NULL,             'Arbitrages politiques, sectorisation et sujets nécessitant une décision élue', ARRAY['carte_scolaire','autre']::categorie[]);

-- -----------------------------------------------------------------------------
-- ANCIENS_ADMINS
-- -----------------------------------------------------------------------------
INSERT INTO anciens_admins (id, ecole_id, nom, fonction, association, annees, note) VALUES
  ('ancien-marie-dupont', 'ecole-jaures', 'Marie Dupont', 'Ancienne présidente',  'FCPE',                 '2024-2026', 'Passation utile sur les dossiers sécurité aux abords.'),
  ('ancien-karim-saidi',  'ecole-jaures', 'Karim Saïdi',  'Ancien administrateur', 'Parents Indépendants', '2023-2024', 'Ancien référent restauration, accès révoqué.');

-- -----------------------------------------------------------------------------
-- DOSSIERS (4 principaux + 1 créé par direction)
-- -----------------------------------------------------------------------------
INSERT INTO dossiers (id, titre, categorie, statut, urgence, description, ecole_id, createur_id, interlocuteur_cible, derniere_maj, nb_pieces_jointes, nb_commentaires, visibility_scope) VALUES
  ('dossier-passage-pieton',   'Passage piéton dangereux devant l''école',                'securite',       'transmis_mairie',  'elevee',  'Plusieurs familles signalent une difficulté récurrente à traverser devant l''école aux horaires d''entrée et de sortie. Le marquage au sol est effacé et il n''y a plus de signalisation lumineuse.', 'ecole-jaures', 'personne-nadia',  'Service Voirie',           '17 mai 2026', 2, 5, 'partage_tripartite'),
  ('dossier-sanitaires',       'Sanitaires du premier étage régulièrement fermés',         'sanitaires',     'en_cours_analyse', 'moyenne', 'Les représentants souhaitent comprendre pourquoi les sanitaires du premier étage sont régulièrement fermés et identifier les solutions possibles pour rétablir un accès permanent.',           'ecole-jaures', 'personne-marc',   'Service Bâtiment',         '14 mai 2026', 1, 3, 'parents_mairie'),
  ('dossier-sectorisation',    'Besoin de clarification sur la sectorisation 2026',        'carte_scolaire', 'resolu',           'faible',  'Plusieurs familles demandent des précisions sur les changements possibles de sectorisation pour la rentrée 2026 et leur impact sur le quartier.',                                            'ecole-jaures', 'personne-nadia',  'Cabinet adjoint éducation', '11 mai 2026', 0, 8, 'parents_mairie'),
  ('dossier-rdv-conseil',      'Demande de rendez-vous avant le prochain conseil d''école', 'rendez_vous',   'rdv_propose',      'moyenne', 'Les parents élus souhaitent préparer les sujets prioritaires avant le prochain conseil d''école avec la direction et le service éducation.',                                                'ecole-jaures', 'personne-nadia',  'Service Éducation',        '16 mai 2026', 0, 2, 'partage_tripartite'),
  ('dossier-batiment-salle12', 'Intervention bâtiment urgente — salle 12',                  'batiment',      'transmis_mairie',  'moyenne', 'La direction signale une infiltration au plafond de la salle 12 après les pluies du week-end. Demande d''intervention du service Bâtiment pour expertise et sécurisation avant la reprise de la semaine.', 'ecole-jaures', 'personne-girard', 'Service Bâtiment',         '18 mai 2026', 1, 1, 'partage_tripartite');

-- Dossiers illustrant les canaux privés (test visibilité) — séparés dans le mock
-- pour rappeler qu'ils sont confidentiels.
INSERT INTO dossiers (id, titre, categorie, statut, urgence, description, ecole_id, createur_id, interlocuteur_cible, derniere_maj, nb_pieces_jointes, nb_commentaires, visibility_scope) VALUES
  ('dossier-communication-direction', 'Difficulté de communication avec la direction',           'communication',  'transmis_mairie',  'moyenne', 'Plusieurs familles signalent des difficultés à obtenir un rendez-vous avec la direction et un manque de retour sur leurs sollicitations. Nous souhaitons en parler avec la mairie pour identifier les leviers de médiation possibles avant tout échange tripartite.', 'ecole-jaures', 'personne-nadia',  'Service Éducation',                    '15 mai 2026', 0, 2, 'parents_mairie'),
  ('dossier-tensions-representants',  'Tensions récurrentes avec certains représentants',          'communication',  'transmis_mairie',  'moyenne', 'La direction sollicite la mairie sur des échanges difficiles avec deux représentants de parents qui contournent les canaux institutionnels et publient des informations partielles. Nous souhaitons un point de cadrage avant de répondre publiquement.', 'ecole-jaures', 'personne-girard', 'Cabinet de l''adjoint à l''éducation', '17 mai 2026', 0, 1, 'direction_mairie'),
  ('dossier-note-budget',             'Arbitrage budgétaire — écoles élémentaires 2026-2027',      'autre',          'en_cours_analyse', 'faible',  'Note interne au service éducation pour préparer l''arbitrage du budget travaux des écoles élémentaires. Synthèse des demandes terrain et propositions de priorisation avant présentation à l''adjoint.', 'ecole-jaures', 'personne-claire', 'Cabinet de l''adjoint à l''éducation', '12 mai 2026', 0, 0, 'mairie_interne');

-- -----------------------------------------------------------------------------
-- HISTORIQUE_EVENTS (sélection minimale pour démonstration)
-- -----------------------------------------------------------------------------
INSERT INTO historique_events (id, dossier_id, date, type, acteur_nom, description) VALUES
  ('hist-pp-1', 'dossier-passage-pieton', '10 mai 2026', 'creation',  'Nadia Benali',       'Dossier créé'),
  ('hist-pp-2', 'dossier-passage-pieton', '12 mai 2026', 'envoi',     'Nadia Benali',       'Partagé aux représentants'),
  ('hist-pp-3', 'dossier-passage-pieton', '15 mai 2026', 'envoi',     'Nadia Benali',       'Transmis à la mairie'),
  ('hist-pp-4', 'dossier-passage-pieton', '17 mai 2026', 'reception', 'Service Éducation',  'Reçu — analyse en cours'),
  ('hist-cd-1', 'dossier-communication-direction', '13 mai 2026', 'creation', 'Nadia Benali',  'Dossier créé — canal privé parents/mairie'),
  ('hist-cd-2', 'dossier-communication-direction', '14 mai 2026', 'envoi',    'Nadia Benali',  'Transmis à la mairie'),
  ('hist-cd-3', 'dossier-communication-direction', '15 mai 2026', 'reception','Claire Moreau', 'Reçu — analyse en cours, médiation envisagée'),
  ('hist-tr-1', 'dossier-tensions-representants', '16 mai 2026', 'creation',  'Mme Girard',     'Dossier créé — canal privé direction/mairie'),
  ('hist-tr-2', 'dossier-tensions-representants', '16 mai 2026', 'envoi',     'Mme Girard',     'Transmis à la mairie'),
  ('hist-tr-3', 'dossier-tensions-representants', '17 mai 2026', 'reception', 'Thomas Lefèvre', 'Reçu — arbitrage à programmer');

-- -----------------------------------------------------------------------------
-- PIECES_JOINTES (sélection)
-- -----------------------------------------------------------------------------
INSERT INTO pieces_jointes (id, dossier_id, nom, type, taille, ajoute_par, date) VALUES
  ('piece-passage-photo-1',     'dossier-passage-pieton', 'passage-pieton-efface.jpg',     'image', '1,8 Mo', 'Nadia Benali', '10 mai 2026'),
  ('piece-passage-pdf-1',       'dossier-passage-pieton', 'signalements-familles.pdf',     'pdf',   '642 Ko', 'Nadia Benali', '12 mai 2026'),
  ('piece-sanitaires-photo-1',  'dossier-sanitaires',     'affichage-fermeture-sanitaire.png', 'image', '920 Ko', 'Marc Laurent', '6 mai 2026');

-- -----------------------------------------------------------------------------
-- COMMENTAIRES_DOSSIER (sélection)
-- -----------------------------------------------------------------------------
INSERT INTO commentaires_dossier (id, dossier_id, auteur_nom, role_label, date, contenu, important) VALUES
  ('comment-passage-1', 'dossier-passage-pieton', 'Marc Laurent',          'Parent élu',          '12 mai 2026', 'Même constat côté maternelle : les familles traversent souvent entre deux voitures aux heures d''entrée.',                                  TRUE),
  ('comment-passage-2', 'dossier-passage-pieton', 'Mme Girard',            'Direction école',     '13 mai 2026', 'La direction confirme avoir reçu trois signalements en une semaine. Un rappel de vigilance a été fait aux familles.',                       FALSE),
  ('comment-passage-3', 'dossier-passage-pieton', 'Claire Moreau',         'Service éducation',   '17 mai 2026', 'Le dossier est transmis au service Voirie pour vérification du marquage et chiffrage de la signalisation.',                                  FALSE),
  ('comment-sanitaires-1', 'dossier-sanitaires',  'Marc Laurent',          'Parent élu',          '8 mai 2026',  'Les fermetures semblent concentrées après la pause méridienne. Nous ajoutons la photo de l''affichage.',                                    FALSE),
  ('comment-sectorisation-1', 'dossier-sectorisation', 'Cabinet de l''adjoint', 'Mairie',          '2 mai 2026',  'Une réunion publique sera organisée avant toute modification de périmètre. Le calendrier sera partagé fin mai.',                            FALSE),
  ('comment-rdv-1', 'dossier-rdv-conseil',  'Claire Moreau',           'Service éducation',  '16 mai 2026', 'Deux créneaux sont proposés pour préparer le conseil avec les représentants volontaires.',                                                       FALSE);

-- -----------------------------------------------------------------------------
-- RENDEZ_VOUS
-- -----------------------------------------------------------------------------
INSERT INTO rendez_vous (id, titre, date, heure, lieu, participants_noms, dossier_lie_id, dossier_lie_titre, statut, pieces_jointes, visibility_scope) VALUES
  ('rdv-securite', 'Point sécurité abords école',       '23 mai 2026', '18h00', 'Mairie',              ARRAY['Nadia Benali','Claire Moreau','Mme Girard'], 'dossier-passage-pieton', 'Passage piéton dangereux devant l''école',                  'confirme',
    '[{"id":"rdv-securite-ordre-du-jour","nom":"ordre-du-jour-securite.pdf","type":"pdf","taille":"184 Ko"}]'::jsonb,
    'partage_tripartite'),
  ('rdv-conseil',  'Préparation conseil d''école',      '29 mai 2026', '17h30', 'École Jean Jaurès',   ARRAY['Nadia Benali','Marc Laurent'],               'dossier-rdv-conseil',    'Demande de rendez-vous avant le prochain conseil d''école', 'demande',  '[]'::jsonb, 'parents_mairie'),
  ('rdv-tensions', 'Point de cadrage avec direction',   '26 mai 2026', '14h00', 'Bureau de l''adjoint', ARRAY['Mme Girard','Thomas Lefèvre'],              'dossier-tensions-representants', 'Tensions récurrentes avec certains représentants', 'confirme', '[]'::jsonb, 'direction_mairie');

-- -----------------------------------------------------------------------------
-- MESSAGES
-- -----------------------------------------------------------------------------
INSERT INTO messages (id, collectivite_id, ecole_id, titre, expediteur, date, priorite, contenu, lu, pieces_jointes, visibility_scope) VALUES
  ('message-travaux',      'mairie-montreuil', 'ecole-jaures', 'Travaux prévus rue de l''École',         'Service éducation',                   '18 mai 2026', 'importante', 'Des travaux de voirie sont prévus à proximité de l''école Jean Jaurès entre le 1er et le 15 juin. Une information complémentaire sera transmise aux représentants dans les prochains jours afin de coordonner la sécurité aux abords pendant la durée du chantier.', FALSE,
    '[{"id":"message-travaux-plan","nom":"plan-emprise-travaux.pdf","type":"pdf","taille":"318 Ko"}]'::jsonb,
    'partage_tripartite'),
  ('message-sectorisation', 'mairie-montreuil', NULL,           'Réunion d''information sectorisation 2026', 'Cabinet de l''adjoint à l''éducation', '15 mai 2026', 'normale',    'Une réunion d''information sera organisée pour présenter les évolutions envisagées de la carte scolaire pour la rentrée 2026. Les représentants sont invités à y participer pour porter la voix des familles.', TRUE,  '[]'::jsonb, 'parents_mairie'),
  ('message-vigipirate',   'mairie-montreuil', 'ecole-jaures', 'Consignes Vigipirate rentrée 2026-2027',  'Cabinet de l''adjoint à l''éducation', '16 mai 2026', 'importante', 'Vous trouverez ci-joint la note de consignes Vigipirate à appliquer dès la rentrée 2026-2027 : contrôle des accès, accueil des familles, exercices PPMS et personnes-ressources mairie. Merci de relayer auprès de l''équipe enseignante et de confirmer la prise en compte avant le 15 juin.', FALSE,
    '[{"id":"message-vigipirate-note","nom":"consignes-vigipirate-2026-2027.pdf","type":"pdf","taille":"412 Ko"}]'::jsonb,
    'direction_mairie');

-- =============================================================================
-- Fin du seed
-- Pour rappeler le contenu : 1 mairie, 4 écoles, 5 personnes, 5 contacts mairie,
-- 8 dossiers (couvrant tous les scopes), 3 RDV, 3 messages, 2 anciens admins,
-- + historique events, pièces jointes et commentaires sélectionnés.
-- =============================================================================
