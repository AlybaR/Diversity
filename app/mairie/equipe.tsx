/**
 * /mairie/equipe — annuaire interne de la mairie + ajout d'agents et d'élus.
 *
 * Page créée pour la démo : permet d'ajouter en direct un agent service
 * éducation ou un élu adjoint au cabinet. La personne apparait immédiatement
 * dans le sélecteur de mode démo et dans les listes filtrées par rôle.
 */

import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Building2, Home, Send, UserPlus, X } from 'lucide-react-native';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { SelectField, type SelectOption } from '../../components/SelectField';
import { TextInputField } from '../../components/TextInputField';
import { GRADIENTS } from '../../constants/theme';
import { MAIRIE } from '../../data/mockData';
import { useCreatePersonne, usePersonnes } from '../../hooks';
import type { Role } from '../../types';

type MairieRole = 'mairie_admin' | 'elu';

const ROLE_OPTIONS: SelectOption<MairieRole>[] = [
  { value: 'mairie_admin', label: 'Agent — Service éducation' },
  { value: 'elu', label: 'Élu — Cabinet adjoint éducation' },
];

const ROLE_BADGE_LABEL: Record<MairieRole, string> = {
  mairie_admin: 'Agent',
  elu: 'Élu',
};

export default function MairieEquipeScreen() {
  const insets = useSafeAreaInsets();
  const { data: personnes = [] } = usePersonnes();
  const createPersonne = useCreatePersonne();

  // On filtre uniquement les agents + élus de la mairie
  const equipe = personnes.filter((p) => p.role === 'mairie_admin' || p.role === 'elu');

  const [modalOpen, setModalOpen] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MairieRole | null>('mairie_admin');
  const [fonction, setFonction] = useState('');

  const handleCreate = async () => {
    if (prenom.trim().length < 2 || nom.trim().length < 2 || !email.includes('@') || !role) {
      Alert.alert(
        'Informations manquantes',
        'Renseigne au minimum prénom, nom, email et type de poste.',
      );
      return;
    }
    try {
      await createPersonne.mutateAsync({
        prenom,
        nom,
        email,
        role: role as Role,
        fonction: fonction || undefined,
        service: role === 'mairie_admin' ? 'Service éducation' : 'Cabinet adjoint éducation',
      });
      setModalOpen(false);
      setPrenom('');
      setNom('');
      setEmail('');
      setFonction('');
      setRole('mairie_admin');
      Alert.alert(
        'Personne ajoutée',
        `${prenom} ${nom} fait maintenant partie de l'équipe ${MAIRIE.nom}. Tu peux changer de personnage pour te connecter sous cette identité.`,
      );
    } catch (err) {
      Alert.alert(
        'Erreur',
        err instanceof Error ? err.message : "Impossible d'ajouter la personne.",
      );
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
        <View className="px-5 pt-2 pb-5 flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">Équipe mairie</Text>
            <Text className="text-teal-100 text-xs mt-1">
              {equipe.length} agent{equipe.length > 1 ? 's' : ''} & élu
              {equipe.filter((p) => p.role === 'elu').length > 1 ? 's' : ''}
            </Text>
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

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-100">
          <View className="flex-row items-center gap-2 mb-1">
            <Building2 color="#0d9488" size={16} />
            <Text className="text-slate-700 font-bold text-sm">Membres de l’équipe</Text>
          </View>
          <Text className="text-slate-500 text-xs leading-relaxed">
            Agents du service éducation et élus du cabinet. Pour ajouter quelqu’un, utilise le
            bouton ci-dessous — la personne apparait immédiatement.
          </Text>
        </View>

        {equipe.map((p) => (
          <View
            key={p.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 mb-3 flex-row items-center gap-3"
          >
            <View className="w-11 h-11 bg-mairie-50 rounded-xl items-center justify-center">
              <Text className="text-mairie-700 font-bold text-sm">
                {p.prenom.charAt(0)}
                {p.nom.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-sm">
                {p.prenom} {p.nom}
              </Text>
              {p.fonction && <Text className="text-slate-500 text-xs mt-0.5">{p.fonction}</Text>}
              <Text className="text-slate-400 text-[11px] mt-0.5">{p.email}</Text>
            </View>
            <Badge
              label={ROLE_BADGE_LABEL[p.role as MairieRole]}
              tone={p.role === 'elu' ? 'warning' : 'emerald'}
            />
          </View>
        ))}

        <View className="mt-3">
          <SecondaryButton
            label="Ajouter un agent ou un élu"
            iconLeft={<UserPlus color="#334155" size={18} />}
            onPress={() => setModalOpen(true)}
          />
        </View>

        <Text className="text-slate-400 text-xs text-center mt-4 px-6 leading-relaxed">
          Les membres ajoutés ici peuvent se connecter et accéder aux dossiers selon leur rôle
          (agent ou élu). En production, l’invitation passera par email.
        </Text>
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-950/40">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-800 font-bold text-lg">Ajouter à l’équipe</Text>
                <Text className="text-slate-500 text-xs mt-0.5">{MAIRIE.nom}</Text>
              </View>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X color="#475569" size={22} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View className="gap-4">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextInputField
                      label="Prénom"
                      placeholder="Sophie"
                      value={prenom}
                      onChangeText={setPrenom}
                    />
                  </View>
                  <View className="flex-1">
                    <TextInputField
                      label="Nom"
                      placeholder="Bernard"
                      value={nom}
                      onChangeText={setNom}
                    />
                  </View>
                </View>
                <TextInputField
                  label="Email"
                  placeholder="prenom.nom@montreuil-sur-seine.fr"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <SelectField<MairieRole>
                  label="Type de poste"
                  value={role}
                  onChange={setRole}
                  options={ROLE_OPTIONS}
                  placeholder="Choisir le poste..."
                />
                <TextInputField
                  label="Fonction (facultatif)"
                  placeholder="Ex : Référente écoles élémentaires"
                  value={fonction}
                  onChangeText={setFonction}
                />
              </View>

              <View className="gap-3 mt-5 pb-2">
                <PrimaryButton
                  label="Confirmer l’ajout"
                  iconLeft={<Send color="white" size={18} />}
                  onPress={handleCreate}
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

      <BottomNav variant="mairie" />
    </View>
  );
}
