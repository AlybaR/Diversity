/**
 * useGuidedTour — état global de la visite guidée de démo.
 *
 * Architecture : pattern subscribe externe + useSyncExternalStore (cf. useDemoUser).
 * Permet à n'importe quel composant de réagir aux changements sans Context.
 *
 * Persistance : AsyncStorage clé `@passerelle-tour-done` pour mémoriser que
 * l'utilisateur a fini ou skippé la visite (on ne lui repropose plus le CTA
 * jusqu'à reset).
 *
 * Le scénario (TOUR_STEPS) est statique : 6 étapes qui couvrent :
 *   1. Accueil + présentation
 *   2. Vue mairie (dashboard)
 *   3. Détail d'un dossier mairie + scope visibility
 *   4. Switch de rôle via Mode démo
 *   5. Vue parent (dossiers)
 *   6. Création d'un dossier + félicitations finales
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@passerelle-tour-done';

export interface TourStep {
  id: string;
  /** Titre court de la bulle */
  title: string;
  /** Description / consigne à l'utilisateur */
  description: string;
  /** Libellé du bouton de progression */
  nextLabel?: string;
  /** Chemin de route attendu (si défini, la bulle peut suggérer "naviguez vers X") */
  hintPath?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Bienvenue dans la démo Passerelle',
    description:
      "Passerelle coordonne 3 acteurs : parents élus, mairie et direction d'école. Cette visite te montre les points clés en 60 secondes.",
    nextLabel: 'Commencer →',
  },
  {
    id: 'choose-mairie',
    title: 'Étape 1 — Vue mairie',
    description:
      'Tape sur « Je suis une mairie » pour découvrir ce que voit le service éducation municipal.',
    nextLabel: 'Suivant',
    hintPath: '/mairie/dashboard',
  },
  {
    id: 'mairie-dashboard',
    title: 'Étape 2 — Le tableau de bord',
    description:
      "La mairie voit l'activité agrégée de toutes les écoles. Tape sur un dossier dans la liste pour ouvrir son détail.",
    nextLabel: "J'ai ouvert un dossier",
    hintPath: '/mairie/dossier-detail',
  },
  {
    id: 'mairie-dossier',
    title: 'Étape 3 — Canal de visibilité',
    description:
      "Chaque dossier a un canal qui détermine qui peut le voir (parents↔mairie, direction↔mairie, tripartite, mairie interne). C'est l'isolation au cœur de Passerelle.",
    nextLabel: 'Compris, suite',
  },
  {
    id: 'switch-role',
    title: 'Étape 4 — Changer de personnage',
    description:
      'Reviens au Welcome (ou via ton profil) et utilise « Mode démo : tester un autre rôle » pour passer côté parent et voir la même app sous un angle différent.',
    nextLabel: 'Suivant',
    hintPath: '/parent/home',
  },
  {
    id: 'parent-create',
    title: 'Étape 5 — Créer un dossier',
    description:
      "Côté parent, va dans « Mes dossiers » et crée une nouvelle demande. Tu verras qu'elle apparaît immédiatement, puis côté mairie après changement de rôle.",
    nextLabel: 'Terminer la visite',
  },
  {
    id: 'done',
    title: '🎉 Visite terminée',
    description:
      'Tu as vu les éléments clés : les 3 rôles, les canaux de visibilité, la création + réponse. Explore librement maintenant.',
    nextLabel: 'Fermer',
  },
];

// =============================================================================
// State global
// =============================================================================
interface TourState {
  active: boolean;
  step: number; // index dans TOUR_STEPS
  hasCompleted: boolean; // savoir si on ne propose plus le CTA
}

let _state: TourState = {
  active: false,
  step: 0,
  hasCompleted: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

function getSnapshot(): TourState {
  return _state;
}

// Cache de l'état "completed" pour éviter de relire AsyncStorage à chaque mount
let _initialized = false;
async function initializeFromStorage(): Promise<void> {
  if (_initialized) return;
  _initialized = true;
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (value === '1') {
      _state = { ..._state, hasCompleted: true };
      notify();
    }
  } catch {
    /* ignore */
  }
}

async function persistCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

async function clearCompleted(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// =============================================================================
// Hook
// =============================================================================
export function useGuidedTour() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    initializeFromStorage();
  }, []);

  const start = useCallback(() => {
    _state = { active: true, step: 0, hasCompleted: false };
    notify();
  }, []);

  const next = useCallback(() => {
    if (!_state.active) return;
    const nextIndex = _state.step + 1;
    if (nextIndex >= TOUR_STEPS.length) {
      // Fin
      _state = { active: false, step: 0, hasCompleted: true };
      persistCompleted();
      notify();
      return;
    }
    _state = { ..._state, step: nextIndex };
    notify();
  }, []);

  const previous = useCallback(() => {
    if (!_state.active) return;
    const prevIndex = Math.max(0, _state.step - 1);
    _state = { ..._state, step: prevIndex };
    notify();
  }, []);

  const skip = useCallback(() => {
    _state = { active: false, step: 0, hasCompleted: true };
    persistCompleted();
    notify();
  }, []);

  const close = useCallback(() => {
    _state = { ..._state, active: false };
    notify();
  }, []);

  const reset = useCallback(() => {
    _state = { active: false, step: 0, hasCompleted: false };
    clearCompleted();
    notify();
  }, []);

  const currentStep = TOUR_STEPS[state.step] ?? null;

  return {
    active: state.active,
    hasCompleted: state.hasCompleted,
    stepIndex: state.step,
    totalSteps: TOUR_STEPS.length,
    currentStep,
    start,
    next,
    previous,
    skip,
    close,
    reset,
  };
}
