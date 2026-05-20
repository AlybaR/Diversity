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
 *
 * Configuration auth (Phase 2) :
 *   - Web : utilise `localStorage` natif (storage undefined). `detectSessionInUrl: true`
 *     pour parser le `#access_token=` reçu après clic sur magic link.
 *   - iOS/Android : utilise `@react-native-async-storage/async-storage`.
 *   - `persistSession: true` : la session survit aux rechargements
 *   - `autoRefreshToken: true` : le JWT se renouvelle automatiquement avant expiration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

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

const isWeb = Platform.OS === 'web';

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      // Web : localStorage natif (storage undefined laisse Supabase choisir).
      // Natif : AsyncStorage requis pour persister la session entre sessions.
      storage: isWeb ? undefined : AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      // detectSessionInUrl : seulement utile côté web pour parser le #access_token
      // après clic sur le magic link.
      detectSessionInUrl: isWeb,
    },
  },
);
