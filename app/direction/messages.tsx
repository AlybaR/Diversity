import { router, type Href } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { MessageCard } from '../../components/MessageCard';
import { useMessages } from '../../hooks';

export default function DirectionMessagesScreen() {
  // Filtré par rôle direction → scopes 'direction_mairie' + 'partage_tripartite'.
  const { data: messages = [] } = useMessages({ visibleByRole: 'direction' });
  const nonLus = messages.filter((m) => !m.lu).length;

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader
        title="Messages mairie"
        subtitle={`${messages.length} messages · ${nonLus} non lu${nonLus > 1 ? 's' : ''}`}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {messages.length === 0 ? (
          <View className="items-center py-12 bg-white rounded-2xl border border-slate-100">
            <Text className="text-slate-500 text-sm">Aucun message pour l'instant.</Text>
          </View>
        ) : (
          messages.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              onPress={() => router.push(`/direction/message-detail?id=${m.id}` as unknown as Href)}
            />
          ))
        )}
        <Text className="text-slate-400 text-xs text-center mt-4 px-6 leading-relaxed">
          Cette boîte ne contient que les messages mairie destinés à la direction d'établissement.
          Les diffusions adressées aux parents n'apparaissent pas ici.
        </Text>
      </ScrollView>
      <BottomNav variant="direction" />
    </View>
  );
}
