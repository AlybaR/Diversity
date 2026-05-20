/**
 * Service auth-link — pont entre Supabase Auth (auth.users) et notre table `personnes`.
 *
 * À la première connexion magic link, on cherche la personne par email et on lie
 * `auth_user_id`. À toutes les connexions suivantes, la personne est retrouvée via
 * `auth_user_id` (champ utilisé partout dans les policies RLS).
 */

import type { Personne } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapPersonne } from './_mappers';

/**
 * Cherche une personne par email exact.
 * Retourne null si aucune personne ne matche.
 *
 * IMPORTANT : cette requête contourne RLS via la clé anon car la policy SELECT
 * sur `personnes` exige `auth.uid()` non NULL. À l'étape callback, on appelle
 * cette fonction APRÈS que `supabase.auth.getSession()` ait posé le JWT, donc
 * `auth.uid()` est défini. La policy autorise alors de lire sa propre ligne.
 */
export async function findPersonneByEmail(email: string): Promise<Personne | null> {
  const { data, error } = await supabase
    .from('personnes')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (error) {
    if (__DEV__) console.warn('[auth-link] findPersonneByEmail error', error.message);
    return null;
  }
  return data ? mapPersonne(data) : null;
}

/**
 * Cherche une personne par auth_user_id (équivalent JWT subject).
 * C'est le chemin "rapide" pour les sessions suivantes.
 */
export async function findPersonneByAuthUserId(authUserId: string): Promise<Personne | null> {
  const { data, error } = await supabase
    .from('personnes')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    if (__DEV__) console.warn('[auth-link] findPersonneByAuthUserId error', error.message);
    return null;
  }
  return data ? mapPersonne(data) : null;
}

/**
 * Lie une personne à un compte auth.users. À appeler une seule fois, à la
 * première connexion. Idempotent : si `auth_user_id` est déjà rempli, ne fait rien.
 */
export async function linkAuthToPersonne(personneId: string, authUserId: string): Promise<void> {
  const { error } = await supabase
    .from('personnes')
    .update({ auth_user_id: authUserId })
    .eq('id', personneId)
    .is('auth_user_id', null);

  if (error) {
    if (__DEV__) console.warn('[auth-link] linkAuthToPersonne error', error.message);
    throw error;
  }
}
