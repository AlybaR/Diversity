import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { GRADIENTS } from '../../constants/theme';
import { BottomNav } from '../../components/BottomNav';
import { TextInputField } from '../../components/TextInputField';
import { SelectField, type SelectOption } from '../../components/SelectField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Badge } from '../../components/Badge';
import { StatutBadge, UrgenceBadge } from '../../components/StatusBadge';
import { PERSONNES, STATUTS_DOSSIER } from '../../data/mockData';
import { useCreateMessage, useDossier, useDossiers, useUpdateDossierStatut } from '../../hooks';
import type { StatutDossier } from '../../types';

type Service =
  | 'voirie'
  | 'batiment'
  | 'restauration'
  | 'periscolaire'
  | 'education'
  | 'cabinet'
  | 'communication';

const SERVICES: SelectOption<Service>[] = [
  { value: 'voirie', label: 'Service Voirie' },
  { value: 'batiment', label: 'Service Bâtiment' },
  { value: 'restauration', label: 'Service Restauration' },
  { value: 'periscolaire', label: 'Service Périscolaire' },
  { value: 'education', label: 'Service Éducation' },
  { value: 'cabinet', label: 'Cabinet adjoint éducation' },
  { value: 'communication', label: 'Service Communication' },
];

const NEW_STATUTS: SelectOption<StatutDossier>[] = STATUTS_DOSSIER.filter((s) =>
  [
    'recu',
    'en_cours_analyse',
    'en_attente_information',
    'rdv_propose',
    'action_programmee',
    'resolu',
    'classe_sans_suite',
    'hors_competence',
  ].includes(s.value),
);

const DELAIS: SelectOption<string>[] = [
  { value: '7j', label: 'Sous 7 jours' },
  { value: '15j', label: 'Sous 2 semaines' },
  { value: '1m', label: 'Sous 1 mois' },
  { value: '3m', label: 'Sous 3 mois' },
  { value: '6m', label: 'Sous 6 mois' },
  { value: 'na', label: 'Non applicable' },
];

