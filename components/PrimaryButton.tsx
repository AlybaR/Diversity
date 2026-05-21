import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GRADIENTS } from '../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  disabled?: boolean;
  className?: string;
  /**
   * Texte lu par les lecteurs d'écran. Par défaut = `label`. À surcharger
   * quand le label visible est court mais ambigu (ex : "OK" sur une modale).
   */
  accessibilityLabel?: string;
  /** Hint additionnel (ex : « ouvre la liste des dossiers »). */
  accessibilityHint?: string;
}

export function PrimaryButton({
  label,
  onPress,
  iconLeft,
  iconRight,
  disabled = false,
  className = '',
  accessibilityLabel,
  accessibilityHint,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
      className={className}
    >
      <LinearGradient
        colors={GRADIENTS.primary as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 12,
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-center py-3.5 px-5 gap-2">
          {iconLeft}
          <Text className="text-white font-semibold text-base">{label}</Text>
          {iconRight}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
