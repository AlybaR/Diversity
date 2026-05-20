import type { Message, Role, VisibilityScope } from '../types';
import { canRoleSeeScope } from '../types';
import { MESSAGES } from '../data/mockData';
import { mockAsync, USE_SUPABASE } from './_config';
import { getMessageByIdFromSupabase, listMessagesFromSupabase } from './supabase/messages';

export interface MessageFilter {
  ecoleId?: string;
  scope?: VisibilityScope;
  // Filtre par rôle qui consulte (cf. listDossiers).
  visibleByRole?: Role;
}

export function listMessages(filter: MessageFilter = {}): Promise<Message[]> {
  if (USE_SUPABASE) return listMessagesFromSupabase(filter);
  let result = MESSAGES;
  if (filter.scope) {
    result = result.filter((m) => m.visibilityScope === filter.scope);
  }
  if (filter.visibleByRole) {
    const role = filter.visibleByRole;
    result = result.filter((m) => canRoleSeeScope(role, m.visibilityScope));
  }
  return mockAsync(result);
}

export function getMessageById(id: string): Promise<Message | null> {
  if (USE_SUPABASE) return getMessageByIdFromSupabase(id);
  const message = MESSAGES.find((m) => m.id === id) ?? null;
  return mockAsync(message);
}
