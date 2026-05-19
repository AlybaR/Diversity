import { ScrollView, Text, View } from 'react-native';
import { Building2, Mail, Phone } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { Badge } from '../../components/Badge';
import { BottomNav } from '../../components/BottomNav';
import { CATEGORIES, CONTACTS_MAIRIE } from '../../data/mockData';
import type { ContactMairie } from '../../types';

function categoryLabel(value: ContactMairie['categoriesLiees'][number]) {
  return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

function MairieContactCard({ contact }: { contact: ContactMairie }) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-slate-800 font-bold text-sm">{contact.nom}</Text>
          <Text className="text-slate-500 text-xs mt-0.5">{contact.fonction}</Text>
        </View>
        <Badge label={contact.service} tone="emerald" />
      </View>

      <Text className="text-slate-600 text-xs leading-relaxed mt-3">{contact.perimetre}</Text>

      <View className="gap-2 mt-3 pt-3 border-t border-slate-100">
        <View className="flex-row items-center gap-2">
          <Mail color="#94a3b8" size={13} />
          <Text className="text-slate-500 text-xs flex-1">{contact.email}</Text>
        </View>
        {contact.telephone && (
          <View className="flex-row items-center gap-2">
            <Phone color="#94a3b8" size={13} />
            <Text className="text-slate-500 text-xs">{contact.telephone}</Text>
          </View>
        )}
      </View>

      <View className="flex-row flex-wrap mt-3" style={{ gap: 6 }}>
        {contact.categoriesLiees.map((category) => (
          <Badge key={category} label={categoryLabel(category)} tone="slate" />
        ))}
      </View>
    </View>
  );
}

export default function DirectionDirectoryScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader
        title="Annuaire mairie"
        subtitle={`${CONTACTS_MAIRIE.length} services et référents`}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-100">
          <View className="flex-row items-center gap-2 mb-1">
            <Building2 color="#4f46e5" size={16} />
            <Text className="text-slate-700 font-bold text-sm">Vos interlocuteurs mairie</Text>
          </View>
          <Text className="text-slate-500 text-xs leading-relaxed">
            Liste des référents mairie pour les sujets transverses : bâtiment, voirie, sécurité,
            restauration et cabinet. Utilisez l'annuaire pour orienter un nouveau sujet ou préparer
            un rendez-vous.
          </Text>
        </View>

        {CONTACTS_MAIRIE.map((contact) => (
          <MairieContactCard key={contact.id} contact={contact} />
        ))}

        <Text className="text-slate-400 text-xs text-center mt-4 px-6 leading-relaxed">
          La liste des représentants des parents n'apparaît pas ici : la direction d'établissement
          interagit avec la mairie via les sujets institutionnels et les rendez-vous concertés.
        </Text>
      </ScrollView>
      <BottomNav variant="direction" />
    </View>
  );
}
