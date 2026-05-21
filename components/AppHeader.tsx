import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { ReactNode } from 'react';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  /** Affiche un bouton "Maison" (retour Welcome) à droite. Défaut : true. */
  showHome?: boolean;
  rightElement?: ReactNode;
}

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  showHome = true,
  rightElement,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-white border-b border-slate-100" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {showBack && (
            <Pressable onPress={() => router.back()} hitSlop={8} className="mr-2">
              <ArrowLeft size={22} color="#334155" />
            </Pressable>
          )}
          <View className="flex-1">
            <Text className="text-slate-800 font-bold text-base">{title}</Text>
            {subtitle && <Text className="text-slate-500 text-xs mt-0.5">{subtitle}</Text>}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {rightElement}
          {showHome && (
            <Pressable
              onPress={() => router.replace('/')}
              hitSlop={8}
              className="w-9 h-9 rounded-full items-center justify-center border border-slate-200"
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#f1f5f9' : '#ffffff',
              })}
            >
              <Home size={16} color="#475569" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
