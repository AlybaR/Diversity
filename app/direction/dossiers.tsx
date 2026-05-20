import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { FolderOpen, Plus } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { DossierCard } from '../../components/DossierCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/LoadingState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS } from '../../constants/theme';
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
  const {
    data: dossiers = [],
    isLoading,
    error,
    refetch,
  } = useDossiers({
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

        {error && (
          <ErrorBanner
            message={`Impossible de charger les sujets (${error.message}).`}
            onRetry={() => refetch()}
            className="mb-3"
          />
        )}

        {isLoading ? (
          <LoadingState label="Chargement des sujets…" />
        ) : filtered.length === 0 ? (
          <View className="bg-white rounded-2xl border border-slate-100">
            <EmptyState
              icon={<FolderOpen color={COLORS.slate[400]} size={28} />}
              title="Aucun sujet"
              subtitle="Vous ne voyez ici que les sujets transverses (voirie, bâtiment, RDV concertés). Les conversations privées parents ↔ mairie restent confidentielles."
              cta={
                active !== 'all'
                  ? { label: 'Voir tous les sujets', onPress: () => setActive('all') }
                  : undefined
              }
            />
          </View>
        ) : (
          filtered.map((dossier) => (
            <DossierCard
              key={dossier.id}
              dossier={dossier}
              onPress={() =>
                router.push(`/direction/dossier-detail?id=${dossier.id}` as unknown as Href)
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
