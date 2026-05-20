/**
 * Configuration de la couche services.
 *
 * En mode mock : les services lisent depuis `data/mockData.ts`.
 * À l'intégration backend : remplacer les implémentations dans chaque service par des appels `fetch(...)`,
 * idéalement vers une API REST hébergée en France (Scaleway / OVH) pour conformité RGPD.
 *
 * Les hooks `hooks/use*.ts` (basés sur React Query) ne nécessiteront aucun changement.
 */

/**
 * Bascule mock data ↔ Supabase.
 *
 * Lit la variable d'env `EXPO_PUBLIC_USE_SUPABASE` :
 *   - `'true'`  → les services utilisent Supabase (Phase 1.2+)
 *   - autre/absent → mockData en mémoire (comportement par défaut, Phase 0/1.1)
 *
 * Notes :
 *   - Le flag est lu UNE FOIS au chargement de l'app. Pour le changer, redémarrer Metro.
 *   - Tant que l'auth Phase 2 n'est pas branchée, les requêtes Supabase échoueront sur
 *     les tables protégées par RLS (renvoient 0 ligne). Passer à `'true'` après auth.
 */
export const USE_SUPABASE = process.env.EXPO_PUBLIC_USE_SUPABASE === 'true';

/** Délai artificiel (ms) pour simuler la latence réseau. 0 = instantané. */
export const MOCK_LATENCY_MS = 0;

/** Helper qui simule un appel asynchrone. */
export function mockAsync<T>(data: T): Promise<T> {
  if (MOCK_LATENCY_MS === 0) return Promise.resolve(data);
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_LATENCY_MS));
}

/** Clés cache standardisées pour React Query (évite les typos et les chevauchements). */
export const QUERY_KEYS = {
  ecoles: ['ecoles'] as const,
  ecole: (id: string) => ['ecoles', id] as const,
  dossiers: (ecoleId?: string) => ['dossiers', { ecoleId }] as const,
  dossier: (id: string) => ['dossiers', id] as const,
  messages: (ecoleId?: string) => ['messages', { ecoleId }] as const,
  message: (id: string) => ['messages', id] as const,
  rendezVous: (ecoleId?: string) => ['rendez-vous', { ecoleId }] as const,
  personnes: (ecoleId?: string) => ['personnes', { ecoleId }] as const,
  statsParent: (ecoleId: string) => ['stats', 'parent', ecoleId] as const,
  statsMairie: (collectiviteId: string) => ['stats', 'mairie', collectiviteId] as const,
} as const;
