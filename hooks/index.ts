/**
 * Hooks de données — wrappers React Query autour de la couche services.
 *
 * Pourquoi React Query :
 * - cache automatique entre écrans (pas de refetch quand on revient sur la liste)
 * - loading / error states gratuits
 * - revalidation transparente quand le backend sera branché
 * - devtools disponibles en dev (TanStack Query DevTools)
 *
 * Convention : un hook par requête, signature `use<Entity>` (liste) ou `use<Entity>` singulier (détail).
 */

export * from './useDossiers';
export * from './useEcoles';
export * from './useMessages';
export * from './useRendezVous';
export * from './usePersonnes';
export * from './useStats';
