import { Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  tone?: 'primary' | 'success' | 'danger' | 'warning' | 'slate' | 'indigo' | 'emerald';
  className?: string;
}

const TONES: Record<NonNullable<BadgeProps['tone']>, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-600',
  danger: 'bg-danger-100 text-danger-600',
  warning: 'bg-warning-100 text-accent-400',
  slate: 'bg-slate-100 text-slate-600',
  indigo: 'bg-primary-50 text-primary-600',
  emerald: 'bg-success-100 text-success-600',
};

export function Badge({ label, tone = 'primary', className = '' }: BadgeProps) {
  const [bg, text] = TONES[tone].split(' ');
  return (
    <View className={`${bg} rounded-full px-2.5 py-0.5 ${className}`}>
      <Text className={`${text} text-[11px] font-semibold tracking-wide`}>{label}</Text>
    </View>
  );
}
