/**
 * /direction/directory — annuaire vu par la direction d'école.
 *
 * Comporte 2 sections :
 *   1. Mes interlocuteurs mairie (CONTACTS_MAIRIE, statique)
 *   2. Mon équipe pédagogique (personnes avec role='direction' rattachées à
 *      l'école) — éditable, on peut ajouter un enseignant impliqué
 *
 * Pour la démo : permet d'ajouter en direct un enseignant ou autre membre
 * pédagogique qui interviendra sur un dossier. La personne apparait dans le
 * sélecteur de mode démo.
 */

import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Building2, Mail, Phone, Send, UserPlus, Users, X } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextInputField } from '../../components/TextInputField';
import { CATEGORIES, CONTACTS_MAIRIE, ECOLES, PERSONNES } from '../../data/mockData';
import { useCreatePersonne, usePersonnes } from '../../hooks';
import type { ContactMairie } from '../../types';

const ECOLE_DIRECTION =
  ECOLES.find((e) => e.id === PERSONNES.find((p) => p.role === 'direction')?.ecoleId) ?? ECOLES[0];

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

export default function DirectionDirectoryScreen() {
  const { data: personnes = [] } = usePersonnes();
  const createPersonne = useCreatePersonne();
  // Membres pédagogiques = personnes avec role='direction' rattachées à l'école
  const equipePedago = personnes.filter(
    (p) => p.role === 'direction' && p.ecoleId === ECOLE_DIRECTION.id,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [fonction, setFonction] = useState('');

  const handleCreate = async () => {
    if (
      prenom.trim().length < 2 ||
      nom.trim().length < 2 ||
      !email.includes('@') ||
      fonction.trim().length < 2
    ) {
      Alert.alert(
        'Informations manquantes',
        'Renseigne au minimum prénom, nom, email et fonction (ex : « Enseignante CM2 »).',
      );
      return;
    }
    try {
      await createPersonne.mutateAsync({
        prenom,
        nom,
        email,
        role: 'direction',
        ecoleId: ECOLE_DIRECTION.id,
        fonction,
      });
      setModalOpen(false);
      setPrenom('');
      setNom('');
      setEmail('');
      setFonction('');
      Alert.alert(
        'Membre ajouté',
        `${prenom} ${nom} (${fonction}) fait maintenant partie de l'équipe pédagogique de ${ECOLE_DIRECTION.nom}. Cette personne peut être impliquée dans un dossier ou un rendez-vous.`,
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
      <AppHeader title="Annuaire" subtitle="Mairie + équipe pédagogique" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {/* Section équipe pédagogique */}
        <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
          <View className="flex-row items-center gap-2 mb-1">
            <Users color="#4f46e5" size={16} />
            <Text className="text-slate-700 font-bold text-sm">Équipe pédagogique</Text>
          </View>
          <Text className="text-slate-500 text-xs leading-relaxed">
            Membres de l'école : direction, adjoints, enseignants référents. À utiliser pour
            impliquer quelqu'un dans un dossier institutionnel.
          </Text>
        </View>

        {equipePedago.map((p) => (
          <View
            key={p.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 mb-3 flex-row items-center gap-3"
          >
            <View className="w-11 h-11 bg-direction-50 rounded-xl items-center justify-center">
              <Text className="text-direction-700 font-bold text-sm">
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
          </View>
        ))}

        <View className="mb-6">
          <SecondaryButton
            label="Ajouter un membre de l'équipe"
            iconLeft={<UserPlus color="#334155" size={18} />}
            onPress={() => setModalOpen(true)}
          />
        </View>

        {/* Section contacts mairie */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-100">
          <View className="flex-row items-center gap-2 mb-1">
            <Building2 color="#0d9488" size={16} />
            <Text className="text-slate-700 font-bold text-sm">Vos interlocuteurs mairie</Text>
          </View>
          <Text className="text-slate-500 text-xs leading-relaxed">
            Liste des référents mairie pour les sujets transverses : bâtiment, voirie, sécurité,
            restauration et cabinet.
          </Text>
        </View>

        {CONTACTS_MAIRIE.map((contact) => (
          <MairieContactCard key={contact.id} contact={contact} />
        ))}

        <Text className="text-slate-400 text-xs text-center mt-4 px-6 leading-relaxed">
          La liste des représentants des parents n'apparaît pas ici : la direction d'établissement
          interagit avec la mairie via les sujets institutionnels et les rendez-vous concertés.
        </Text>
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-950/40">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-800 font-bold text-lg">
                  Ajouter un membre de l'équipe
                </Text>
                <Text className="text-slate-500 text-xs mt-0.5">{ECOLE_DIRECTION.nom}</Text>
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
                      placeholder="Lucie"
                      value={prenom}
                      onChangeText={setPrenom}
                    />
                  </View>
                  <View className="flex-1">
                    <TextInputField
                      label="Nom"
                      placeholder="Tessier"
                      value={nom}
                      onChangeText={setNom}
                    />
                  </View>
                </View>
                <TextInputField
                  label="Email"
                  placeholder="prenom.nom@ac-versailles.fr"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInputField
                  label="Fonction"
                  placeholder="Ex : Enseignante CM2, Adjointe, Référente PAI..."
                  value={fonction}
                  onChangeText={setFonction}
                />
              </View>

              <View className="gap-3 mt-5 pb-2">
                <PrimaryButton
                  label="Confirmer l'ajout"
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

      <BottomNav variant="direction" />
    </View>
  );
}
