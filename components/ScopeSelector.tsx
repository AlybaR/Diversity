import { Pressable, Text, View } from 'react-native';
import { Check, ShieldCheck, Users } from 'lucide-react-native';
import type { Role, VisibilityScope } from '../types';

interface ScopeSelectorProps {
  // Rôle de l'utilisateur courant — détermine les options disponibles.
  // Les options interdites par la matrice canRoleSeeScope sont retirées.
  role: Role;
  value: VisibilityScope | null;
  onChange: (scope: VisibilityScope) => void;
  label?: string;
}

interface ScopeOption {
  scope: VisibilityScope;
  title: string;
  description: string;
}

// Options exposées par rôle de créateur :
// - parent ne propose pas direction_mairie ni mairie_interne
// - direction ne propose pas parents_mairie ni mairie_interne
// - mairie a les 4 options
const OPTIONS_BY_ROLE: Record<Role, ScopeOption[]> = {
  parent_admin: [
    {
      scope: 'parents_mairie',
      title: 'Parents élus + mairie',
      description:
        "Conversation privée avec la mairie. La direction d'établissement ne voit pas ce dossier.",
    },
    {
      scope: 'partage_tripartite',
      title: 'Parents + direction + mairie',
      description:
        'Sujet transverse partagé avec les trois parties. Adapté aux travaux, sécurité, RDV concertés.',
    },
  ],
  parent_contributeur: [
    {
      scope: 'parents_mairie',
      title: 'Parents élus + mairie',
      description:
        "Conversation privée avec la mairie. La direction d'établissement ne voit pas ce dossier.",
    },
    {
      scope: 'partage_tripartite',
      title: 'Parents + direction + mairie',
      description:
        'Sujet transverse partagé avec les trois parties. Adapté aux travaux, sécurité, RDV concertés.',
    },
  ],
  direction: [
    {
      scope: 'direction_mairie',
      title: 'Direction + mairie',
      description:
        'Conversation privée avec la mairie. Les représentants des parents ne voient pas ce dossier.',
    },
    {
      scope: 'partage_tripartite',
      title: 'Parents + direction + mairie',
      description:
        'Sujet transverse partagé avec les trois parties. Adapté aux travaux, sécurité, RDV concertés.',
    },
  ],
  mairie_admin: [
    {
      scope: 'mairie_interne',
      title: 'Mairie uniquement',
      description: 'Note interne au service. Ni les parents ni la direction ne voient ce dossier.',
    },
    {
      scope: 'parents_mairie',
      title: 'Mairie + parents élus',
      description: 'Dossier privé entre la mairie et les parents élus. La direction ne voit pas.',
    },
    {
      scope: 'direction_mairie',
      title: 'Mairie + direction',
      description: 'Dossier privé entre la mairie et la direction. Les parents ne voient pas.',
    },
    {
      scope: 'partage_tripartite',
      title: 'Mairie + parents + direction',
      description: 'Dossier partagé entre les trois parties.',
    },
  ],
  elu: [
    {
      scope: 'mairie_interne',
      title: 'Mairie uniquement',
      description: 'Note interne au service. Ni les parents ni la direction ne voient ce dossier.',
    },
    {
      scope: 'parents_mairie',
      title: 'Mairie + parents élus',
      description: 'Dossier privé entre la mairie et les parents élus. La direction ne voit pas.',
    },
    {
      scope: 'direction_mairie',
      title: 'Mairie + direction',
      description: 'Dossier privé entre la mairie et la direction. Les parents ne voient pas.',
    },
    {
      scope: 'partage_tripartite',
      title: 'Mairie + parents + direction',
      description: 'Dossier partagé entre les trois parties.',
    },
  ],
};

export function ScopeSelector({ role, value, onChange, label }: ScopeSelectorProps) {
  const options = OPTIONS_BY_ROLE[role];

  return (
    <View>
      <View className="flex-row items-center gap-2 mb-2">
        <ShieldCheck color="#4f46e5" size={14} />
        <Text className="text-sm font-semibold text-slate-700">
          {label ?? 'Qui doit voir ce dossier ?'}
        </Text>
      </View>
      <View className="gap-2">
        {options.map((option) => {
          const active = value === option.scope;
          const isShared = option.scope === 'partage_tripartite';
          return (
            <Pressable
              key={option.scope}
              onPress={() => onChange(option.scope)}
              className={`rounded-xl border p-3 ${
                active ? 'bg-direction-50 border-direction-200' : 'bg-white border-slate-200'
              }`}
              style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
            >
              <View className="flex-row items-start gap-3">
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center ${
                    active ? 'bg-direction-100' : 'bg-slate-50'
                  }`}
                >
                  {isShared ? (
                    <Users color={active ? '#4f46e5' : '#94a3b8'} size={18} />
                  ) : (
                    <ShieldCheck color={active ? '#4f46e5' : '#94a3b8'} size={18} />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-sm font-bold ${
                        active ? 'text-direction-700' : 'text-slate-800'
                      }`}
                    >
                      {option.title}
                    </Text>
                    {active && <Check color="#4f46e5" size={16} />}
                  </View>
                  <Text className="text-slate-500 text-xs leading-relaxed mt-1">
                    {option.description}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
