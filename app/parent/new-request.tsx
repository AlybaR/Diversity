import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Paperclip, Save, Send, Share2, AlertCircle } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { TextInputField } from '../../components/TextInputField';
import { SelectField, type SelectOption } from '../../components/SelectField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { ScopeSelector } from '../../components/ScopeSelector';
import { CATEGORIES, URGENCES } from '../../data/mockData';
import type { Categorie, Urgence, VisibilityScope } from '../../types';

const CATEGORIE_OPTIONS: SelectOption<Categorie>[] = CATEGORIES.map((c) => ({
  value: c.value,
  label: c.label,
}));

const URGENCE_LABELS: Record<Urgence, string> = {
  faible: 'Faible — information',
  moyenne: 'Moyenne — à traiter',
  elevee: 'Élevée — sécurité / urgence',
};

const URGENCE_COLORS: Record<Urgence, { bg: string; text: string; border: string }> = {
  faible: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  moyenne: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  elevee: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

const ORIENTATIONS: Partial<Record<Categorie, string>> = {
  securite: 'Suggéré : Service Voirie + Direction',
  voirie: 'Suggéré : Service Voirie',
  batiment: 'Suggéré : Service Bâtiment',
  travaux: 'Suggéré : Service Bâtiment / Travaux',
  sanitaires: 'Suggéré : Service Bâtiment',
  restauration: 'Suggéré : Service Restauration',
  periscolaire: 'Suggéré : Service Périscolaire',
  carte_scolaire: 'Suggéré : Cabinet adjoint éducation',
  communication: 'Suggéré : Service Communication',
  accessibilite: 'Suggéré : Référent accessibilité',
  rendez_vous: 'Suggéré : Service Éducation',
};

export default function NewRequestScreen() {
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [urgence, setUrgence] = useState<Urgence>('moyenne');
  const [nbPieces, setNbPieces] = useState(0);
  // Par défaut, on met en visibilité tripartite (sujet partagé) : le parent doit
  // explicitement choisir 'parents_mairie' pour exclure la direction.
  const [scope, setScope] = useState<VisibilityScope>('partage_tripartite');
  const [submitted, setSubmitted] = useState(false);

  const isValid = categorie !== null && titre.trim().length >= 5 && description.trim().length >= 10;

  const handleSave = () => {
    Alert.alert(
      'Brouillon enregistré',
      'Votre demande est conservée et peut être complétée plus tard.',
    );
  };

  const handleShare = () => {
    setSubmitted(true);
    if (!isValid) {
      Alert.alert(
        'Demande incomplète',
        'Choisis une catégorie, un titre (≥ 5) et une description (≥ 10).',
      );
      return;
    }
    Alert.alert(
      'Partagé aux représentants',
      "Les autres représentants élus de l'école peuvent maintenant commenter.",
    );
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) {
      Alert.alert(
        'Demande incomplète',
        'Choisis une catégorie, un titre (≥ 5) et une description (≥ 10).',
      );
      return;
    }
    const scopeMessage =
      scope === 'parents_mairie'
        ? "Visible uniquement par la mairie et les parents élus de l'école."
        : 'Visible par la mairie, les parents élus et la direction.';
    Alert.alert('Demande transmise', `La mairie a bien reçu votre demande. ${scopeMessage}`, [
      { text: 'OK', onPress: () => router.replace('/parent/dossiers') },
    ]);
  };

  const urgenceColor = URGENCE_COLORS[urgence];

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Nouvelle demande" subtitle="École Jean Jaurès" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4">
          <SelectField<Categorie>
            label="Catégorie"
            value={categorie}
            onChange={setCategorie}
            options={CATEGORIE_OPTIONS}
            placeholder="Choisir la catégorie…"
          />
          {submitted && categorie === null && (
            <Text className="text-danger-500 text-xs -mt-3">Catégorie requise</Text>
          )}

          {categorie && ORIENTATIONS[categorie] && (
            <View className="flex-row items-start gap-2 -mt-2 p-3 bg-primary-50 rounded-xl border border-primary-100">
              <AlertCircle color="#1d4ed8" size={16} style={{ marginTop: 1 }} />
              <Text className="flex-1 text-primary-700 text-xs leading-relaxed">
                {ORIENTATIONS[categorie]}
              </Text>
            </View>
          )}

          <TextInputField
            label="Titre"
            placeholder="Ex : Passage piéton effacé rue de l'École"
            value={titre}
            onChangeText={setTitre}
            helper="Court, factuel, sans accusation. Visible par tous les destinataires."
          />
          {submitted && titre.trim().length < 5 && (
            <Text className="text-danger-500 text-xs -mt-3">
              Titre trop court (5 caractères min.)
            </Text>
          )}

          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">Description</Text>
            <View className="bg-slate-50 border border-slate-200 rounded-xl">
              <TextInputField
                placeholder="Décrivez la situation, ce qui a été observé, les familles concernées…"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                style={{ minHeight: 120, textAlignVertical: 'top', fontSize: 14 }}
              />
            </View>
            <Text className="text-xs text-slate-400 mt-1">{description.length} caractères</Text>
          </View>
          {submitted && description.trim().length < 10 && (
            <Text className="text-danger-500 text-xs -mt-3">
              Description trop courte (10 caractères min.)
            </Text>
          )}

          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">Niveau d'urgence</Text>
            <View className="flex-row gap-2">
              {URGENCES.map((u) => {
                const active = u.value === urgence;
                const c = URGENCE_COLORS[u.value];
                return (
                  <Pressable
                    key={u.value}
                    onPress={() => setUrgence(u.value)}
                    className="flex-1 rounded-xl border py-3 items-center"
                    style={{
                      backgroundColor: active ? c.bg : '#ffffff',
                      borderColor: active ? c.border : '#e2e8f0',
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: active ? c.text : '#64748b' }}
                    >
                      {u.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-xs text-slate-400 mt-2" style={{ color: urgenceColor.text }}>
              {URGENCE_LABELS[urgence]}
            </Text>
          </View>

          <ScopeSelector role="parent_admin" value={scope} onChange={setScope} />

          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">
              Pièces jointes (facultatif)
            </Text>
            <Pressable
              onPress={() => setNbPieces((n) => n + 1)}
              className="bg-white border border-dashed border-slate-300 rounded-xl py-5 items-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Paperclip color="#94a3b8" size={20} />
              <Text className="text-slate-500 text-sm mt-2">
                {nbPieces === 0
                  ? 'Ajouter une photo ou un document'
                  : `${nbPieces} pièce${nbPieces > 1 ? 's' : ''} jointe${nbPieces > 1 ? 's' : ''}`}
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                {nbPieces === 0 ? 'JPG, PNG, PDF — max 10 Mo' : 'Tap pour en ajouter une autre'}
              </Text>
            </Pressable>
            {nbPieces > 0 && (
              <Pressable onPress={() => setNbPieces(0)} className="mt-2 self-start">
                <Text className="text-xs text-danger-500 font-semibold">Tout retirer</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View className="gap-3 mt-6">
          <PrimaryButton
            label="Transmettre à la mairie"
            onPress={handleSubmit}
            iconLeft={<Send color="white" size={18} />}
          />
          <SecondaryButton
            label="Partager aux représentants"
            onPress={handleShare}
            iconLeft={<Share2 color="#334155" size={18} />}
          />
          <SecondaryButton
            label="Enregistrer en brouillon"
            onPress={handleSave}
            iconLeft={<Save color="#475569" size={18} />}
            variant="ghost"
          />
        </View>
      </ScrollView>
      <BottomNav variant="parent" />
    </View>
  );
}
