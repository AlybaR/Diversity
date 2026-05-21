import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addCommentaire,
  createDossier,
  getDossierById,
  listDossiers,
  shareDossierTripartite,
  updateDossierStatut,
  type AddCommentaireInput,
  type CreateDossierInput,
  type DossierFilter,
  type UpdateDossierStatutInput,
} from '../services/dossiers';
import { QUERY_KEYS } from '../services/_config';

export function useDossiers(filter: DossierFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.dossiers(filter.ecoleId), filter],
    queryFn: () => listDossiers(filter),
  });
}

export function useDossier(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.dossier(id ?? ''),
    queryFn: () => (id ? getDossierById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

/**
 * Crée un dossier + invalide les listes pour que tous les écrans qui les
 * affichent se rafraîchissent (parent/dossiers, mairie/dashboard, etc.).
 */
export function useCreateDossier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDossierInput) => createDossier(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}

export function useAddCommentaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCommentaireInput) => addCommentaire(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossier(input.dossierId) });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}

export function useUpdateDossierStatut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDossierStatutInput) => updateDossierStatut(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossier(input.dossierId) });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}

export function useShareDossierTripartite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { dossierId: string; acteurNom: string }) => shareDossierTripartite(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dossier(input.dossierId) });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });
}
