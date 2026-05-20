/**
 * Écran callback magic link.
 *
 * Étapes :
 *   1. Récupère la session (Supabase a parsé le hash #access_token automatiquement)
 *   2. Appelle la RPC `link_current_user_to_personne()` :
 *      - retourne la personne déjà liée si auth_user_id rempli
 *      - sinon match par email + UPDATE auth_user_id (en bypassant RLS via SECURITY DEFINER)
 *   3. Redirige vers la zone du rôle, ou vers /auth/no-access avec un détail si KO
 *
 * Le détail d'erreur est passé en query param vers /auth/no-access pour que le
 * mode __DEV__ puisse l'afficher : ça évite les diagnostics aveugles à l'avenir.
 */

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { supabase } from '../../lib/supabase';
import type { Role } from '../../types';

function redirectFromRole(role: Role): Href {
  switch (role) {
    case 'parent_admin':
    case 'parent_contributeur':
      return '/parent/home' as Href;
    case 'direction':
      return '/direction/home' as Href;
    case 'mairie_admin':
    case 'elu':
      return '/mairie/dashboard' as Href;
  }
}

interface LinkResult {
  personne_id: string;
  personne_role: Role;
}

function gotoNoAccess(reason: string, detail?: string) {
  router.replace({
    pathname: '/auth/no-access',
    params: detail ? { reason, detail } : { reason },
  } as Href);
}

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<string>('Vérification de la connexion…');
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    (async () => {
      // 1. Récupère la session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[auth/callback] session', {
          user_id: session?.user.id,
          email: session?.user.email,
          error: sessionError?.message,
        });
      }

      if (!session) {
        gotoNoAccess('no-session', sessionError?.message);
        return;
      }

      // 2. Appel RPC qui fait la liaison côté base (bypass RLS)
      setStatus('Liaison du compte…');
      const { data, error } = await supabase.rpc('link_current_user_to_personne');

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[auth/callback] rpc result', { data, error: error?.message });
      }

      if (error) {
        gotoNoAccess('rpc-error', error.message);
        return;
      }

      // La RPC retourne un set of rows. Selon Supabase JS le typage peut varier.
      const rows = (Array.isArray(data) ? data : data ? [data] : []) as LinkResult[];
      const linked = rows.length > 0 ? rows[0] : null;

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[auth/callback] linked', linked);
      }

      if (!linked) {
        gotoNoAccess('email-not-found', `Aucune personne ne correspond à ${session.user.email}`);
        return;
      }

      // 3. Redirection selon le rôle
      router.replace(redirectFromRole(linked.personne_role));
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-8">
      <ActivityIndicator color="#2563eb" size="large" />
      <Text className="text-slate-600 text-sm mt-4 text-center">{status}</Text>
    </View>
  );
}
