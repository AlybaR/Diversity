/**
 * /auth/callback-demo — faux callback magic link pour la démo.
 *
 * Reçoit un `role` hint en query param (depuis /sign-in?role=mairie). Pick la
 * première personne mock avec ce rôle, set comme courante, redirige vers la
 * home du rôle. Tout instantané, aucun appel réseau.
 *
 * Si pas de role en query, on tombe sur Nadia (parent_admin) par défaut.
 */

import { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { PERSONNES } from '../../data/mockData';
import { useDemoUser } from '../../hooks/useDemoUser';
import type { Role } from '../../types';

// Aliases query param → rôle interne. /sign-in expose `role=parent|mairie|direction`.
function resolveRole(hint?: string): Role {
  switch (hint?.toLowerCase()) {
    case 'mairie':
      return 'mairie_admin';
    case 'direction':
      return 'direction';
    case 'elu':
      return 'elu';
    case 'parent_contributeur':
      return 'parent_contributeur';
    case 'parent':
    case 'parent_admin':
    default:
      return 'parent_admin';
  }
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

export default function CallbackDemoScreen() {
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { switchTo } = useDemoUser();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const targetRole = resolveRole(role);
    const personne = PERSONNES.find((p) => p.role === targetRole) ?? PERSONNES[0];
    switchTo(personne.id, { redirect: false });
    // Petit délai pour que le state soit visible (UX moins abrupte)
    setTimeout(() => {
      router.replace(homeForRole(personne.role));
    }, 450);
  }, [role, switchTo]);

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-8">
      <ActivityIndicator color="#2563eb" size="large" />
      <Text className="text-slate-600 text-sm mt-4 text-center">Connexion en cours…</Text>
      <Text className="text-slate-400 text-xs mt-2 text-center">Mode démo</Text>
    </View>
  );
}
