/**
 * <EmptyState /> — placeholder centré quand une liste est vide.
 *
 * Pas une erreur : juste l'absence de données. Exemples :
 *   - "Aucun dossier en cours" sur /parent/dossiers
 *   - "Pas de message reçu" sur /direction/messages
 *   - "Aucun rendez-vous planifié" sur /parent/appointments
 *
 * Affiche un icône lucide, un titre, un sous-titre optionnel, et un CTA optionnel.
 * Différent de <Placeholder /> qui est pour les écrans en cours de construction.
 */

import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  cta?: { label: string; onPress: () => void };
  className?: string;
}

export function EmptyState({ icon, title, subtitle, cta, className = '' }: EmptyStateProps) {
  return (
    <View className={`items-center py-12 px-6 ${className}`}>
      <View className="w-16 h-16 bg-slate-100 rounded-2xl items-center justify-center mb-4">
        {icon}
      </View>
      <Text className="text-slate-800 font-bold text-base text-center">{title}</Text>
      {subtitle && (
        <Text className="text-slate-500 text-sm text-center mt-2 leading-relaxed max-w-[280px]">
          {subtitle}
        </Text>
      )}
      {cta && (
        <Pressable
          onPress={cta.onPress}
          className="mt-5 px-5 py-2.5 rounded-xl border border-primary-200"
          style={({ pressed }) => ({
            backgroundColor: pressed ? COLORS.primary[100] : COLORS.primary[50],
          })}
        >
          <Text className="text-primary-600 font-semibold text-sm">{cta.label}</Text>
        </Pressable>
      )}
    </View>
  );
}
