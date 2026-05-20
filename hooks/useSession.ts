/**
 * Hook central de session — source unique pour savoir qui est connecté.
 *
 * Combine :
 *   - la session Supabase Auth (JWT, expire, etc.)
 *   - la ligne `personnes` correspondante (rôle, école, fonction, etc.)
 *
 * Réagit à `onAuthStateChange` : si l'utilisateur se déconnecte ou si son
 * JWT expire, le hook recharge automatiquement.
 *
 * Utilisé par :
 *   - Les guards de layout (`app/parent/_layout.tsx`, etc.)
 *   - L'écran callback (`app/auth/callback.tsx`)
 *   - Le bouton "Se déconnecter" du profil
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { clearUser, setUser } from '../lib/sentry';
import { findPersonneByAuthUserId } from '../services/supabase/authLink';
import type { Personne, Role } from '../types';

interface UseSessionResult {
  session: Session | null;
  user: User | null;
  personne: Personne | null;
  role: Role | null;
  /** true tant qu'on charge la session OU la personne associée */
  loading: boolean;
  /** true si l'utilisateur est connecté ET a une ligne `personnes` valide */
  isAuthorized: boolean;
  signOut: () => Promise<void>;
}

export function useSession(): UseSessionResult {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Récupère la session existante au montage + abonne aux changements
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session);
        setSessionLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (cancelled) return;
      setSession(newSession);
      // Invalide le cache personne quand la session change
      queryClient.invalidateQueries({ queryKey: ['personne-by-auth-user'] });
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [queryClient]);

  // Charge la personne correspondante quand on a une session
  const personneQuery = useQuery({
    queryKey: ['personne-by-auth-user', session?.user.id],
    queryFn: () => (session?.user.id ? findPersonneByAuthUserId(session.user.id) : null),
    enabled: !!session?.user.id,
    staleTime: 5 * 60_000, // 5 min : peu de raison que la personne change pendant la session
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    clearUser();
    // Flush tout le cache React Query (anciennes données pour l'ancien rôle)
    queryClient.clear();
  };

  const loading = sessionLoading || (!!session && personneQuery.isLoading);
  const personne = personneQuery.data ?? null;
  const role: Role | null = personne?.role ?? null;
  const isAuthorized = !!session && !!personne;

  // Synchronise l'identité avec Sentry (no-op tant que le DSN n'est pas configuré)
  useEffect(() => {
    if (isAuthorized && personne) {
      setUser({ id: personne.id, email: personne.email, role: personne.role });
    }
  }, [isAuthorized, personne]);

  return {
    session,
    user: session?.user ?? null,
    personne,
    role,
    loading,
    isAuthorized,
    signOut,
  };
}