export default function MairieReplyScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  // Soit on cible un dossier précis via l'id de la query, soit fallback sur le 1er de la liste.
  const { data: specificDossier } = useDossier(id);
  const { data: allDossiers = [] } = useDossiers();
  const dossier = specificDossier ?? allDossiers[0];

  const [reponse, setReponse] = useState('');
  const [nouveauStatut, setNouveauStatut] = useState<StatutDossier | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [delai, setDelai] = useState<string | null>(null);
  const [actionPrevue, setActionPrevue] = useState('');
  const [proposerRdv, setProposerRdv] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const updateStatut = useUpdateDossierStatut();
  const createMessage = useCreateMessage();

  const isValid =
    reponse.trim().length >= 10 && nouveauStatut !== null && service !== null && delai !== null;

  if (!dossier) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 text-sm">Chargement…</Text>
      </View>
    );
  }

  const submit = async () => {
    setSubmitted(true);
    if (!isValid || !nouveauStatut) {
      Alert.alert('Réponse incomplète', 'Vérifie la réponse, le statut, le service et le délai.');
      return;
    }
    const mairieAgent = PERSONNES.find((p) => p.role === 'mairie_admin') ?? PERSONNES[0];
    try {
      await updateStatut.mutateAsync({
        dossierId: dossier.id,
        statut: nouveauStatut,
        acteurNom: `${mairieAgent.prenom} ${mairieAgent.nom}`,
        description: actionPrevue
          ? `Réponse mairie : ${actionPrevue}`
          : `Statut mis à jour (${nouveauStatut})`,
      });
      await createMessage.mutateAsync({
        titre: `Réponse : ${dossier.titre}`,
        contenu: reponse,
        expediteur: `${mairieAgent.prenom} ${mairieAgent.nom} — Mairie`,
        priorite: proposerRdv ? 'importante' : 'normale',
        visibilityScope: dossier.visibilityScope,
      });
      Alert.alert(
        'Réponse envoyée',
        `La réponse a été publiée dans le dossier${proposerRdv ? ' avec une proposition de rendez-vous' : ''}.`,
        [{ text: 'OK', onPress: () => router.replace('/mairie/dashboard') }],
      );
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Échec de l’envoi.');
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
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1 mb-3 self-start"
            hitSlop={8}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 text-sm">Retour</Text>
          </Pressable>
          <Text className="text-xl font-bold text-white">Répondre au dossier</Text>
          <Text className="text-teal-100 text-xs mt-1">Vue mairie — réponse structurée</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Récap dossier */}
        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-4">
          <Text className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2">
            Dossier concerné
          </Text>
          <Text className="text-slate-800 font-bold text-base mb-2">{dossier.titre}</Text>
          <View className="flex-row flex-wrap gap-2 mb-2">
            <Badge
              label={dossier.ecoleId.replace('ecole-', 'École ').replace('-', ' ')}
              tone="slate"
            />
            <StatutBadge statut={dossier.statut} />
            <UrgenceBadge urgence={dossier.urgence} />
          </View>
          <Text className="text-slate-600 text-xs leading-relaxed" numberOfLines={3}>
            {dossier.description}
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">Votre réponse</Text>
            <TextInputField
              placeholder="Bonjour, suite à votre signalement…"
              value={reponse}
              onChangeText={setReponse}
              multiline
              numberOfLines={6}
              style={{ minHeight: 130, textAlignVertical: 'top', fontSize: 14 }}
            />
            <Text className="text-xs text-slate-400 mt-1">{reponse.length} caractères</Text>
          </View>
          {submitted && reponse.trim().length < 10 && (
            <Text className="text-danger-500 text-xs -mt-3">Réponse trop courte</Text>
          )}

          <SelectField<StatutDossier>
            label="Nouveau statut à publier"
            value={nouveauStatut}
            onChange={setNouveauStatut}
            options={NEW_STATUTS}
            placeholder="Sélectionner le nouveau statut…"
          />
          {submitted && nouveauStatut === null && (
            <Text className="text-danger-500 text-xs -mt-3">Statut requis</Text>
          )}

          <SelectField<Service>
            label="Service concerné"
            value={service}
            onChange={setService}
            options={SERVICES}
          />
          {submitted && service === null && (
            <Text className="text-danger-500 text-xs -mt-3">Service requis</Text>
          )}

          <SelectField<string>
            label="Délai estimé"
            value={delai}
            onChange={setDelai}
            options={DELAIS}
          />
          {submitted && delai === null && (
            <Text className="text-danger-500 text-xs -mt-3">Délai requis</Text>
          )}

          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Action prévue (facultatif)
            </Text>
            <TextInputField
              placeholder="Ex : Repassage du marquage au sol semaine 24"
              value={actionPrevue}
              onChangeText={setActionPrevue}
              multiline
              numberOfLines={3}
              style={{ minHeight: 70, textAlignVertical: 'top', fontSize: 14 }}
            />
          </View>

          <View className="flex-row items-start gap-3 p-3 bg-white rounded-xl border border-slate-200">
            <Switch
              value={proposerRdv}
              onValueChange={setProposerRdv}
              trackColor={{ false: '#cbd5e1', true: '#5eead4' }}
              thumbColor={proposerRdv ? '#0d9488' : '#f8fafc'}
            />
            <View className="flex-1">
              <Text className="text-slate-700 text-sm font-semibold">Proposer un rendez-vous</Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Joint une proposition de créneaux aux représentants élus.
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6">
          <PrimaryButton
            label="Envoyer la réponse"
            onPress={submit}
            iconLeft={<Send color="white" size={18} />}
          />
        </View>

        <Text className="text-slate-400 text-xs text-center mt-4">
          Les représentants élus de l'école recevront une notification.
        </Text>
      </ScrollView>
      <BottomNav variant="mairie" />
    </View>
  );
}
