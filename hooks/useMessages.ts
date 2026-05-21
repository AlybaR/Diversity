import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMessage,
  getMessageById,
  listMessages,
  markMessageAsRead,
  type CreateMessageInput,
  type MessageFilter,
} from '../services/messages';
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

export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMessageInput) => createMessage(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markMessageAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.message(id) });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
