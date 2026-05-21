/**
 * /aide — menu d'aide qui liste les 3 sous-pages.
 *
 * Accessible depuis le footer de la Welcome screen et depuis le menu profil.
 * Pas de BottomNav : c'est une zone "annexe", on revient à l'origine via le
 * bouton Back de l'AppHeader.
 */

import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { BookOpen, ChevronRight, MessageCircle, Sparkles } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS } from '../../constants/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function MenuItem({ icon, iconBg, title, subtitle, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-2 border border-slate-100 flex-row items-center gap-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View className={`w-11 h-11 rounded-xl items-center justify-center ${iconBg}`}>{icon}</View>
      <View className="flex-1">
        <Text className="text-slate-800 font-bold text-sm">{title}</Text>
        <Text className="text-slate-500 text-xs mt-0.5">{subtitle}</Text>
      </View>
      <ChevronRight color={COLORS.slate[400]} size={18} />
    </Pressable>
  );
}

export default function AideIndexScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Aide" subtitle="Comprendre et utiliser Passerelle" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <MenuItem
          icon={<Sparkles color={COLORS.primary[600]} size={20} />}
          iconBg="bg-primary-50"
          title="Comment ça marche"
          subtitle="Présentation, rôles, canaux de visibilité"
          onPress={() => router.push('/aide/comment-ca-marche' as Href)}
        />
        <MenuItem
          icon={<BookOpen color={COLORS.success[600]} size={20} />}
          iconBg="bg-success-50"
          title="FAQ"
          subtitle="Questions fréquentes (général, sécurité, compte, technique)"
          onPress={() => router.push('/aide/faq' as Href)}
        />
        <MenuItem
          icon={<MessageCircle color={COLORS.mairie[600]} size={20} />}
          iconBg="bg-mairie-50"
          title="Contact"
          subtitle="Nous écrire, contacter le DPO"
          onPress={() => router.push('/aide/contact' as Href)}
        />

        <Text className="text-slate-400 text-xs text-center mt-6 leading-relaxed">
          Pour les informations légales (CGU, politique de confidentialité, mentions légales),
          rends-toi dans la section Légal.
        </Text>
      </ScrollView>
    </View>
  );
}
