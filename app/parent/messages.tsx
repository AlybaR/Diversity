import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MailPlus, Send, X } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { MessageCard } from '../../components/MessageCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { TextInputField } from '../../components/TextInputField';
import { useMessages } from '../../hooks';

export default function MessagesScreen() {
  const { data: messages = [] } = useMessages({ visibleByRole: 'parent_admin' });
  const [composerOpen, setComposerOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const nonLus = messages.filter((m) => !m.lu).length;

  const handleSend = () => {
    if (titre.trim().length < 4 || contenu.trim().length < 10) {
      Alert.alert(
        'Message incomplet',
        'Ajoutez un objet et un message suffisamment précis avant envoi.',
      );
      return;
    }
    setComposerOpen(false);
    setTitre('');
    setContenu('');
    Alert.alert(
      'Message préparé',
      'Dans la version connectée, ce message sera transmis au service éducation.',
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader
        title="Messages mairie"
        subtitle={`${messages.length} messages · ${nonLus} non lu${nonLus > 1 ? 's' : ''}`}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="mb-4">
          <PrimaryButton
            label="Écrire à la mairie"
            onPress={() => setComposerOpen(true)}
            iconLeft={<MailPlus color="white" size={18} />}
          />
        </View>

        {messages.map((m) => (
          <MessageCard
            key={m.id}
            message={m}
            onPress={() => router.push({ pathname: './message-detail', params: { id: m.id } })}
          />
        ))}
        <Text className="text-slate-400 text-xs text-center mt-4">
          Les messages de la mairie sont diffusés à l'ensemble des représentants élus de votre
          école.
        </Text>
      </ScrollView>

      <Modal visible={composerOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-slate-950/40">
          <View className="bg-white rounded-t-3xl p-5 max-h-[86%]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-800 font-bold text-lg">Nouveau message</Text>
                <Text className="text-slate-500 text-xs mt-0.5">Service éducation</Text>
              </View>
              <Pressable onPress={() => setComposerOpen(false)} hitSlop={8}>
                <X color="#475569" size={22} />
              </Pressable>
            </View>

            <View className="gap-4">
              <TextInputField
                label="Objet"
                placeholder="Ex : Question sur les travaux de juin"
                value={titre}
                onChangeText={setTitre}
              />
              <TextInputField
                label="Message"
                placeholder="Expliquez la demande, le contexte et l'échéance souhaitée..."
                value={contenu}
                onChangeText={setContenu}
                multiline
                numberOfLines={7}
                style={{ minHeight: 140, textAlignVertical: 'top', fontSize: 14 }}
              />
            </View>

            <View className="gap-3 mt-5">
              <PrimaryButton
                label="Envoyer le message"
                onPress={handleSend}
                iconLeft={<Send color="white" size={18} />}
              />
              <SecondaryButton
                label="Annuler"
                onPress={() => setComposerOpen(false)}
                variant="ghost"
              />
            </View>
          </View>
        </View>
      </Modal>
      <BottomNav variant="parent" />
    </View>
  );
}
