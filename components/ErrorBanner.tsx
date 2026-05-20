/**
 * <ErrorBanner /> — bandeau d'erreur inline.
 *
 * Utilisé quand une requête React Query renvoie une `error`. Affiche le message
 * et propose éventuellement un bouton "Réessayer" qui appelle `onRetry`.
 *
 * Variante `compact` : version réduite pour les contextes peu prioritaires
 * (sidebar, en-tête de liste). Variante `default` : pleine largeur, padding plus
 * généreux, pour les états bloquants au cœur d'un écran.
 *
 * Pourquoi un composant dédié : avant Phase 3, chaque écran affichait son propre
 * `<Text>Erreur…</Text>` ad hoc. C'était inconsistant et invisible aux QA. Le
 * composant centralise le visuel + le wording.
 */

import { Pressable, Text, View } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ErrorBanner({
  title = 'Erreur',
  message,
  onRetry,
  variant = 'default',
  className = '',
}: ErrorBannerProps) {
  const padding = variant === 'compact' ? 'p-3' : 'p-4';
  const iconSize = variant === 'compact' ? 16 : 20;

  return (
    <View className={`bg-danger-50 border border-danger-100 rounded-xl ${padding} ${className}`}>
      <View className="flex-row items-start gap-3">
        <AlertCircle color={COLORS.danger[600]} size={iconSize} />
        <View className="flex-1">
          <Text className="text-danger-600 font-semibold text-sm">{title}</Text>
          <Text className="text-danger-600 text-xs mt-1 leading-relaxed">{message}</Text>
          {onRetry && (
            <Pressable
              onPress={onRetry}
              className="flex-row items-center gap-1.5 mt-2 self-start"
              hitSlop={8}
            >
              <RefreshCw color={COLORS.danger[600]} size={14} />
              <Text className="text-danger-600 text-xs font-semibold underline">Réessayer</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
