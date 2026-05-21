/**
 * <PhoneFrame /> — wrapper qui adapte la présentation selon la largeur d'écran.
 *
 * 3 modes :
 *   1. Mobile natif (iOS/Android) ou web < 768px → plein écran. L'app est
 *      vue comme une application native classique.
 *   2. Web entre 768px et 1024px (tablette / petit écran de bureau) → colonne
 *      centrale "responsive" max 480px, fond dégradé doux autour. Pas de cadre
 *      iPhone, pas de notch — on veut que ça ressemble à un site web qui a
 *      une version mobile, pas à une démo enfermée dans un téléphone.
 *   3. Web ≥ 1024px (laptop / desktop) → idem mode 2, mais avec un peu plus
 *      de marge autour pour aérer.
 *
 * Avant : le mode "iPhone simulé" avec notch était cool pour montrer "c'est
 * une app mobile" mais donnait une impression de démo bricolée. Maintenant
 * on cherche le rendu d'une vraie web-app responsive, présentable sur ordi
 * en réunion ET sur téléphone des participants.
 */

import { ReactNode } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '../constants/theme';

interface PhoneFrameProps {
  children: ReactNode;
}

// Largeur maximale du "viewport" mobile sur grand écran. ~Plus large que iPhone
// pour rester lisible sans s'étirer comme une vraie page desktop.
const APP_MAX_WIDTH = 480;
// Seuil au-dessus duquel on centre la colonne (sinon plein écran mobile).
const RESPONSIVE_BREAKPOINT = 768;

export function PhoneFrame({ children }: PhoneFrameProps) {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width >= RESPONSIVE_BREAKPOINT;

  // Mobile natif OU petit écran web : plein écran direct, pas de cadre.
  if (!isWebLarge) {
    return <>{children}</>;
  }

  return (
    <LinearGradient
      colors={GRADIENTS.bodyShell as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        minHeight: '100%' as unknown as number,
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: APP_MAX_WIDTH,
          flex: 1,
          backgroundColor: 'white',
          // Ombre douce sur les côtés pour signaler "voici la zone app"
          ...(Platform.OS === 'web'
            ? {
                boxShadow: '0 0 40px rgba(0, 0, 0, 0.08)',
                minHeight: '100vh' as unknown as number,
              }
            : {}),
        }}
      >
        {children}
      </View>
    </LinearGradient>
  );
}
