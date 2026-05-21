/**
 * /mairie/dossier-detail — vue mairie d'un dossier.
 *
 * Inspirée de `app/parent/dossier-detail.tsx` mais :
 *   - Pas de garde RLS côté UI (la mairie voit tous les scopes)
 *   - Couleurs teal mairie au lieu de bleu primary
 *   - Action principale = « Répondre » (vers /mairie/reply?id={dossier.id})
 *   - Action secondaire = « Partager en tripartite » (basculer le scope si
 *     pas déjà tripartite). Avec confirmation explicite que l'historique
 *     deviendra visible à tous.
 */

import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, router, type Href } from 'expo-router';
import { CalendarDays, FileText, Paperclip, Send, Share2 } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { Badge } from '../../components/Badge';
import { StatutBadge, UrgenceBadge } from '../../components/StatusBadge';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextInputField } from '../../components/TextInputField';
import { CATEGORIES, COMMENTAIRES_DOSSIER, PIECES_JOINTES, PERSONNES } from '../../data/mockData';
import { useDossier, useEcole, useShareDossierTripartite } from '../../hooks';
import { scopeShortLabel, type CommentaireDossier } from '../../types';

export default function MairieDossierDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: specificDossier } = useDossier(id);
  const dossier = specificDossier;
  const { data: ecole } = useEcole(dossier?.ecoleId);
  const createur = PERSONNES.find((p) => p.id === dossier?.createurId);
  const categorie = CATEGORIES.find((c) => c.value === dossier?.categorie);
  const [commentaire, setCommentaire] = useState('');
  const [commentairesLocaux, setCommentairesLocaux] = useState<CommentaireDossier[]>([]);
  const shareTripartite = useShareDossierTripartite();

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
        auteurNom: 'Claire Moreau',
        roleLabel: 'Mairie — Service éducation',
        date: "À l'instant",
        contenu,
      },
    ]);
    setCommentaire('');
    Alert.alert('Commentaire publié', 'Il apparaît dans le fil du dossier.');
  };

  const handleShareTripartite = () => {
    if (!dossier) return;
    if (dossier.visibilityScope === 'partage_tripartite') {
      Alert.alert(
        'Déjà partagé',
        'Ce dossier est déjà visible par les parents élus, la direction et la mairie.',
      );
      return;
    }
    Alert.alert(
      'Partager en tripartite ?',
      `Le dossier deviendra visible par les parents élus, la direction et la mairie. L'historique complet sera accessible aux nouveaux destinataires.\n\nCanal actuel : ${scopeShortLabel(dossier.visibilityScope)}.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer le partage',
          onPress: async () => {
            try {
              await shareTripartite.mutateAsync({
                dossierId: dossier.id,
                acteurNom: 'Claire Moreau — Mairie',
              });
              Alert.alert('Partage effectué', 'Le dossier est maintenant en tripartite.');
            } catch (err) {
              Alert.alert('Erreur', err instanceof Error ? err.message : 'Échec du partage.');
            }
          },
        },
      ],
    );
  };

  if (!dossier) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-slate-400 text-sm">Chargement…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Détail dossier" subtitle="Vue mairie" />
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
            {dossier.interlocuteurCible && (
              <Text className="text-slate-500 text-xs">
                Interlocuteur cible :{' '}
                <Text className="text-slate-700 font-semibold">{dossier.interlocuteurCible}</Text>
              </Text>
            )}
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
            <Text className="text-slate-400 text-xs">Aucune pièce jointe pour ce dossier.</Text>
          ) : (
            <View className="gap-2">
              {piecesJointes.map((piece) => (
                <View
                  key={piece.id}
                  className="flex-row items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <View className="h-10 w-10 rounded-xl bg-mairie-50 items-center justify-center">
                    <Paperclip color="#0d9488" size={18} />
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
                <View className="w-2 h-2 rounded-full bg-mairie-500" />
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
              label="Ajouter un commentaire interne mairie"
              placeholder="Ex : note pour l'équipe, à valider avec l'élu, etc."
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
            label="Répondre au dossier"
            iconLeft={<FileText color="white" size={18} />}
            onPress={() =>
              router.push({
                pathname: '/mairie/reply',
                params: { id: dossier.id },
              } as unknown as Href)
            }
          />
          {dossier.visibilityScope !== 'partage_tripartite' &&
            dossier.visibilityScope !== 'mairie_interne' && (
              <SecondaryButton
                label="Partager en tripartite (parents + direction)"
                iconLeft={<Share2 color="#334155" size={18} />}
                onPress={handleShareTripartite}
              />
            )}
          <SecondaryButton
            label="Proposer un rendez-vous"
            iconLeft={<CalendarDays color="#334155" size={18} />}
            variant="ghost"
            onPress={() => router.push('/mairie/rendez-vous' as Href)}
          />
        </View>
      </ScrollView>
      <BottomNav variant="mairie" />
    </View>
  );
}
