import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ShieldCheck, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { GRADIENTS } from '../constants/theme';
import { TextInputField } from '../components/TextInputField';
import { SelectField, type SelectOption } from '../components/SelectField';
import { PrimaryButton } from '../components/PrimaryButton';

type Role = 'admin' | 'contributeur';
type Association = 'fcpe' | 'peep' | 'apel' | 'independants' | 'autre';

const ROLES: SelectOption<Role>[] = [
  { value: 'admin', label: 'Parent élu — Administrateur' },
  { value: 'contributeur', label: 'Parent élu — Contributeur' },
];

const ASSOCIATIONS: SelectOption<Association>[] = [
  { value: 'fcpe', label: 'FCPE' },
  { value: 'peep', label: 'PEEP' },
  { value: 'apel', label: 'APEL' },
  { value: 'independants', label: 'Parents Indépendants' },
  { value: 'autre', label: 'Autre / liste libre' },
];

export default function CreateAccountScreen() {
  const insets = useSafeAreaInsets();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [association, setAssociation] = useState<Association | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [consentement, setConsentement] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid =
    prenom.trim().length > 1 &&
    nom.trim().length > 1 &&
    /^\S+@\S+\.\S+$/.test(email) &&
    association !== null &&
    role !== null &&
    consentement;

  const submit = () => {
    setSubmitted(true);
    if (!isValid) {
      Alert.alert(
        'Informations manquantes',
        'Vérifie le prénom, nom, email, association, rôle et le consentement.',
      );
      return;
    }
    router.replace('/parent/home');
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={GRADIENTS.header as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-2 pb-6">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1 mb-4 self-start"
            hitSlop={8}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 text-sm">Retour</Text>
          </Pressable>
          <Text className="text-xl font-bold text-white">Créer mon compte</Text>
          <Text className="text-primary-200 text-sm mt-1">Parent élu — école Jean Jaurès</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-primary-50 rounded-xl p-3 border border-primary-100 mb-5 flex-row items-start gap-2">
          <ShieldCheck color="#1d4ed8" size={18} style={{ marginTop: 2 }} />
          <Text className="text-primary-700 text-xs flex-1 leading-relaxed">
            Vos coordonnées ne sont partagées qu'avec les autres représentants de l'école et la
            mairie. Aucune diffusion publique.
          </Text>
        </View>

        <View className="gap-4">
          <TextInputField
            label="Prénom"
            placeholder="Nadia"
            value={prenom}
            onChangeText={setPrenom}
            autoCapitalize="words"
          />
          {submitted && prenom.trim().length < 2 && (
            <Text className="text-danger-500 text-xs -mt-3">Prénom requis</Text>
          )}

          <TextInputField
            label="Nom"
            placeholder="Benali"
            value={nom}
            onChangeText={setNom}
            autoCapitalize="words"
          />
          {submitted && nom.trim().length < 2 && (
            <Text className="text-danger-500 text-xs -mt-3">Nom requis</Text>
          )}

          <TextInputField
            label="Email"
            placeholder="prenom.nom@exemple.org"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          {submitted && !/^\S+@\S+\.\S+$/.test(email) && (
            <Text className="text-danger-500 text-xs -mt-3">Email invalide</Text>
          )}

          <TextInputField
            label="Téléphone (facultatif)"
            placeholder="06 12 34 56 78"
            value={telephone}
            onChangeText={setTelephone}
            keyboardType="phone-pad"
            helper="Ne sera visible que par les administrateurs de l'école."
          />

          <SelectField<Association>
            label="Association / liste"
            value={association}
            onChange={setAssociation}
            options={ASSOCIATIONS}
          />
          {submitted && association === null && (
            <Text className="text-danger-500 text-xs -mt-3">Association requise</Text>
          )}

          <SelectField<Role>
            label="Rôle demandé"
            value={role}
            onChange={setRole}
            options={ROLES}
            helper="Un administrateur d'école devra valider votre rôle."
          />
          {submitted && role === null && (
            <Text className="text-danger-500 text-xs -mt-3">Rôle requis</Text>
          )}

          <View className="flex-row items-start gap-3 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <Switch
              value={consentement}
              onValueChange={setConsentement}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={consentement ? '#2563eb' : '#f8fafc'}
            />
            <View className="flex-1">
              <Text className="text-slate-700 text-sm leading-relaxed">
                J'accepte que mes coordonnées soient partagées avec les représentants de l'école et
                la mairie dans le cadre de mon mandat.
              </Text>
              {submitted && !consentement && (
                <Text className="text-danger-500 text-xs mt-1">Consentement requis</Text>
              )}
            </View>
          </View>
        </View>

        <View className="mt-6">
          <PrimaryButton
            label="Créer mon compte"
            onPress={submit}
            iconLeft={<UserPlus color="white" size={18} />}
          />
        </View>

        <Text className="text-slate-400 text-xs text-center mt-4">
          En créant votre compte vous acceptez les conditions d'usage et la politique de
          confidentialité.
        </Text>
      </ScrollView>
    </View>
  );
}
