/**
 * /mairie/rendez-vous — agenda mairie.
 *
 * Liste tous les rendez-vous visibles par la mairie (filtrés par visibleByRole
 * côté service). Sections : À traiter (demandes), Confirmés, Passés.
 *
 * Pour le MVP, le bouton « Confirmer » sur une demande passe le statut à
 * `confirme`. Pas d'écran de proposition de créneaux dédié (Phase 5).
 */

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, Check } from 'lucide-react-native';
import { AppointmentCard } from '../../components/AppointmentCard';
import { BottomNav } from '../../components/BottomNav';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/LoadingState';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { useRendezVous, useUpdateRendezVousStatut } from '../../hooks';

export default function MairieRendezVousScreen() {
  const insets = useSafeAreaInsets();
  const {
    data: rdvs = [],
    isLoading,
    error,
    refetch,
  } = useRendezVous({ visibleByRole: 'mairie_admin' });
  const update = useUpdateRendezVousStatut();

  const aTraiter = rdvs.filter((r) => r.statut === 'demande' || r.statut === 'creneaux_proposes');
  const confirmes = rdvs.filter((r) => r.statut === 'confirme');
  const passes = rdvs.filter((r) => r.statut === 'passe');

  const handleConfirmer = async (id: string, titre: string) => {
    try {
      await update.mutateAsync({ id, statut: 'confirme' });
      Alert.alert('Rendez-vous confirmé', `« ${titre} » est confirmé.`);
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Échec de la confirmation.');
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <LinearGradient
        colors={GRADIENTS.mairie as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-2 pb-5">
          <Text className="text-xl font-bold text-white">Rendez-vous</Text>
          <Text className="text-teal-100 text-xs mt-1">{rdvs.length} rendez-vous au total</Text>
        </View>
      </LinearGradient>

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
        ) : rdvs.length === 0 ? (
          <View className="bg-white rounded-2xl border border-slate-100">
            <EmptyState
              icon={<CalendarDays color={COLORS.slate[400]} size={28} />}
              title="Aucun rendez-vous"
              subtitle="Les demandes de rendez-vous des parents élus et de la direction apparaîtront ici."
            />
          </View>
        ) : (
          <>
            {aTraiter.length > 0 && (
              <>
                <Text className="text-slate-700 font-bold text-sm mb-3">À traiter</Text>
                {aTraiter.map((r) => (
                  <View key={r.id} className="mb-2">
                    <AppointmentCard rdv={r} />
                    <Pressable
                      onPress={() => handleConfirmer(r.id, r.titre)}
                      className="flex-row items-center justify-center gap-2 mt-2 py-2 rounded-xl bg-mairie-50 border border-mairie-100 self-end px-4"
                      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    >
                      <Check color={COLORS.mairie[700]} size={14} />
                      <Text className="text-mairie-700 text-xs font-semibold">
                        Confirmer ce créneau
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            {confirmes.length > 0 && (
              <>
                <Text className="text-slate-700 font-bold text-sm mb-3 mt-4">Confirmés</Text>
                {confirmes.map((r) => (
                  <AppointmentCard key={r.id} rdv={r} />
                ))}
              </>
            )}

            {passes.length > 0 && (
              <>
                <Text className="text-slate-700 font-bold text-sm mb-3 mt-4">Passés</Text>
                {passes.map((r) => (
                  <AppointmentCard key={r.id} rdv={r} />
                ))}
              </>
            )}
          </>
        )}

        <Text className="text-slate-400 text-xs text-center mt-6 px-6 leading-relaxed">
          La proposition de créneaux alternatifs et le compte-rendu de réunion arriveront en Phase
          5.
        </Text>
      </ScrollView>
      <BottomNav variant="mairie" />
    </View>
  );
}
