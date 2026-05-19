import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Key,
  MapPin,
  XCircle,
} from 'lucide-react-native';
import { GRADIENTS } from '../constants/theme';
import { TextInputField } from '../components/TextInputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { ECOLES, MAIRIE } from '../data/mockData';

type KeyState = 'input' | 'valid' | 'invalid' | 'expired';

export default function JoinSchoolScreen() {
  const insets = useSafeAreaInsets();
  const [keyValue, setKeyValue] = useState('');
  const [state, setState] = useState<KeyState>('input');

  const handleContinue = () => {
    const value = keyValue.trim().toUpperCase();
    if (value === 'JAURES-2026') {
      setState('valid');
    } else if (value === 'EXPIRE') {
      setState('expired');
    } else if (value.length > 0) {
      setState('invalid');
    }
  };

  const reset = () => {
    setState('input');
    setKeyValue('');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header dégradé */}
      <LinearGradient
        colors={GRADIENTS.header as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="px-5 pt-2 pb-6">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1 mb-4 self-start"
            hitSlop={8}
          >
            <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
            <Text className="text-white/70 text-sm">Retour</Text>
          </Pressable>
          <Text className="text-xl font-bold text-white">Rejoindre mon école</Text>
          <Text className="text-primary-200 text-sm mt-1">
            Saisissez le code reçu par votre école
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: insets.bottom + 24 }}
      >
        {state === 'input' && (
          <View>
            {/* Icône clé */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-primary-50 rounded-2xl items-center justify-center">
                <Key color="#2563eb" size={28} />
              </View>
            </View>

            <TextInputField
              label="Code école"
              placeholder="Ex : JAURES-2026"
              value={keyValue}
              onChangeText={(t) => setKeyValue(t.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              monospace
              helper="Ce code vous a été transmis par votre direction d'école ou la mairie."
            />

            <View className="mt-4">
              <PrimaryButton label="Continuer" onPress={handleContinue} />
            </View>

            {/* Bandeau d'astuce */}
            <View
              className="mt-8 p-4 rounded-xl border border-warning-100"
              style={{ backgroundColor: '#fffbeb' }}
            >
              <Text className="text-amber-700 text-xs leading-relaxed">
                <Text className="font-semibold">💡 Astuce : </Text>
                Le code école se trouve dans l'email d'invitation ou sur le document remis lors de
                la réunion de rentrée. Tapez{' '}
                <Text className="font-bold" style={{ fontFamily: 'monospace' }}>
                  JAURES-2026
                </Text>{' '}
                pour tester.
              </Text>
            </View>
          </View>
        )}

        {state === 'valid' && (
          <View>
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-success-50 rounded-2xl items-center justify-center">
                <CheckCircle2 color="#10b981" size={32} />
              </View>
            </View>

            <Text className="text-center text-lg font-bold text-slate-800 mb-6">
              École reconnue !
            </Text>

            {/* Carte école détectée */}
            <View
              className="rounded-2xl p-5 border border-primary-100 mb-6"
              style={{ backgroundColor: '#eff6ff' }}
            >
              <View className="flex-row items-start gap-3 mb-4">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center bg-white"
                  style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 1,
                  }}
                >
                  <Building2 color="#1d4ed8" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-800">{ECOLES[0].nom}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <MapPin color="#94a3b8" size={12} />
                    <Text className="text-slate-500 text-xs">{ECOLES[0].adresse}</Text>
                  </View>
                </View>
              </View>
              <View
                className="rounded-xl p-3 flex-row items-center gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}
              >
                <Building2 color="#94a3b8" size={14} />
                <Text className="text-slate-600 text-sm">
                  Collectivité : <Text className="font-semibold text-slate-700">{MAIRIE.nom}</Text>
                </Text>
              </View>
            </View>

            <PrimaryButton
              label="Confirmer et créer mon compte"
              onPress={() => router.push('/create-account')}
            />
          </View>
        )}

        {state === 'invalid' && (
          <View>
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-danger-50 rounded-2xl items-center justify-center">
                <XCircle color="#ef4444" size={32} />
              </View>
            </View>
            <Text className="text-center text-lg font-bold text-slate-800 mb-2">
              Code non reconnu
            </Text>
            <Text className="text-center text-sm text-slate-500 mb-6 px-4">
              Ce code ne correspond à aucune école enregistrée. Vérifiez la saisie ou contactez
              votre direction.
            </Text>
            <SecondaryButton label="Réessayer" onPress={reset} variant="slate" />
          </View>
        )}

        {state === 'expired' && (
          <View>
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-warning-50 rounded-2xl items-center justify-center">
                <Clock color="#f59e0b" size={32} />
              </View>
            </View>
            <Text className="text-center text-lg font-bold text-slate-800 mb-2">Clé expirée</Text>
            <Text className="text-center text-sm text-slate-500 mb-6 px-4">
              Cette clé n'est plus active. Demandez une nouvelle invitation à votre direction
              d'école ou à votre mairie.
            </Text>
            <SecondaryButton label="Réessayer" onPress={reset} variant="slate" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
