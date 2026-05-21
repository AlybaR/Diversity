/**
 * Profil parent — vraie page (remplace le blueprint placeholder).
 *
 * Sections :
 *   1. Identité (nom, rôle, école, mairie)
 *   2. Préférences (notifications, email)
 *   3. RGPD (export, suppression, politique de confidentialité)
 *   4. Aide & Légal (liens vers /aide et /legal)
 *   5. Déconnexion
 *
 * Comportement RGPD :
 *   - Export : pour le MVP, déclenche un toast "Vous recevrez un email sous 24h".
 *     Phase 5 : Edge Function Supabase qui génère un ZIP avec toutes les données
 *     visibles par l'utilisateur et l'envoie en pièce jointe email.
 *   - Suppression : confirmation double (texte exact à taper) puis appel
 *     supabase.auth.signOut + suppression de la ligne `personnes`. Phase 5 :
 *     marquer pour suppression différée 30j (délai de réversibilité légal).
 */

import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Download,
  FileText,
  HelpCircle,
  LogOut,
  Mail,
  Scale,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react-native';
import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextInputField } from '../../components/TextInputField';
import { COLORS, GRADIENTS } from '../../constants/theme';
import { ECOLES, MAIRIE, UTILISATEUR_COURANT } from '../../data/mockData';
import { useSession } from '../../hooks/useSession';
import { addBreadcrumb, captureMessage } from '../../lib/sentry';
import { USE_SUPABASE } from '../../services/_config';

interface RowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
}

function Row({ icon, iconBg, title, subtitle, onPress, destructive }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-3 mb-2 border border-slate-100 flex-row items-center gap-3"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View className={`w-9 h-9 rounded-lg items-center justify-center ${iconBg}`}>{icon}</View>
      <View className="flex-1">
        <Text
          className={`font-semibold text-sm ${destructive ? 'text-danger-600' : 'text-slate-800'}`}
        >
          {title}
        </Text>
        {subtitle && <Text className="text-slate-500 text-xs mt-0.5">{subtitle}</Text>}
      </View>
      <ChevronRight color={COLORS.slate[400]} size={16} />
    </Pressable>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide mt-4 mb-2">
      {children}
    </Text>
  );
}

