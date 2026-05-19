import { useQuery } from '@tanstack/react-query';
import { getStatsMairie, getStatsParent } from '../services/stats';
import { QUERY_KEYS } from '../services/_config';

export function useStatsParent(ecoleId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.statsParent(ecoleId),
    queryFn: () => getStatsParent(ecoleId),
  });
}

export function useStatsMairie(collectiviteId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.statsMairie(collectiviteId),
    queryFn: () => getStatsMairie(collectiviteId),
  });
}
