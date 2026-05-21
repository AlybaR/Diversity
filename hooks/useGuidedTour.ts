/**
 * useGuidedTour — visite guidée avec navigation automatique.
 *
 * Pattern subscribe externe + useSyncExternalStore (cf. useDemoUser). Permet
 * à n'importe quel composant de réagir aux changements sans Context.
 *
 * Comportement clé : chaque étape a un `navigateTo` et optionnel `switchToRole`.
 * Quand l'utilisateur clique "Suivant" :
 *   1. On switch l'utilisateur courant si l'étape suivante l'exige
 *      (ex: passer de Nadia/parent à Claire/mairie)
 *   2. On router.replace() vers le path cible (l'écran change)
 *   3. On avance le state (la bulle change de contenu)
 *
 * Donc l'utilisateur n'a JAMAIS besoin de cliquer ailleurs que sur la bulle.
 * Il regarde, il clique Suivant, il regarde, il clique Suivant. Visite passive.
 *
 * Persistance : AsyncStorage clé `@passerelle-tour-done` pour mémoriser que
 * l'utilisateur a fini ou skippé la visite (on ne lui repropose plus le CTA).
 */

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { router, type Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERSONNES } from '../data/mockData';
import type { Role } from '../types';
import { useDemoUser } from './useDemoUser';

const STORAGE_KEY = '@passerelle-tour-done';

export interface TourStep {
  id: string;
  /** Titre court de la bulle */
  title: string;
  /** Description / consigne à l'utilisateur */
  description: string;
  /** Libellé du bouton de progression */
  nextLabel?: string;
  /**
   * Chemin où naviguer pour atteindre cette étape (router.replace). Si défini,
   * appelé AVANT d'afficher l'étape (= au moment où on avance vers).
   */
  navigateTo?: string;
  /**
   * Si défini, change l'utilisateur courant pour le premier personnage du
   * rôle indiqué AVANT de naviguer. Permet de simuler "comme si tu te
   * connectais en mairie / parent / direction".
   */
  switchToRole?: Role;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '👋 Bienvenue dans Passerelle',
    description:
      "Passerelle coordonne 3 acteurs autour de l'école : parents élus, mairie, direction. Cette visite te montre les points clés en 60 secondes — clique simplement « Suivant ».",
    nextLabel: 'Commencer →',
  },
  {
    id: 'parent-home',
    title: 'Côté parent élu',
    description:
      "Voici l'accueil d'un parent élu (Nadia). On y voit l'activité de son école : dossiers ouverts, urgents, derniers messages mairie, prochain RDV.",
    nextLabel: 'Suivant',
    navigateTo: '/parent/home',
    switchToRole: 'parent_admin',
  },
  {
    id: 'parent-dossiers',
    title: 'La liste des dossiers',
    description:
      'Tous les dossiers visibles par le parent. Les filtres en haut permettent de trier (urgents, en attente mairie, résolus). On va maintenant changer de rôle.',
    nextLabel: 'Passer côté mairie',
    navigateTo: '/parent/dossiers',
  },
  {
    id: 'mairie-dashboard',
    title: 'Côté mairie',
    description:
      "Maintenant tu es Claire, agent du service éducation. Tu vois l'activité agrégée de toutes les écoles, pas juste une.",
    nextLabel: 'Voir les dossiers',
    navigateTo: '/mairie/dashboard',
    switchToRole: 'mairie_admin',
  },
  {
    id: 'mairie-dossiers',
    title: 'Vue mairie : tous les dossiers',
    description:
      "La mairie voit TOUS les dossiers, quels que soient leurs canaux. Les parents et la direction ne voient que ce qui les concerne. C'est l'isolation au cœur de Passerelle.",
    nextLabel: 'Suivant',
    navigateTo: '/mairie/dossiers',
  },
  {
    id: 'mairie-equipe',
    title: "L'annuaire interne mairie",
    description:
      'Ici tu vois les agents du service éducation et les élus du cabinet. En mode démo, tu peux ajouter un agent ou un élu en direct — il apparaît immédiatement dans le sélecteur de mode démo et dans les listes filtrées par rôle.',
    nextLabel: 'Voir la direction',
    navigateTo: '/mairie/equipe',
  },
  {
    id: 'direction-home',
    title: 'Côté direction d’école',
    description:
      'Enfin, voici la vue de la directrice. Elle ne voit que les sujets institutionnels (canal direction↔mairie ou tripartite) — jamais les conversations privées parents↔mairie.',
    nextLabel: 'Annuaire pédagogique',
    navigateTo: '/direction/home',
    switchToRole: 'direction',
  },
  {
    id: 'direction-directory',
    title: "L'équipe pédagogique",
    description:
      "Dernier point : la direction gère aussi son équipe pédagogique (enseignants impliqués sur les dossiers). L'annuaire est également éditable en démo pour ajouter un enseignant en direct.",
    nextLabel: 'Suivant',
    navigateTo: '/direction/directory',
  },
  {
    id: 'done',
    title: '🎉 Visite terminée',
    description:
      "Tu as vu les 3 rôles et le principe d'isolation. À toi maintenant : explore les écrans, crée un dossier, change de personnage via « Mode démo » sur l'accueil.",
    nextLabel: "C'est parti",
    navigateTo: '/',
    switchToRole: 'parent_admin',
  },
];

// =============================================================================
// State global (subscribe pattern)
// =============================================================================
interface TourState {
  active: boolean;
  step: number;
  hasCompleted: boolean;
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
  const { switchTo } = useDemoUser();

  useEffect(() => {
    initializeFromStorage();
  }, []);

  /** Applique navigation + switchRole d'un step donné */
  const applyStepActions = useCallback(
    (step: TourStep) => {
      if (step.switchToRole) {
        const personne = PERSONNES.find((p) => p.role === step.switchToRole);
        if (personne) {
          // switchTo(id, { redirect: false }) : on ne laisse pas useDemoUser
          // rediriger vers la home par défaut, c'est le step.navigateTo qui
          // décide où atterrir.
          switchTo(personne.id, { redirect: false });
        }
      }
      if (step.navigateTo) {
        router.replace(step.navigateTo as Href);
      }
    },
    [switchTo],
  );

  const start = useCallback(() => {
    _state = { active: true, step: 0, hasCompleted: false };
    notify();
    // L'étape 0 (welcome) n'a pas de navigateTo : on reste où on est.
  }, []);

  const next = useCallback(() => {
    if (!_state.active) return;
    const nextIndex = _state.step + 1;
    if (nextIndex >= TOUR_STEPS.length) {
      // Fin de la visite
      _state = { active: false, step: 0, hasCompleted: true };
      persistCompleted();
      notify();
      // On peut tout de même appliquer le dernier step (ex: retour à l'accueil)
      const lastStep = TOUR_STEPS[TOUR_STEPS.length - 1];
      applyStepActions(lastStep);
      return;
    }
    const targetStep = TOUR_STEPS[nextIndex];
    applyStepActions(targetStep);
    _state = { ..._state, step: nextIndex };
    notify();
  }, [applyStepActions]);

  const previous = useCallback(() => {
    if (!_state.active) return;
    const prevIndex = Math.max(0, _state.step - 1);
    const targetStep = TOUR_STEPS[prevIndex];
    applyStepActions(targetStep);
    _state = { ..._state, step: prevIndex };
    notify();
  }, [applyStepActions]);

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
