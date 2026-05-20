import '../global.css';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhoneFrame } from '../components/PhoneFrame';

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
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <PhoneFrame>
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
          </Stack>
        </PhoneFrame>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
