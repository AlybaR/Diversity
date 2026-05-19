import { useQuery } from '@tanstack/react-query';
import { listDossiers, getDossierById, type DossierFilter } from '../services/dossiers';
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