export default function ParentProfileScreen() {
  const insets = useSafeAreaInsets();
  const { personne, signOut } = useSession();

  // Source de vérité : si on a une vraie session Supabase, on lit `personne`.
  // Sinon (mode mock / dev local), on retombe sur UTILISATEUR_COURANT.
  const me = personne ?? UTILISATEUR_COURANT;
  const ecole = ECOLES.find((e) => e.id === me.ecoleId) ?? ECOLES[0];
  const initials = `${me.prenom.charAt(0)}${me.nom.charAt(0)}`.toUpperCase();
  const fonctionLabel =
    me.role === 'parent_admin'
      ? 'Parent élu — Administrateur'
      : me.role === 'parent_contributeur'
        ? 'Parent élu — Contributeur'
        : (me.fonction ?? 'Membre');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleExport = () => {
    addBreadcrumb({ category: 'rgpd', message: 'export-requested', data: { personne_id: me.id } });
    captureMessage(`rgpd-export-requested: personne=${me.id}`, 'info');
    Alert.alert(
      'Export de tes données',
      'Tu vas recevoir un email à ' +
        me.email +
        ' avec une archive ZIP de toutes tes données dans les 24 heures.\n\n' +
        '(En MVP : la pipeline d’export sera branchée en Phase 5. Pour le moment, ta demande est enregistrée.)',
    );
  };

  const handleDeleteConfirm = async () => {
    if (confirmText.trim().toLowerCase() !== 'supprimer') {
      Alert.alert(
        'Confirmation incorrecte',
        'Tape exactement "supprimer" pour confirmer la suppression.',
      );
      return;
    }
    addBreadcrumb({
      category: 'rgpd',
      message: 'delete-requested',
      data: { personne_id: me.id },
    });
    captureMessage(`rgpd-delete-requested: personne=${me.id}`, 'warning');
    setDeleteOpen(false);
    setConfirmText('');

    if (USE_SUPABASE) {
      // En prod : signOut puis (Phase 5) Edge Function qui marque pour suppression différée 30j
      await signOut();
      router.replace('/');
    } else {
      Alert.alert(
        'Demande enregistrée',
        'Ta demande de suppression est notée. En mode démo, le compte reste actif. En production, il sera désactivé sous 30 jours.',
      );
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header dégradé avec identité */}
      <LinearGradient
        colors={GRADIENTS.header as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-1 pb-5 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <X color="rgba(255,255,255,0.7)" size={20} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">Mon profil</Text>
          </View>
        </View>
        <View className="px-5 pb-5 items-center">
          <View
            className="w-20 h-20 rounded-2xl items-center justify-center border border-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Text className="text-white font-bold text-2xl">{initials}</Text>
          </View>
          <Text className="text-white font-bold text-base mt-3">
            {me.prenom} {me.nom}
          </Text>
          <Text className="text-primary-200 text-xs mt-0.5">{fonctionLabel}</Text>
          <View
            className="self-center flex-row items-center gap-1.5 rounded-full px-3 py-1 border border-white/20 mt-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Text className="text-white text-[11px] font-medium">{ecole.nom}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {/* Identité */}
        <SectionTitle>Identité</SectionTitle>
        <View className="bg-white rounded-2xl p-4 border border-slate-100">
          <View className="flex-row items-start gap-3 mb-3">
            <Mail color={COLORS.slate[500]} size={16} />
            <View className="flex-1">
              <Text className="text-slate-500 text-xs">Email</Text>
              <Text className="text-slate-800 text-sm font-semibold mt-0.5">{me.email}</Text>
            </View>
          </View>
          <View className="flex-row items-start gap-3">
            <ShieldCheck color={COLORS.slate[500]} size={16} />
            <View className="flex-1">
              <Text className="text-slate-500 text-xs">Mairie de rattachement</Text>
              <Text className="text-slate-800 text-sm font-semibold mt-0.5">{MAIRIE.nom}</Text>
            </View>
          </View>
        </View>

        {/* Préférences */}
        <SectionTitle>Préférences</SectionTitle>
        <Row
          icon={<Bell color={COLORS.primary[600]} size={18} />}
          iconBg="bg-primary-50"
          title="Notifications"
          subtitle="Email + push (à venir)"
          onPress={() => router.push('/parent/notifications-settings' as Href)}
        />

        {/* RGPD */}
        <SectionTitle>Données personnelles (RGPD)</SectionTitle>
        <Row
          icon={<Download color={COLORS.mairie[600]} size={18} />}
          iconBg="bg-mairie-50"
          title="Exporter mes données"
          subtitle="Archive ZIP envoyée par email sous 24h"
          onPress={handleExport}
        />
        <Row
          icon={<ShieldCheck color={COLORS.success[600]} size={18} />}
          iconBg="bg-success-50"
          title="Politique de confidentialité"
          subtitle="Ce que nous collectons et pourquoi"
          onPress={() => router.push('/legal/privacy' as Href)}
        />
        <Row
          icon={<Trash2 color={COLORS.danger[600]} size={18} />}
          iconBg="bg-danger-50"
          title="Supprimer mon compte"
          subtitle="Action irréversible, délai de 30 jours"
          onPress={() => setDeleteOpen(true)}
          destructive
        />

        {/* Aide & Légal */}
        <SectionTitle>Aide & Légal</SectionTitle>
        <Row
          icon={<HelpCircle color={COLORS.slate[600]} size={18} />}
          iconBg="bg-slate-100"
          title="Centre d’aide"
          subtitle="Comment ça marche, FAQ, contact"
          onPress={() => router.push('/aide' as Href)}
        />
        <Row
          icon={<Scale color={COLORS.slate[600]} size={18} />}
          iconBg="bg-slate-100"
          title="Conditions d’utilisation"
          onPress={() => router.push('/legal/cgu' as Href)}
        />
        <Row
          icon={<FileText color={COLORS.slate[600]} size={18} />}
          iconBg="bg-slate-100"
          title="Mentions légales"
          onPress={() => router.push('/legal/mentions' as Href)}
        />

        {/* Déconnexion */}
        <View className="mt-6">
          <SecondaryButton
            label="Se déconnecter"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          />
        </View>

        <Text className="text-slate-400 text-[10px] text-center mt-4">
          Passerelle v0.4.0 · Hébergé en France (eu-west-3)
        </Text>
      </ScrollView>

      <BottomNav variant="parent" />

      {/* Modal suppression compte */}
      <Modal visible={deleteOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-950/40">
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 bg-danger-50 rounded-xl items-center justify-center">
                  <Trash2 color={COLORS.danger[600]} size={20} />
                </View>
                <Text className="text-slate-800 font-bold text-base">Supprimer mon compte</Text>
              </View>
              <Pressable onPress={() => setDeleteOpen(false)} hitSlop={8}>
                <X color={COLORS.slate[600]} size={20} />
              </Pressable>
            </View>

            <Text className="text-slate-600 text-sm leading-relaxed mb-3">
              Cette action est <Text className="font-bold text-danger-600">irréversible</Text> après
              30 jours. Ton compte sera désactivé immédiatement et tu seras déconnecté. Pendant 30
              jours, tu pourras nous écrire au DPO pour annuler la suppression.
            </Text>

            <Text className="text-slate-600 text-sm leading-relaxed mb-3">
              Tes contributions passées (dossiers, messages, commentaires) resteront dans
              l’historique de l’école sous une forme anonymisée pour assurer la continuité
              institutionnelle.
            </Text>

            <Text className="text-slate-700 text-xs font-semibold mt-3 mb-2">
              Pour confirmer, tape <Text className="text-danger-600">supprimer</Text> ci-dessous :
            </Text>
            <TextInputField
              label=""
              placeholder="supprimer"
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="none"
            />

            <View className="gap-2 mt-4">
              <PrimaryButton
                label="Confirmer la suppression"
                onPress={handleDeleteConfirm}
                iconLeft={<Trash2 color="white" size={16} />}
              />
              <SecondaryButton
                label="Annuler"
                onPress={() => {
                  setDeleteOpen(false);
                  setConfirmText('');
                }}
                variant="ghost"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Bouton sortie discret en-dessous */}
      <View className="absolute right-4" style={{ bottom: 90 }}>
        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
          className="w-12 h-12 bg-slate-200 rounded-2xl items-center justify-center"
        >
          <LogOut color={COLORS.slate[600]} size={20} />
        </Pressable>
      </View>
    </View>
  );
}
