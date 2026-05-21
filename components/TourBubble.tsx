/**
 * <TourBubble /> — bulle flottante de visite guidée.
 *
 * Monté globalement dans `app/_layout.tsx`. Visible uniquement si la visite
 * est `active`. Positionnée en bas-centre, au-dessus de la BottomNav.
 *
 * Design : carte blanche, ombre douce, accent orange-doré pour signaler
 * "élément de guidage" (différencie du contenu app).
 */

import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useGuidedTour } from '../hooks/useGuidedTour';

export function TourBubble() {
  const { active, currentStep, stepIndex, totalSteps, next, previous, skip, close } =
    useGuidedTour();

  if (!active || !currentStep) return null;

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 84, // au-dessus de la BottomNav (height ~80)
      }}
    >
      <View
        pointerEvents="auto"
        className="bg-white rounded-2xl border border-accent-100 w-full"
        style={{
          maxWidth: 420,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        {/* En-tête avec sparkle + close */}
        <View className="flex-row items-center justify-between gap-2 px-4 pt-3 pb-1">
          <View className="flex-row items-center gap-1.5">
            <Sparkles color={COLORS.accent[400]} size={12} />
            <Text className="text-accent-400 text-[10px] font-bold uppercase tracking-wider">
              Visite guidée · {stepIndex + 1}/{totalSteps}
            </Text>
          </View>
          <Pressable onPress={close} hitSlop={8}>
            <X color={COLORS.slate[400]} size={16} />
          </Pressable>
        </View>

        {/* Titre + description */}
        <View className="px-4 pb-3">
          <Text className="text-slate-800 font-bold text-sm">{currentStep.title}</Text>
          <Text className="text-slate-600 text-xs mt-1 leading-relaxed">
            {currentStep.description}
          </Text>
        </View>

        {/* Boutons */}
        <View className="flex-row items-center justify-between gap-2 px-3 pb-3">
          <View className="flex-row items-center gap-1.5">
            {!isFirstStep && (
              <Pressable
                onPress={previous}
                hitSlop={6}
                className="flex-row items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200"
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <ChevronLeft color={COLORS.slate[500]} size={14} />
                <Text className="text-slate-500 text-[11px] font-semibold">Précédent</Text>
              </Pressable>
            )}
            <Pressable onPress={skip} hitSlop={6} className="px-2 py-1.5">
              <Text className="text-slate-400 text-[11px] underline">Passer</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={next}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-100"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Text className="text-accent-400 text-xs font-bold">
              {currentStep.nextLabel ?? (isLastStep ? 'Terminer' : 'Suivant')}
            </Text>
            {!isLastStep && <ChevronRight color={COLORS.accent[400]} size={14} />}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
