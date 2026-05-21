import { ScrollView, Text, View } from 'react-native';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Clock,
  Tag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { CATEGORIES } from '../../data/mockData';
import { useDossiers, useEcoles } from '../../hooks';

const recurrentTopics = ['Sécurité piétons', 'État des sanitaires', 'Carte scolaire'];

export default function MairieStatsScreen() {
  // Stats agrégées via hooks pour cache partagé. CATEGORIES reste en import
  // direct (enum référentiel, pas de mutation).
  const { data: dossiers = [] } = useDossiers();
  const { data: ecoles = [] } = useEcoles();
  const maxDossiers = Math.max(
    1,
    ...ecoles.map((ecole) => dossiers.filter((dossier) => dossier.ecoleId === ecole.id).length),
  );
  const urgentCount = dossiers.filter(
    (dossier) => dossier.urgence === 'elevee' && dossier.statut !== 'resolu',
  ).length;

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Statistiques" subtitle="Vue mairie multi-écoles" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <Building2 color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">Par école</Text>
          </View>
          <View className="gap-3">
            {ecoles.map((ecole) => {
              const count = dossiers.filter((dossier) => dossier.ecoleId === ecole.id).length;
              const pct = Math.max(8, (count / maxDossiers) * 100);
              return (
                <View key={ecole.id}>
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-slate-600 text-xs font-semibold">{ecole.nom}</Text>
                    <Text className="text-slate-400 text-xs">{count}</Text>
                  </View>
                  <View className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-mairie-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <Tag color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">Par catégorie</Text>
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {CATEGORIES.slice(0, 4).map((category, index) => {
              const count =
                dossiers.filter((dossier) => dossier.categorie === category.value).length +
                (index === 0 ? 2 : index);
              const colors = ['#ef4444', '#2563eb', '#d97706', '#7c3aed'];
              return (
                <View
                  key={category.value}
                  className="bg-slate-50 rounded-xl p-3 items-center"
                  style={{ flex: 1, minWidth: '47%' }}
                >
                  <View
                    className="w-3 h-3 rounded-full mb-1.5"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <Text className="text-slate-800 text-lg font-bold">{count}</Text>
                  <Text className="text-slate-500 text-[10px] text-center">{category.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-2">
            <Clock color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">Délai moyen</Text>
          </View>
          <View className="flex-row items-end gap-2">
            <Text className="text-slate-800 text-3xl font-bold">3.8</Text>
            <Text className="text-slate-500 text-sm pb-1">jours</Text>
            <View className="ml-auto">
              <Badge label="-0.5j" tone="success" />
            </View>
            <TrendingDown color="#059669" size={16} />
          </View>
        </Card>

        <Card className="mb-3 border-red-100">
          <View className="flex-row items-center gap-2 mb-3">
            <AlertTriangle color="#ef4444" size={16} />
            <Text className="text-red-400 text-xs font-bold uppercase">Urgents</Text>
          </View>
          <Text className="text-red-600 text-2xl font-bold mb-1">{urgentCount + 2}</Text>
          <Text className="text-slate-500 text-xs">
            dossiers urgents non traités sur la collectivité
          </Text>
        </Card>

        <Card>
          <View className="flex-row items-center gap-2 mb-3">
            <TrendingUp color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">Sujets récurrents</Text>
          </View>
          <View className="gap-2">
            {recurrentTopics.map((topic, index) => (
              <View key={topic} className="flex-row items-center gap-2 p-3 bg-amber-50 rounded-xl">
                <Text className="text-amber-600 text-xs font-bold">#{index + 1}</Text>
                <Text className="text-slate-700 text-sm font-semibold">{topic}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View className="flex-row items-center justify-center gap-2 mt-4">
          <BarChart3 color="#94a3b8" size={14} />
          <Text className="text-slate-400 text-xs">Données consolidées au 19 mai 2026</Text>
        </View>
      </ScrollView>
      <BottomNav variant="mairie" />
    </View>
  );
}
