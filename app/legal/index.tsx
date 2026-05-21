/**
 * /legal — menu des pages légales (mentions, CGU, politique de confidentialité).
 */

import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ChevronRight, FileText, Scale, ShieldCheck } from 'lucide-react-native';
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

export default function LegalIndexScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Légal" subtitle="Mentions, CGU, RGPD" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <MenuItem
          icon={<FileText color={COLORS.slate[600]} size={20} />}
          iconBg="bg-slate-100"
          title="Mentions légales"
          subtitle="Éditeur, hébergeur, contact"
          onPress={() => router.push('/legal/mentions' as Href)}
        />
        <MenuItem
          icon={<Scale color={COLORS.primary[600]} size={20} />}
          iconBg="bg-primary-50"
          title="Conditions générales d’utilisation"
          subtitle="Règles d’usage du service"
          onPress={() => router.push('/legal/cgu' as Href)}
        />
        <MenuItem
          icon={<ShieldCheck color={COLORS.success[600]} size={20} />}
          iconBg="bg-success-50"
          title="Politique de confidentialité"
          subtitle="RGPD, données collectées, tes droits"
          onPress={() => router.push('/legal/privacy' as Href)}
        />

        <Text className="text-slate-400 text-xs text-center mt-6 leading-relaxed">
          Ces documents sont régulièrement mis à jour. La date de dernière révision est indiquée en
          en-tête de chaque page.
        </Text>
      </ScrollView>
    </View>
  );
}
