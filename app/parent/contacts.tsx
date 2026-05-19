import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import {
  Building2,
  Bus,
  ChevronRight,
  Construction,
  Mail,
  Phone,
  ShieldAlert,
  Utensils,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';

const contacts = [
  {
    title: 'Sécurité aux abords',
    service: 'Service Voirie',
    icon: ShieldAlert,
    color: '#ef4444',
    route: 'securite',
    delai: 'Réponse cible : 7 jours',
  },
  {
    title: 'Bâtiments et sanitaires',
    service: 'Service Bâtiment',
    icon: Construction,
    color: '#2563eb',
    route: 'batiment',
    delai: 'Réponse cible : 15 jours',
  },
  {
    title: 'Restauration scolaire',
    service: 'Service Restauration',
    icon: Utensils,
    color: '#d97706',
    route: 'restauration',
    delai: 'Réponse cible : 10 jours',
  },
  {
    title: 'Périscolaire et sorties',
    service: 'Service Éducation',
    icon: Bus,
    color: '#0d9488',
    route: 'periscolaire',
    delai: 'Réponse cible : 10 jours',
  },
];

export default function ContactsScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="À qui s'adresser ?" subtitle="Orientation des demandes école" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Card className="mb-3">
          <View className="flex-row items-start gap-3">
            <View className="w-11 h-11 bg-primary-50 rounded-xl items-center justify-center">
              <Building2 color="#2563eb" size={21} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 text-sm font-bold">Point d'entrée conseillé</Text>
              <Text className="text-slate-500 text-xs leading-relaxed mt-1">
                Créez un dossier depuis l'application : la mairie le route vers le bon service avec
                tout l'historique attaché.
              </Text>
            </View>
          </View>
        </Card>

        <View className="gap-3">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <Pressable
                key={contact.title}
                onPress={() =>
                  router.push({
                    pathname: '/parent/new-request',
                    params: { categorie: contact.route },
                  })
                }
                className="bg-white rounded-2xl p-4 border border-slate-100"
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                <View className="flex-row items-start gap-3">
                  <View className="w-11 h-11 rounded-xl items-center justify-center bg-slate-50">
                    <Icon color={contact.color} size={21} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 text-sm font-bold">{contact.title}</Text>
                    <Text className="text-slate-500 text-xs mt-1">{contact.service}</Text>
                    <Text className="text-slate-400 text-xs mt-1">{contact.delai}</Text>
                  </View>
                  <ChevronRight color="#cbd5e1" size={18} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <Card className="mt-3">
          <Text className="text-slate-800 text-sm font-bold mb-3">Contacts utiles</Text>
          <View className="gap-2">
            <ContactLine
              icon={<Mail color="#64748b" size={15} />}
              label="education@montreuil-sur-seine.fr"
            />
            <ContactLine icon={<Phone color="#64748b" size={15} />} label="01 42 00 00 00" />
          </View>
          <Pressable
            onPress={() =>
              Alert.alert(
                'Contact direct',
                'Pour garder une trace collective, privilégiez un dossier partagé dans l’application.',
              )
            }
            className="self-start mt-3"
          >
            <Badge label="Traçabilité recommandée" tone="primary" />
          </Pressable>
        </Card>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}

function ContactLine({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-2 rounded-xl bg-slate-50 p-3">
      {icon}
      <Text className="text-slate-600 text-xs font-semibold">{label}</Text>
    </View>
  );
}
