import { Stack } from 'expo-router';
import { AuthGuard } from '../../components/AuthGuard';

export default function DirectionLayout() {
  return (
    <AuthGuard allowedRoles={['direction']}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      />
    </AuthGuard>
  );
}
