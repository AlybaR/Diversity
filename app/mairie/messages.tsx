/**
 * /mairie/messages — boîte de réception mairie.
 *
 * Liste tous les messages dont la mairie est destinataire (parents_mairie +
 * direction_mairie + partage_tripartite + mairie_interne). Inspiré de
 * `app/parent/messages.tsx` mais en lecture seule (la mairie répond aux
 * messages via /mairie/reply à partir d'un dossier, pas via un composer
 * libre).
 */

import { router, type Href } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { BottomNav } from '../../components/BottomNav';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { LoadingState } from '../../components/LoadingState';
import { MessageCard } from '../../components/MessageCard';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { useMessages } from '../../hooks';

export default function MairieMessagesScreen() {
  const insets = useSafeAreaInsets();
  // La mairie voit tous les messages quels que soient leurs scopes (filtrés
  // implicitement par visibleByRole côté service).
  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useMessages({ visibleByRole: 'mairie_admin' });
  const nonLus = messages.filter((m) => !m.lu).length;

  return (
    <View className="flex-1 bg-slate-50">
      <LinearGradient
        colors={GRADIENTS.mairie as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-2 pb-5">
          <Text className="text-xl font-bold text-white">Messages reçus</Text>
          <Text className="text-teal-100 text-xs mt-1">
            {messages.length} message{messages.length > 1 ? 's' : ''}
            {nonLus > 0 ? ` · ${nonLus} non lu${nonLus > 1 ? 's' : ''}` : ''}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {error && (
          <ErrorBanner
            message={`Impossible de charger les messages (${error.message}).`}
            onRetry={() => refetch()}
            className="mb-3"
          />
        )}

        {isLoading ? (
          <LoadingState label="Chargement des messages…" />
        ) : messages.length === 0 ? (
          <View className="bg-white rounded-2xl border border-slate-100">
            <EmptyState
              icon={<MessageSquare color={COLORS.slate[400]} size={28} />}
              title="Aucun message reçu"
              subtitle="Les messages des parents élus et de la direction d’école apparaîtront ici."
            />
          </View>
        ) : (
          messages.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              onPress={() =>
                router.push({
                  pathname: '/parent/message-detail',
                  params: { id: m.id },
                } as unknown as Href)
              }
            />
          ))
        )}

        <Text className="text-slate-400 text-xs text-center mt-4 px-6 leading-relaxed">
          Pour répondre à un message lié à un dossier, ouvre le dossier concerné et utilise «
          Répondre au dossier ».
        </Text>
      </ScrollView>
      <BottomNav variant="mairie" />
    </View>
  );
}
