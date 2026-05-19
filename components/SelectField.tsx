import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label?: string;
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  helper?: string;
  maxHeight?: number;
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Sélectionner…',
  helper,
  maxHeight = 220,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };

  const choose = (opt: SelectOption<T>) => {
    onChange(opt.value);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(false);
  };

  return (
    <View className="mb-1">
      {label && <Text className="text-sm font-semibold text-slate-700 mb-2">{label}</Text>}
      <Pressable
        onPress={toggle}
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <Text className={selected ? 'text-slate-800 text-base' : 'text-slate-400 text-base'}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown
          color="#94a3b8"
          size={18}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open && (
        <View
          className="bg-white border border-slate-200 rounded-xl mt-2 overflow-hidden"
          style={{
            shadowColor: '#0f172a',
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <ScrollView style={{ maxHeight }} nestedScrollEnabled>
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => choose(opt)}
                  className={`flex-row items-center justify-between px-4 py-3 border-b border-slate-100 ${active ? 'bg-primary-50' : ''}`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <Text
                    className={`text-sm ${active ? 'text-primary-700 font-semibold' : 'text-slate-700'}`}
                  >
                    {opt.label}
                  </Text>
                  {active && <Check color="#2563eb" size={16} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
      {helper && <Text className="text-xs text-slate-400 mt-1">{helper}</Text>}
    </View>
  );
}
