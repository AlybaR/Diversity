import { Text, View } from 'react-native';
import { Mail } from 'lucide-react-native';
import type { Personne } from '../types';
import { Badge } from './Badge';

interface RepresentativeCardProps {
  personne: Personne;
}

const ROLE_LABEL: Partial<Record<Personne['role'], string>> = {
  parent_admin: 'Parent élu — Administrateur',
  parent_contributeur: 'Parent élu — Contributeur',
  mairie_admin: 'Mairie — Administrateur',
  elu: 'Élu',
  direction: 'Direction',
};

export function RepresentativeCard({ personne }: RepresentativeCardProps) {
  const initials = `${personne.prenom.charAt(0)}${personne.nom.charAt(0)}`.toUpperCase();
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3 flex-row items-start gap-3">
      <View className="w-11 h-11 bg-primary-100 rounded-full items-center justify-center">
        <Text className="text-primary-700 font-bold text-sm">{initials}</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-slate-800 font-bold text-sm">
            {personne.prenom} {personne.nom}
          </Text>
          {personne.actif && <Badge label="Actif" tone="success" />}
        </View>
        {personne.association && (
          <Text className="text-slate-500 text-xs mt-0.5">{personne.association}</Text>
        )}
        <Text className="text-slate-400 text-[11px] mt-0.5">{ROLE_LABEL[personne.role]}</Text>
        <View className="flex-row items-center gap-1 mt-2">
          <Mail color="#94a3b8" size={12} />
          <Text className="text-slate-500 text-xs">{personne.email}</Text>
        </View>
      </View>
    </View>
  );
}
