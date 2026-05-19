import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FolderOpen,
  Mail,
  School,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import { GRADIENTS } from '../../constants/theme';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { DossierCard } from '../../components/DossierCard';
import { AppointmentCard } from '../../components/AppointmentCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { MAIRIE } from '../../data/mockData';
import { useDossiers, useRendezVous, useStatsMairie } from '../../hooks';

export default function MairieDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { data: stats } = useStatsMairie(MAIRIE.id);
  const { data: dossiers = [] } = useDossiers();
  const { data: rdvs = [] } = useRendezVous();

  if (!stats) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 text-sm">Chargement...</Text>
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
        <View className="px-5 pt-2 pb-5">
          <Text className="text-white font-bold text-lg">Tableau de bord</Text>
          <Text className="text-teal-100 text-sm mt-1">{MAIRIE.nom}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Section Performance ce mois — qualité (délai) + débit (dossiers traités) */}
        <View className="mt-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide">
              Performance ce mois
            </Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            <PerformanceCard
              icon={<Clock color="#0d9488" size={18} />}
              label="Délai moyen de réponse"
              value={`${stats.delaiMoyenJours.toLocaleString('fr-FR')} j`}
              delta={stats.deltaDelaiJours}
              deltaUnit="j"
              positiveWhenNegative
            />
            <PerformanceCard
              icon={<CheckCircle2 color="#0d9488" size={18} />}
              label="Dossiers traités"
              value={String(stats.dossiersTraitesMois)}
              delta={stats.deltaDossiersTraitesMois}
              deltaUnit=""
            />
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

interface PerformanceCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: number;
  deltaUnit: string;
  // Pour le délai, une variation négative est une amélioration (on répond plus vite).
  // Pour les dossiers traités, une variation positive est une amélioration (on traite plus).
  positiveWhenNegative?: boolean;
}

function PerformanceCard({
  icon,
  label,
  value,
  delta,
  deltaUnit,
  positiveWhenNegative = false,
}: PerformanceCardProps) {
  const isPositive = positiveWhenNegative ? delta < 0 : delta > 0;
  const deltaLabel = `${delta > 0 ? '+' : ''}${delta.toLocaleString('fr-FR')}${deltaUnit}`;
  const trendColor = isPositive ? '#059669' : '#d97706';
  const trendBg = isPositive ? '#ecfdf5' : '#fffbeb';
  const TrendIcon = isPositive
    ? positiveWhenNegative
      ? TrendingDown
      : TrendingUp
    : positiveWhenNegative
      ? TrendingUp
      : TrendingDown;

  return (
    <View
      className="flex-1 bg-white rounded-2xl p-4 border border-slate-100"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="w-9 h-9 bg-mairie-50 rounded-xl items-center justify-center">{icon}</View>
        <View
          className="flex-row items-center gap-1 rounded-full px-2 py-1"
          style={{ backgroundColor: trendBg }}
        >
          <TrendIcon color={trendColor} size={12} />
          <Text className="text-[10px] font-bold" style={{ color: trendColor }}>
            {deltaLabel}
          </Text>
        </View>
      </View>
      <Text className="text-slate-800 text-2xl font-bold">{value}</Text>
      <Text className="text-slate-500 text-[11px] mt-1 leading-snug">{label}</Text>
    </View>
  );
}
