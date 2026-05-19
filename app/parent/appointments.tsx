import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarPlus, Send, X } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { AppointmentCard } from '../../components/AppointmentCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { SelectField, type SelectOption } from '../../components/SelectField';
import { TextInputField } from '../../components/TextInputField';
import { useDossiers, useRendezVous } from '../../hooks';

const CRENEAUX = ['Mercredi 27 mai · 17h30', 'Jeudi 28 mai · 18h00', 'Vendredi 29 mai · 08h30'];

export default function AppointmentsScreen() {
  const { data: rdvs = [] } = useRendezVous({ visibleByRole: 'parent_admin' });
  const { data: dossiers = [] } = useDossiers({ visibleByRole: 'parent_admin' });
  const [modalOpen, setModalOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [dossierId, setDossierId] = useState<string | null>(null);
  const [creneau, setCreneau] = useState(CRENEAUX[0]);
  const [precision, setPrecision] = useState('');

  const dossierOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'sans-dossier', label: 'Aucun dossier lié' },
      ...dossiers.map((dossier) => ({ value: dossier.id, label: dossier.titre })),
    ],
    [dossiers],
  );

  const aVenir = rdvs.filter((r) => r.statut === 'confirme');
  const demandes = rdvs.filter((r) => r.statut === 'demande' || r.statut === 'creneaux_proposes');

  const handleSubmit = () => {
    if (titre.trim().length < 5) {
      Alert.alert('Titre manquant', 'Donnez un objet clair à votre demande de rendez-vous.');
      return;
    }
    setModalOpen(false);
    setTitre('');
    setDossierId(null);
    setCreneau(CRENEAUX[0]);
    setPrecision('');
    Alert.alert(
      'Demande envoyée',
      'La mairie recevra la demande avec les créneaux proposés dès que le backend sera branché.',
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Rendez-vous" subtitle={`${rdvs.length} rendez-vous`} />
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

        <Text className="text-slate-700 font-bold text-sm mb-3 mt-2">Passés</Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100 items-center">
          <Text className="text-slate-400 text-xs">Aucun rendez-vous passé dans la démo.</Text>
        </View>

        <View className="mt-5">
          <PrimaryButton
            label="Demander un rendez-vous"
            iconLeft={<CalendarPlus color="white" size={18} />}
            onPress={() => setModalOpen(true)}
          />
        </View>
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-950/40">
          <View className="bg-white rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-800 font-bold text-lg">Demander un rendez-vous</Text>
                <Text className="text-slate-500 text-xs mt-0.5">
                  Proposez un créneau à la mairie
                </Text>
              </View>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X color="#475569" size={22} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <TextInputField
                  label="Objet"
                  placeholder="Ex : Point sécurité avant conseil d'école"
                  value={titre}
                  onChangeText={setTitre}
                />
                <SelectField<string>
                  label="Dossier lié"
                  value={dossierId}
                  onChange={setDossierId}
                  options={dossierOptions}
                  placeholder="Choisir un dossier..."
                  maxHeight={170}
                />

                <View>
                  <Text className="text-sm font-semibold text-slate-700 mb-2">Créneau préféré</Text>
                  <View className="gap-2">
                    {CRENEAUX.map((item) => {
                      const active = item === creneau;
                      return (
                        <Pressable
                          key={item}
                          onPress={() => setCreneau(item)}
                          className={`rounded-xl border px-4 py-3 ${
                            active
                              ? 'bg-primary-50 border-primary-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <Text
                            className={`text-sm font-semibold ${
                              active ? 'text-primary-700' : 'text-slate-600'
                            }`}
                          >
                            {item}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <TextInputField
                  label="Précisions"
                  placeholder="Participants souhaités, urgence, contexte..."
                  value={precision}
                  onChangeText={setPrecision}
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 96, textAlignVertical: 'top', fontSize: 14 }}
                />
              </View>

              <View className="gap-3 mt-5 pb-2">
                <PrimaryButton
                  label="Envoyer la demande"
                  iconLeft={<Send color="white" size={18} />}
                  onPress={handleSubmit}
                />
                <SecondaryButton
                  label="Annuler"
                  variant="ghost"
                  onPress={() => setModalOpen(false)}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <BottomNav variant="parent" />
    </View>
  );
}
