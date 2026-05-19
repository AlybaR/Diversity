import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Clock,
  Eye,
  School,
  TrendingUp,
} from 'lucide-react-native';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { DOSSIERS, ECOLES, RENDEZ_VOUS } from '../../data/mockData';

export default function ModeEluScreen() {
  const insets = useSafeAreaInsets();
  const urgentCount = DOSSIERS.filter((dossier) => dossier.urgence === 'elevee').length + 2;

  return (
    <View className="flex-1 bg-slate-50">
      <LinearGradient
        colors={['#1e293b', '#0f172a'] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-2 pb-5">
          <View className="flex-row items-center gap-2 mb-1">
            <Eye color="#f59e0b" size={18} />
            <Badge label="Mode élu" tone="warning" />
          </View>
          <Text className="text-white font-bold text-lg">Vue stratégique</Text>
          <Text className="text-slate-400 text-xs mt-1">
            Ville de Montreuil-sur-Seine · Mai 2026
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="flex-row gap-2 mb-3">
          <Kpi icon={<School color="#2563eb" size={16} />} label="Écoles" value={ECOLES.length} />
          <Kpi
            icon={<AlertTriangle color="#ef4444" size={16} />}
            label="Alertes"
            value={urgentCount}
          />
          <Kpi icon={<Clock color="#d97706" size={16} />} label="Délai moy." value="3.8j" />
        </View>

        <Card className="mb-3 border-red-100">
          <View className="flex-row items-center gap-2 mb-3">
            <AlertTriangle color="#ef4444" size={16} />
            <Text className="text-red-400 text-xs font-bold uppercase">À surveiller</Text>
          </View>
          {[
            { name: 'Jean Jaurès', issue: 'Passage piéton non sécurisé', days: 6 },
            { name: 'Victor Hugo', issue: 'Signalement bâtiment C', days: 12 },
          ].map((school) => (
            <View key={school.name} className="p-3 bg-red-50 rounded-xl mb-2">
              <Text className="text-slate-800 text-sm font-bold">{school.name}</Text>
              <Text className="text-slate-500 text-xs mt-0.5">{school.issue}</Text>
              <View className="self-start mt-2">
                <Badge label={`En attente ${school.days}j`} tone="danger" />
              </View>
            </View>
          ))}
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <TrendingUp color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">Tendances du mois</Text>
          </View>
          {[
            { label: 'Dossiers reçus', value: '+12', color: 'text-primary-600' },
            { label: 'Dossiers traités', value: '+15', color: 'text-success-600' },
            { label: 'Délai de réponse', value: '-0.5j', color: 'text-success-600' },
            { label: 'Satisfaction représentants', value: '94%', color: 'text-warning-600' },
          ].map((trend) => (
            <View
              key={trend.label}
              className="flex-row items-center justify-between p-3 bg-slate-50 rounded-xl mb-2"
            >
              <Text className="text-slate-600 text-sm">{trend.label}</Text>
              <Text className={`${trend.color} text-sm font-bold`}>{trend.value}</Text>
            </View>
          ))}
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <CalendarDays color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">
              Prochains rendez-vous
            </Text>
          </View>
          {RENDEZ_VOUS.map((rdv) => (
            <View key={rdv.id} className="p-3 bg-slate-50 rounded-xl mb-2">
              <Text className="text-slate-700 text-sm font-semibold">{rdv.titre}</Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                {rdv.date} · {rdv.heure}
              </Text>
            </View>
          ))}
        </Card>

        <Card className="border-amber-100">
          <View className="flex-row items-center gap-2 mb-3">
            <BarChart3 color="#d97706" size={16} />
            <Text className="text-amber-500 text-xs font-bold uppercase">Signaux faibles</Text>
          </View>
          {[
            '3 écoles signalent des problèmes de sécurité piétonne.',
            'Les demandes liées aux sanitaires restent récurrentes.',
            'Retards cumulés sur les réponses bâtiment secteur nord.',
          ].map((signal) => (
            <View key={signal} className="flex-row items-start gap-2 mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
              <Text className="text-slate-600 text-xs leading-relaxed flex-1">{signal}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
      <BottomNav variant="mairie" />
    </View>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <View className="flex-1 bg-white rounded-xl p-3 border border-slate-100 items-center">
      {icon}
      <Text className="text-slate-800 text-lg font-bold mt-1">{value}</Text>
      <Text className="text-slate-500 text-[10px] text-center">{label}</Text>
    </View>
  );
}
