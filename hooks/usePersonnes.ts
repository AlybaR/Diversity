import { useQuery } from '@tanstack/react-query';
import { listPersonnes, type PersonneFilter } from '../services/personnes';
import { QUERY_KEYS } from '../services/_config';

export function usePersonnes(filter: PersonneFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.personnes(filter.ecoleId), filter],
    queryFn: () => listPersonnes(filter),
  });
}
