import { Pressable, Text, View } from 'react-native';
import type { Message } from '../types';
import { Badge } from './Badge';

interface MessageCardProps {
  message: Message;
  onPress?: () => void;
}

export function MessageCard({ message, onPress }: MessageCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      className="bg-white rounded-2xl p-4 border border-slate-100 mb-3"
    >
      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-row items-center gap-2 flex-1">
          {!message.lu && <View className="w-2 h-2 bg-primary-500 rounded-full" />}
          <Text className="text-slate-800 font-bold text-sm flex-1" numberOfLines={2}>
            {message.titre}
          </Text>
        </View>
        {message.priorite === 'importante' && <Badge label="Important" tone="warning" />}
        {message.priorite === 'urgente' && <Badge label="Urgent" tone="danger" />}
      </View>
      <Text className="text-slate-500 text-xs mb-2">
        {message.date} · {message.expediteur}
      </Text>
      <Text className="text-slate-600 text-xs leading-relaxed" numberOfLines={2}>
        {message.contenu}
      </Text>
    </Pressable>
  );
}
