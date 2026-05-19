import { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface TextInputFieldProps extends TextInputProps {
  label?: string;
  helper?: string;
  monospace?: boolean;
}

export function TextInputField({
  label,
  helper,
  monospace = false,
  style,
  ...rest
}: TextInputFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="space-y-2">
      {label && <Text className="text-sm font-semibold text-slate-700 mb-1">{label}</Text>}
      <TextInput
        placeholderTextColor="#cbd5e1"
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          {
            backgroundColor: '#f8fafc',
            borderWidth: 1,
            borderColor: focused ? '#2563eb' : '#e2e8f0',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            color: '#1e293b',
            fontSize: monospace ? 18 : 15,
            letterSpacing: monospace ? 2 : 0,
            fontFamily: monospace ? 'monospace' : undefined,
          },
          style as object,
        ]}
      />
      {helper && <Text className="text-xs text-slate-400 mt-1">{helper}</Text>}
    </View>
  );
}
