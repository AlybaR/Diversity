/**
 * Service Supabase — Dossiers
 *
 * Implémentation réelle (vs mockAsync) qui interroge la table `dossiers`
 * via le client Supabase. Le filtrage par scope est en grande partie
 * délégué aux politiques RLS PostgreSQL (cf. supabase/migrations/0002).
 *
 * ⚠️ Ces fonctions ne sont actives que si EXPO_PUBLIC_USE_SUPABASE === 'true'
 * ET que l'utilisateur est authentifié (Phase 2). Sinon, la couche
 * services/dossiers.ts continue de servir mockData.
 */

import type { Dossier } from '../../types';
import { supabase } from '../../lib/supabase';
import type { DossierFilter } from '../dossiers';
import { mapDossier } from './_mappers';

const OPEN_STATUTS = [
  'transmis_mairie',
  'recu',
  'en_cours_analyse',
  'en_attente_information',
  'rdv_propose',
  'action_programmee',
];

export async function listDossiersFromSupabase(filter: DossierFilter = {}): Promise<Dossier[]> {
  // L'historique est récupéré en relation pour reconstruire la structure TS.
  let query = supabase
    .from('dossiers')
    .select('*, historique:historique_events(*)')
    .order('cree_le', { ascending: false });

  if (filter.ecoleId) {
    query = query.eq('ecole_id', filter.ecoleId);
  }
  if (filter.statut) {
    query = query.eq('statut', filter.statut);
  }
  if (filter.ouvert) {
    query = query.in('statut', OPEN_STATUTS);
  }
  if (filter.urgent) {
    query = query.eq('urgence', 'elevee').neq('statut', 'resolu');
  }
  if (filter.scope) {
    query = query.eq('visibility_scope', filter.scope);
  }
  // Le filtre `visibleByRole` est INUTILE ici : la RLS PostgreSQL filtre
  // automatiquement les lignes selon le rôle de auth.uid(). Si on essaie de
  // récupérer un dossier non autorisé, PostgreSQL renvoie 0 lignes.

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapDossier);
}

export async function getDossierByIdFromSupabase(id: string): Promise<Dossier | null> {
  const { data, error } = await supabase
    .from('dossiers')
    .select('*, historique:historique_events(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    // PostgREST renvoie une erreur si plusieurs lignes ; avec .maybeSingle()
    // on accepte 0 ou 1. Sinon on propage.
    throw error;
  }
  return data ? mapDossier(data) : null;
}
