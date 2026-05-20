/**
 * <LoadingState /> — indicateur de chargement centré.
 *
 * Utilisé pendant `isLoading` d'une requête React Query. Plus chaleureux qu'un
 * simple ActivityIndicator nu : on affiche un libellé contextuel.
 *
 * Variante `inline` : petit indicateur en ligne (au-dessus d'une liste qui se
 * recharge). Variante `centered` (défaut) : spinner + label centré sur tout
 * l'espace disponible.
 */

import { ActivityIndicator, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface LoadingStateProps {
  label?: string;
  variant?: 'centered' | 'inline';
  className?: string;
}

export function LoadingState({
  label = 'Chargement…',
  variant = 'centered',
  className = '',
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <View className={`flex-row items-center justify-center gap-2 py-3 ${className}`}>
        <ActivityIndicator color={COLORS.primary[500]} size="small" />
        <Text className="text-slate-500 text-xs">{label}</Text>
      </View>
    );
  }

  return (
    <View className={`items-center justify-center py-12 ${className}`}>
      <ActivityIndicator color={COLORS.primary[500]} size="large" />
      <Text className="text-slate-500 text-sm mt-3">{label}</Text>
    </View>
  );
}
