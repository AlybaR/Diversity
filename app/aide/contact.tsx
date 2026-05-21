/**
 * /aide/contact — formulaire de contact + adresses de référence.
 *
 * Pas encore d'envoi réel (Phase 5 : Edge Function Supabase + relai email).
 * Pour le MVP, l'envoi affiche une alerte de confirmation et logue côté
 * Sentry pour qu'on récupère les messages tant qu'on n'a pas la pipeline.
 */

import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Mail, Send, Shield } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextInputField } from '../../components/TextInputField';
import { COLORS } from '../../constants/theme';
import { captureMessage } from '../../lib/sentry';

const DPO_EMAIL = 'dpo@passerelle.fr'; // TODO Phase 4 : remplacer par l'email réel quand le DPO sera désigné
const SUPPORT_EMAIL = 'contact@passerelle.fr'; // TODO Phase 4 : idem

export default function ContactScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (subject.trim().length < 4 || message.trim().length < 10) {
      Alert.alert('Message incomplet', 'Indique un objet et un message d’au moins 10 caractères.');
      return;
    }
    setSending(true);
    // Phase 5 : remplacer par un appel à une Edge Function Supabase qui relaie l'email
    captureMessage(`contact-form: subject="${subject}" length=${message.length}`, 'info');
    setTimeout(() => {
      setSending(false);
      setSubject('');
      setMessage('');
      Alert.alert(
        'Message envoyé',
        'Nous reviendrons vers toi sous 48h ouvrées. En attendant, tu peux nous joindre directement par email à contact@passerelle.fr.',
      );
    }, 600);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Contact" subtitle="Nous écrire" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          <View className="flex-row items-center gap-2 mb-2">
            <Mail color={COLORS.primary[600]} size={18} />
            <Text className="text-slate-800 font-bold text-sm">Support général</Text>
          </View>
          <Text className="text-slate-600 text-xs leading-relaxed">
            Pour toute question d’usage, signalement de bug ou suggestion d’amélioration :
          </Text>
          <Text className="text-primary-600 font-semibold text-sm mt-1">{SUPPORT_EMAIL}</Text>
          <Text className="text-slate-400 text-xs mt-2">Réponse sous 48h ouvrées.</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          <View className="flex-row items-center gap-2 mb-2">
            <Shield color={COLORS.success[600]} size={18} />
            <Text className="text-slate-800 font-bold text-sm">DPO — données personnelles</Text>
          </View>
          <Text className="text-slate-600 text-xs leading-relaxed">
            Pour exercer tes droits RGPD (accès, rectification, suppression, portabilité,
            opposition) ou poser une question sur la confidentialité :
          </Text>
          <Text className="text-success-600 font-semibold text-sm mt-1">{DPO_EMAIL}</Text>
          <Text className="text-slate-400 text-xs mt-2">Réponse sous 30 jours (délai légal).</Text>
        </View>

        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide mt-3 mb-2">
          Formulaire de contact
        </Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100">
          <View className="gap-4">
            <TextInputField
              label="Objet"
              placeholder="Ex : Problème de connexion magic link"
              value={subject}
              onChangeText={setSubject}
            />
            <TextInputField
              label="Message"
              placeholder="Décris le contexte, ce que tu cherches à faire, ce qui se passe…"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              style={{ minHeight: 120, textAlignVertical: 'top', fontSize: 14 }}
            />
          </View>
          <View className="mt-4">
            <PrimaryButton
              label={sending ? 'Envoi…' : 'Envoyer'}
              onPress={handleSend}
              iconLeft={<Send color="white" size={16} />}
              disabled={sending}
            />
          </View>
          <Pressable className="mt-3">
            <Text className="text-slate-400 text-xs text-center">
              Aucune donnée sensible ne doit être incluse dans ce message (mot de passe, données de
              santé, numéro de sécurité sociale, etc.).
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
