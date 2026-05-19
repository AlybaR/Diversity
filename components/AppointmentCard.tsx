import { Pressable, Text, View } from 'react-native';
import { CalendarDays, Clock, FileText, MapPin, Users } from 'lucide-react-native';
import type { RendezVous } from '../types';
import { Badge } from './Badge';

interface AppointmentCardProps {
  rdv: RendezVous;
  onPress?: () => void;
}

const STATUT_TONE: Record<
  RendezVous['statut'],
  'success' | 'warning' | 'slate' | 'danger' | 'primary'
> = {
  confirme: 'success',
  demande: 'warning',
  creneaux_proposes: 'primary',
  passe: 'slate',
  annule: 'danger',
};

const STATUT_LABEL: Record<RendezVous['statut'], string> = {
  confirme: 'Confirmé',
  demande: 'Demandé',
  creneaux_proposes: 'Créneaux proposés',
  passe: 'Passé',
  annule: 'Annulé',
};

export function AppointmentCard({ rdv, onPress }: AppointmentCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      className="bg-white rounded-2xl p-4 border border-slate-100 mb-3"
    >
      <View className="flex-row items-start justify-between mb-3">
        <Text className="text-slate-800 font-bold text-sm flex-1 pr-2">{rdv.titre}</Text>
        <Badge label={STATUT_LABEL[rdv.statut]} tone={STATUT_TONE[rdv.statut]} />
      </View>
      <View className="flex-row flex-wrap gap-3">
        <View className="flex-row items-center gap-1">
          <CalendarDays color="#10b981" size={12} />
          <Text className="text-slate-600 text-xs">{rdv.date}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Clock color="#10b981" size={12} />
          <Text className="text-slate-600 text-xs">{rdv.heure}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MapPin color="#10b981" size={12} />
          <Text className="text-slate-600 text-xs">{rdv.lieu}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-1 mt-2 pt-2 border-t border-slate-100">
        <Users color="#94a3b8" size={12} />
        <Text className="text-slate-500 text-xs flex-1" numberOfLines={1}>
          {rdv.participantsNoms.join(', ')}
        </Text>
      </View>
      {rdv.dossierLieTitre && (
        <Text className="text-slate-400 text-[11px] mt-1">Lié : {rdv.dossierLieTitre}</Text>
      )}
      {rdv.piecesJointes && rdv.piecesJointes.length > 0 && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <Text className="text-slate-500 text-[11px] font-semibold mb-2">Pièces jointes</Text>
          {rdv.piecesJointes.map((piece) => (
            <View key={piece.id} className="flex-row items-center gap-2">
              <FileText color="#94a3b8" size={12} />
              <Text className="text-slate-500 text-xs flex-1">{piece.nom}</Text>
              <Text className="text-slate-400 text-[11px]">{piece.taille}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
