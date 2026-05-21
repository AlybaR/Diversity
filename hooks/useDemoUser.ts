/**
 * Hook `useDemoUser` — wraps les helpers `getCurrentUser` / `setCurrentUser`
 * de `data/mockData.ts` avec :
 *   - un compteur de version (force re-render des consommateurs après switch)
 *   - une invalidation de tous les caches React Query (sinon on garde les
 *     anciennes listes filtrées par l'ancien rôle)
 *   - une redirection automatique vers la home du nouveau rôle
 *
 * À utiliser uniquement en mode démo (USE_SUPABASE=false). En mode prod, la
 * source de vérité reste `useSession().personne` (Supabase Auth).
 */

import { useCallback, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import { getCurrentUser, setCurrentUser as mockSetCurrentUser } from '../data/mockData';
import type { Personne, Role } from '../types';

type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  version += 1;
  listeners.forEach((l) => l());
}

function getSnapshot(): number {
  return version;
}

function homeForRole(role: Role): Href {
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

export function useDemoUser() {
  // Force re-render des consommateurs quand `version` change.
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const queryClient = useQueryClient();
  const currentUser: Personne = getCurrentUser();

  const switchTo = useCallback(
    (personneId: string, options: { redirect?: boolean } = { redirect: true }) => {
      const next = mockSetCurrentUser(personneId);
      if (!next) return null;
      notify();
      // Invalide TOUS les caches : les listes filtrées par rôle vont refetch.
      queryClient.invalidateQueries();
      if (options.redirect !== false) {
        router.replace(homeForRole(next.role));
      }
      return next;
    },
    [queryClient],
  );

  return { currentUser, switchTo };
}
