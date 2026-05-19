import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { CheckCircle2, Clock, Edit3, MessageCircle, Send, ThumbsUp } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextInputField } from '../../components/TextInputField';
import { DOSSIERS } from '../../data/mockData';
import { UrgenceBadge } from '../../components/StatusBadge';

const initialVotes = [
  { initials: 'NB', name: 'Nadia Benali', approved: true },
  { initials: 'ML', name: 'Marc Laurent', approved: true },
  { initials: 'SG', name: 'Sophie Girard', approved: false },
];

export default function ValidationScreen() {
  const dossier = DOSSIERS[0];
  const [votes, setVotes] = useState(initialVotes);
  const [commentaire, setCommentaire] = useState('');
  const approvedCount = votes.filter((vote) => vote.approved).length;

  const approveAsCurrentUser = () => {
    setVotes((current) =>
      current.map((vote) => (vote.initials === 'SG' ? { ...vote, approved: true } : vote)),
    );
    Alert.alert('Approbation enregistrée', 'La validation collective est à jour.');
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Validation collective" subtitle="Avant envoi à la mairie" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Card className="mb-3 border-primary-200">
          <View className="flex-row flex-wrap gap-2 mb-3">
            <Badge label="En attente de validation" tone="warning" />
            <Badge label="Sécurité" tone="slate" />
            <UrgenceBadge urgence={dossier.urgence} />
          </View>
          <Text className="text-slate-800 font-bold text-base mb-2">{dossier.titre}</Text>
          <Text className="text-slate-500 text-sm leading-relaxed" numberOfLines={4}>
            {dossier.description}
          </Text>
        </Card>

        <Card className="mb-3">
          <Text className="text-slate-400 text-xs font-bold uppercase mb-3">Approbations</Text>
          <View className="flex-row items-center gap-3 mb-3">
            <View className="flex-1 h-3 bg-emerald-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(approvedCount / votes.length) * 100}%` }}
              />
            </View>
            <Text className="text-emerald-700 text-xs font-bold">
              {approvedCount}/{votes.length}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {votes.map((vote) => (
              <View
                key={vote.initials}
                className={`flex-row items-center gap-2 px-2.5 py-2 rounded-xl ${
                  vote.approved ? 'bg-emerald-50' : 'bg-slate-50'
                }`}
              >
                <View className="w-7 h-7 bg-primary-100 rounded-full items-center justify-center">
                  <Text className="text-primary-700 text-[10px] font-bold">{vote.initials}</Text>
                </View>
                {vote.approved ? (
                  <ThumbsUp color="#059669" size={12} />
                ) : (
                  <Clock color="#94a3b8" size={12} />
                )}
              </View>
            ))}
          </View>
        </Card>

        <Card className="mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <MessageCircle color="#94a3b8" size={16} />
            <Text className="text-slate-400 text-xs font-bold uppercase">
              Commentaires internes
            </Text>
          </View>
          {[
            {
              author: 'Marc Laurent',
              text: 'Il faudrait conserver les photos du stationnement gênant dans les pièces jointes.',
              date: 'Il y a 3h',
            },
            {
              author: 'Sophie Girard',
              text: "D'accord avec la formulation, on peut transmettre après ajout du créneau photo.",
              date: 'Il y a 1h',
            },
          ].map((item) => (
            <View key={item.text} className="bg-slate-50 rounded-xl p-3 mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-slate-700 text-xs font-bold">{item.author}</Text>
                <Text className="text-slate-400 text-[10px]">{item.date}</Text>
              </View>
              <Text className="text-slate-600 text-xs leading-relaxed">{item.text}</Text>
            </View>
          ))}
          <TextInputField
            placeholder="Ajouter un commentaire interne..."
            value={commentaire}
            onChangeText={setCommentaire}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72, textAlignVertical: 'top', fontSize: 14 }}
          />
        </Card>

        <View className="gap-3">
          <SecondaryButton
            label="Approuver"
            iconLeft={<CheckCircle2 color="#059669" size={18} />}
            onPress={approveAsCurrentUser}
          />
          <SecondaryButton
            label="Demander modification"
            iconLeft={<Edit3 color="#d97706" size={18} />}
            onPress={() =>
              Alert.alert(
                'Modification demandée',
                commentaire.trim() || 'Ajoutez un commentaire pour préciser la modification.',
              )
            }
          />
          <PrimaryButton
            label="Transmettre à la mairie"
            iconLeft={<Send color="white" size={18} />}
            onPress={() =>
              Alert.alert(
                'Transmission simulée',
                'Le dossier sera transmis quand tous les représentants auront validé.',
              )
            }
          />
        </View>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}
