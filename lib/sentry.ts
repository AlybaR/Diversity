/**
 * Couche d'abstraction Sentry — stub léger qu'on pourra remplacer en Phase 3+
 * par le SDK officiel `@sentry/react-native` sans toucher au code applicatif.
 *
 * Pourquoi pas brancher Sentry directement ?
 *   - Le SDK officiel exige un plugin EAS + une config native qu'on ne veut pas
 *     pousser avant d'avoir un compte Sentry réel (DSN + projet créés).
 *   - Le coût en bundle / DX (Expo Go ne supporte pas tous les modules natifs)
 *     ne se justifie qu'au moment où on commence à recevoir des vrais events.
 *
 * Comportement actuel :
 *   - En `__DEV__` : `console.log` structuré (tag `[sentry]`), utile pour
 *     vérifier que les sites d'instrumentation sont bien posés.
 *   - En prod (`__DEV__ === false`) : no-op silencieux. Aucun impact perf.
 *
 * Migration future (vers `@sentry/react-native`) :
 *   1. `npx expo install @sentry/react-native`
 *   2. Plugin EAS dans `app.json` (instructions Sentry)
 *   3. Remplacer les corps de fonctions ci-dessous par les appels Sentry.*
 *   4. Lire le DSN via `process.env.EXPO_PUBLIC_SENTRY_DSN`
 *   5. Aucun changement aux 30+ sites d'appel dans l'app.
 *
 * Contrat (sous-ensemble de l'API Sentry, suffisant pour 95% des cas) :
 *   - `captureException(error, context?)` — erreur attrapée
 *   - `captureMessage(message, level?)` — événement non-erreur (warn/info)
 *   - `setUser({ id, email })` — associe l'utilisateur connecté à tous les events
 *   - `clearUser()` — au logout
 *   - `addBreadcrumb({ category, message, data? })` — trace d'audit légère
 */

type SentryLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

interface SentryUser {
  id: string;
  email?: string;
  role?: string;
}

interface SentryBreadcrumb {
  category: string;
  message: string;
  data?: Record<string, unknown>;
  level?: SentryLevel;
}

interface SentryContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: SentryLevel;
}

const DSN: string | undefined =
  typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_SENTRY_DSN : undefined;
const ENABLED = !!DSN;

export function captureException(error: unknown, context?: SentryContext): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn('[sentry] captureException', {
      error: error instanceof Error ? `${error.name}: ${error.message}` : error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  }
  if (ENABLED) {
    // TODO Phase 3+ : Sentry.captureException(error, { tags, extra, level });
  }
}

export function captureMessage(message: string, level: SentryLevel = 'info'): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[sentry][${level}] ${message}`);
  }
  if (ENABLED) {
    // TODO Phase 3+ : Sentry.captureMessage(message, level);
  }
}

export function setUser(user: SentryUser): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[sentry] setUser', user);
  }
  if (ENABLED) {
    // TODO Phase 3+ : Sentry.setUser(user);
  }
}

export function clearUser(): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[sentry] clearUser');
  }
  if (ENABLED) {
    // TODO Phase 3+ : Sentry.setUser(null);
  }
}

export function addBreadcrumb(crumb: SentryBreadcrumb): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[sentry][crumb] ${crumb.category}: ${crumb.message}`, crumb.data ?? '');
  }
  if (ENABLED) {
    // TODO Phase 3+ : Sentry.addBreadcrumb(crumb);
  }
}

/**
 * Renvoie l'état du SDK pour les écrans de diagnostic (/auth/debug).
 */
export function getSentryStatus() {
  return {
    enabled: ENABLED,
    dsnConfigured: !!DSN,
    sdkInstalled: false, // À passer à true quand on aura branché @sentry/react-native
  };
}
