/**
 * /legal/cgu — conditions générales d'utilisation.
 *
 * Structure type :
 *   1. Objet
 *   2. Définitions
 *   3. Acceptation
 *   4. Accès au service
 *   5. Création de compte (par invitation)
 *   6. Engagements de l'utilisateur
 *   7. Engagements de l'éditeur
 *   8. Propriété intellectuelle
 *   9. Données personnelles (renvoi privacy)
 *   10. Suspension / résiliation
 *   11. Responsabilité
 *   12. Modifications des CGU
 *   13. Loi applicable et juridiction
 *
 * ⚠️ Modèle à faire valider par un juriste avant production publique.
 */

import { ScrollView, Text, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';

interface SectionProps {
  num: string;
  title: string;
  children: React.ReactNode;
}

function Section({ num, title, children }: SectionProps) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
      <Text className="text-slate-400 text-xs font-bold">Article {num}</Text>
      <Text className="text-slate-800 font-bold text-sm mt-1 mb-2">{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text className="text-slate-600 text-xs leading-relaxed mb-2">{children}</Text>;
}

function B({ children }: { children: React.ReactNode }) {
  return <Text className="font-semibold text-slate-700">{children}</Text>;
}

export default function CguScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="CGU" subtitle="Dernière mise à jour : 20 mai 2026" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Section num="1" title="Objet">
          <P>
            Les présentes conditions générales d’utilisation (« CGU ») régissent l’accès et l’usage
            du service Passerelle (« le Service »), édité par [À COMPLÉTER] (« l’Éditeur »).
          </P>
          <P>
            Passerelle est un outil de coordination institutionnelle entre les parents élus, les
            services municipaux et les directions d’école, permettant l’échange d’informations
            relatives à la vie scolaire dans le respect strict des canaux de visibilité définis.
          </P>
        </Section>

        <Section num="2" title="Définitions">
          <P>
            <B>Utilisateur</B> : toute personne physique disposant d’un compte sur le Service
            (parent élu, agent mairie, élu, direction d’école).
          </P>
          <P>
            <B>Mairie cliente</B> : collectivité ayant souscrit au Service et invité les
            utilisateurs.
          </P>
          <P>
            <B>Canal de visibilité</B> : règle de filtrage qui définit qui peut voir un dossier ou
            un message (parents↔mairie, direction↔mairie, tripartite, mairie interne).
          </P>
        </Section>

        <Section num="3" title="Acceptation des CGU">
          <P>
            L’accès au Service vaut acceptation pleine et entière des présentes CGU. Si tu n’es pas
            d’accord avec une clause, tu ne dois pas utiliser le Service.
          </P>
        </Section>

        <Section num="4" title="Accès au service">
          <P>
            Le Service est accessible 24h/24, 7j/7, sous réserve d’interruptions pour maintenance.
            L’Éditeur ne garantit pas une disponibilité de 100 % et ne pourra être tenu responsable
            d’une interruption temporaire ou d’une indisponibilité ponctuelle.
          </P>
          <P>
            L’Utilisateur doit disposer d’une connexion internet et d’un appareil compatible
            (navigateur web récent, iOS 15+, Android 8+).
          </P>
        </Section>

        <Section num="5" title="Création de compte">
          <P>
            La création de compte se fait exclusivement <B>par invitation</B>. Aucun parcours
            d’auto-inscription n’est proposé. Les invitations sont émises par la mairie cliente ou
            par un parent élu administrateur de son école.
          </P>
          <P>
            L’authentification se fait par lien magique envoyé à l’adresse email de l’utilisateur.
            Aucun mot de passe n’est stocké.
          </P>
        </Section>

        <Section num="6" title="Engagements de l’utilisateur">
          <P>L’Utilisateur s’engage à :</P>
          <P>
            • Utiliser le Service dans le respect du <B>ton institutionnel</B> attendu : pas
            d’injures, pas de propos discriminatoires, pas de mise en cause nominative
            disproportionnée.
          </P>
          <P>
            • <B>Ne pas publier de données personnelles d’enfants</B> (nom complet, photo,
            informations médicales, etc.) sauf nécessité documentée et avec accord explicite des
            représentants légaux.
          </P>
          <P>
            • <B>Respecter le canal de visibilité</B> de chaque dossier : ne pas tenter de
            contourner les règles techniques d’isolation.
          </P>
          <P>
            • Maintenir confidentielles les informations dont il prend connaissance dans le cadre de
            son mandat ou de sa fonction.
          </P>
          <P>
            • Signaler sans délai à l’Éditeur toute faille de sécurité ou tout usage suspect du
            Service.
          </P>
        </Section>

        <Section num="7" title="Engagements de l’éditeur">
          <P>L’Éditeur s’engage à :</P>
          <P>• Héberger les données en Union Européenne (région eu-west-3, Paris).</P>
          <P>
            • Mettre en œuvre les mesures techniques et organisationnelles raisonnables pour
            protéger les données (chiffrement en transit, Row Level Security en base, audit
            d’accès).
          </P>
          <P>
            • Notifier les utilisateurs et la CNIL en cas de violation de données dans les délais
            réglementaires (72h).
          </P>
        </Section>

        <Section num="8" title="Propriété intellectuelle">
          <P>
            Le code source, l’interface, les textes et l’identité visuelle de Passerelle restent la
            propriété exclusive de l’Éditeur. L’Utilisateur conserve la propriété des contenus qu’il
            publie (dossiers, messages, pièces jointes) mais concède à l’Éditeur une licence
            d’hébergement et de diffusion limitée aux destinataires autorisés par le canal.
          </P>
        </Section>

        <Section num="9" title="Données personnelles">
          <P>
            Le traitement des données personnelles est détaillé dans la{' '}
            <B>Politique de confidentialité</B>, accessible depuis le menu Légal. Cette politique
            fait partie intégrante des présentes CGU.
          </P>
        </Section>

        <Section num="10" title="Suspension / résiliation">
          <P>
            L’Éditeur se réserve le droit de suspendre un compte en cas de manquement grave aux
            présentes CGU (publication de contenu illicite, tentative de contournement des règles
            d’isolation, etc.), après notification écrite à l’Utilisateur.
          </P>
          <P>
            L’Utilisateur peut résilier son compte à tout moment depuis sa page profil. La
            suppression devient définitive sous 30 jours.
          </P>
        </Section>

        <Section num="11" title="Responsabilité">
          <P>
            Passerelle est un outil de communication. L’Éditeur n’intervient pas dans le contenu des
            échanges et ne peut être tenu responsable des conséquences d’une décision prise par une
            mairie, une direction ou un parent élu suite à un échange via le Service.
          </P>
          <P>
            La responsabilité de l’Éditeur ne peut être engagée qu’en cas de faute prouvée et
            uniquement à hauteur du préjudice direct et certain subi par l’Utilisateur.
          </P>
        </Section>

        <Section num="12" title="Modifications des CGU">
          <P>
            L’Éditeur peut modifier les présentes CGU. Les utilisateurs sont informés des
            modifications substantielles par notification dans l’application et par email. La
            poursuite de l’utilisation vaut acceptation des CGU modifiées.
          </P>
        </Section>

        <Section num="13" title="Loi applicable et juridiction">
          <P>
            Les présentes CGU sont soumises au droit français. À défaut de résolution amiable, tout
            litige sera porté devant les tribunaux français compétents.
          </P>
        </Section>

        <View className="bg-warning-50 rounded-xl p-3 border border-warning-100 mt-3">
          <Text className="text-warning-600 text-xs font-semibold">⚠️ Document préparatoire</Text>
          <Text className="text-slate-600 text-xs mt-1 leading-relaxed">
            Ce modèle de CGU doit être validé par un juriste avant la mise en production publique.
            Le nom de l’Éditeur et les champs <B>[À COMPLÉTER]</B> doivent être renseignés.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
