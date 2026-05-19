// Constantes de thème reprises depuis mockups-app/src/index.css
// Utilisées principalement pour <LinearGradient> qui ne lit pas Tailwind.

export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#172554',
  },
  accent: {
    50: '#fef3c7',
    100: '#fde68a',
    200: '#fcd34d',
    300: '#f59e0b',
    400: '#d97706',
    500: '#b45309',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  mairie: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
  },
  // Palette indigo/violet pour l'espace direction d'établissement
  // (différenciée du bleu parent et du teal mairie pour éviter la confusion de rôle).
  direction: {
    50: '#eef2ff',
    100: '#e0e7ff',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
  },
} as const;

// Gradients identiques à ceux de mockups-app/src/index.css
export const GRADIENTS = {
  // .gradient-header — bleu institutionnel pour entêtes parent
  header: ['#1e3a8a', '#2563eb', '#6366f1'] as const,
  // .gradient-primary — bouton principal
  primary: ['#2563eb', '#1d4ed8', '#7c3aed'] as const,
  // .gradient-mairie — entête mairie (teal)
  mairie: ['#0f766e', '#0d9488', '#2dd4bf'] as const,
  // Entête direction d'établissement (indigo / violet)
  direction: ['#4338ca', '#4f46e5', '#7c3aed'] as const,
  // Fond global du shell mobile
  bodyShell: ['#f0f4ff', '#e8f0fe', '#f5f0ff'] as const,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;
