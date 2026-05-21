import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRendezVous,
  listRendezVous,
  updateRendezVousStatut,
  type CreateRendezVousInput,
  type RdvFilter,
} from '../services/rendezVous';
import type { StatutRDV } from '../types';
import { QUERY_KEYS } from '../services/_config';

export function useRendezVous(filter: RdvFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.rendezVous(filter.ecoleId), filter],
    queryFn: () => listRendezVous(filter),
  });
}

export function useCreateRendezVous() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRendezVousInput) => createRendezVous(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
    },
  });
}

export function useUpdateRendezVousStatut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; statut: StatutRDV }) => updateRendezVousStatut(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rendez-vous'] });
    },
  });
}
