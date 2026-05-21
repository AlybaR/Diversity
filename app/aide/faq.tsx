/**
 * /aide/faq — questions fréquentes.
 *
 * Organisées en 4 thèmes : Général / Sécurité & RGPD / Compte / Technique.
 * Format accordéon : chaque item est dépliable au tap. Pas de recherche pour
 * le MVP (15 questions, lisible en scroll).
 */

import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS } from '../../constants/theme';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const SECTIONS: FaqSection[] = [
  {
    title: 'Général',
    items: [
      {
        q: 'À qui s’adresse Passerelle ?',
        a: 'À tous les parents élus, agents de mairie (service éducation, élus à l’éducation) et directeurs·rices d’école qui ont besoin de coordonner des sujets institutionnels (sécurité, restauration, périscolaire, bâtiment, etc.).',
      },
      {
        q: 'Combien ça coûte ?',
        a: 'Le coût est porté par la mairie qui souscrit le service pour l’ensemble de ses écoles. Pour les parents élus et les directions, l’usage est gratuit. Contacte ta mairie si tu n’as pas reçu d’invitation.',
      },
      {
        q: 'Sur quels appareils l’app fonctionne ?',
        a: 'Passerelle est disponible sur le web (navigateur Chrome, Firefox, Safari, Edge), sur iPhone (iOS 15+) et sur Android (8+).',
      },
      {
        q: 'Que faire si je quitte mon mandat de parent élu ?',
        a: 'Tu peux transférer la gestion à un autre représentant depuis ta page profil, ou simplement supprimer ton compte. Les dossiers ouverts pendant ton mandat restent visibles aux successeurs (continuité institutionnelle).',
      },
    ],
  },
  {
    title: 'Sécurité & RGPD',
    items: [
      {
        q: 'Mes données sont stockées où ?',
        a: 'En France, région eu-west-3 (Paris). Aucun transfert hors Union Européenne n’est effectué. Hébergeur : Supabase (Postgres managé conforme RGPD).',
      },
      {
        q: 'Qui peut lire mes messages ?',
        a: 'Uniquement les personnes autorisées par le canal de visibilité du dossier. Ces règles sont appliquées par la base de données (Row Level Security), pas seulement par l’interface. Aucun administrateur de la mairie ne peut lire un dossier hors de son canal sans intervention technique explicite (qui serait tracée).',
      },
      {
        q: 'Comment exporter mes données ?',
        a: 'Depuis ta page profil → section RGPD → bouton « Exporter mes données ». Tu reçois sous 24h un fichier ZIP contenant tous les dossiers, messages et rendez-vous te concernant.',
      },
      {
        q: 'Comment supprimer mon compte ?',
        a: 'Page profil → section RGPD → bouton « Supprimer mon compte ». La suppression est définitive sous 30 jours (délai de réversibilité légal). Tes dossiers passés restent dans l’historique de l’école avec ton nom anonymisé.',
      },
      {
        q: 'Y a-t-il des cookies ou du tracking ?',
        a: 'Pas de cookies tiers, pas de trackers publicitaires, pas de Google Analytics. Un seul cookie technique pour maintenir ta session (HttpOnly, SameSite=Strict).',
      },
    ],
  },
  {
    title: 'Compte',
    items: [
      {
        q: 'Comment se créer un compte ?',
        a: 'Les comptes sont créés sur invitation. Si tu es parent élu, c’est ta mairie ou ton parent élu administrateur qui t’invite. Si tu es agent mairie ou directeur, ta mairie te crée le compte. Pas d’auto-inscription : c’est une mesure de sécurité institutionnelle.',
      },
      {
        q: 'J’ai perdu mon lien de connexion (magic link)',
        a: 'Le lien expire après 1 heure. Retourne sur l’écran de connexion, saisis ton email, un nouveau lien est envoyé immédiatement (limite de 2 envois par heure).',
      },
      {
        q: 'Mon email a changé, comment le mettre à jour ?',
        a: 'Page profil → bouton « Modifier mon email ». Un email de confirmation est envoyé à la nouvelle adresse. Le changement est effectif au clic du lien de confirmation.',
      },
    ],
  },
  {
    title: 'Technique',
    items: [
      {
        q: 'L’app fonctionne-t-elle hors-ligne ?',
        a: 'Partiellement : tu peux consulter les dossiers et messages déjà chargés. La création et l’envoi nécessitent une connexion. Un bandeau orange t’indique quand tu es hors-ligne.',
      },
      {
        q: 'J’ai trouvé un bug, où le signaler ?',
        a: 'Soit via la page Contact (lien dans le menu d’aide), soit directement par email à l’adresse de ton administrateur mairie. Les bugs critiques sont traités sous 48h.',
      },
      {
        q: 'L’app est-elle accessible aux personnes en situation de handicap ?',
        a: 'L’app suit les standards WCAG 2.1 niveau AA en cours d’audit. Si tu rencontres une difficulté d’accessibilité, signale-le via la page Contact — chaque retour nous aide à améliorer le service.',
      },
    ],
  },
];

function AccordionItem({ q, a }: FaqItem) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      className="bg-white rounded-xl p-4 border border-slate-100 mb-2"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="text-slate-800 font-semibold text-sm flex-1">{q}</Text>
        {open ? (
          <ChevronUp color={COLORS.slate[500]} size={18} />
        ) : (
          <ChevronDown color={COLORS.slate[500]} size={18} />
        )}
      </View>
      {open && <Text className="text-slate-600 text-xs mt-2 leading-relaxed">{a}</Text>}
    </Pressable>
  );
}

export default function FaqScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="FAQ" subtitle="Questions fréquentes" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {SECTIONS.map((section) => (
          <View key={section.title} className="mb-4">
            <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide mb-2">
              {section.title}
            </Text>
            {section.items.map((item) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </View>
        ))}

        <Text className="text-slate-400 text-xs text-center mt-4">
          Une question manque ? Utilise la page Contact dans le menu d’aide.
        </Text>
      </ScrollView>
    </View>
  );
}
