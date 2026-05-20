import { ScrollView, Text, View } from 'react-native';
import { Alert } from 'react-native';
import { CalendarDays, CalendarPlus } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppointmentCard } from '../../components/AppointmentCard';
import { BottomNav } from '../../components/BottomNav';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/LoadingState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS } from '../../constants/theme';
import { PERSONNES } from '../../data/mockData';
import { useRendezVous } from '../../hooks';

const DIRECTION = PERSONNES.find((p) => p.role === 'direction');

export default function DirectionAppointmentsScreen() {
  const {
    data: rdvs = [],
    isLoading,
    error,
    refetch,
  } = useRendezVous({ visibleByRole: 'direction' });
  // Direction ne voit que les RDV où elle figure parmi les participants.
  const rdvsDirection = DIRECTION
    ? rdvs.filter((r) =>
        r.participantsNoms.some((n) => n.toLowerCase().includes(DIRECTION.nom.toLowerCase())),
      )
    : [];

  const aVenir = rdvsDirection.filter((r) => r.statut === 'confirme');
  const demandes = rdvsDirection.filter(
    (r) => r.statut === 'demande' || r.statut === 'creneaux_proposes',
  );

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader
        title="Rendez-vous"
        subtitle={`${rdvsDirection.length} rendez-vous où je suis attendu(e)`}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {error && (
          <ErrorBanner
            message={`Impossible de charger les rendez-vous (${error.message}).`}
            onRetry={() => refetch()}
            className="mb-3"
          />
        )}

        {isLoading ? (
          <LoadingState label="Chargement des rendez-vous…" />
        ) : (
          <>
            {aVenir.length > 0 && (
              <>
                <Text className="text-slate-700 font-bold text-sm mb-3">À venir</Text>
                {aVenir.map((r) => (
                  <AppointmentCard key={r.id} rdv={r} />
                ))}
              </>
            )}

            {demandes.length > 0 && (
              <>
                <Text className="text-slate-700 font-bold text-sm mb-3 mt-2">Demandés</Text>
                {demandes.map((r) => (
                  <AppointmentCard key={r.id} rdv={r} />
                ))}
              </>
            )}

            {rdvsDirection.length === 0 && (
              <View className="bg-white rounded-2xl border border-slate-100">
                <EmptyState
                  icon={<CalendarDays color={COLORS.slate[400]} size={28} />}
                  title="Aucun rendez-vous en cours"
                  subtitle="Les rendez-vous concertés impliquant la direction (avec la mairie et les représentants) apparaîtront ici."
                />
              </View>
            )}
          </>
        )}

        <View className="mt-5">
          <PrimaryButton
            label="Proposer un rendez-vous"
            iconLeft={<CalendarPlus color="white" size={18} />}
            onPress={() =>
              Alert.alert(
                'Proposer un rendez-vous',
                'Cette fonctionnalité ouvrira le composer de demande lorsque le backend de planning sera connecté.',
              )
            }
          />
        </View>
      </ScrollView>
      <BottomNav variant="direction" />
    </View>
  );
}
