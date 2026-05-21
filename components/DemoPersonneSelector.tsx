/**
 * <DemoPersonneSelector /> — sheet modal qui liste les 5+ personnes mock pour
 * la démo. Tap = bascule l'identité courante + redirige vers la home du rôle.
 *
 * Affiché uniquement en mode démo (USE_SUPABASE=false) :
 *   - depuis le Welcome via un bouton "Mode démo"
 *   - depuis le profil parent (section "Mode démo")
 *   - depuis le dashboard mairie et la home direction (action "Mode démo")
 *
 * Inclut également un bouton "Réinitialiser la démo" pour repartir d'un état
 * propre entre deux présentations, sans avoir à switcher de rôle pour accéder
 * au profil parent.
 *
 * Pas de useSession ici — on bypass tout, le user "se connecte" instantanément
 * en se choisissant un personnage.
 */

import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { RefreshCw, Sparkles, X } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ECOLES, PERSONNES, resetMockData } from '../data/mockData';
import { useDemoUser } from '../hooks/useDemoUser';
import type { Personne, Role } from '../types';
import { COLORS } from '../constants/theme';

const ROLE_LABEL: Record<Role, string> = {
  parent_admin: 'Parent élu — Administrateur',
  parent_contributeur: 'Parent élu — Contributeur',
  mairie_admin: 'Mairie — Agent',
  elu: 'Mairie — Élu',
  direction: 'Direction d’école',
};

const ROLE_TONE: Record<Role, { bg: string; text: string }> = {
  parent_admin: { bg: 'bg-primary-50', text: 'text-primary-700' },
  parent_contributeur: { bg: 'bg-primary-50', text: 'text-primary-700' },
  mairie_admin: { bg: 'bg-mairie-50', text: 'text-mairie-700' },
  elu: { bg: 'bg-mairie-50', text: 'text-mairie-700' },
  direction: { bg: 'bg-direction-50', text: 'text-direction-700' },
};

interface DemoPersonneSelectorProps {
  visible: boolean;
  onClose: () => void;
  /** Titre du sheet (par défaut : "Mode démo — Choisir un personnage"). */
  title?: string;
  /** Description en haut du sheet. */
  description?: string;
}

function Row({
  personne,
  active,
  onPress,
}: {
  personne: Personne;
  active: boolean;
  onPress: () => void;
}) {
  const initials = `${personne.prenom.charAt(0)}${personne.nom.charAt(0)}`.toUpperCase();
  const tone = ROLE_TONE[personne.role];
  const ecole = personne.ecoleId ? ECOLES.find((e) => e.id === personne.ecoleId) : null;
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 p-3 rounded-2xl border mb-2 ${
        active ? 'border-primary-300 bg-primary-50/40' : 'border-slate-100 bg-white'
      }`}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View className={`w-11 h-11 rounded-xl items-center justify-center ${tone.bg}`}>
        <Text className={`font-bold text-sm ${tone.text}`}>{initials}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-slate-800 font-bold text-sm">
          {personne.prenom} {personne.nom}
        </Text>
        <Text className="text-slate-500 text-xs mt-0.5">{ROLE_LABEL[personne.role]}</Text>
        {ecole && <Text className="text-slate-400 text-[10px] mt-0.5">{ecole.nom}</Text>}
      </View>
      {active && (
        <View className="bg-primary-100 rounded-full px-2 py-0.5">
          <Text className="text-primary-700 text-[10px] font-bold uppercase">Actif</Text>
        </View>
      )}
    </Pressable>
  );
}

export function DemoPersonneSelector({
  visible,
  onClose,
  title = 'Mode démo — Choisir un personnage',
  description = 'Sélectionne une personne pour explorer son point de vue. Tu peux changer à tout moment depuis ton profil.',
}: DemoPersonneSelectorProps) {
  const { currentUser, switchTo } = useDemoUser();
  const queryClient = useQueryClient();

  const handleReset = () => {
    Alert.alert(
      'Réinitialiser la démo ?',
      "Toutes les données créées pendant cette session (dossiers, messages, RDV, personnes ajoutées) vont être restaurées à l'état initial. L'utilisateur courant reste inchangé.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => {
            resetMockData();
            queryClient.invalidateQueries();
            onClose();
            Alert.alert(
              'Démo réinitialisée',
              "Les listes sont restaurées à l'état d'origine. Tu peux relancer ta présentation depuis un état propre.",
            );
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-950/40">
        <View className="bg-white rounded-t-3xl p-5 max-h-[88%]">
          <View className="flex-row items-start justify-between gap-3 mb-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Sparkles color={COLORS.accent[400]} size={16} />
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  Démo
                </Text>
              </View>
              <Text className="text-slate-800 font-bold text-base">{title}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X color={COLORS.slate[600]} size={20} />
            </Pressable>
          </View>

          <Text className="text-slate-600 text-xs leading-relaxed mb-4">{description}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {PERSONNES.map((p) => (
              <Row
                key={p.id}
                personne={p}
                active={p.id === currentUser.id}
                onPress={() => {
                  switchTo(p.id);
                  onClose();
                }}
              />
            ))}
          </ScrollView>

          {/* Reset démo : accessible depuis tous les rôles via ce sheet, sans
              passer par /parent/profile. Sépare visuellement du picker via une
              fine bordure. */}
          <View className="mt-3 pt-3 border-t border-slate-100">
            <Pressable
              onPress={handleReset}
              className="flex-row items-center gap-2 p-3 rounded-xl bg-warning-50 border border-warning-100"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <RefreshCw color={COLORS.warning[600]} size={16} />
              <View className="flex-1">
                <Text className="text-slate-800 font-bold text-xs">Réinitialiser la démo</Text>
                <Text className="text-slate-500 text-[10px] mt-0.5">
                  Restaurer dossiers, messages, RDV et personnes à l’état initial.
                </Text>
              </View>
            </Pressable>
          </View>

          <Text className="text-slate-400 text-[10px] text-center mt-3 leading-relaxed">
            En production, la liste des utilisateurs sera gérée par la mairie via des invitations
            (cf. /aide/comment-ca-marche).
          </Text>
        </View>
      </View>
    </Modal>
  );
}
