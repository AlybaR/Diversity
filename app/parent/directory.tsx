import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import {
  Building2,
  History,
  KeyRound,
  Link,
  Mail,
  Phone,
  Send,
  UserPlus,
  X,
} from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { RepresentativeCard } from '../../components/RepresentativeCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextInputField } from '../../components/TextInputField';
import { ANCIENS_ADMINS, CATEGORIES, CONTACTS_MAIRIE, ECOLES } from '../../data/mockData';
import { useCreatePersonne, usePersonnes } from '../../hooks';
import type { ContactMairie } from '../../types';

type DirectoryTab = 'parents' | 'mairie' | 'anciens';

const TABS: { id: DirectoryTab; label: string; detail: string }[] = [
  { id: 'parents', label: 'Parents élus', detail: 'Représentants actifs' },
  { id: 'mairie', label: 'Contacts mairie', detail: 'Services et référents' },
  { id: 'anciens', label: 'Anciens admins', detail: 'Présidents/admins sortants' },
];

function categoryLabel(value: ContactMairie['categoriesLiees'][number]) {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

function MairieContactCard({ contact }: { contact: ContactMairie }) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-slate-800 font-bold text-sm">{contact.nom}</Text>
          <Text className="text-slate-500 text-xs mt-0.5">{contact.fonction}</Text>
        </View>
        <Badge label={contact.service} tone="emerald" />
      </View>

      <Text className="text-slate-600 text-xs leading-relaxed mt-3">{contact.perimetre}</Text>

      <View className="gap-2 mt-3 pt-3 border-t border-slate-100">
        <View className="flex-row items-center gap-2">
          <Mail color="#94a3b8" size={13} />
          <Text className="text-slate-500 text-xs flex-1">{contact.email}</Text>
        </View>
        {contact.telephone && (
          <View className="flex-row items-center gap-2">
            <Phone color="#94a3b8" size={13} />
            <Text className="text-slate-500 text-xs">{contact.telephone}</Text>
          </View>
        )}
      </View>

      <View className="flex-row flex-wrap mt-3" style={{ gap: 6 }}>
        {contact.categoriesLiees.map((category) => (
          <Badge key={category} label={categoryLabel(category)} tone="slate" />
        ))}
      </View>
    </View>
  );
}

