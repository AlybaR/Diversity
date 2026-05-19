import { useQuery } from '@tanstack/react-query';
import { listEcoles, getEcoleById } from '../services/ecoles';
import { QUERY_KEYS } from '../services/_config';

export function useEcoles() {
  return useQuery({
    queryKey: QUERY_KEYS.ecoles,
    queryFn: listEcoles,
  });
}

export function useEcole(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.ecole(id ?? ''),
    queryFn: () => (id ? getEcoleById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}
