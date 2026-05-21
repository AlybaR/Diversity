import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import {
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  FolderOpen,
  MessageSquare,
} from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useDossiers, useMessages, useRendezVous } from '../../hooks';

type ExportFormat = 'pdf' | 'txt';

export default function ExportScreen() {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  // Données via hooks → l'aperçu reflète les ajouts/résolutions faits en démo
  // sans avoir besoin de recharger l'écran manuellement.
  const { data: dossiers = [] } = useDossiers();
  const { data: messages = [] } = useMessages();
  const { data: rdvs = [] } = useRendezVous();
  const stats = useMemo(
    () => [
      {
        label: 'Dossiers ouverts',
        value: dossiers.filter((dossier) => dossier.statut !== 'resolu').length,
        icon: FolderOpen,
        color: '#2563eb',
      },
      {
        label: 'Dossiers résolus',
        value: dossiers.filter((dossier) => dossier.statut === 'resolu').length,
        icon: CheckCircle2,
        color: '#059669',
      },
      { label: 'Rendez-vous', value: rdvs.length, icon: CalendarDays, color: '#d97706' },
      { label: 'Messages mairie', value: messages.length, icon: MessageSquare, color: '#6366f1' },
    ],
    [dossiers, messages, rdvs],
  );

  const categories = [
    { label: 'Sécurité / Voirie', count: 3, pct: 75 },
    { label: 'Bâtiment / Sanitaires', count: 2, pct: 50 },
    { label: 'Carte scolaire', count: 1, pct: 25 },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Synthèse école" subtitle="Générer un résumé exploitable" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Card className="mb-3">
          <Text className="text-slate-400 text-xs font-bold uppercase mb-3">Période</Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] mb-1">Du</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
                <Text className="text-slate-700 text-sm font-semibold">01/09/2025</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] mb-1">Au</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3">
                <Text className="text-slate-700 text-sm font-semibold">19/05/2026</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card className="mb-3">
          <Text className="text-slate-400 text-xs font-bold uppercase mb-3">Aperçu</Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <View
                  key={stat.label}
                  className="bg-slate-50 rounded-xl p-3 items-center"
                  style={{ flex: 1, minWidth: '47%' }}
                >
                  <Icon color={stat.color} size={18} />
                  <Text className="text-slate-800 text-lg font-bold mt-1">{stat.value}</Text>
                  <Text className="text-slate-500 text-[10px] text-center">{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card className="mb-3">
          <Text className="text-slate-400 text-xs font-bold uppercase mb-3">
            Catégories principales
          </Text>
          <View className="gap-3">
            {categories.map((category) => (
              <View key={category.label}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-slate-600 text-xs font-semibold">{category.label}</Text>
                  <Text className="text-slate-400 text-xs">{category.count}</Text>
                </View>
                <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${category.pct}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-slate-400 text-xs font-bold uppercase mb-3">Format</Text>
          <View className="flex-row gap-2">
            {(['pdf', 'txt'] as ExportFormat[]).map((item) => {
              const active = item === format;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFormat(item)}
                  className={`flex-1 rounded-xl border py-3 items-center ${
                    active ? 'bg-primary-500 border-primary-500' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <FileText color={active ? '#ffffff' : '#64748b'} size={17} />
                  <Text
                    className={`text-sm font-bold mt-1 ${active ? 'text-white' : 'text-slate-500'}`}
                  >
                    {item.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <PrimaryButton
          label="Générer la synthèse"
          iconLeft={<Download color="white" size={18} />}
          onPress={() =>
            Alert.alert(
              'Synthèse générée',
              `La génération ${format.toUpperCase()} sera branchée au service d'export backend.`,
            )
          }
        />
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}
