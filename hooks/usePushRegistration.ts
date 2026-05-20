/**
 * Hook `usePushRegistration` — déclenche l'enregistrement push à chaque session.
 *
 * Idempotent : si la permission est déjà accordée et le token déjà stocké, on
 * remet à jour le token (utile en cas de rotation OS). Si la permission est
 * refusée, on n'insiste pas — on retourne juste l'état pour info.
 *
 * Branché dans `app/_layout.tsx` au niveau global pour qu'on n'oublie pas une
 * route. La fonction underlying est no-op tant qu'il n'y a pas de session.
 */

import { useEffect, useState } from 'react';
import { registerForPushNotifications } from '../lib/notifications';
import { useSession } from './useSession';

interface UsePushRegistrationResult {
  token: string | null;
  permissionGranted: boolean;
  reason: string | null;
  /** true tant que la demande de permission/token est en cours */
  registering: boolean;
}

export function usePushRegistration(): UsePushRegistrationResult {
  const { personne, isAuthorized } = useSession();
  const [state, setState] = useState<UsePushRegistrationResult>({
    token: null,
    permissionGranted: false,
    reason: null,
    registering: false,
  });

  useEffect(() => {
    if (!isAuthorized || !personne) return;
    let cancelled = false;
    setState((s) => ({ ...s, registering: true }));
    (async () => {
      const result = await registerForPushNotifications(personne.id);
      if (cancelled) return;
      setState({
        token: result.token,
        permissionGranted: result.permissionGranted,
        reason: result.reason ?? null,
        registering: false,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthorized, personne]);

  return state;
}
