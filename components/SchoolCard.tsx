import { Pressable, Text, View } from 'react-native';
import { Building2, MapPin } from 'lucide-react-native';
import type { Ecole } from '../types';

interface SchoolCardProps {
  ecole: Ecole;
  onPress?: () => void;
  dossiersOuverts?: number;
  dossiersUrgents?: number;
}

export function SchoolCard({ ecole, onPress, dossiersOuverts, dossiersUrgents }: SchoolCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      className="bg-white rounded-2xl p-4 border border-slate-100 mb-3"
    >
      <View className="flex-row items-start gap-3">
        <View className="w-12 h-12 bg-mairie-50 rounded-xl items-center justify-center">
          <Building2 color="#0d9488" size={22} />
        </View>
        <View className="flex-1">
          <Text className="text-slate-800 font-bold text-sm">{ecole.nom}</Text>
          <View className="flex-row items-center mt-1 gap-1">
            <MapPin color="#94a3b8" size={12} />
            <Text className="text-slate-500 text-xs">{ecole.adresse}</Text>
          </View>
          <Text className="text-slate-400 text-[11px] mt-1">Direction : {ecole.directionNom}</Text>
        </View>
      </View>
      {(dossiersOuverts !== undefined || dossiersUrgents !== undefined) && (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-slate-100">
          {dossiersOuverts !== undefined && (
            <View className="flex-1 bg-primary-50 rounded-xl p-2.5">
              <Text className="text-primary-600 font-bold text-base">{dossiersOuverts}</Text>
              <Text className="text-primary-500 text-[10px] font-medium">Dossiers ouverts</Text>
            </View>
          )}
          {dossiersUrgents !== undefined && dossiersUrgents > 0 && (
            <View className="flex-1 bg-danger-50 rounded-xl p-2.5">
              <Text className="text-danger-500 font-bold text-base">{dossiersUrgents}</Text>
              <Text className="text-danger-500 text-[10px] font-medium">Urgents</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
