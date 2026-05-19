import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { CalendarDays, FileText, MessageSquare, Paperclip, Send } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { Badge } from '../../components/Badge';
import { StatutBadge, UrgenceBadge } from '../../components/StatusBadge';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextInputField } from '../../components/TextInputField';
import { CATEGORIES, COMMENTAIRES_DOSSIER, PIECES_JOINTES } from '../../data/mockData';
import { useDossier, useDossiers, useEcole, usePersonnes } from '../../hooks';
import { canRoleSeeScope, type CommentaireDossier } from '../../types';

export default function DossierDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: specificDossier } = useDossier(id);
  const { data: allDossiers = [] } = useDossiers({ visibleByRole: 'parent_admin' });
  const dossier = specificDossier ?? allDossiers[0];
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
      Alert.alert('Commentaire trop court', 'Ajoutez au moins une phrase utile au dossier.');
      return;
    }

    setCommentairesLocaux((current) => [
      ...current,
      {
        id: `comment-local-${Date.now()}`,
        dossierId: dossier?.id ?? '',
        auteurNom: 'Nadia Benali',
        roleLabel: 'Parent administrateur',
        date: "À l'instant",
        contenu,
      },
    ]);
    setCommentaire('');
    Alert.alert('Commentaire ajouté', 'Il apparaîtra dans le fil du dossier.');
  };

  if (!dossier) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 text-sm">Chargement…</Text>
      </View>
    );
  }

  // Garde-fou : un parent ne doit jamais ouvrir un dossier direction_mairie ou mairie_interne,
  // même en collant un id dans l'URL. Pas de fuite du titre.
  if (!canRoleSeeScope('parent_admin', dossier.visibilityScope)) {
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
            label="Retour à mes dossiers"
            onPress={() => router.replace('/parent/dossiers')}
          />
        </View>
        <BottomNav variant="parent" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Détail dossier" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-3">
          <Text className="text-slate-800 font-bold text-lg mb-3">{dossier.titre}</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            <Badge label={categorie?.label ?? ''} tone="slate" />
            <StatutBadge statut={dossier.statut} />
            <UrgenceBadge urgence={dossier.urgence} />
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

        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          <Text className="text-slate-700 font-bold text-sm mb-3">
            Pièces jointes ({piecesJointes.length})
          </Text>
          {piecesJointes.length === 0 ? (
            <Text className="text-slate-400 text-xs">
              Aucune pièce jointe n'est associée à ce dossier pour l'instant.
            </Text>
          ) : (
            <View className="gap-2">
              {piecesJointes.map((piece) => (
                <View
                  key={piece.id}
                  className="flex-row items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <View className="h-10 w-10 rounded-xl bg-primary-50 items-center justify-center">
                    <Paperclip color="#2563eb" size={18} />
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
          )}
        </View>

        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          <Text className="text-slate-700 font-bold text-sm mb-3">Historique</Text>
          {dossier.historique.map((h, idx) => (
            <View key={h.id} className="flex-row gap-3 mb-3">
              <View className="items-center">
                <View className="w-2 h-2 rounded-full bg-primary-500" />
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
              placeholder="Ex : information complémentaire, retour d'une famille, point à confirmer..."
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
          <PrimaryButton
            label="Ajouter une information"
            iconLeft={<FileText color="white" size={18} />}
            onPress={() =>
              Alert.alert(
                'Information complémentaire',
                'Dans le MVP, ajoutez cette information via le fil de commentaires du dossier.',
              )
            }
          />
          <SecondaryButton
            label="Demander un rendez-vous"
            iconLeft={<CalendarDays color="#334155" size={18} />}
            onPress={() => router.push('/parent/appointments')}
          />
          <SecondaryButton
            label="Relancer la mairie"
            iconLeft={<MessageSquare color="#334155" size={18} />}
            variant="ghost"
            onPress={() =>
              Alert.alert(
                'Relance préparée',
                'Une notification de relance sera envoyée à la mairie dans la version connectée au backend.',
              )
            }
          />
        </View>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}
