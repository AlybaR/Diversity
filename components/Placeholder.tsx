import { ScrollView, Text, View } from 'react-native';
import { Construction } from 'lucide-react-native';
import { ReactNode } from 'react';
import { router, type Href } from 'expo-router';
import { AppHeader } from './AppHeader';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface PlaceholderProps {
  title: string;
  subtitle?: string;
  description?: string;
  expectedContent: string[];
  ctaPrimary?: { label: string; path: Href };
  ctaSecondary?: { label: string; path: Href };
  showBack?: boolean;
  rightElement?: ReactNode;
}

export function Placeholder({
  title,
  subtitle,
  description,
  expectedContent,
  ctaPrimary,
  ctaSecondary,
  showBack = true,
  rightElement,
}: PlaceholderProps) {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        rightElement={rightElement}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View className="bg-white rounded-2xl p-6 border border-slate-100 items-center">
          <View className="w-14 h-14 bg-primary-50 rounded-2xl items-center justify-center mb-4">
            <Construction color="#2563eb" size={28} />
          </View>
          <Text className="text-slate-800 font-bold text-lg text-center">Écran en préparation</Text>
          {description && (
            <Text className="text-slate-500 text-sm text-center mt-2 leading-relaxed">
              {description}
            </Text>
          )}
        </View>

        <View className="bg-white rounded-2xl p-5 border border-slate-100 mt-3">
          <Text className="text-slate-700 font-bold text-sm mb-3">Éléments prévus</Text>
          <View>
            {expectedContent.map((item, idx) => (
              <View key={idx} className="flex-row items-start py-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 mr-2" />
                <Text className="text-slate-600 text-sm flex-1 leading-relaxed">{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5 gap-3">
          {ctaPrimary && (
            <PrimaryButton label={ctaPrimary.label} onPress={() => router.push(ctaPrimary.path)} />
          )}
          {ctaSecondary && (
            <SecondaryButton
              label={ctaSecondary.label}
              onPress={() => router.push(ctaSecondary.path)}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
