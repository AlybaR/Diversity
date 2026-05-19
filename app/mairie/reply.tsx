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
import { STATUTS_DOSSIER } from '../../data/mockData';
import { useDossier, useDossiers } from '../../hooks';
import { scopeShortLabel, type StatutDossier, type VisibilityScope } from '../../types';

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
  // Scope local pour simuler le workflow de partage (mock — sans persistance backend).
  const [currentScope, setCurrentScope] = useState<VisibilityScope | null>(null);

  const effectiveScope: VisibilityScope =
    currentScope ?? dossier?.visibilityScope ?? 'parents_mairie';
  // On peut proposer le partage uniquement pour les dossiers privés (pas pour ceux déjà tripartites).
  const canProposeShare =
    effectiveScope === 'parents_mairie' || effectiveScope === 'direction_mairie';

  const isValid =
    reponse.trim().length >= 10 && nouveauStatut !== null && service !== null && delai !== null;

  if (!dossier) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 text-sm">Chargement…</Text>
      </View>
    );
  }

  const submit = () => {
    setSubmitted(true);
    if (!isValid) {
      Alert.alert('Réponse incomplète', 'Vérifie la réponse, le statut, le service et le délai.');
      return;
    }
    Alert.alert(
      'Réponse envoyée',
      `Les représentants de l'école seront notifiés${proposerRdv ? ' et une proposition de rendez-vous leur sera transmise' : ''}.`,
      [{ text: 'OK', onPress: () => router.replace('/mairie/dashboard') }],
    );
  };

  // Workflow de partage : la mairie propose au créateur du dossier de l'élargir
  // au canal tripartite (cas 3 du briefing produit). Validation requise par le créateur.
  // Choix retenu : « tout l'historique est partagé dès le partage » (option utilisateur).
  const proposeShare = () => {
    if (!canProposeShare) return;
    const targetParty = effectiveScope === 'parents_mairie' ? 'la direction' : 'les parents élus';
    const creatorParty =
      effectiveScope === 'parents_mairie' ? 'au parent administrateur' : 'à la direction';
    Alert.alert(
      'Proposer le partage',
      `Une demande de partage avec ${targetParty} sera envoyée ${creatorParty}. Si la proposition est acceptée, tout l'historique de ce dossier deviendra visible par ${targetParty} (commentaires et pièces jointes inclus).`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer la proposition',
          onPress: () => {
            setCurrentScope('partage_tripartite');
            Alert.alert(
              'Proposition envoyée',
              `${creatorParty.charAt(0).toUpperCase() + creatorParty.slice(1)} va valider ou refuser. L'historique du dossier conservera la trace de ce changement.`,
            );
          },
        },
      ],
    );
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
            <Badge label={scopeShortLabel(effectiveScope)} tone="indigo" />
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

        {canProposeShare && (
          <View className="mt-5 bg-white rounded-2xl p-4 border border-direction-100">
            <Text className="text-direction-700 font-semibold text-sm mb-1">
              Proposer le partage avec{' '}
              {effectiveScope === 'parents_mairie' ? 'la direction' : 'les parents'}
            </Text>
            <Text className="text-slate-500 text-xs leading-relaxed mb-3">
              Ce dossier est actuellement privé entre vous et le créateur. Vous pouvez proposer de
              l'élargir au canal tripartite. Le créateur devra valider la proposition.
            </Text>
            <Pressable
              onPress={proposeShare}
              className="bg-direction-50 border border-direction-200 rounded-xl py-2.5 px-4 self-start"
              style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
            >
              <Text className="text-direction-700 text-xs font-bold">
                Proposer le partage tripartite
              </Text>
            </Pressable>
          </View>
        )}

        {effectiveScope === 'partage_tripartite' && currentScope === 'partage_tripartite' && (
          <View className="mt-5 bg-success-50 rounded-2xl p-4 border border-success-100">
            <Text className="text-success-600 font-semibold text-sm">
              Proposition de partage envoyée
            </Text>
            <Text className="text-slate-600 text-xs leading-relaxed mt-1">
              En attente de validation du créateur. Une fois validée, l'historique complet sera
              visible par toutes les parties.
            </Text>
          </View>
        )}

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
