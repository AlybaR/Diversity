import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import {
  AlertTriangle,
  Archive,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  FolderOpen,
  Home,
  MessageSquare,
  Plus,
} from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { UTILISATEUR_COURANT } from '../../data/mockData';
import { useEcoles, useMessages, useRendezVous, useStatsParent } from '../../hooks';
import { BottomNav } from '../../components/BottomNav';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/LoadingState';

function PulseNumber({
  value,
  className,
  style,
}: {
  value: number;
  className?: string;
  style?: object;
}) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.Text className={className} style={[style, animatedStyle]}>
      {value}
    </Animated.Text>
  );
}

export default function ParentHomeScreen() {
  const insets = useSafeAreaInsets();
  // Données via hooks React Query (cache partagé entre écrans, prêt pour backend)
  const { data: ecoles, isLoading: ecolesLoading, error: ecolesError } = useEcoles();
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages({ visibleByRole: 'parent_admin' });
  const {
    data: rdvs,
    isLoading: rdvsLoading,
    error: rdvsError,
  } = useRendezVous({ visibleByRole: 'parent_admin' });
  const ecole = ecoles?.[0];
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useStatsParent(ecole?.id ?? '');
  const dernierMessage = messages?.[0];
  const prochainRdv = rdvs?.[0];
  const initials =
    `${UTILISATEUR_COURANT.prenom.charAt(0)}${UTILISATEUR_COURANT.nom.charAt(0)}`.toUpperCase();

  const isLoading = ecolesLoading || messagesLoading || rdvsLoading || statsLoading;
  // On agrège les erreurs en un seul ErrorBanner (premier non-null gagne)
  const error = ecolesError || messagesError || rdvsError || statsError;

  // Pendant le premier load (sans cache chaud), spinner plein écran. Une fois qu'on
  // a au moins l'école et les stats, on rend l'écran complet (les sections vides
  // affichent leur propre EmptyState).
  if (isLoading && !ecole) {
    return (
      <View className="flex-1 bg-slate-50">
        <LoadingState label="Chargement de l’accueil…" />
      </View>
    );
  }

  if (!ecole || !stats) {
    return (
      <View className="flex-1 bg-slate-50 p-4 justify-center">
        <ErrorBanner
          title="Données indisponibles"
          message={
            error?.message ?? 'Aucune école rattachée à votre compte. Contactez votre mairie.'
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header dégradé */}
      <LinearGradient
        colors={GRADIENTS.header as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-1 pb-5">
          <View className="flex-row items-center justify-between mb-1 gap-2">
            <View className="flex-1">
              <Text className="text-white font-bold text-lg leading-tight">{ecole.nom}</Text>
              <Text className="text-primary-200 text-xs mt-0.5">
                Année scolaire {ecole.anneeScolaire}
              </Text>
            </View>
            <Pressable
              onPress={() => router.replace('/')}
              hitSlop={6}
              className="w-9 h-9 rounded-full items-center justify-center border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Home color="white" size={16} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/parent/profile' as Href)}
              className="w-9 h-9 rounded-full items-center justify-center border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Text className="text-white text-sm font-bold">{initials}</Text>
            </Pressable>
          </View>
          <View
            className="self-start flex-row items-center gap-1.5 rounded-full px-3 py-1 border border-white/20 mt-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <View className="w-2 h-2 bg-emerald-400 rounded-full" />
            <Text className="text-white text-[11px] font-medium">Parent élu — Administrateur</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Contenu scrollable */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <ErrorBanner
            message={`Certaines sections ont échoué à se charger (${error.message}).`}
            className="mb-3"
          />
        )}

        {/* Alerte */}
        <View
          className="rounded-2xl p-4 mb-3 flex-row items-start gap-3 border"
          style={{ backgroundColor: '#fef3c7', borderColor: 'rgba(252, 211, 77, 0.6)' }}
        >
          <View className="w-10 h-10 bg-accent-100 rounded-xl items-center justify-center">
            <AlertTriangle color="#d97706" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-amber-800 font-semibold text-sm">
              {stats.enAttenteMairie} dossiers attendent une réponse
            </Text>
            <Text className="text-amber-600 text-xs mt-0.5">de la mairie</Text>
          </View>
        </View>

        {/* Sujets en cours */}
        <View
          className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          <Pressable
            onPress={() => router.push('/parent/dossiers')}
            className="flex-row items-center justify-between mb-3"
          >
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 bg-primary-50 rounded-lg items-center justify-center">
                <FolderOpen color="#2563eb" size={16} />
              </View>
              <Text className="font-bold text-sm text-slate-800">Sujets en cours</Text>
            </View>
            <ChevronRight color="#cbd5e1" size={16} />
          </Pressable>
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1 bg-primary-50 rounded-xl p-3 items-center">
              <Text className="text-2xl font-bold text-primary-600">{stats.dossiersOuverts}</Text>
              <Text className="text-[10px] text-primary-500 font-medium mt-0.5">
                Dossiers ouverts
              </Text>
            </View>
            <View className="flex-1 bg-danger-50 rounded-xl p-3 items-center">
              <PulseNumber
                value={stats.dossiersUrgents}
                className="text-2xl font-bold"
                style={{ color: '#ef4444' }}
              />
              <Text className="text-[10px] text-danger-500 font-medium mt-0.5">Dossier urgent</Text>
            </View>
          </View>
          <View className="bg-slate-50 rounded-xl p-2.5 flex-row items-center justify-between">
            <Text className="text-xs text-slate-500">
              {stats.enAttenteMairie} en attente de réponse
            </Text>
            <Pressable onPress={() => router.push('/parent/dossiers')}>
              <Text className="text-xs font-semibold text-primary-500">Voir les dossiers</Text>
            </Pressable>
          </View>
        </View>

        {/* Dernier message mairie */}
        <View
          className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 bg-primary-50 rounded-lg items-center justify-center">
              <MessageSquare color="#6366f1" size={16} />
            </View>
            <Text className="font-bold text-sm text-slate-800">Dernier message mairie</Text>
          </View>
          {dernierMessage ? (
            <View
              className="rounded-xl p-3.5 border"
              style={{ backgroundColor: '#eef2ff', borderColor: '#e0e7ff' }}
            >
              <Text className="text-sm font-semibold text-slate-800 mb-1">
                {dernierMessage.titre}
              </Text>
              <Text className="text-xs text-slate-500 mb-3">
                {dernierMessage.date} · {dernierMessage.expediteur}
              </Text>
              <Pressable
                onPress={() => router.push('/parent/messages')}
                className="bg-white px-3 py-1.5 rounded-lg border border-primary-100 self-start"
              >
                <Text className="text-xs font-semibold text-primary-600">Lire</Text>
              </Pressable>
            </View>
          ) : (
            <EmptyState
              icon={<MessageSquare color={COLORS.slate[400]} size={24} />}
              title="Aucun message"
              subtitle="La mairie n’a pas encore écrit. Vous serez notifié dès qu’un message arrive."
              className="py-6"
            />
          )}
        </View>

        {/* Prochain rendez-vous */}
        <View
          className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 bg-success-50 rounded-lg items-center justify-center">
              <CalendarDays color="#10b981" size={16} />
            </View>
            <Text className="font-bold text-sm text-slate-800">Prochain rendez-vous</Text>
          </View>
          {prochainRdv ? (
            <View
              className="rounded-xl p-3.5 border border-success-100"
              style={{ backgroundColor: '#ecfdf5' }}
            >
              <Text className="text-sm font-semibold text-slate-800 mb-2">{prochainRdv.titre}</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                <Badge label={`📅 ${prochainRdv.date}`} tone="emerald" />
                <Badge label={`🕕 ${prochainRdv.heure}`} tone="emerald" />
                <Badge label={`📍 ${prochainRdv.lieu}`} tone="emerald" />
              </View>
              <Pressable
                onPress={() => router.push('/parent/appointments')}
                className="bg-white px-3 py-1.5 rounded-lg border border-success-100 self-start"
              >
                <Text className="text-xs font-semibold text-success-600">Voir le rendez-vous</Text>
              </Pressable>
            </View>
          ) : (
            <EmptyState
              icon={<CalendarDays color={COLORS.slate[400]} size={24} />}
              title="Aucun rendez-vous planifié"
              subtitle="Vous pouvez en proposer un à la mairie depuis l’onglet Rendez-vous."
              cta={{ label: 'Proposer un RDV', onPress: () => router.push('/parent/appointments') }}
              className="py-6"
            />
          )}
        </View>

        {/* Historique rapide */}
        <View
          className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}
        >
          <View className="flex-row items-center gap-2 mb-3">
            <View
              className="w-8 h-8 rounded-lg items-center justify-center"
              style={{ backgroundColor: '#faf5ff' }}
            >
              <Archive color="#a855f7" size={16} />
            </View>
            <Text className="font-bold text-sm text-slate-800">Historique rapide</Text>
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            <View
              className="bg-slate-50 rounded-xl p-2.5 items-center"
              style={{ flex: 1, minWidth: '47%' }}
            >
              <Text className="text-lg font-bold text-slate-700">{stats.dossiersArchives}</Text>
              <Text className="text-[10px] text-slate-500">Dossiers archivés</Text>
            </View>
            <View
              className="bg-slate-50 rounded-xl p-2.5 items-center"
              style={{ flex: 1, minWidth: '47%' }}
            >
              <Text className="text-lg font-bold text-slate-700">{stats.rdvRealises}</Text>
              <Text className="text-[10px] text-slate-500">RDV réalisés</Text>
            </View>
            <View
              className="bg-slate-50 rounded-xl p-2.5 items-center"
              style={{ flex: 1, minWidth: '47%' }}
            >
              <Text className="text-lg font-bold text-slate-700">{stats.messagesMairie}</Text>
              <Text className="text-[10px] text-slate-500">Messages mairie</Text>
            </View>
            <Pressable
              onPress={() => router.push('/parent/historique' as Href)}
              className="bg-primary-50 rounded-xl p-2.5 items-center"
              style={{ flex: 1, minWidth: '47%' }}
            >
              <Text className="text-xs font-semibold text-primary-600">Consulter →</Text>
              <Text className="text-[10px] text-primary-400">l'historique</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* FABs */}
      <View className="absolute right-4" style={{ bottom: 90, gap: 12, zIndex: 40 }}>
        <Pressable
          onPress={() => router.push('/parent/appointments')}
          className="w-12 h-12 bg-success-500 rounded-2xl items-center justify-center"
          style={{
            shadowColor: '#10b981',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <CalendarPlus color="white" size={20} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/parent/new-request')}
          style={{
            shadowColor: '#2563eb',
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={GRADIENTS.primary as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus color="white" size={24} />
          </LinearGradient>
        </Pressable>
      </View>

      <BottomNav variant="parent" />
    </View>
  );
}
