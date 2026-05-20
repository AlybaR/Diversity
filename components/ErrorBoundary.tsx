/**
 * <ErrorBoundary /> — capture les erreurs React non-handlées pour éviter le
 * crash de toute l'app (écran blanc). Affiche un fallback minimal avec un
 * bouton "Recharger" qui réinitialise le state interne.
 *
 * Pourquoi indispensable :
 *   - Sans boundary, une exception dans un screen affiche un écran blanc total
 *     (web) ou un crash dialog (natif). L'utilisateur ne peut rien faire.
 *   - Avec, on logue l'erreur via `lib/sentry.captureException` puis on
 *     propose un retry. C'est le minimum syndical de robustesse en prod.
 *
 * À monter au plus haut niveau possible (juste en dessous des providers), une
 * seule instance dans `app/_layout.tsx` couvre toutes les routes.
 *
 * Limites :
 *   - Ne capture PAS les erreurs des handlers async (promesses), des callbacks
 *     event-natifs, ni des erreurs côté serveur. Pour ça → `captureException`
 *     manuel dans les catch.
 */

import { Component, ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AlertOctagon, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { captureException } from '../lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    captureException(error, {
      tags: { boundary: 'global' },
      extra: { componentStack: info.componentStack ?? undefined },
      level: 'error',
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <View className="flex-1 bg-slate-50 px-6 justify-center">
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 24 }}>
          <View className="w-16 h-16 bg-danger-50 rounded-2xl items-center justify-center mb-4">
            <AlertOctagon color={COLORS.danger[600]} size={32} />
          </View>
          <Text className="text-slate-800 font-bold text-lg text-center">
            Une erreur est survenue
          </Text>
          <Text className="text-slate-500 text-sm text-center mt-2 leading-relaxed">
            L’application a rencontré un problème inattendu. Vous pouvez essayer de recharger.
          </Text>

          {__DEV__ && (
            <View className="bg-danger-50 border border-danger-100 rounded-xl p-3 mt-5 w-full">
              <Text className="text-danger-600 font-semibold text-xs">{error.name}</Text>
              <Text className="text-danger-600 text-xs mt-1">{error.message}</Text>
              {error.stack && (
                <Text className="text-danger-600 text-[10px] mt-2 leading-tight">
                  {error.stack.split('\n').slice(0, 6).join('\n')}
                </Text>
              )}
            </View>
          )}

          <Pressable
            onPress={this.reset}
            className="mt-6 px-5 py-3 rounded-xl bg-primary-500 flex-row items-center gap-2"
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <RefreshCw color="white" size={16} />
            <Text className="text-white font-semibold text-sm">Recharger</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }
}
