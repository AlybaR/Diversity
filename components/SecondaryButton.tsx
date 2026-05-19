import { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  iconLeft?: ReactNode;
  variant?: 'outline' | 'ghost' | 'slate';
  className?: string;
}

export function SecondaryButton({
  label,
  onPress,
  iconLeft,
  variant = 'outline',
  className = '',
}: SecondaryButtonProps) {
  const variantClasses =
    variant === 'outline'
      ? 'bg-white border border-slate-200'
      : variant === 'ghost'
        ? 'bg-transparent'
        : 'bg-slate-100';

  const textColor = variant === 'ghost' ? 'text-slate-600' : 'text-slate-700';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      className={`${variantClasses} rounded-xl py-3.5 px-5 flex-row items-center justify-center gap-2 ${className}`}
    >
      {iconLeft}
      <Text className={`${textColor} font-semibold text-base`}>{label}</Text>
    </Pressable>
  );
}
