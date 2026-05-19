import { Pressable, Text, View } from 'react-native';
import { Clock, MessageCircle, Paperclip } from 'lucide-react-native';
import type { Dossier } from '../types';
import { CATEGORIES } from '../data/mockData';
import { StatutBadge, UrgenceBadge } from './StatusBadge';

interface DossierCardProps {
  dossier: Dossier;
  onPress?: () => void;
}

export function DossierCard({ dossier, onPress }: DossierCardProps) {
  const categorie = CATEGORIES.find((c) => c.value === dossier.categorie)?.label;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      className="bg-white rounded-2xl p-4 border border-slate-100 mb-3"
    >
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-slate-800 font-bold text-base flex-1 pr-2">{dossier.titre}</Text>
        <UrgenceBadge urgence={dossier.urgence} />
      </View>
      <View className="flex-row items-center gap-2 mb-3">
        <Text className="text-slate-500 text-xs">{categorie}</Text>
        <View className="w-1 h-1 rounded-full bg-slate-300" />
        <StatutBadge statut={dossier.statut} />
      </View>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Clock color="#94a3b8" size={12} />
          <Text className="text-slate-400 text-[11px]">Maj {dossier.derniereMaj}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          {dossier.nbPiecesJointes > 0 && (
            <View className="flex-row items-center gap-1">
              <Paperclip color="#94a3b8" size={12} />
              <Text className="text-slate-400 text-[11px]">{dossier.nbPiecesJointes}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <MessageCircle color="#94a3b8" size={12} />
            <Text className="text-slate-400 text-[11px]">{dossier.nbCommentaires}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
