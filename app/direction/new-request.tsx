import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Send, ShieldCheck } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { BottomNav } from '../../components/BottomNav';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { SelectField, type SelectOption } from '../../components/SelectField';
import { TextInputField } from '../../components/TextInputField';
import { ScopeSelector } from '../../components/ScopeSelector';
import { CATEGORIES, ECOLES, PERSONNES } from '../../data/mockData';
import type { Categorie, Urgence, VisibilityScope } from '../../types';

const DIRECTION = PERSONNES.find((p) => p.role === 'direction');
const ECOLE_DIRECTION = ECOLES.find((e) => e.id === DIRECTION?.ecoleId) ?? ECOLES[0];

const URGENCES: { value: Urgence; label: string; tone: string; activeBg: string }[] = [
  { value: 'faible', label: 'Faible', tone: 'border-success-100', activeBg: 'bg-success-50' },
  { value: 'moyenne', label: 'Moyenne', tone: 'border-warning-100', activeBg: 'bg-warning-50' },
  { value: 'elevee', label: 'Élevée', tone: 'border-danger-100', activeBg: 'bg-danger-50' },
];

export default function DirectionNewRequestScreen() {
  // La direction choisit entre :
  // - direction_mairie  → privé avec la mairie (tensions, arbitrages, alertes internes)
  // - partage_tripartite → partagé avec parents + mairie (travaux, sécurité, info officielle)
  // Aucun autre scope n'est exposé (cf. ScopeSelector OPTIONS_BY_ROLE.direction).
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  const [urgence, setUrgence] = useState<Urgence>('moyenne');
  // Par défaut : direction_mairie (canal privé avec la mairie) — la direction
  // doit explicitement choisir 'partage_tripartite' pour inclure les parents.
  const [scope, setScope] = useState<VisibilityScope>('direction_mairie');

  const categorieOptions = useMemo<SelectOption<Categorie>[]>(
    () => CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
    [],
  );

  const handleSubmit = () => {
    const missing: string[] = [];
    if (titre.trim().length < 5) missing.push('un titre clair (5 caractères min.)');
    if (description.trim().length < 10) missing.push('une description (10 caractères min.)');
    if (!categorie) missing.push('une catégorie');
    if (missing.length > 0) {
      Alert.alert('Sujet incomplet', `Merci d'ajouter ${missing.join(', ')}.`);
      return;
    }
    const scopeMessage =
      scope === 'direction_mairie'
        ? 'Visible uniquement par la mairie. Les représentants des parents ne verront pas ce sujet.'
        : "Visible par la mairie, les parents élus et la direction de l'école.";
    Alert.alert('Sujet transmis', `Le sujet a été transmis à la mairie. ${scopeMessage}`, [
      { text: 'OK', onPress: () => router.replace('/direction/dossiers' as Href) },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Nouveau sujet" subtitle="Direction de l'école" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <Card className="mb-3 bg-direction-50 border-direction-100">
          <View className="flex-row items-start gap-3">
            <ShieldCheck color="#4f46e5" size={20} />
            <View className="flex-1">
              <Text className="text-direction-700 font-semibold text-sm">
                Choix de visibilité explicite
              </Text>
              <Text className="text-direction-600 text-xs leading-relaxed mt-1">
                Choisissez avec qui ce sujet est partagé. Un sujet « Direction + mairie » reste
                strictement privé entre vous et la mairie — les parents élus ne le voient pas.
              </Text>
            </View>
          </View>
        </Card>

        <View className="gap-4">
          <TextInputField
            label="Titre du sujet"
            placeholder="Ex : Demande d'intervention infiltration salle 12"
            value={titre}
            onChangeText={setTitre}
          />

          <SelectField<Categorie>
            label="Catégorie"
            value={categorie}
            onChange={setCategorie}
            options={categorieOptions}
            placeholder="Choisir une catégorie..."
            maxHeight={220}
          />

          <ScopeSelector role="direction" value={scope} onChange={setScope} />

          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">Urgence</Text>
            <View className="flex-row gap-2">
              {URGENCES.map((u) => {
                const active = u.value === urgence;
                return (
                  <Pressable
                    key={u.value}
                    onPress={() => setUrgence(u.value)}
                    className={`flex-1 rounded-xl border px-3 py-3 items-center ${
                      active ? `${u.activeBg} ${u.tone}` : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        active ? 'text-slate-800' : 'text-slate-500'
                      }`}
                    >
                      {u.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-slate-700 mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Décrire le contexte, l'historique, l'impact et la demande précise."
              placeholderTextColor="#94a3b8"
              multiline
              style={{
                minHeight: 140,
                textAlignVertical: 'top',
                fontSize: 14,
                backgroundColor: 'white',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                borderRadius: 14,
                padding: 14,
                color: '#1e293b',
              }}
            />
            <Text className="text-slate-400 text-[11px] mt-1.5 text-right">
              {description.length} caractères
            </Text>
          </View>

          <Card className="bg-slate-50">
            <Text className="text-slate-500 text-xs leading-relaxed">
              École rattachée :{' '}
              <Text className="text-slate-700 font-semibold">{ECOLE_DIRECTION.nom}</Text>. Créé par
              :{' '}
              <Text className="text-slate-700 font-semibold">
                {DIRECTION?.prenom} {DIRECTION?.nom}
              </Text>
              .
            </Text>
          </Card>
        </View>

        <View className="gap-3 mt-5">
          <PrimaryButton
            label="Transmettre à la mairie"
            iconLeft={<Send color="white" size={18} />}
            onPress={handleSubmit}
          />
          <SecondaryButton label="Annuler" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScrollView>
      <BottomNav variant="direction" />
    </View>
  );
}
