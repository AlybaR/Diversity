import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  FolderOpen,
  Home,
  Mail,
  School,
  Users,
} from 'lucide-react-native';
import { GRADIENTS } from '../../constants/theme';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { DossierCard } from '../../components/DossierCard';
import { AppointmentCard } from '../../components/AppointmentCard';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/LoadingState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { MAIRIE } from '../../data/mockData';
import { useDossiers, useRendezVous, useStatsMairie } from '../../hooks';

export default function MairieDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { data: stats, isLoading: statsLoading, error: statsError } = useStatsMairie(MAIRIE.id);
  const { data: dossiers = [], error: dossiersError } = useDossiers();
  const { data: rdvs = [], error: rdvsError } = useRendezVous();
  const aggregateError = statsError || dossiersError || rdvsError;

  if (statsLoading && !stats) {
    return (
      <View className="flex-1 bg-slate-50">
        <LoadingState label="Chargement du tableau de bord…" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View className="flex-1 bg-slate-50 p-4 justify-center">
        <ErrorBanner
          title="Tableau de bord indisponible"
          message={
            aggregateError?.message ?? 'Les statistiques de la mairie ne peuvent pas être chargées.'
          }
        />
      </View>
    );
  }

  const statCards: ActivityCardProps[] = [
    {
      label: 'Écoles',
      value: stats.nbEcoles,
      icon: <School color="#0d9488" size={18} />,
      iconBg: 'bg-mairie-50',
      valueColor: 'text-mairie-700',
    },
    {
      label: 'Représentants actifs',
      value: stats.representantsActifs,
      icon: <Users color="#2563eb" size={18} />,
      iconBg: 'bg-primary-50',
      valueColor: 'text-primary-600',
    },
    {
      label: 'Dossiers ouverts',
      value: stats.dossiersOuverts,
      icon: <FolderOpen color="#d97706" size={18} />,
      iconBg: 'bg-warning-50',
      valueColor: 'text-warning-600',
    },
    {
      label: 'Dossiers urgents',
      value: stats.dossiersUrgents,
      icon: <AlertTriangle color="#ef4444" size={18} />,
      iconBg: 'bg-danger-50',
      valueColor: 'text-danger-500',
    },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <LinearGradient
        colors={GRADIENTS.mairie as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-2 pb-5 flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">Tableau de bord</Text>
            <Text className="text-teal-100 text-sm mt-1">{MAIRIE.nom}</Text>
          </View>
          <Pressable
            onPress={() => router.replace('/')}
            hitSlop={6}
            className="w-9 h-9 rounded-full items-center justify-center border border-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Home color="white" size={16} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {aggregateError && (
          <ErrorBanner
            message={`Certaines données n’ont pas pu être chargées (${aggregateError.message}).`}
            className="mb-3"
          />
        )}

        {/* Section Activité — état du parc (compteurs d'instances) */}
        <View>
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide">
              Activité
            </Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {statCards.map((s) => (
              <ActivityCard key={s.label} {...s} onPress={() => router.push('/mairie/schools')} />
            ))}
          </View>
        </View>

        <Card className="mt-4">
          <Text className="text-slate-800 font-bold text-sm mb-2">Écoles à surveiller</Text>
          <Text className="text-slate-500 text-xs">
            {stats.ecolesASurveiller} écoles présentent un dossier urgent non traité depuis plus de
            7 jours.
          </Text>
        </Card>

        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={() => router.push('/mairie/schools')}
            className="flex-1 bg-white rounded-2xl p-4 border border-slate-100"
            style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
          >
            <Building2 color="#0d9488" size={20} />
            <Text className="text-slate-800 font-bold text-sm mt-2">Écoles</Text>
            <Text className="text-slate-400 text-xs mt-1">Fiches et dossiers liés</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/mairie/messages')}
            className="flex-1 bg-white rounded-2xl p-4 border border-slate-100"
            style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
          >
            <Mail color="#0d9488" size={20} />
            <Text className="text-slate-800 font-bold text-sm mt-2">Messages</Text>
            <Text className="text-slate-400 text-xs mt-1">Diffusions écoles</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push('/mairie/rendez-vous')}
          className="bg-white rounded-2xl p-4 border border-slate-100 mt-3 flex-row items-center gap-3"
          style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
        >
          <View className="w-10 h-10 bg-success-50 rounded-xl items-center justify-center">
            <CalendarDays color="#10b981" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-slate-800 font-bold text-sm">Rendez-vous mairie</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Demandes, confirmations et réunions liées aux dossiers.
            </Text>
          </View>
        </Pressable>

        <Text className="text-slate-700 font-bold text-sm mb-3 mt-5">Derniers dossiers</Text>
        {dossiers.slice(0, 3).map((d) => (
          <DossierCard
            key={d.id}
            dossier={d}
            onPress={() => router.push({ pathname: '/mairie/reply', params: { id: d.id } })}
          />
        ))}

        <Text className="text-slate-700 font-bold text-sm mb-3 mt-3">Prochains rendez-vous</Text>
        {rdvs.slice(0, 2).map((r) => (
          <AppointmentCard key={r.id} rdv={r} />
        ))}

        <View className="mt-5">
          <PrimaryButton
            label="Créer un message"
            iconLeft={<Mail color="white" size={18} />}
            onPress={() => router.push('/mairie/messages')}
          />
        </View>
      </ScrollView>
      <BottomNav variant="mairie" />
    </View>
  );
}

interface ActivityCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
  valueColor: string;
}

function ActivityCard({
  label,
  value,
  icon,
  iconBg,
  valueColor,
  onPress,
}: ActivityCardProps & { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-3 border border-slate-100"
      style={({ pressed }) => ({
        flex: 1,
        minWidth: '47%',
        opacity: pressed ? 0.86 : 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      })}
    >
      <View className={`${iconBg} w-8 h-8 rounded-xl items-center justify-center mb-2`}>
        {icon}
      </View>
      <Text className={`${valueColor} text-2xl font-bold`}>{value}</Text>
      <Text className="text-slate-500 text-[11px] font-medium mt-0.5">{label}</Text>
    </Pressable>
  );
}
