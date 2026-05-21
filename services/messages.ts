import type { Message, PrioriteMessage, Role, VisibilityScope } from '../types';
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

// =============================================================================
// MUTATIONS — mode démo uniquement
// =============================================================================

export interface CreateMessageInput {
  titre: string;
  contenu: string;
  expediteur: string;
  priorite?: PrioriteMessage;
  visibilityScope: VisibilityScope;
}

export function createMessage(input: CreateMessageInput): Promise<Message> {
  if (USE_SUPABASE) {
    return Promise.reject(new Error('createMessage non implémenté en mode Supabase (démo only)'));
  }
  const now = new Date();
  const message: Message = {
    id: `message-${now.getTime()}`,
    titre: input.titre,
    expediteur: input.expediteur,
    date: now.toISOString(),
    priorite: input.priorite ?? 'normale',
    contenu: input.contenu,
    lu: false,
    visibilityScope: input.visibilityScope,
  };
  MESSAGES.unshift(message);
  return mockAsync(message);
}

export function markMessageAsRead(id: string): Promise<Message | null> {
  if (USE_SUPABASE) {
    return Promise.reject(
      new Error('markMessageAsRead non implémenté en mode Supabase (démo only)'),
    );
  }
  const message = MESSAGES.find((m) => m.id === id);
  if (!message) return mockAsync(null);
  message.lu = true;
  return mockAsync(message);
}
