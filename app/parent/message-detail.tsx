import { Alert, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCheck, FileText, MailPlus } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { useMessage, useMessages } from '../../hooks';
import { canRoleSeeScope } from '../../types';

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: specificMessage } = useMessage(id);
  const { data: messages = [] } = useMessages({ visibleByRole: 'parent_admin' });
  const message = specificMessage ?? messages.find((item) => item.id === id) ?? messages[0];

  // Garde-fou : pas de fuite si le parent n'a pas le scope du message.
  if (message && !canRoleSeeScope('parent_admin', message.visibilityScope)) {
    return (
      <View className="flex-1 bg-slate-50">
        <AppHeader title="Accès refusé" />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-slate-700 font-semibold text-base text-center mb-2">
            Vous n'avez pas accès à ce message.
          </Text>
          <SecondaryButton
            label="Retour aux messages"
            onPress={() => router.replace('/parent/messages')}
          />
        </View>
        <BottomNav variant="parent" />
      </View>
    );
  }

  if (!message) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 text-sm">Chargement...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Message mairie" subtitle={message.date} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-3">
          <View className="flex-row items-start justify-between gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-lg leading-snug">{message.titre}</Text>
              <Text className="text-slate-500 text-xs mt-2">Envoyé par {message.expediteur}</Text>
            </View>
            {message.priorite === 'importante' && <Badge label="Important" tone="warning" />}
            {message.priorite === 'urgente' && <Badge label="Urgent" tone="danger" />}
          </View>

          {!message.lu && (
            <View className="self-start bg-primary-50 rounded-full px-3 py-1 mb-4">
              <Text className="text-primary-700 text-xs font-semibold">Non lu</Text>
            </View>
          )}

          <Text className="text-slate-700 text-sm leading-relaxed">{message.contenu}</Text>
        </View>

        {message.piecesJointes && message.piecesJointes.length > 0 && (
          <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
            <Text className="text-slate-700 font-bold text-sm mb-3">Pièces jointes</Text>
            <View className="gap-2">
              {message.piecesJointes.map((piece) => (
                <View
                  key={piece.id}
                  className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex-row items-center gap-3"
                >
                  <View className="w-9 h-9 bg-primary-50 rounded-lg items-center justify-center">
                    <FileText color="#2563eb" size={16} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-700 text-xs font-bold">{piece.nom}</Text>
                    <Text className="text-slate-400 text-[11px] mt-0.5">{piece.taille}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="gap-3 mt-3">
          <PrimaryButton
            label="Répondre à la mairie"
            iconLeft={<MailPlus color="white" size={18} />}
            onPress={() =>
              Alert.alert(
                'Réponse préparée',
                "Le composer de réponse sera branché au backend de messagerie dans l'étape suivante.",
              )
            }
          />
          <SecondaryButton
            label="Marquer comme lu"
            iconLeft={<CheckCheck color="#334155" size={18} />}
            onPress={() => Alert.alert('Message marqué comme lu', 'État simulé dans la démo.')}
          />
          <SecondaryButton
            label="Retour aux messages"
            variant="ghost"
            onPress={() => router.push('/parent/messages')}
          />
        </View>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}
