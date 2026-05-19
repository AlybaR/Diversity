import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { DossierCard } from '../../components/DossierCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ECOLES, PERSONNES } from '../../data/mockData';
import { useDossiers } from '../../hooks';

type FilterId = 'all' | 'open' | 'urgent' | 'mine' | 'resolved';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'open', label: 'Ouverts' },
  { id: 'urgent', label: 'Urgents' },
  { id: 'mine', label: 'Créés par moi' },
  { id: 'resolved', label: 'Résolus' },
];

const DIRECTION = PERSONNES.find((p) => p.role === 'direction');
const ECOLE_DIRECTION = ECOLES.find((e) => e.id === DIRECTION?.ecoleId) ?? ECOLES[0];

export default function DirectionDossiersScreen() {
  // Filtre strict via la matrice canRoleSeeScope : la direction voit uniquement
  // 'direction_mairie' et 'partage_tripartite', jamais 'parents_mairie' ni 'mairie_interne'.
  const { data: dossiers = [], isLoading } = useDossiers({
    ecoleId: ECOLE_DIRECTION.id,
    visibleByRole: 'direction',
  });
  const [active, setActive] = useState<FilterId>('all');

  const filtered = useMemo(() => {
    switch (active) {
      case 'open':
        return dossiers.filter((d) => d.statut !== 'resolu' && d.statut !== 'classe_sans_suite');
      case 'urgent':
        return dossiers.filter((d) => d.urgence === 'elevee' && d.statut !== 'resolu');
      case 'mine':
        return dossiers.filter((d) => d.createurId === DIRECTION?.id);
      case 'resolved':
        return dossiers.filter((d) => d.statut === 'resolu');
      default:
        return dossiers;
    }
  }, [dossiers, active]);

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Sujets institutionnels" subtitle={`${dossiers.length} sujets`} />
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
                className={`rounded-full px-3 py-1.5 border ${
                  isActive ? 'bg-direction-600 border-direction-600' : 'bg-white border-slate-200'
                }`}
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
            <ActivityIndicator color="#4f46e5" />
            <Text className="text-slate-400 text-xs mt-3">Chargement…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View className="items-center py-12 bg-white rounded-2xl border border-slate-100">
            <Text className="text-slate-500 text-sm">Aucun sujet ne correspond au filtre.</Text>
            <Text className="text-slate-400 text-xs mt-2 px-6 text-center leading-relaxed">
              Vous ne voyez ici que les sujets transverses (voirie, bâtiment, RDV concertés). Les
              conversations privées parents ↔ mairie restent confidentielles.
            </Text>
            {active !== 'all' && (
              <Pressable onPress={() => setActive('all')} className="mt-3">
                <Text className="text-direction-600 text-xs font-semibold">
                  Voir tous les sujets
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
                router.push({
                  pathname: '/direction/dossier-detail',
                  params: { id: dossier.id },
                } as Href)
              }
            />
          ))
        )}

        <View className="mt-4">
          <PrimaryButton
            label="Créer un sujet institutionnel"
            onPress={() => router.push('/direction/new-request' as Href)}
            iconLeft={<Plus color="white" size={18} />}
          />
        </View>
      </ScrollView>
      <BottomNav variant="direction" />
    </View>
  );
}
