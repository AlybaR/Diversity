import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import {
  CalendarDays,
  ChevronRight,
  FolderOpen,
  MessageSquare,
  Plus,
  ShieldCheck,
} from 'lucide-react-native';
import { GRADIENTS } from '../../constants/theme';
import { BottomNav } from '../../components/BottomNav';
import { Badge } from '../../components/Badge';
import { ErrorBanner } from '../../components/ErrorBanner';
import { ECOLES, PERSONNES } from '../../data/mockData';
import { useDossiers, useMessages, useRendezVous } from '../../hooks';

const DIRECTION = PERSONNES.find((p) => p.role === 'direction');
const ECOLE_DIRECTION = ECOLES.find((e) => e.id === DIRECTION?.ecoleId) ?? ECOLES[0];

export default function DirectionHomeScreen() {
  const insets = useSafeAreaInsets();
  // La direction ne voit que les dossiers/messages/RDV dont le scope l'autorise.
  // Source : matrice canRoleSeeScope (direction voit 'direction_mairie' + 'partage_tripartite').
  const { data: dossiers = [], error: dossiersError } = useDossiers({
    ecoleId: ECOLE_DIRECTION.id,
    visibleByRole: 'direction',
  });
  const { data: messages = [], error: messagesError } = useMessages({ visibleByRole: 'direction' });
  const { data: rdvs = [], error: rdvsError } = useRendezVous({ visibleByRole: 'direction' });
  const error = dossiersError || messagesError || rdvsError;

  const directionNom = DIRECTION ? `${DIRECTION.prenom} ${DIRECTION.nom}` : 'Direction';
  const initials = DIRECTION
    ? `${DIRECTION.prenom.charAt(0)}${DIRECTION.nom.charAt(0)}`.toUpperCase()
    : 'D';
  const dossiersOuverts = dossiers.filter(
    (d) => d.statut !== 'resolu' && d.statut !== 'classe_sans_suite',
  ).length;
  const dossiersUrgents = dossiers.filter(
    (d) => d.urgence === 'elevee' && d.statut !== 'resolu',
  ).length;
  const messagesNonLus = messages.filter((m) => !m.lu).length;
  const dernierMessage = messages[0];
  // RDV où la direction figure dans les participants
  const rdvsDirection = rdvs.filter((r) =>
    DIRECTION
      ? r.participantsNoms.some(
          (n) => n.toLowerCase().includes(DIRECTION.nom.toLowerCase()) || n === directionNom,
        )
      : false,
  );
  const prochainRdv = rdvsDirection.find((r) => r.statut === 'confirme') ?? rdvsDirection[0];

  return (
    <View className="flex-1 bg-slate-50">
      <LinearGradient
        colors={GRADIENTS.direction as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-1 pb-5">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-1">
              <Text className="text-white font-bold text-lg leading-tight">
                {ECOLE_DIRECTION.nom}
              </Text>
              <Text className="text-indigo-100 text-xs mt-0.5">
                Année scolaire {ECOLE_DIRECTION.anneeScolaire}
              </Text>
            </View>
            <View
              className="w-9 h-9 rounded-full items-center justify-center border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Text className="text-white text-sm font-bold">{initials}</Text>
            </View>
          </View>
          <View
            className="self-start flex-row items-center gap-1.5 rounded-full px-3 py-1 border border-white/20 mt-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <View className="w-2 h-2 bg-indigo-300 rounded-full" />
            <Text className="text-white text-[11px] font-medium">
              Direction — {DIRECTION?.fonction ?? 'Directeur/Directrice'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <ErrorBanner
            message={`Certaines données n’ont pas pu être chargées (${error.message}).`}
            className="mb-3"
          />
        )}

        {/* Bandeau de confidentialité — rassure la direction sur l'isolation */}
        <View
          className="rounded-2xl p-4 mb-3 flex-row items-start gap-3 border"
          style={{ backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }}
        >
          <View className="w-10 h-10 bg-direction-100 rounded-xl items-center justify-center">
            <ShieldCheck color="#4f46e5" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-direction-700 font-semibold text-sm">
              Espace direction confidentiel
            </Text>
            <Text className="text-direction-600 text-xs mt-0.5 leading-relaxed">
              Vous ne voyez que les sujets institutionnels et messages mairie qui vous sont
              destinés. Les échanges parents ↔ mairie restent privés.
            </Text>
          </View>
        </View>

        {/* Sujets institutionnels */}
        <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
          <Pressable
            onPress={() => router.push('/direction/dossiers' as Href)}
            className="flex-row items-center justify-between mb-3"
          >
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 bg-direction-50 rounded-lg items-center justify-center">
                <FolderOpen color="#4f46e5" size={16} />
              </View>
              <Text className="font-bold text-sm text-slate-800">Sujets institutionnels</Text>
            </View>
            <ChevronRight color="#cbd5e1" size={16} />
          </Pressable>
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1 bg-direction-50 rounded-xl p-3 items-center">
              <Text className="text-2xl font-bold text-direction-600">{dossiersOuverts}</Text>
              <Text className="text-[10px] text-direction-500 font-medium mt-0.5">
                Sujets ouverts
              </Text>
            </View>
            <View className="flex-1 bg-danger-50 rounded-xl p-3 items-center">
              <Text className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                {dossiersUrgents}
              </Text>
              <Text className="text-[10px] text-danger-500 font-medium mt-0.5">Urgents</Text>
            </View>
          </View>
          <View className="bg-slate-50 rounded-xl p-2.5 flex-row items-center justify-between">
            <Text className="text-xs text-slate-500">{dossiers.length} sujets au total</Text>
            <Pressable onPress={() => router.push('/direction/dossiers' as Href)}>
              <Text className="text-xs font-semibold text-direction-600">Voir tous</Text>
            </Pressable>
          </View>
        </View>

        {/* Dernier message mairie */}
        {dernierMessage && (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row items-center justify-between gap-2 mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 bg-direction-50 rounded-lg items-center justify-center">
                  <MessageSquare color="#4f46e5" size={16} />
                </View>
                <Text className="font-bold text-sm text-slate-800">Messages mairie</Text>
              </View>
              {messagesNonLus > 0 && (
                <Badge
                  label={`${messagesNonLus} non lu${messagesNonLus > 1 ? 's' : ''}`}
                  tone="warning"
                />
              )}
            </View>
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
                onPress={() => router.push('/direction/messages' as Href)}
                className="bg-white px-3 py-1.5 rounded-lg border border-direction-100 self-start"
              >
                <Text className="text-xs font-semibold text-direction-600">Lire</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Prochain RDV */}
        {prochainRdv && (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 bg-success-50 rounded-lg items-center justify-center">
                <CalendarDays color="#10b981" size={16} />
              </View>
              <Text className="font-bold text-sm text-slate-800">Prochain rendez-vous</Text>
            </View>
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
                onPress={() => router.push('/direction/appointments' as Href)}
                className="bg-white px-3 py-1.5 rounded-lg border border-success-100 self-start"
              >
                <Text className="text-xs font-semibold text-success-600">Voir le rendez-vous</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB création sujet institutionnel */}
      <Pressable
        onPress={() => router.push('/direction/new-request' as Href)}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 90,
          shadowColor: '#4f46e5',
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={GRADIENTS.direction as unknown as [string, string, ...string[]]}
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

      <BottomNav variant="direction" />
    </View>
  );
}
