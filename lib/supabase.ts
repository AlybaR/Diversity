/**
 * Client Supabase unique pour Passerelle.
 *
 * Lit la configuration depuis les variables d'env Expo :
 *   - EXPO_PUBLIC_SUPABASE_URL       (URL du projet, ex: https://xyz.supabase.co)
 *   - EXPO_PUBLIC_SUPABASE_ANON_KEY  (clé anon publique, OK dans le bundle client)
 *
 * Ces variables sont :
 *   - Définies dans `.env.local` côté dev (non versionné)
 *   - Définies en CI/prod via les secrets de l'hébergeur (Cloudflare Pages / EAS Secrets)
 *
 * Préfixe `EXPO_PUBLIC_` obligatoire pour qu'Expo Router/Metro les expose côté client.
 *
 * La clé `anon` est volontairement publique : la sécurité repose sur les politiques RLS
 * côté PostgreSQL (cf. supabase/migrations/0002_rls_policies.sql). Aucune donnée sensible
 * n'est exposée tant que les policies sont bien configurées.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // En dev, on log un warning explicite pour aider à diagnostiquer le souci.
  // En prod (bundle minifié), ce warning sera silencieux mais les requêtes échoueront proprement.
  if (__DEV__) {
    console.warn(
      '[Supabase] EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY manquant. ' +
        'Crée un fichier `.env.local` à la racine de mobile-app/ (cf. .env.example).',
    );
  }
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      // Persistance de session : à brancher avec @react-native-async-storage/async-storage
      // en Phase 2 (auth magic link). Pour l'instant, en Phase 1, on ne fait que de la lecture.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);
