import { useQuery } from '@tanstack/react-query';
import { listRendezVous, type RdvFilter } from '../services/rendezVous';
import { QUERY_KEYS } from '../services/_config';

export function useRendezVous(filter: RdvFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.rendezVous(filter.ecoleId), filter],
    queryFn: () => listRendezVous(filter),
  });
}
