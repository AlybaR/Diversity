import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react-native';
import { GRADIENTS } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { supabase } from '../../lib/supabase';

export default function SignInSentScreen() {
  const insets = useSafeAreaInsets();
  const { email, role, ecole } = useLocalSearchParams<{
    email?: string;
    role?: string;
    ecole?: string;
  }>();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const emailRedirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });
    setResending(false);
    if (error) {
      Alert.alert(
        "Erreur d'envoi",
        error.message ?? "Impossible de renvoyer le lien pour l'instant.",
      );
      return;
    }
    setResent(true);
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
          <Text className="text-xl font-bold text-white">Email envoyé</Text>
          <Text className="text-primary-200 text-sm mt-1">
            Ouvre ta boîte mail et clique sur le lien
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: insets.bottom + 24 }}
      >
        <View className="items-center mb-6 mt-4">
          <View className="w-20 h-20 bg-success-50 rounded-2xl items-center justify-center">
            <CheckCircle2 color="#10b981" size={36} />
          </View>
        </View>

        <Text className="text-center text-lg font-bold text-slate-800 mb-3">
          Lien de connexion envoyé
        </Text>

        {email && (
          <View
            className="rounded-xl p-3 border mb-6 mx-2"
            style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
          >
            <View className="flex-row items-center gap-2 justify-center">
              <Mail color="#1d4ed8" size={16} />
              <Text className="text-primary-700 text-sm font-semibold">{email}</Text>
            </View>
          </View>
        )}

        <Text className="text-center text-sm text-slate-500 px-4 mb-6 leading-relaxed">
          Vérifie aussi tes spams. Le lien est valable 1 heure. Une fois cliqué, tu seras
          automatiquement connecté(e).
        </Text>

        {resent && (
          <View
            className="rounded-xl p-3 border mb-4"
            style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}
          >
            <Text className="text-success-600 text-xs text-center">
              Nouveau lien envoyé. Vérifie ta boîte mail.
            </Text>
          </View>
        )}

        <View className="gap-3 mt-2">
          <PrimaryButton label={resending ? 'Envoi…' : 'Renvoyer le lien'} onPress={handleResend} />
          <SecondaryButton
            label="Changer d'email"
            onPress={() =>
              router.replace({
                pathname: '/sign-in',
                params: { role, ecole },
              } as Href)
            }
            variant="ghost"
          />
        </View>
      </ScrollView>
    </View>
  );
}
