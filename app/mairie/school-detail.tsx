import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyRound, Mail, RefreshCw, X } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { DossierCard } from '../../components/DossierCard';
import { RepresentativeCard } from '../../components/RepresentativeCard';
import { AppointmentCard } from '../../components/AppointmentCard';
import { Card } from '../../components/Card';
import { DOSSIERS, ECOLES, PERSONNES, RENDEZ_VOUS } from '../../data/mockData';

function generateSchoolKey(ecoleId: string) {
  const prefix = ecoleId
    .replace('ecole-', '')
    .replace(/[^a-z]/gi, '')
    .slice(0, 6)
    .toUpperCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${suffix}`;
}

export default function SchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const ecole = ECOLES.find((e) => e.id === id) ?? ECOLES[0];
  const dossiers = DOSSIERS.filter((d) => d.ecoleId === ecole.id);
  const representants = PERSONNES.filter(
    (p) =>
      p.ecoleId === ecole.id && (p.role === 'parent_admin' || p.role === 'parent_contributeur'),
  );
  const rdvs = RENDEZ_VOUS.slice(0, 1);
  const [currentKey, setCurrentKey] = useState(ecole.cle);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');

  const openKeyModal = () => {
    setGeneratedKey(generateSchoolKey(ecole.id));
    setKeyModalOpen(true);
  };

  const confirmKey = () => {
    setCurrentKey(generatedKey);
    setKeyModalOpen(false);
    Alert.alert(
      'Nouvelle clé active',
      "L'ancienne clé est considérée comme révoquée dans cette simulation.",
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title={ecole.nom} subtitle={ecole.adresse} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Card className="mb-3">
          <Text className="text-slate-700 font-bold text-sm mb-2">Direction</Text>
          <Text className="text-slate-600 text-sm">{ecole.directionNom}</Text>
        </Card>

        <Card className="mb-3 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-slate-700 font-bold text-sm">Clé école</Text>
            <Text className="text-slate-400 text-xs">À transmettre aux nouveaux représentants</Text>
          </View>
          <Text className="text-primary-600 font-mono font-bold">{currentKey}</Text>
        </Card>

        <Text className="text-slate-700 font-bold text-sm mb-2 mt-2">
          Représentants actifs ({representants.length})
        </Text>
        {representants.map((p) => (
          <RepresentativeCard key={p.id} personne={p} />
        ))}

        <Text className="text-slate-700 font-bold text-sm mb-2 mt-2">
          Dossiers ({dossiers.length})
        </Text>
        {dossiers.slice(0, 3).map((d) => (
          <DossierCard
            key={d.id}
            dossier={d}
            onPress={() => router.push({ pathname: '/mairie/reply', params: { id: d.id } })}
          />
        ))}

        <Text className="text-slate-700 font-bold text-sm mb-2 mt-2">Rendez-vous à venir</Text>
        {rdvs.map((r) => (
          <AppointmentCard key={r.id} rdv={r} />
        ))}

        <View className="gap-3 mt-4">
          <PrimaryButton
            label="Envoyer un message"
            iconLeft={<Mail color="white" size={18} />}
            onPress={() =>
              Alert.alert(
                'Message école',
                "La création d'un message ciblé école sera reliée à la messagerie mairie.",
              )
            }
          />
          <SecondaryButton
            label="Générer une nouvelle clé"
            iconLeft={<KeyRound color="#334155" size={18} />}
            onPress={openKeyModal}
          />
        </View>
      </ScrollView>

      <Modal visible={keyModalOpen} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-slate-950/40 px-5">
          <View className="bg-white rounded-2xl p-5 w-full">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-800 font-bold text-lg">Nouvelle clé école</Text>
                <Text className="text-slate-500 text-xs mt-0.5">{ecole.nom}</Text>
              </View>
              <Pressable onPress={() => setKeyModalOpen(false)} hitSlop={8}>
                <X color="#475569" size={22} />
              </Pressable>
            </View>

            <View className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-3">
              <Text className="text-slate-400 text-xs font-semibold mb-1">Clé actuelle</Text>
              <Text className="text-slate-700 font-mono font-bold">{currentKey}</Text>
            </View>

            <View className="rounded-xl bg-primary-50 border border-primary-100 p-4">
              <Text className="text-primary-700 text-xs font-semibold mb-1">Nouvelle clé</Text>
              <Text className="text-primary-700 font-mono text-lg font-bold">{generatedKey}</Text>
            </View>

            <Text className="text-slate-400 text-xs leading-relaxed mt-3">
              Valider cette clé révoquera l'ancienne dans la future version backend. Les accès déjà
              validés restent actifs.
            </Text>

            <View className="gap-3 mt-5">
              <PrimaryButton label="Activer cette clé" onPress={confirmKey} />
              <SecondaryButton
                label="Générer une autre clé"
                iconLeft={<RefreshCw color="#334155" size={18} />}
                onPress={() => setGeneratedKey(generateSchoolKey(ecole.id))}
              />
              <SecondaryButton
                label="Annuler"
                variant="ghost"
                onPress={() => setKeyModalOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
      <BottomNav variant="mairie" />
    </View>
  );
}
