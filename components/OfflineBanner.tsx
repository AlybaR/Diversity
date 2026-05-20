/**
 * <OfflineBanner /> — bandeau global affiché quand le device est hors-ligne.
 *
 * À monter une seule fois, dans `app/_layout.tsx`, juste sous le SafeAreaView.
 * Quand `useNetworkStatus()` renvoie `isOnline === false`, il affiche un bandeau
 * orange en haut de l'écran. React Query continue de servir le cache, donc l'app
 * reste utilisable en lecture.
 *
 * Volontairement non-cliquable (pas de bouton "Réessayer") : la connexion
 * revient automatiquement, et React Query refetch tout seul via onlineManager.
 */

import { Text, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { COLORS } from '../constants/theme';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  if (isOnline) return null;

  return (
    <View
      className="bg-warning-500 px-4 py-2 flex-row items-center justify-center gap-2"
      style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}
    >
      <WifiOff color="#fff" size={14} />
      <Text className="text-white text-xs font-semibold">
        Mode hors-ligne — données en cache uniquement
      </Text>
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: COLORS.warning[600],
          opacity: 0,
        }}
      />
    </View>
  );
}
