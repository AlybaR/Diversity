import { useQuery } from '@tanstack/react-query';
import { getMessageById, listMessages, type MessageFilter } from '../services/messages';
import { QUERY_KEYS } from '../services/_config';

export function useMessages(filter: MessageFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.messages(filter.ecoleId), filter],
    queryFn: () => listMessages(filter),
  });
}

export type { MessageFilter };

export function useMessage(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.message(id ?? ''),
    queryFn: () => (id ? getMessageById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}
