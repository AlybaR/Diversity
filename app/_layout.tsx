import '../global.css';
import { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PhoneFrame } from '../components/PhoneFrame';
import { OfflineBanner } from '../components/OfflineBanner';
import { configureNotificationHandler } from '../lib/notifications';
import { usePushRegistration } from '../hooks/usePushRegistration';

// Une seule fois par exécution : configure la présentation des notifs en foreground
configureNotificationHandler();

/**
 * Composant invisible qui déclenche les effets de session (push registration,
 * etc.) une fois `QueryClientProvider` monté. Le hook gate sur `isAuthorized`,
 * donc no-op tant qu'il n'y a pas de session.
 */
function SessionEffects() {
  usePushRegistration();
  return null;
}

export default function RootLayout() {
  // QueryClient instance créée une fois par session, persistée via useState
  // (évite la recréation à chaque re-render qui flusherait le cache).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 min : les données restent fraîches sans refetch
            gcTime: 5 * 60_000, // 5 min : conservé en cache après le dernier consommateur
            retry: 1, // 1 retry sur erreur (le mock layer n'échoue jamais, utile pour le backend)
            refetchOnWindowFocus: false, // pas pertinent en RN, désactivé par défaut
          },
        },
      }),
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SessionEffects />
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <PhoneFrame>
            <View style={{ flex: 1 }}>
              <OfflineBanner />
              <View style={{ flex: 1 }}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#f8fafc' },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="join-school" />
                  <Stack.Screen name="create-account" />
                  <Stack.Screen name="sign-in" />
                  <Stack.Screen name="auth" />
                  <Stack.Screen name="parent" />
                  <Stack.Screen name="mairie" />
                  <Stack.Screen name="direction" />
                  <Stack.Screen name="aide" />
                  <Stack.Screen name="legal" />
                </Stack>
              </View>
            </View>
          </PhoneFrame>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
