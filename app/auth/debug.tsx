/**
 * Écran diagnostic auth — uniquement en __DEV__.
 *
 * Affiche en clair :
 *   - Ce que voit `supabase.auth.getSession()` (uid, email, expiry)
 *   - Ce que retourne la RPC `link_current_user_to_personne()`
 *   - Le contenu visible de `personnes` (filtré par RLS automatiquement)
 *   - Le nombre de dossiers visibles
 *
 * Sert à debug rapidement quand un magic link finit sur /auth/no-access.
 * À masquer / retirer en prod (route nue accessible si on connait l'URL).
 */

import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bug } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { SecondaryButton } from '../../components/SecondaryButton';
import { supabase } from '../../lib/supabase';

interface DiagnosticResult {
  step: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

export default function AuthDebugScreen() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!__DEV__) return;

    (async () => {
      const out: DiagnosticResult[] = [];

      // 1. Session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      out.push({
        step: '1. supabase.auth.getSession()',
        ok: !!sessionData.session && !sessionError,
        data: sessionData.session
          ? {
              user_id: sessionData.session.user.id,
              email: sessionData.session.user.email,
              expires_at: new Date((sessionData.session.expires_at ?? 0) * 1000).toISOString(),
            }
          : null,
        error: sessionError?.message,
      });

      // 2. RPC link_current_user_to_personne
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'link_current_user_to_personne',
      );
      out.push({
        step: '2. rpc(link_current_user_to_personne)',
        ok: !rpcError,
        data: rpcData,
        error: rpcError?.message,
      });

      // 3. SELECT * FROM personnes (filtré par RLS)
      const { data: personnesData, error: personnesError } = await supabase
        .from('personnes')
        .select('id, email, role, auth_user_id');
      out.push({
        step: '3. SELECT * FROM personnes (RLS filtré côté client)',
        ok: !personnesError,
        data: personnesData ? { count: personnesData.length, rows: personnesData } : null,
        error: personnesError?.message,
      });

      // 4. Count dossiers visibles
      const { count, error: dossiersError } = await supabase
        .from('dossiers')
        .select('*', { count: 'exact', head: true });
      out.push({
        step: '4. count dossiers visibles (RLS filtré)',
        ok: !dossiersError,
        data: { count },
        error: dossiersError?.message,
      });

      setResults(out);
      setLoading(false);
    })();
  }, []);

  if (!__DEV__) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-8">
        <Text className="text-slate-600 text-sm text-center">
          Cette page n'est accessible qu'en mode développement.
        </Text>
        <SecondaryButton label="Retour" onPress={() => router.replace('/')} variant="ghost" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Diagnostic auth" subtitle="__DEV__ uniquement" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <View className="flex-row items-center gap-2 mb-4">
          <Bug color="#dc2626" size={16} />
          <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide">
            Résultats des appels Supabase
          </Text>
        </View>

        {loading && <Text className="text-slate-400 text-xs">Chargement…</Text>}

        {results.map((r, idx) => (
          <View
            key={idx}
            className="bg-white rounded-xl p-3 border border-slate-200 mb-3"
            style={{ borderLeftWidth: 3, borderLeftColor: r.ok ? '#10b981' : '#ef4444' }}
          >
            <Text className="text-slate-800 text-sm font-bold mb-1">
              {r.ok ? '✅' : '❌'} {r.step}
            </Text>
            {r.error && <Text className="text-red-600 text-xs font-mono mb-1">{r.error}</Text>}
            {r.data !== undefined && (
              <Text className="text-slate-500 text-[11px] font-mono leading-relaxed">
                {JSON.stringify(r.data, null, 2)}
              </Text>
            )}
          </View>
        ))}

        <View className="gap-2 mt-4">
          <SecondaryButton
            label="Se déconnecter (signOut)"
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace('/');
            }}
          />
          <SecondaryButton
            label="Retour à l'accueil"
            onPress={() => router.replace('/')}
            variant="ghost"
          />
        </View>

        <Text className="text-slate-400 text-[10px] text-center mt-6 px-4">
          Cette page n'est compilée qu'en mode dev. Elle disparait du bundle en prod.
        </Text>
      </ScrollView>
    </View>
  );
}
