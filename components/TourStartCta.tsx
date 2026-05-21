/**
 * <TourStartCta /> — encart sur Welcome qui propose de démarrer la visite.
 *
 * Affiché uniquement :
 *   - en mode démo (`!USE_SUPABASE`)
 *   - si la visite n'a pas encore été faite (`!hasCompleted`)
 *   - si elle n'est pas déjà active (`!active`)
 *
 * Au clic : démarre la visite. La bulle <TourBubble /> (montée dans _layout)
 * prend le relais et guide l'utilisateur.
 */

import { Pressable, Text, View } from 'react-native';
import { PlayCircle, Sparkles } from 'lucide-react-native';
import { useGuidedTour } from '../hooks/useGuidedTour';
import { USE_SUPABASE } from '../services/_config';

export function TourStartCta() {
  const { active, hasCompleted, start, reset } = useGuidedTour();

  if (USE_SUPABASE) return null;

  // Visite déjà terminée : on propose un petit lien "Recommencer la visite"
  if (hasCompleted) {
    return (
      <Pressable
        onPress={() => {
          reset();
          start();
        }}
        hitSlop={6}
        className="flex-row items-center gap-1.5 self-center mb-3 px-3 py-1.5 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        <PlayCircle color="rgba(255,255,255,0.5)" size={12} />
        <Text className="text-white/50 text-[10px] font-medium">Relancer la visite guidée</Text>
      </Pressable>
    );
  }

  if (active) return null;

  return (
    <View
      className="rounded-2xl p-4 mb-3 border border-white/20"
      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: 'rgba(251,191,36,0.2)' }}
        >
          <Sparkles color="#fbbf24" size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-sm">Première visite ?</Text>
          <Text className="text-white/70 text-xs mt-1 leading-relaxed">
            Découvre Passerelle en 60 secondes — on te montre les points clés étape par étape.
          </Text>
        </View>
      </View>
      <Pressable
        onPress={start}
        className="mt-3 self-stretch flex-row items-center justify-center gap-2 py-2.5 rounded-xl"
        style={({ pressed }) => ({
          opacity: pressed ? 0.92 : 1,
          backgroundColor: 'rgba(251,191,36,0.95)',
        })}
      >
        <PlayCircle color="#78350f" size={16} />
        <Text className="text-amber-900 font-bold text-sm">Démarrer la visite</Text>
      </Pressable>
    </View>
  );
}
