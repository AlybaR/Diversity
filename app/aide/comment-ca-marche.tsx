/**
 * /aide/comment-ca-marche — présentation du fonctionnement de Passerelle.
 *
 * Cible : nouveaux utilisateurs (parents élus, agents mairie, directeurs)
 * pour comprendre en 2 minutes :
 *   - À qui s'adresse l'app
 *   - Les 3 rôles
 *   - Les 4 canaux de visibilité (isolation des conversations)
 *   - La promesse de sécurité (RLS au niveau base)
 *
 * Pas de wording marketing : ton institutionnel, neutre, factuel.
 */

import { ScrollView, Text, View } from 'react-native';
import { Building2, GraduationCap, Lock, ShieldCheck, Users } from 'lucide-react-native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS } from '../../constants/theme';

interface RoleBlockProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: 'parent' | 'mairie' | 'direction';
}

const TONE_BG: Record<RoleBlockProps['tone'], string> = {
  parent: 'bg-primary-50',
  mairie: 'bg-mairie-50',
  direction: 'bg-direction-50',
};

function RoleBlock({ icon, title, description, tone }: RoleBlockProps) {
  return (
    <View className="flex-row items-start gap-3 bg-white rounded-2xl p-4 mb-3 border border-slate-100">
      <View className={`w-10 h-10 rounded-xl items-center justify-center ${TONE_BG[tone]}`}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-slate-800 font-bold text-sm">{title}</Text>
        <Text className="text-slate-500 text-xs mt-1 leading-relaxed">{description}</Text>
      </View>
    </View>
  );
}

interface ScopeBlockProps {
  label: string;
  visible: string;
  hidden: string;
}

function ScopeBlock({ label, visible, hidden }: ScopeBlockProps) {
  return (
    <View className="bg-slate-50 rounded-xl p-3 mb-2 border border-slate-100">
      <Text className="text-slate-800 font-semibold text-xs">{label}</Text>
      <Text className="text-slate-600 text-xs mt-1">
        <Text className="text-success-600 font-semibold">Visible par </Text>: {visible}
      </Text>
      <Text className="text-slate-600 text-xs mt-0.5">
        <Text className="text-danger-600 font-semibold">Invisible pour </Text>: {hidden}
      </Text>
    </View>
  );
}

export default function CommentCaMarcheScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <AppHeader title="Comment ça marche" subtitle="Présentation de Passerelle" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="bg-white rounded-2xl p-5 border border-slate-100 mb-3">
          <Text className="text-slate-800 font-bold text-base mb-2">
            Qu’est-ce que Passerelle ?
          </Text>
          <Text className="text-slate-600 text-sm leading-relaxed">
            Passerelle est un espace de coordination institutionnelle entre les parents élus, la
            mairie et la direction d’école. L’objectif : remplacer les chaînes d’emails et les
            groupes de messagerie informels par un canal traçable, sécurisé et adapté aux
            obligations réglementaires des collectivités.
          </Text>
        </View>

        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide mt-3 mb-2">
          Les 3 rôles
        </Text>

        <RoleBlock
          icon={<Users color={COLORS.primary[600]} size={20} />}
          title="Parents élus"
          description="Représentants des familles, élus en début d’année scolaire. Ils ouvrent les dossiers collectifs (sécurité aux abords, restauration, périscolaire…) et portent les demandes auprès de la mairie."
          tone="parent"
        />
        <RoleBlock
          icon={<Building2 color={COLORS.mairie[600]} size={20} />}
          title="Mairie"
          description="Agents du service éducation et élus (adjoints à l’éducation). Reçoivent les dossiers, instruisent, répondent, et peuvent partager certaines réponses avec la direction."
          tone="mairie"
        />
        <RoleBlock
          icon={<GraduationCap color={COLORS.direction[600]} size={20} />}
          title="Direction d’école"
          description="Directeur·rice et équipe. Suit les sujets institutionnels qui la concernent (voirie, bâtiment, rendez-vous concertés) sans accéder aux conversations privées parents ↔ mairie."
          tone="direction"
        />

        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide mt-5 mb-2">
          Les 4 canaux de visibilité
        </Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          <Text className="text-slate-600 text-xs leading-relaxed mb-3">
            Chaque dossier ou message a un <Text className="font-semibold">canal</Text> qui définit
            qui peut le voir. Cette isolation est appliquée au niveau base de données : impossible
            d’y accéder par une URL devinée.
          </Text>

          <ScopeBlock
            label="Parents ↔ Mairie"
            visible="parents élus, mairie"
            hidden="direction d’école"
          />
          <ScopeBlock
            label="Direction ↔ Mairie"
            visible="direction, mairie"
            hidden="parents élus"
          />
          <ScopeBlock
            label="Tripartite (parents + direction + mairie)"
            visible="les 3 rôles"
            hidden="aucun (canal le plus ouvert)"
          />
          <ScopeBlock
            label="Mairie interne"
            visible="mairie uniquement"
            hidden="parents et direction"
          />
        </View>

        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide mt-3 mb-2">
          Comment ça se passe en pratique
        </Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
          {[
            {
              n: '1',
              t: 'Ouverture d’un dossier',
              d: 'Un parent élu, la direction ou la mairie ouvre un dossier en choisissant le canal de visibilité.',
            },
            {
              n: '2',
              t: 'Échanges',
              d: 'Les messages et pièces jointes sont confinés au canal. Personne d’autre ne peut les lire.',
            },
            {
              n: '3',
              t: 'Partage (optionnel)',
              d: 'La mairie peut, sur décision explicite, partager le dossier en tripartite. L’historique passé devient alors visible aux nouveaux destinataires (mention claire à l’acceptation).',
            },
            {
              n: '4',
              t: 'Résolution',
              d: 'Le dossier est marqué résolu ou classé sans suite. Conservation pour la durée du mandat puis archivage RGPD.',
            },
          ].map((s) => (
            <View key={s.n} className="flex-row gap-3 mb-3">
              <View className="w-7 h-7 rounded-full bg-primary-50 items-center justify-center">
                <Text className="text-primary-600 font-bold text-xs">{s.n}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 font-semibold text-sm">{s.t}</Text>
                <Text className="text-slate-500 text-xs mt-0.5 leading-relaxed">{s.d}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-success-50 rounded-2xl p-4 border border-success-100 mb-3">
          <View className="flex-row items-center gap-2 mb-2">
            <ShieldCheck color={COLORS.success[600]} size={18} />
            <Text className="text-success-600 font-bold text-sm">La promesse de sécurité</Text>
          </View>
          <Text className="text-slate-600 text-xs leading-relaxed">
            Les règles de visibilité sont matérialisées dans la base de données (Row Level Security
            PostgreSQL), pas seulement dans l’interface. Si un utilisateur tente d’accéder à un
            dossier auquel il n’a pas droit — même par une URL directe — la base renvoie zéro ligne.
            Aucune fuite par bug applicatif n’est possible.
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mt-2 mb-1">
          <Lock color={COLORS.slate[500]} size={14} />
          <Text className="text-slate-500 text-xs">
            Données hébergées en France (région eu-west-3), conformes RGPD.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
