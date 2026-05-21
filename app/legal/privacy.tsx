/**
 * /legal/privacy — politique de confidentialité conforme RGPD.
 *
 * Structure CNIL recommandée :
 *   1. Responsable de traitement
 *   2. Données collectées
 *   3. Finalités du traitement
 *   4. Bases légales
 *   5. Destinataires des données
 *   6. Durée de conservation
 *   7. Droits des personnes concernées
 *   8. Délégué à la protection des données (DPO)
 *   9. Sécurité des données
 *   10. Transferts hors UE
 *   11. Cookies
 *   12. Réclamation CNIL
 *
 * ⚠️ Document à valider par un juriste / DPO avant production publique.
 */

import { ScrollView, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS } from '../../constants/theme';

interface SectionProps {
  num: string;
  title: string;
  children: React.ReactNode;
}

function Section({ num, title, children }: SectionProps) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
      <Text className="text-slate-400 text-xs font-bold">{num}</Text>
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row items-start gap-2 mb-1">
      <Text className="text-slate-400 text-xs">•</Text>
      <Text className="text-slate-600 text-xs leading-relaxed flex-1">{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Confidentialité" subtitle="Dernière mise à jour : 20 mai 2026" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="bg-success-50 rounded-2xl p-4 border border-success-100 mb-3 flex-row items-start gap-3">
          <ShieldCheck color={COLORS.success[600]} size={20} />
          <Text className="text-slate-700 text-xs leading-relaxed flex-1">
            La protection de tes données personnelles est au cœur de Passerelle. Cette politique
            détaille ce qu’on collecte, pourquoi, combien de temps, et tes droits. Conforme au
            Règlement Général sur la Protection des Données (UE 2016/679).
          </Text>
        </View>

        <Section num="1" title="Responsable de traitement">
          <P>
            Le responsable du traitement des données personnelles est{' '}
            <B>[À COMPLÉTER — l’éditeur Passerelle]</B>, dont les coordonnées figurent dans les{' '}
            <B>Mentions légales</B>.
          </P>
        </Section>

        <Section num="2" title="Données collectées">
          <P>
            <B>Catégorie 1 — Identité</B> : nom, prénom, adresse email professionnelle, fonction
            (parent élu, agent mairie, directeur, etc.), école de rattachement, mairie de
            rattachement.
          </P>
          <P>
            <B>Catégorie 2 — Contenu</B> : titre et contenu des dossiers, messages, commentaires,
            pièces jointes que tu publies.
          </P>
          <P>
            <B>Catégorie 3 — Métadonnées d’usage</B> : dates de connexion, dates de création et
            modification des dossiers, identifiant technique de session (JWT Supabase).
          </P>
          <P>
            <B>Catégorie 4 — Token push (facultatif)</B> : si tu autorises les notifications, un
            token Expo Push est stocké pour l’envoi de notifications. Tu peux le révoquer depuis les
            paramètres de ton OS.
          </P>
          <P>
            <B>Aucune donnée sensible n’est collectée par le système</B> (santé, opinions
            politiques, religieuses, orientation sexuelle, etc.). L’éditeur ne peut empêcher un
            utilisateur de publier des données sensibles dans le contenu d’un dossier — c’est
            pourquoi les CGU rappellent l’interdiction de publier des données personnelles d’enfants
            sans accord.
          </P>
        </Section>

        <Section num="3" title="Finalités du traitement">
          <Bullet>
            Permettre la coordination institutionnelle entre parents élus, mairie et direction
            d’école.
          </Bullet>
          <Bullet>Tracer l’historique des échanges pour assurer la continuité du mandat.</Bullet>
          <Bullet>
            Notifier les utilisateurs (via push ou email) des événements pertinents pour leur rôle.
          </Bullet>
          <Bullet>
            Améliorer le Service par l’analyse anonymisée des parcours (taux de complétion d’un
            dossier, temps de réponse moyen, etc.).
          </Bullet>
        </Section>

        <Section num="4" title="Bases légales">
          <P>
            <B>Exécution du contrat de service</B> (article 6.1.b RGPD) : pour les utilisateurs
            invités par une mairie cliente, le traitement est nécessaire à l’exécution du contrat
            entre cette mairie et l’éditeur.
          </P>
          <P>
            <B>Intérêt légitime</B> (article 6.1.f) : pour les métadonnées techniques nécessaires à
            la sécurité et au bon fonctionnement du Service.
          </P>
          <P>
            <B>Consentement explicite</B> (article 6.1.a) : pour les notifications push (case à
            cocher au moment de la première demande).
          </P>
        </Section>

        <Section num="5" title="Destinataires des données">
          <Bullet>
            Les autres utilisateurs autorisés par le canal de visibilité de chaque dossier (jamais
            au-delà).
          </Bullet>
          <Bullet>
            Les sous-traitants techniques de l’éditeur (Supabase, Cloudflare, Sentry, Expo), liés
            par contrat à des engagements RGPD équivalents.
          </Bullet>
          <Bullet>
            Aucune communication à des tiers commerciaux. Aucune revente de données. Aucun profilage
            publicitaire.
          </Bullet>
        </Section>

        <Section num="6" title="Durée de conservation">
          <Bullet>
            <B>Compte actif</B> : tant que le mandat ou la fonction professionnelle de l’utilisateur
            est en cours.
          </Bullet>
          <Bullet>
            <B>Dossiers et messages</B> : 3 ans après la fin du mandat de l’utilisateur initiateur
            (continuité institutionnelle), puis suppression automatique.
          </Bullet>
          <Bullet>
            <B>Logs techniques</B> : 12 mois (durée légale Loi Informatique et Libertés).
          </Bullet>
          <Bullet>
            <B>Compte supprimé</B> : 30 jours de délai de rétractation puis suppression définitive.
            Les contenus publiés restent dans l’historique de l’école sous forme anonymisée (« Un
            parent élu »).
          </Bullet>
        </Section>

        <Section num="7" title="Tes droits">
          <P>
            Conformément au RGPD, tu disposes des droits suivants, exerçables depuis ta page profil
            ou par email au DPO :
          </P>
          <Bullet>
            <B>Droit d’accès</B> : obtenir une copie de toutes tes données.
          </Bullet>
          <Bullet>
            <B>Droit de rectification</B> : corriger une donnée inexacte.
          </Bullet>
          <Bullet>
            <B>Droit à l’effacement</B> (« droit à l’oubli ») : supprimer ton compte et tes données.
          </Bullet>
          <Bullet>
            <B>Droit à la portabilité</B> : récupérer tes données dans un format structuré (ZIP).
          </Bullet>
          <Bullet>
            <B>Droit d’opposition</B> : t’opposer au traitement de tes données pour un motif
            légitime.
          </Bullet>
          <Bullet>
            <B>Droit de retrait du consentement</B> : pour les notifications push, à tout moment
            depuis les paramètres de ton OS.
          </Bullet>
        </Section>

        <Section num="8" title="Délégué à la protection des données (DPO)">
          <P>
            Pour exercer tes droits ou poser une question, contacte le DPO à l’adresse{' '}
            <B>dpo@passerelle.fr</B>. Réponse sous 30 jours (délai légal).
          </P>
        </Section>

        <Section num="9" title="Sécurité des données">
          <Bullet>Chiffrement HTTPS systématique en transit (TLS 1.3).</Bullet>
          <Bullet>Chiffrement at-rest des bases PostgreSQL chez Supabase.</Bullet>
          <Bullet>
            Row Level Security PostgreSQL : isolation matérialisée au niveau base, pas seulement
            applicatif.
          </Bullet>
          <Bullet>Aucun mot de passe stocké (authentification par lien magique).</Bullet>
          <Bullet>Audit des dépendances logicielles (Dependabot/Renovate).</Bullet>
          <Bullet>Backup quotidien automatique (rétention 30 jours).</Bullet>
        </Section>

        <Section num="10" title="Transferts hors UE">
          <P>
            <B>Aucun transfert hors UE pour les données nominatives</B>. Toutes les données
            personnelles sont hébergées en région eu-west-3 (Paris).
          </P>
          <P>
            Les outils techniques utilisés (Cloudflare pour le CDN, Sentry pour le monitoring
            d’erreurs) sont configurés pour utiliser leurs points de présence européens. Les
            éventuels transferts vers les États-Unis (pour Sentry par exemple) sont couverts par des
            clauses contractuelles types validées par la Commission européenne.
          </P>
        </Section>

        <Section num="11" title="Cookies et traceurs">
          <P>
            Passerelle n’utilise{' '}
            <B>
              aucun cookie tiers, aucun tracker publicitaire, aucun outil d’analytics avec cookies
            </B>
            .
          </P>
          <P>
            Un seul cookie technique (ou équivalent en stockage local) est utilisé pour maintenir ta
            session connectée : HttpOnly, SameSite=Strict, durée 7 jours. Ce cookie est strictement
            nécessaire au fonctionnement du Service et ne nécessite pas de consentement (article 82
            de la loi Informatique et Libertés).
          </P>
        </Section>

        <Section num="12" title="Réclamation CNIL">
          <P>
            Si tu estimes que tes droits ne sont pas respectés, tu peux déposer une réclamation
            auprès de la Commission Nationale de l’Informatique et des Libertés (CNIL) :
          </P>
          <P>
            <B>CNIL</B> — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
          </P>
          <P>
            Site web : <B>www.cnil.fr</B>
          </P>
        </Section>

        <View className="bg-warning-50 rounded-xl p-3 border border-warning-100 mt-3">
          <Text className="text-warning-600 text-xs font-semibold">⚠️ Document préparatoire</Text>
          <Text className="text-slate-600 text-xs mt-1 leading-relaxed">
            Cette politique de confidentialité doit être revue et validée par un DPO ou un juriste
            spécialisé avant la mise en production publique. Voir LEGAL_NOTES.md pour la liste des
            décisions juridiques en attente.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
