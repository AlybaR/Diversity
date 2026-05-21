import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPersonne,
  listPersonnes,
  type CreatePersonneInput,
  type PersonneFilter,
} from '../services/personnes';
import { QUERY_KEYS } from '../services/_config';

export function usePersonnes(filter: PersonneFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.personnes(filter.ecoleId), filter],
    queryFn: () => listPersonnes(filter),
  });
}

export function useCreatePersonne() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePersonneInput) => createPersonne(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnes'] });
    },
  });
}
