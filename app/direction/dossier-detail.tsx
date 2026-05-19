import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, router, type Href } from 'expo-router';
import { CalendarDays, Paperclip, Send } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { Badge } from '../../components/Badge';
import { StatutBadge, UrgenceBadge } from '../../components/StatusBadge';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextInputField } from '../../components/TextInputField';
import { CATEGORIES, COMMENTAIRES_DOSSIER, PERSONNES, PIECES_JOINTES } from '../../data/mockData';
import { useDossier, useEcole, usePersonnes } from '../../hooks';
import { canRoleSeeScope, scopeShortLabel, type CommentaireDossier } from '../../types';

const DIRECTION = PERSONNES.find((p) => p.role === 'direction');

export default function DirectionDossierDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: dossier } = useDossier(id);
  const { data: ecole } = useEcole(dossier?.ecoleId);
  const { data: personnes = [] } = usePersonnes();
  const createur = personnes.find((p) => p.id === dossier?.createurId);
  const categorie = CATEGORIES.find((c) => c.value === dossier?.categorie);
  const [commentaire, setCommentaire] = useState('');
  const [commentairesLocaux, setCommentairesLocaux] = useState<CommentaireDossier[]>([]);

  const piecesJointes = useMemo(
    () => PIECES_JOINTES.filter((piece) => piece.dossierId === dossier?.id),
    [dossier?.id],
  );
  const commentaires = useMemo(
    () => [
      ...COMMENTAIRES_DOSSIER.filter((item) => item.dossierId === dossier?.id),
      ...commentairesLocaux,
    ],
    [commentairesLocaux, dossier?.id],
  );

  const handleAddComment = () => {
    const contenu = commentaire.trim();
    if (contenu.length < 8) {
      Alert.alert('Commentaire trop court', 'Ajoutez au moins une phrase utile au sujet.');
      return;
    }
    setCommentairesLocaux((current) => [
      ...current,
      {
        id: `comment-local-${Date.now()}`,
        dossierId: dossier?.id ?? '',
        auteurNom: DIRECTION ? `${DIRECTION.prenom} ${DIRECTION.nom}` : 'Direction',
        roleLabel: 'Direction école',
        date: "À l'instant",
        contenu,
      },
    ]);
    setCommentaire('');
    Alert.alert('Commentaire ajouté', 'Il apparaîtra dans le fil du sujet.');
  };

  // Garde-fou : seule la matrice canRoleSeeScope autorise l'accès.
  // Sobre : pas de fuite du titre, pas de détails sur ce qu'on bloque.
  if (dossier && !canRoleSeeScope('direction', dossier.visibilityScope)) {
    return (
      <View className="flex-1 bg-slate-50">
        <AppHeader title="Accès refusé" />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-slate-700 font-semibold text-base text-center mb-2">
            Vous n'avez pas accès à ce dossier.
          </Text>
          <Text className="text-slate-500 text-xs text-center leading-relaxed mb-6">
            Si vous pensez que c'est une erreur, contactez le service éducation de la mairie.
          </Text>
          <SecondaryButton
            label="Retour à mes sujets"
            onPress={() => router.replace('/direction/dossiers' as Href)}
          />
        </View>
        <BottomNav variant="direction" />
      </View>
    );
  }

  if (!dossier) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 text-sm">Chargement…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Détail sujet" subtitle="Espace direction" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-3">
          <Text className="text-slate-800 font-bold text-lg mb-3">{dossier.titre}</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            <Badge label={categorie?.label ?? ''} tone="slate" />
            <StatutBadge statut={dossier.statut} />
            <UrgenceBadge urgence={dossier.urgence} />
            <Badge label={scopeShortLabel(dossier.visibilityScope)} tone="indigo" />
          </View>
          <Text className="text-slate-600 text-sm leading-relaxed">{dossier.description}</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          <Text className="text-slate-700 font-bold text-sm mb-3">Contexte</Text>
          <View className="gap-2">
            <Text className="text-slate-500 text-xs">
              École : <Text className="text-slate-700 font-semibold">{ecole?.nom}</Text>
            </Text>
            <Text className="text-slate-500 text-xs">
              Créé par :{' '}
              <Text className="text-slate-700 font-semibold">
                {createur?.prenom} {createur?.nom}
              </Text>
            </Text>
            <Text className="text-slate-500 text-xs">
              Interlocuteur cible :{' '}
              <Text className="text-slate-700 font-semibold">{dossier.interlocuteurCible}</Text>
            </Text>
            <Text className="text-slate-500 text-xs">
              Dernière mise à jour :{' '}
              <Text className="text-slate-700 font-semibold">{dossier.derniereMaj}</Text>
            </Text>
          </View>
        </View>

        {piecesJointes.length > 0 && (
          <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
            <Text className="text-slate-700 font-bold text-sm mb-3">
              Pièces jointes ({piecesJointes.length})
            </Text>
            <View className="gap-2">
              {piecesJointes.map((piece) => (
                <View
                  key={piece.id}
                  className="flex-row items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <View className="h-10 w-10 rounded-xl bg-direction-50 items-center justify-center">
                    <Paperclip color="#4f46e5" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 text-sm font-semibold" numberOfLines={1}>
                      {piece.nom}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      {piece.taille} · ajouté par {piece.ajoutePar} · {piece.date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          <Text className="text-slate-700 font-bold text-sm mb-3">Historique</Text>
          {dossier.historique.map((h, idx) => (
            <View key={h.id} className="flex-row gap-3 mb-3">
              <View className="items-center">
                <View className="w-2 h-2 rounded-full bg-direction-500" />
                {idx < dossier.historique.length - 1 && (
                  <View className="w-px flex-1 bg-slate-200 mt-1" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 text-sm font-semibold">{h.description}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {h.date} · {h.acteurNom}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          <Text className="text-slate-700 font-bold text-sm mb-3">
            Commentaires ({commentaires.length})
          </Text>
          <View className="gap-3">
            {commentaires.map((item) => (
              <View key={item.id} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-slate-800 text-sm font-bold">{item.auteurNom}</Text>
                    <Text className="text-slate-400 text-xs">
                      {item.roleLabel} · {item.date}
                    </Text>
                  </View>
                  {item.important && <Badge label="À retenir" tone="warning" />}
                </View>
                <Text className="text-slate-600 text-sm leading-relaxed mt-2">{item.contenu}</Text>
              </View>
            ))}
          </View>

          <View className="mt-4 gap-3">
            <TextInputField
              label="Ajouter un commentaire"
              placeholder="Précision technique, retour terrain, point à confirmer avec la mairie..."
              value={commentaire}
              onChangeText={setCommentaire}
              multiline
              numberOfLines={4}
              style={{ minHeight: 96, textAlignVertical: 'top', fontSize: 14 }}
            />
            <SecondaryButton
              label="Publier le commentaire"
              onPress={handleAddComment}
              iconLeft={<Send color="#334155" size={18} />}
            />
          </View>
        </View>

        <View className="gap-3 mt-3">
          <SecondaryButton
            label="Proposer un rendez-vous"
            iconLeft={<CalendarDays color="#334155" size={18} />}
            onPress={() => router.push('/direction/appointments' as Href)}
          />
        </View>
      </ScrollView>
      <BottomNav variant="direction" />
    </View>
  );
}
