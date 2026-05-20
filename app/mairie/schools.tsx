import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { School } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/LoadingState';
import { SchoolCard } from '../../components/SchoolCard';
import { COLORS } from '../../constants/theme';
import { useDossiers, useEcoles } from '../../hooks';

export default function MairieSchoolsScreen() {
  const { data: ecoles = [], isLoading, error, refetch } = useEcoles();
  const { data: dossiers = [] } = useDossiers();
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Écoles de la collectivité" subtitle={`${ecoles.length} établissements`} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {error && (
          <ErrorBanner
            message={`Impossible de charger les écoles (${error.message}).`}
            onRetry={() => refetch()}
            className="mb-3"
          />
        )}

        {isLoading && ecoles.length === 0 && <LoadingState label="Chargement des écoles…" />}

        {!isLoading && ecoles.length === 0 && (
          <View className="bg-white rounded-2xl border border-slate-100">
            <EmptyState
              icon={<School color={COLORS.slate[400]} size={28} />}
              title="Aucune école rattachée"
              subtitle="Aucune école n’est encore liée à cette mairie."
            />
          </View>
        )}

        {ecoles.map((ecole) => {
          const dossiersOuverts = dossiers.filter(
            (d) =>
              d.ecoleId === ecole.id && d.statut !== 'resolu' && d.statut !== 'classe_sans_suite',
          ).length;
          const dossiersUrgents = dossiers.filter(
            (d) => d.ecoleId === ecole.id && d.urgence === 'elevee' && d.statut !== 'resolu',
          ).length;
          return (
            <SchoolCard
              key={ecole.id}
              ecole={ecole}
              dossiersOuverts={dossiersOuverts}
              dossiersUrgents={dossiersUrgents}
              onPress={() =>
                router.push({ pathname: '/mairie/school-detail', params: { id: ecole.id } })
              }
            />
          );
        })}
        <Text className="text-slate-400 text-xs text-center mt-4">
          Vue mairie : suivi global de l'activité par école.
        </Text>
      </ScrollView>
      <BottomNav variant="mairie" />
    </View>
  );
}
