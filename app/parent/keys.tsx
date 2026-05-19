import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Copy, KeyRound, RefreshCw, ShieldCheck, UserPlus } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { ECOLES } from '../../data/mockData';

function createKey() {
  return `JAURES-${Math.floor(1000 + Math.random() * 9000)}`;
}

const invitations = [
  { email: 'samira.ali@example.org', statut: 'Envoyée', date: '18 mai 2026' },
  { email: 'louis.martin@example.org', statut: 'Ouverte', date: '17 mai 2026' },
];

export default function KeysScreen() {
  const [activeKey, setActiveKey] = useState(ECOLES[0].cle);
  const [pendingKey, setPendingKey] = useState(createKey());

  const regenerate = () => setPendingKey(createKey());
  const activate = () => {
    setActiveKey(pendingKey);
    setPendingKey(createKey());
    Alert.alert('Clé activée', 'Les prochaines invitations utiliseront cette nouvelle clé école.');
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Clés école" subtitle="École élémentaire Jean Jaurès" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Card className="mb-3">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
              <KeyRound color="#2563eb" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 text-sm font-bold">Clé active</Text>
              <Text className="text-slate-400 text-xs">
                À partager uniquement aux élus confirmés
              </Text>
            </View>
            <Badge label="Active" tone="success" />
          </View>
          <View className="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <Text className="text-primary-700 font-mono text-xl font-bold tracking-wider">
              {activeKey}
            </Text>
            <Text className="text-slate-400 text-xs mt-1">Expire le 31 août 2027</Text>
          </View>
          <Pressable
            onPress={() => Alert.alert('Clé copiée', activeKey)}
            className="flex-row items-center gap-2 mt-3 self-start"
          >
            <Copy color="#2563eb" size={15} />
            <Text className="text-primary-600 text-xs font-semibold">Copier la clé</Text>
          </Pressable>
        </Card>

        <Card className="mb-3">
          <Text className="text-slate-800 text-sm font-bold mb-1">Nouvelle clé préparée</Text>
          <Text className="text-slate-500 text-xs mb-3">
            Activez-la seulement si l'ancienne clé a trop circulé.
          </Text>
          <View className="rounded-xl bg-amber-50 border border-amber-100 p-4 mb-3">
            <Text className="text-amber-700 font-mono text-lg font-bold">{pendingKey}</Text>
          </View>
          <View className="gap-3">
            <PrimaryButton label="Activer cette clé" onPress={activate} />
            <SecondaryButton
              label="Générer une autre clé"
              iconLeft={<RefreshCw color="#334155" size={18} />}
              onPress={regenerate}
            />
          </View>
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <ShieldCheck color="#059669" size={18} />
            <Text className="text-slate-800 text-sm font-bold">Règles de sécurité</Text>
          </View>
          {[
            'Une clé ne donne pas automatiquement le rôle administrateur.',
            'Chaque accès doit être validé par un parent administrateur.',
            'Les clés expirent à chaque rentrée scolaire.',
          ].map((item) => (
            <Text key={item} className="text-slate-500 text-xs leading-relaxed mb-2">
              • {item}
            </Text>
          ))}
        </Card>

        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-800 text-sm font-bold">Invitations récentes</Text>
            <UserPlus color="#94a3b8" size={16} />
          </View>
          <View className="gap-2">
            {invitations.map((invitation) => (
              <View
                key={invitation.email}
                className="flex-row items-center justify-between rounded-xl bg-slate-50 p-3"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-slate-700 text-sm font-semibold">{invitation.email}</Text>
                  <Text className="text-slate-400 text-xs">{invitation.date}</Text>
                </View>
                <Badge label={invitation.statut} tone="slate" />
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}
