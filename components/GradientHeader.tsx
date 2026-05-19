import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { GRADIENTS } from '../constants/theme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'parent' | 'mairie';
  showBack?: boolean;
  rightElement?: ReactNode;
  children?: ReactNode;
}

export function GradientHeader({
  title,
  subtitle,
  variant = 'parent',
  showBack = false,
  rightElement,
  children,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const colors = variant === 'mairie' ? GRADIENTS.mairie : GRADIENTS.header;

  return (
    <LinearGradient
      colors={colors as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: insets.top }}
    >
      <View className="px-5 pt-2 pb-5">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1 mb-4 self-start"
            hitSlop={8}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 text-sm">Retour</Text>
          </Pressable>
        )}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-white font-bold text-xl leading-tight">{title}</Text>
            {subtitle && <Text className="text-primary-200 text-sm mt-1">{subtitle}</Text>}
          </View>
          {rightElement}
        </View>
        {children}
      </View>
    </LinearGradient>
  );
}
