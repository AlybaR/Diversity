import type { StatutDossier, Urgence } from '../types';
import { STATUTS_DOSSIER } from '../data/mockData';
import { Badge } from './Badge';

interface StatutBadgeProps {
  statut: StatutDossier;
}

const STATUT_TONE: Record<
  StatutDossier,
  'primary' | 'success' | 'danger' | 'warning' | 'slate' | 'indigo'
> = {
  brouillon: 'slate',
  partage_representants: 'slate',
  transmis_mairie: 'primary',
  recu: 'primary',
  en_cours_analyse: 'warning',
  en_attente_information: 'warning',
  rdv_propose: 'indigo',
  action_programmee: 'primary',
  resolu: 'success',
  classe_sans_suite: 'slate',
  hors_competence: 'slate',
};

export function StatutBadge({ statut }: StatutBadgeProps) {
  const label = STATUTS_DOSSIER.find((s) => s.value === statut)?.label ?? statut;
  return <Badge label={label} tone={STATUT_TONE[statut]} />;
}

interface UrgenceBadgeProps {
  urgence: Urgence;
}

const URGENCE_TONE: Record<Urgence, 'success' | 'warning' | 'danger'> = {
  faible: 'success',
  moyenne: 'warning',
  elevee: 'danger',
};

const URGENCE_LABEL: Record<Urgence, string> = {
  faible: 'Faible',
  moyenne: 'Moyenne',
  elevee: 'Élevée',
};

export function UrgenceBadge({ urgence }: UrgenceBadgeProps) {
  return <Badge label={URGENCE_LABEL[urgence]} tone={URGENCE_TONE[urgence]} />;
}
