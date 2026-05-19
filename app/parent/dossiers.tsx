import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { DossierCard } from '../../components/DossierCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useDossiers } from '../../hooks';

type FilterId = 'all' | 'open' | 'urgent' | 'waiting' | 'resolved';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'open', label: 'Ouverts' },
  { id: 'urgent', label: 'Urgents' },
  { id: 'waiting', label: 'En attente mairie' },
  { id: 'resolved', label: 'Résolus' },
];

export default function DossiersScreen() {
  // Côté parent : filtre par rôle → invisibles 'direction_mairie' et 'mairie_interne'.
  const { data: dossiers = [], isLoading } = useDossiers({ visibleByRole: 'parent_admin' });
  const [active, setActive] = useState<FilterId>('all');

  const filtered = useMemo(() => {
    switch (active) {
      case 'open':
        return dossiers.filter((d) => d.statut !== 'resolu' && d.statut !== 'classe_sans_suite');
      case 'urgent':
        return dossiers.filter((d) => d.urgence === 'elevee' && d.statut !== 'resolu');
      case 'waiting':
        return dossiers.filter(
          (d) => d.statut === 'transmis_mairie' || d.statut === 'en_cours_analyse',
        );
      case 'resolved':
        return dossiers.filter((d) => d.statut === 'resolu');
      default:
        return dossiers;
    }
  }, [dossiers, active]);

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Mes dossiers" subtitle={`${dossiers.length} dossiers`} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16, gap: 8, paddingBottom: 12 }}
        >
          {FILTERS.map((f) => {
            const isActive = f.id === active;
            return (
              <Pressable
                key={f.id}
                onPress={() => setActive(f.id)}
                className={`rounded-full px-3 py-1.5 border ${isActive ? 'bg-primary-500 border-primary-500' : 'bg-white border-slate-200'}`}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Text
                  className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#2563eb" />
            <Text className="text-slate-400 text-xs mt-3">Chargement des dossiers…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View className="items-center py-12 bg-white rounded-2xl border border-slate-100">
            <Text className="text-slate-500 text-sm">Aucun dossier ne correspond au filtre.</Text>
            {active !== 'all' && (
              <Pressable onPress={() => setActive('all')} className="mt-3">
                <Text className="text-primary-500 text-xs font-semibold">
                  Voir tous les dossiers
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          filtered.map((dossier) => (
            <DossierCard
              key={dossier.id}
              dossier={dossier}
              onPress={() =>
                router.push({ pathname: '/parent/dossier-detail', params: { id: dossier.id } })
              }
            />
          ))
        )}

        <View className="mt-4">
          <PrimaryButton
            label="Nouvelle demande"
            onPress={() => router.push('/parent/new-request')}
            iconLeft={<Plus color="white" size={18} />}
          />
        </View>

        <Text className="text-slate-400 text-xs text-center mt-6">
          Astuce : appuyez sur un dossier pour voir son détail et son historique.
        </Text>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}
