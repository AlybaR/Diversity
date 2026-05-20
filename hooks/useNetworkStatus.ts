/**
 * Hook `useNetworkStatus` — détecte la connectivité réseau.
 *
 * Sur web : utilise `window.navigator.onLine` + événements `online`/`offline`.
 * Sur iOS/Android : utilise `@react-native-community/netinfo`.
 *
 * Le hook expose `{ isOnline, isInternetReachable }` :
 *   - `isOnline` : interface réseau active (wifi/cellulaire connecté). C'est ce
 *     qu'on affiche dans l'OfflineBanner.
 *   - `isInternetReachable` : test actif côté natif (NetInfo ping un endpoint).
 *     Plus précis mais peut être null si en cours de vérification.
 *
 * Pourquoi un hook custom et pas useNetInfo direct : on veut un fallback web
 * propre, et on veut homogénéiser le contrat (NetInfo renvoie `null` ou
 * `boolean | null` selon l'état, c'est confus). Ici on retourne `true` par
 * défaut (optimiste) tant qu'on n'a pas la preuve du contraire.
 */

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface NetworkStatus {
  isOnline: boolean;
  isInternetReachable: boolean | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true, // optimiste par défaut
    isInternetReachable: null,
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      const update = () =>
        setStatus({
          isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
          isInternetReachable: null,
        });
      update();

      window.addEventListener('online', update);
      window.addEventListener('offline', update);
      return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
      };
    }

    // Côté natif : import dynamique pour éviter de charger netinfo en web bundle
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const NetInfoModule = await import('@react-native-community/netinfo');
        const NetInfo = NetInfoModule.default;
        unsubscribe = NetInfo.addEventListener((state) => {
          setStatus({
            isOnline: !!state.isConnected,
            isInternetReachable: state.isInternetReachable,
          });
        });
        // État initial
        const initial = await NetInfo.fetch();
        setStatus({
          isOnline: !!initial.isConnected,
          isInternetReachable: initial.isInternetReachable,
        });
      } catch (err) {
        if (__DEV__) console.warn('[useNetworkStatus] init failed', err);
      }
    })();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return status;
}
