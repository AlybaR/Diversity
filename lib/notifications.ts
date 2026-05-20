/**
 * Couche d'abstraction notifications push — phase de collecte de tokens uniquement.
 *
 * Côté serveur (l'envoi effectif) sera branché en Phase 5 (pilote mairies).
 * À ce stade : on demande la permission au moment du login, on récupère le
 * token Expo Push, et on l'enregistre dans `personnes.push_token` côté DB.
 *
 * Pourquoi pas tout de suite côté serveur ?
 *   - L'envoi nécessite une fonction Edge Supabase + un endpoint Expo Push
 *     (https://exp.host/--/api/v2/push/send) avec une clé API. Pas critique
 *     pour le MVP.
 *   - Sans utilisateurs réels, on n'aurait rien à pousser. Phase 5 = utile.
 *
 * Plateforme :
 *   - iOS + Android : flux complet (permission + token Expo).
 *   - Web : la PWA peut faire des push via la Web Push API. expo-notifications
 *     ne le gère pas — branche-toi sur `Notification.requestPermission()` + un
 *     Service Worker en Phase 3+. Pour le MVP web, no-op.
 *   - Expo Go : les tokens Expo Push fonctionnent en SDK 49+ tant qu'on a un
 *     `projectId` Expo. En dev sans projectId, on renvoie null.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { addBreadcrumb, captureException } from './sentry';

interface PushRegistrationResult {
  token: string | null;
  permissionGranted: boolean;
  reason?: string;
}

/**
 * Demande la permission de notification + récupère le token Expo Push, et le
 * persiste dans `personnes.push_token` pour l'utilisateur courant.
 *
 * Idempotent : on peut l'appeler à chaque login, le token est mis à jour si
 * l'OS a changé entre temps (rotation possible).
 *
 * Retourne le token + status pour qu'on puisse afficher un message d'erreur
 * ciblé côté UI (différence entre "user refusé" et "device non capable").
 */
export async function registerForPushNotifications(
  personneId: string,
): Promise<PushRegistrationResult> {
  // Web : pas encore branché (cf. doc en haut du fichier)
  if (Platform.OS === 'web') {
    return { token: null, permissionGranted: false, reason: 'web-not-supported' };
  }

  try {
    // 1. Permission OS
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      addBreadcrumb({
        category: 'push',
        message: 'permission-denied',
        data: { status: finalStatus },
      });
      return { token: null, permissionGranted: false, reason: 'permission-denied' };
    }

    // 2. Token Expo Push
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      // Pas de projectId = pas de token Expo Push possible (mais pas une erreur,
      // juste un signe qu'on n'a pas encore configuré EAS).
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('[push] no expo projectId configured — skip token registration');
      }
      return { token: null, permissionGranted: true, reason: 'no-project-id' };
    }
    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResult.data;

    // 3. Persister dans personnes (colonne ajoutée par migration 0004)
    const { error: updateError } = await supabase
      .from('personnes')
      .update({ push_token: token })
      .eq('id', personneId);
    if (updateError) {
      // Si la migration 0004 n'est pas appliquée, l'erreur sera "column push_token does not exist".
      // On loggue mais on retourne le token quand même (utile pour /auth/debug).
      captureException(updateError, {
        tags: { phase: 'push', step: 'persist' },
        level: 'warning',
      });
      return { token, permissionGranted: true, reason: 'persist-failed' };
    }

    addBreadcrumb({
      category: 'push',
      message: 'token-registered',
      data: { personneId, tokenPrefix: token.slice(0, 12) },
    });

    return { token, permissionGranted: true };
  } catch (err) {
    captureException(err, { tags: { phase: 'push', step: 'register' }, level: 'warning' });
    return { token: null, permissionGranted: false, reason: 'exception' };
  }
}

/**
 * Configure la réception des notifications en foreground (sinon iOS les silence
 * par défaut dès que l'app est ouverte). À appeler une seule fois, au démarrage.
 */
export function configureNotificationHandler() {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
      // Champs requis par les versions récentes du SDK
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
