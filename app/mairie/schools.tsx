import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { SchoolCard } from '../../components/SchoolCard';
import { useDossiers, useEcoles } from '../../hooks';

export default function MairieSchoolsScreen() {
  const { data: ecoles = [] } = useEcoles();
  const { data: dossiers = [] } = useDossiers();
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Écoles de la collectivité" subtitle={`${ecoles.length} établissements`} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
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
