import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { ChevronRight, HelpCircle, Shield, Sparkles } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { GRADIENTS } from '../constants/theme';
import { USE_SUPABASE } from '../services/_config';

// Routes des boutons "Je suis X" selon le mode (mock vs Supabase Auth).
// En mode mock : accès direct à la zone, pour que les tests E2E et le dev local
// continuent sans avoir besoin d'auth. En mode Supabase : passe par /sign-in.
const mairieRoute: Href = USE_SUPABASE
  ? ('/sign-in?role=mairie' as Href)
  : ('/mairie/dashboard' as Href);
const directionRoute: Href = USE_SUPABASE
  ? ('/sign-in?role=direction' as Href)
  : ('/direction/home' as Href);

// SVG inline pour matcher les icônes du web mockup (cohérence visuelle stricte)
function SchoolIcon({ size = 40, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M14 22v-4a2 2 0 1 0-4 0v4" />
      <Path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
      <Path d="M18 5v17" />
      <Path d="m4 6 8-4 8 4" />
      <Path d="M6 5v17" />
      <Circle cx={12} cy={9} r={2} />
    </Svg>
  );
}

function BuildingIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18" />
      <Path d="M9 22v-4h6v4" />
      <Path d="M8 6h.01" />
      <Path d="M16 6h.01" />
      <Path d="M12 6h.01" />
      <Path d="M12 10h.01" />
      <Path d="M12 14h.01" />
      <Path d="M16 10h.01" />
      <Path d="M16 14h.01" />
      <Path d="M8 10h.01" />
      <Path d="M8 14h.01" />
    </Svg>
  );
}

function GraduationIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.7)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <Path d="M22 10v6" />
      <Path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={GRADIENTS.header as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-8 items-center justify-center pt-12 pb-6 relative">
          {/* Décorations en fond */}
          <View
            style={{
              position: 'absolute',
              top: 80,
              right: -40,
              width: 160,
              height: 160,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 80,
            }}
            pointerEvents="none"
          />
          <View
            style={{
              position: 'absolute',
              bottom: 160,
              left: -64,
              width: 224,
              height: 224,
              backgroundColor: 'rgba(99,102,241,0.1)',
              borderRadius: 112,
            }}
            pointerEvents="none"
          />

          {/* Logo */}
          <View className="mb-6 relative items-center">
            <View
              className="w-20 h-20 rounded-2xl items-center justify-center border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <SchoolIcon size={40} color="#ffffff" />
            </View>
            <View
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: '#fbbf24' }}
            >
              <Sparkles size={12} color="#78350f" fill="#78350f" />
            </View>
          </View>

          {/* Nom de l'app */}
          <Text
            className="text-white font-bold mb-2 text-center"
            style={{ fontSize: 27, letterSpacing: -0.3 }}
          >
            Autour de l'École
          </Text>
          <Text
            className="text-primary-200 text-sm font-medium mb-8 text-center"
            style={{ maxWidth: 260, lineHeight: 20 }}
          >
            Le lien direct entre parents élus, écoles et mairie
          </Text>

          {/* Description glass-card */}
          <View
            className="rounded-2xl p-5 mb-8 border border-white/15"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', maxWidth: 320 }}
          >
            <Text className="text-white/85 text-[13px] leading-relaxed">
              Retrouvez l'historique de votre école, transmettez vos demandes collectives et
              échangez avec la mairie dans un espace sécurisé.
            </Text>
          </View>
        </View>

        {/* Boutons en bas */}
        <View className="px-6 pb-8 gap-3">
          <Pressable
            onPress={() => router.push('/join-school')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              backgroundColor: 'white',
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 4,
            })}
            className="flex-row items-center justify-between px-6 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-primary-100 rounded-xl items-center justify-center">
                <Shield color="#1d4ed8" size={20} />
              </View>
              <Text className="text-primary-700 font-semibold">J'ai une clé école</Text>
            </View>
            <ChevronRight color="#60a5fa" size={20} />
          </Pressable>

          <Pressable
            onPress={() => router.push(mairieRoute)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            })}
            className="flex-row items-center justify-between px-6 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <BuildingIcon size={20} />
              </View>
              <Text className="text-white font-semibold">Je suis une mairie</Text>
            </View>
            <ChevronRight color="rgba(255,255,255,0.5)" size={20} />
          </Pressable>

          <Pressable
            onPress={() => router.push(directionRoute)}
            style={({ pressed }) => ({
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            })}
            className="flex-row items-center justify-between px-6 py-4"
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <GraduationIcon size={20} />
              </View>
              <Text className="text-white font-semibold">Je suis une direction</Text>
            </View>
            <ChevronRight color="rgba(255,255,255,0.5)" size={20} />
          </Pressable>

          {/* Liens secondaires */}
          <View className="flex-row justify-center gap-6 pt-4 pb-2">
            <View className="flex-row items-center gap-1">
              <Sparkles size={12} color="rgba(255,255,255,0.6)" />
              <Text className="text-white/60 text-xs font-medium">Découvrir l'application</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <HelpCircle size={12} color="rgba(255,255,255,0.6)" />
              <Text className="text-white/60 text-xs font-medium">Besoin d'aide ?</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
