/**
 * /legal/mentions — mentions légales conformes loi pour la confiance dans
 * l'économie numérique (LCEN) du 21 juin 2004, article 6.III.
 *
 * Champs obligatoires :
 *   - identité de l'éditeur (nom, raison sociale, adresse, contact, RCS/SIRET)
 *   - identité de l'hébergeur (nom, adresse, téléphone)
 *   - directeur de la publication
 *
 * ⚠️ Les valeurs `[À COMPLÉTER]` doivent être renseignées avant la mise en
 * ligne publique. Voir LEGAL_NOTES.md pour le détail.
 */

import { ScrollView, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
      <Text className="text-slate-800 font-bold text-sm mb-2">{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text className="text-slate-600 text-xs leading-relaxed mb-2">{children}</Text>;
}

function K({ children }: { children: React.ReactNode }) {
  return <Text className="font-semibold text-slate-700">{children}</Text>;
}

export default function MentionsScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Mentions légales" subtitle="Dernière mise à jour : 20 mai 2026" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Section title="Éditeur du service">
          <P>
            <K>Raison sociale</K> : [À COMPLÉTER — nom de la structure porteuse, association ou
            société]
          </P>
          <P>
            <K>Forme juridique</K> : [À COMPLÉTER — SAS, SARL, association loi 1901, etc.]
          </P>
          <P>
            <K>Adresse du siège</K> : [À COMPLÉTER]
          </P>
          <P>
            <K>SIRET</K> : [À COMPLÉTER]
          </P>
          <P>
            <K>Capital social</K> : [À COMPLÉTER si société]
          </P>
          <P>
            <K>Email de contact</K> : contact@passerelle.fr
          </P>
        </Section>

        <Section title="Directeur de la publication">
          <P>
            <K>Nom</K> : [À COMPLÉTER]
          </P>
          <P>
            <K>Qualité</K> : Représentant légal de l’éditeur
          </P>
        </Section>

        <Section title="Hébergement">
          <P>
            <K>Hébergeur applicatif</K> : Supabase Inc., 970 Toa Payoh North, #07-04, Singapour
            318992 — données hébergées en région eu-west-3 (Paris, France).
          </P>
          <P>
            <K>Hébergeur web (PWA)</K> : Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107,
            USA — diffusion via le PoP européen (Paris).
          </P>
        </Section>

        <Section title="Propriété intellectuelle">
          <P>
            L’ensemble du contenu de Passerelle (interface, code, textes, identité visuelle) est
            protégé par le droit d’auteur. Toute reproduction sans autorisation expresse est
            interdite. Le nom Passerelle et son logo sont des marques déposées (en cours
            d’enregistrement).
          </P>
        </Section>

        <Section title="Signalement de contenu illicite">
          <P>
            Conformément à l’article 6 de la LCEN, tout signalement de contenu manifestement
            illicite peut être adressé à abuse@passerelle.fr avec les éléments d’identification du
            signalant et la description précise du contenu visé.
          </P>
        </Section>

        <Section title="Loi applicable">
          <P>
            Les présentes mentions sont soumises au droit français. Pour tout litige, les tribunaux
            français sont seuls compétents.
          </P>
        </Section>

        <View className="bg-warning-50 rounded-xl p-3 border border-warning-100 mt-3">
          <Text className="text-warning-600 text-xs font-semibold">⚠️ Document préparatoire</Text>
          <Text className="text-slate-600 text-xs mt-1 leading-relaxed">
            Cette page est un modèle qui doit être validé par un juriste avant la mise en production
            publique. Les champs marqués <K>[À COMPLÉTER]</K> doivent être renseignés.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
