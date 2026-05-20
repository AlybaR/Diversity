/**
 * Guard de zone (parent / direction / mairie).
 *
 * Comportement :
 *   - Mode mock (USE_SUPABASE=false) : aucun guard. L'utilisateur navigue librement
 *     comme avant. Permet aux tests Playwright et au dev local de continuer sans auth.
 *   - Mode Supabase (USE_SUPABASE=true) :
 *     - Pendant le chargement de session : écran d'attente
 *     - Pas de session ou pas de personne liée : redirection vers /sign-in
 *     - Rôle incompatible avec la zone : redirection vers la bonne zone
 *     - Tout OK : on rend les children
 */

import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, type Href } from 'expo-router';
import { useSession } from '../hooks/useSession';
import { USE_SUPABASE } from '../services/_config';
import type { Role } from '../types';

interface AuthGuardProps {
  /** Rôles autorisés à voir cette zone. La direction est `['direction']`, la mairie `['mairie_admin', 'elu']`, etc. */
  allowedRoles: Role[];
  /** Redirection cible si rôle non autorisé (par défaut : home de la zone de l'utilisateur). */
  fallbackHref?: Href;
  children: ReactNode;
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

export function AuthGuard({ allowedRoles, fallbackHref, children }: AuthGuardProps) {
  // Bypass total en mode mock : l'app continue de fonctionner comme avant
  if (!USE_SUPABASE) {
    return <>{children}</>;
  }

  const { loading, isAuthorized, role } = useSession();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator color="#2563eb" />
        <Text className="text-slate-400 text-xs mt-3">Vérification de la session…</Text>
      </View>
    );
  }

  if (!isAuthorized || !role) {
    return <Redirect href={'/sign-in' as Href} />;
  }

  if (!allowedRoles.includes(role)) {
    // L'utilisateur est connecté mais n'a pas le droit d'être dans cette zone.
    // On le redirige vers SA zone (ou vers le fallback explicite).
    return <Redirect href={fallbackHref ?? homeForRole(role)} />;
  }

  return <>{children}</>;
}
