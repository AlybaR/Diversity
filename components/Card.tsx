import { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl p-4 border border-slate-100 ${className}`}
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
      {...rest}
    >
      {children}
    </View>
  );
}
