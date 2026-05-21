import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import {
  Archive,
  CheckCircle2,
  FolderOpen,
  KeyRound,
  RefreshCw,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { useDossiers, usePersonnes } from '../../hooks';

interface MemberRow {
  id: string;
  name: string;
  role: 'Admin' | 'Contributeur';
  assoc: string;
  keep: boolean;
}

function nextKey() {
  return `JAURES-2027-${Math.floor(100 + Math.random() * 900)}`;
}

export default function PassageAnneeScreen() {
  // Représentants via hook : reflète les invitations / ajouts faits en démo.
  const { data: representants = [] } = usePersonnes({ representantsOnly: true });
  const { data: dossiers = [] } = useDossiers();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [rentreeKey, setRentreeKey] = useState(nextKey());

  // Synchronise l'état local avec la liste serveur : on ajoute les nouveaux
  // membres en gardant la décision (keep) de ceux déjà connus.
  useEffect(() => {
    setMembers((current) => {
      const previousById = new Map(current.map((m) => [m.id, m]));
      return representants.map((personne, index) => {
        const previous = previousById.get(personne.id);
        return (
          previous ?? {
            id: personne.id,
            name: `${personne.prenom} ${personne.nom}`,
            role: personne.role === 'parent_admin' ? 'Admin' : 'Contributeur',
            assoc: personne.association ?? 'Indépendants',
            // Par défaut : on garde le 1er (admin principal) et on archive les autres.
            keep: index === 0,
          }
        );
      });
    });
  }, [representants]);

  const toggleKeep = (id: string) => {
    setMembers((current) =>
      current.map((member) => (member.id === id ? { ...member, keep: !member.keep } : member)),
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Passage d'année" subtitle="2026-2027 → 2027-2028" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <Users color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">Représentants</Text>
          </View>
          <View className="gap-2">
            {members.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => toggleKeep(member.id)}
                className={`flex-row items-center gap-3 p-3 rounded-xl border ${
                  member.keep ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <View className="w-9 h-9 bg-primary-100 rounded-full items-center justify-center">
                  <Text className="text-primary-700 text-xs font-bold">
                    {member.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-700 text-sm font-semibold">{member.name}</Text>
                  <Text className="text-slate-400 text-xs">
                    {member.assoc} · {member.role}
                  </Text>
                </View>
                <Badge
                  label={member.keep ? 'Conservé' : 'Archiver'}
                  tone={member.keep ? 'success' : 'slate'}
                />
              </Pressable>
            ))}
          </View>
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <FolderOpen color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">
              Dossiers à transférer
            </Text>
          </View>
          <View className="gap-2">
            {dossiers
              .filter((dossier) => dossier.statut !== 'resolu')
              .map((dossier) => (
                <View
                  key={dossier.id}
                  className="flex-row items-center gap-2 p-3 bg-primary-50 rounded-xl"
                >
                  <CheckCircle2 color="#2563eb" size={15} />
                  <Text className="text-slate-700 text-sm flex-1" numberOfLines={1}>
                    {dossier.titre}
                  </Text>
                  <Badge label="Transféré" tone="primary" />
                </View>
              ))}
          </View>
          <Text className="text-slate-400 text-xs leading-relaxed mt-3">
            Les dossiers résolus restent consultables dans l'historique, les dossiers ouverts
            suivent la nouvelle équipe.
          </Text>
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <KeyRound color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">Clé de rentrée</Text>
          </View>
          <View className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-3">
            <Text className="text-slate-800 font-mono font-bold tracking-wider">{rentreeKey}</Text>
            <Text className="text-amber-600 text-xs mt-1">Valable jusqu'au 31 août 2028</Text>
          </View>
          <SecondaryButton
            label="Régénérer"
            iconLeft={<RefreshCw color="#334155" size={18} />}
            onPress={() => setRentreeKey(nextKey())}
          />
        </Card>

        <View className="gap-3">
          <PrimaryButton
            label="Inviter les nouveaux élus"
            iconLeft={<UserPlus color="white" size={18} />}
            onPress={() =>
              Alert.alert(
                'Invitations préparées',
                'Les nouveaux représentants recevront la clé de rentrée après validation.',
              )
            }
          />
          <SecondaryButton
            label="Archiver l'année 2026-2027"
            iconLeft={<Archive color="#334155" size={18} />}
            onPress={() =>
              Alert.alert('Archive simulée', "L'année scolaire est prête à être figée.")
            }
          />
        </View>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}
