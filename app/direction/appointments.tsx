import { ScrollView, Text, View } from 'react-native';
import { Alert } from 'react-native';
import { CalendarPlus } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { AppointmentCard } from '../../components/AppointmentCard';
import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PERSONNES } from '../../data/mockData';
import { useRendezVous } from '../../hooks';

const DIRECTION = PERSONNES.find((p) => p.role === 'direction');

export default function DirectionAppointmentsScreen() {
  const { data: rdvs = [] } = useRendezVous({ visibleByRole: 'direction' });
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
          <View className="items-center py-12 bg-white rounded-2xl border border-slate-100">
            <Text className="text-slate-500 text-sm">Aucun rendez-vous en cours.</Text>
            <Text className="text-slate-400 text-xs mt-2 px-6 text-center leading-relaxed">
              Les rendez-vous concertés impliquant la direction (avec la mairie et les
              représentants) apparaîtront ici.
            </Text>
          </View>
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
