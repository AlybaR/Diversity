import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react-native';
import { GRADIENTS } from '../../constants/theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextInputField } from '../../components/TextInputField';
import { supabase } from '../../lib/supabase';

type RoleHint = 'parent' | 'direction' | 'mairie';

const HEADER_BY_ROLE: Record<RoleHint, { title: string; subtitle: string }> = {
  parent: {
    title: 'Connexion parent élu',
    subtitle: 'Saisis ton email pour recevoir un lien de connexion',
  },
  direction: {
    title: 'Connexion direction',
    subtitle: 'Saisis ton email pour recevoir un lien de connexion',
  },
  mairie: {
    title: 'Connexion mairie',
    subtitle: 'Saisis ton email pour recevoir un lien de connexion',
  },
};

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { role: roleParam, ecole } = useLocalSearchParams<{ role?: string; ecole?: string }>();
  const roleHint: RoleHint =
    roleParam === 'direction' || roleParam === 'mairie' ? roleParam : 'parent';
  const { title, subtitle } = HEADER_BY_ROLE[roleHint];

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValidEmail = /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isValidEmail) return;
    setSubmitting(true);

    // emailRedirectTo : où Supabase renvoie l'utilisateur après clic sur le magic link.
    // En web on prend window.location.origin ; sur natif, Supabase ne gère pas l'URL
    // (Phase 6 traitera les deep links natifs).
    const emailRedirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert(
        "Erreur d'envoi",
        error.message ||
          "Impossible d'envoyer le lien de connexion pour l'instant. Réessaye dans un moment.",
      );
      return;
    }

    // On passe l'email à l'écran "sent" pour pouvoir le réafficher / renvoyer
    router.push({
      pathname: '/sign-in/sent',
      params: { email, role: roleHint, ecole },
    } as Href);
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
          <Text className="text-xl font-bold text-white">{title}</Text>
          <Text className="text-primary-200 text-sm mt-1">{subtitle}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-primary-50 rounded-2xl items-center justify-center">
            <Mail color="#2563eb" size={28} />
          </View>
        </View>

        <TextInputField
          label="Email"
          placeholder="prenom.nom@exemple.org"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        {submitted && !isValidEmail && (
          <Text className="text-danger-500 text-xs mt-1">Adresse email invalide</Text>
        )}

        <View className="mt-5">
          <PrimaryButton
            label={submitting ? 'Envoi en cours…' : 'Recevoir le lien de connexion'}
            onPress={handleSubmit}
          />
        </View>

        <View
          className="mt-8 p-4 rounded-xl border"
          style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
        >
          <View className="flex-row items-start gap-2">
            <ShieldCheck color="#1d4ed8" size={16} style={{ marginTop: 1 }} />
            <Text className="flex-1 text-primary-700 text-xs leading-relaxed">
              Pas de mot de passe : un lien sécurisé t'est envoyé à chaque connexion. Si ton email
              n'est pas reconnu par l'app, contacte la mairie de ton école pour être invité(e).
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
