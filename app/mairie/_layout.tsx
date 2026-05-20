import { Stack } from 'expo-router';
import { AuthGuard } from '../../components/AuthGuard';

export default function MairieLayout() {
  return (
    <AuthGuard allowedRoles={['mairie_admin', 'elu']}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      />
    </AuthGuard>
  );
}
