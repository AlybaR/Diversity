/**
 * Écran callback magic link.
 *
 * Quand Supabase Auth a posé la session (via le hash #access_token=… détecté
 * automatiquement par detectSessionInUrl), ce composant :
 *   1. Attend que la session soit chargée
 *   2. Cherche la personne par email
 *   3. Si trouvée : lie auth_user_id si pas déjà fait, redirige vers la zone du rôle
 *   4. Si pas trouvée : redirige vers /auth/no-access
 */

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { supabase } from '../../lib/supabase';
import {
  findPersonneByAuthUserId,
  findPersonneByEmail,
  linkAuthToPersonne,
} from '../../services/supabase/authLink';
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

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<string>('Vérification de la connexion…');
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    (async () => {
      // 1. Récupère la session (Supabase a déjà parsé le hash de l'URL)
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        // Le hash n'a pas été détecté ou la session a expiré → retour Welcome
        setStatus('Session introuvable — redirection');
        setTimeout(() => router.replace('/'), 800);
        return;
      }

      const authUserId = session.user.id;
      const email = session.user.email;

      // 2. Essayer de récupérer la personne déjà liée
      setStatus('Récupération de ton profil…');
      let personne = await findPersonneByAuthUserId(authUserId);

      // 3. Si pas encore liée, on cherche par email et on relie
      if (!personne && email) {
        const personneByEmail = await findPersonneByEmail(email);
        if (personneByEmail) {
          setStatus('Première connexion — liaison du compte…');
          try {
            await linkAuthToPersonne(personneByEmail.id, authUserId);
            personne = personneByEmail;
          } catch (_err) {
            // La liaison a échoué (peut-être déjà liée à un autre compte) → no-access
            personne = null;
          }
        }
      }

      // 4. Si toujours pas de personne → accès refusé
      if (!personne) {
        router.replace('/auth/no-access' as Href);
        return;
      }

      // 5. Redirection selon le rôle
      router.replace(redirectFromRole(personne.role));
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-8">
      <ActivityIndicator color="#2563eb" size="large" />
      <Text className="text-slate-600 text-sm mt-4 text-center">{status}</Text>
    </View>
  );
}
