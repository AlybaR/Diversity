import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowLeft, Bug, ShieldAlert } from 'lucide-react-native';
import { GRADIENTS } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { supabase } from '../../lib/supabase';

const REASON_LABELS: Record<string, string> = {
  'no-session': 'Session introuvable (le magic link a peut-être expiré ou été déjà utilisé).',
  'rpc-error': 'La fonction de liaison côté base de données a échoué.',
  'email-not-found': 'Aucune personne ne correspond à cet email dans la table `personnes`.',
};

export default function NoAccessScreen() {
  const insets = useSafeAreaInsets();
  const { reason, detail } = useLocalSearchParams<{ reason?: string; detail?: string }>();

  const handleSignOutAndBack = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={GRADIENTS.header as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-2 pb-6">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1 mb-4 self-start"
            hitSlop={8}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 text-sm">Retour</Text>
          </Pressable>
          <Text className="text-xl font-bold text-white">Accès non autorisé</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: insets.bottom + 24 }}
      >
        <View className="items-center mb-6 mt-4">
          <View className="w-20 h-20 bg-danger-50 rounded-2xl items-center justify-center">
            <ShieldAlert color="#ef4444" size={36} />
          </View>
        </View>

        <Text className="text-center text-lg font-bold text-slate-800 mb-3">
          Ton email n'est pas reconnu
        </Text>

        <Text className="text-center text-sm text-slate-500 px-4 mb-6 leading-relaxed">
          Passerelle est un outil d'institution. Pour y accéder, ton compte doit être créé en amont
          par la mairie de ton école.{'\n\n'}
          Contacte le service Éducation de ta mairie pour demander une invitation.
        </Text>

        {/* Détail technique : visible uniquement en mode dev pour diagnostiquer */}
        {__DEV__ && reason && (
          <View
            className="rounded-xl p-4 border mb-4"
            style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Bug color="#dc2626" size={14} />
              <Text className="text-red-700 text-xs font-bold uppercase">Diagnostic dev</Text>
            </View>
            <Text className="text-red-700 text-xs font-mono mb-1">reason : {reason}</Text>
            <Text className="text-red-600 text-xs leading-relaxed">
              {REASON_LABELS[reason] ?? 'Cause inconnue.'}
            </Text>
            {detail && (
              <Text className="text-red-500 text-[11px] font-mono mt-2 leading-relaxed">
                {detail}
              </Text>
            )}
            <SecondaryButton
              label="Page diagnostic auth"
              onPress={() => router.push('/auth/debug' as Href)}
              variant="ghost"
            />
          </View>
        )}

        <View
          className="rounded-xl p-4 border mb-6"
          style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}
        >
          <Text className="text-amber-700 text-xs leading-relaxed">
            <Text className="font-semibold">💡 À savoir : </Text>
            Si tu penses qu'il s'agit d'une erreur (changement d'email récent, mauvaise écriture),
            précise à la mairie l'adresse exacte que tu as saisie.
          </Text>
        </View>

        <View className="gap-3 mt-2">
          <PrimaryButton label="Retour à l'accueil" onPress={handleSignOutAndBack} />
          <SecondaryButton
            label="Réessayer avec un autre email"
            onPress={() => router.replace('/sign-in')}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </View>
  );
}