export default function DirectoryScreen() {
  const { data: representants = [] } = usePersonnes({ representantsOnly: true });
  const createPersonne = useCreatePersonne();
  const [activeTab, setActiveTab] = useState<DirectoryTab>('parents');
  const [modalOpen, setModalOpen] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const ecole = ECOLES[0];
  const representantsActifs = representants.filter((personne) => personne.actif);

  const handleGenerate = () => {
    if (prenom.trim().length < 2 || nom.trim().length < 2 || !email.includes('@')) {
      Alert.alert('Invitation incomplète', 'Renseigne au minimum prénom, nom et adresse email.');
      return;
    }
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    setInvitationLink(`https://passerelle-demo.pages.dev/invitation/JAURES-${token}`);
  };

  const handleSend = async () => {
    if (!invitationLink) {
      handleGenerate();
      return;
    }
    try {
      await createPersonne.mutateAsync({
        prenom,
        nom,
        email,
        role: 'parent_contributeur',
        ecoleId: ecole.id,
        association: 'Parents Indépendants',
      });
      setModalOpen(false);
      setPrenom('');
      setNom('');
      setEmail('');
      setInvitationLink('');
      Alert.alert(
        'Invitation envoyée',
        `${prenom} ${nom} a été ajouté à l'annuaire de ${ecole.nom}. La personne apparaît immédiatement dans la liste des représentants et dans le sélecteur de mode démo.`,
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
      <AppHeader
        title="Annuaire"
        subtitle={`${representantsActifs.length} parents élus · ${CONTACTS_MAIRIE.length} contacts mairie`}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl p-3 mb-4 border border-slate-100">
          <View className="flex-row" style={{ gap: 6 }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-xl border px-2.5 py-2.5 ${
                    active ? 'bg-primary-50 border-primary-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold text-center ${
                      active ? 'text-primary-700' : 'text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </Text>
                  <Text
                    className={`text-[9px] text-center mt-0.5 ${
                      active ? 'text-primary-500' : 'text-slate-400'
                    }`}
                    numberOfLines={1}
                  >
                    {tab.detail}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {activeTab === 'parents' && (
          <>
            <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-100">
              <View className="flex-row items-center gap-2 mb-1">
                <UserPlus color="#2563eb" size={16} />
                <Text className="text-slate-700 font-bold text-sm">Représentants actifs</Text>
              </View>
              <Text className="text-slate-500 text-xs leading-relaxed">
                Les personnes visibles ici sont les parents élus rattachés à votre école pour
                l'année en cours.
              </Text>
            </View>

            {representantsActifs.map((personne) => (
              <RepresentativeCard key={personne.id} personne={personne} />
            ))}
          </>
        )}

        {activeTab === 'mairie' && (
          <>
            <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-100">
              <View className="flex-row items-center gap-2 mb-1">
                <Building2 color="#0d9488" size={16} />
                <Text className="text-slate-700 font-bold text-sm">Bons interlocuteurs mairie</Text>
              </View>
              <Text className="text-slate-500 text-xs leading-relaxed">
                Les contacts servent à orienter un dossier, préparer un message ou identifier le bon
                service avant un rendez-vous.
              </Text>
            </View>

            {CONTACTS_MAIRIE.map((contact) => (
              <MairieContactCard key={contact.id} contact={contact} />
            ))}
          </>
        )}

        {activeTab === 'anciens' && (
          <>
            <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-100">
              <View className="flex-row items-center gap-2 mb-1">
                <History color="#64748b" size={16} />
                <Text className="text-slate-700 font-bold text-sm">Anciens présidents/admins</Text>
              </View>
              <Text className="text-slate-500 text-xs leading-relaxed">
                Seuls les anciens responsables de mandat sont conservés ici. Les anciens
                contributeurs ne sont pas affichés.
              </Text>
            </View>

            {ANCIENS_ADMINS.map((admin) => (
              <View
                key={admin.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 mb-3"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-slate-800 font-bold text-sm">{admin.nom}</Text>
                    <Text className="text-slate-500 text-xs mt-0.5">
                      {admin.fonction}
                      {admin.association ? ` · ${admin.association}` : ''}
                    </Text>
                  </View>
                  <Badge label={admin.annees} tone="slate" />
                </View>
                {admin.note && (
                  <Text className="text-slate-500 text-xs leading-relaxed mt-3">{admin.note}</Text>
                )}
              </View>
            ))}
          </>
        )}

        <View className="bg-white rounded-2xl p-4 mt-2 border border-slate-100">
          <View className="flex-row items-start justify-between gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-sm">Actions admin annuaire</Text>
              <Text className="text-slate-500 text-xs mt-0.5">
                Gestion légère, sans écran séparé dans le parcours principal.
              </Text>
            </View>
            <KeyRound color="#2563eb" size={18} />
          </View>

          <View className="rounded-xl bg-primary-50 border border-primary-100 p-3 mb-3">
            <Text className="text-primary-700 text-xs font-semibold mb-1">Clé école</Text>
            <Text className="text-primary-700 font-mono font-bold">{ecole.cle}</Text>
          </View>

          <View className="gap-3">
            <SecondaryButton
              label="Inviter un représentant"
              iconLeft={<UserPlus color="#334155" size={18} />}
              onPress={() => setModalOpen(true)}
            />
            <SecondaryButton
              label="Signaler une fiche à corriger"
              variant="ghost"
              onPress={() =>
                Alert.alert(
                  'Correction annuaire',
                  'Dans la version connectée, cette action ouvrira une demande de correction liée à la fiche.',
                )
              }
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-950/40">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-800 font-bold text-lg">Inviter un représentant</Text>
                <Text className="text-slate-500 text-xs mt-0.5">{ecole.nom}</Text>
              </View>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X color="#475569" size={22} />
              </Pressable>
            </View>

            <View className="gap-4">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextInputField
                    label="Prénom"
                    placeholder="Samira"
                    value={prenom}
                    onChangeText={setPrenom}
                  />
                </View>
                <View className="flex-1">
                  <TextInputField
                    label="Nom"
                    placeholder="Hamadi"
                    value={nom}
                    onChangeText={setNom}
                  />
                </View>
              </View>
              <TextInputField
                label="Email"
                placeholder="prenom.nom@example.org"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              {invitationLink ? (
                <View className="rounded-xl border border-primary-100 bg-primary-50 p-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Link color="#2563eb" size={16} />
                    <Text className="text-primary-700 text-xs font-bold">Lien généré</Text>
                  </View>
                  <Text className="text-primary-700 text-xs leading-relaxed">{invitationLink}</Text>
                </View>
              ) : (
                <Text className="text-slate-400 text-xs leading-relaxed">
                  Le lien sera valable 14 jours et donnera accès uniquement à cette école après
                  création du compte.
                </Text>
              )}
            </View>

            <View className="gap-3 mt-5">
              <PrimaryButton
                label={invitationLink ? "Envoyer l'invitation" : 'Générer le lien'}
                iconLeft={<Send color="white" size={18} />}
                onPress={invitationLink ? handleSend : handleGenerate}
              />
              <SecondaryButton
                label="Annuler"
                variant="ghost"
                onPress={() => setModalOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
      <BottomNav variant="parent" />
    </View>
  );
}
