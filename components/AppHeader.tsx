import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { ReactNode } from 'react';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: ReactNode;
}

export function AppHeader({ title, subtitle, showBack = true, rightElement }: AppHeaderProps) {
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
        {rightElement}
      </View>
    </View>
  );
}
