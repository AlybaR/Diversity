import { Stack } from 'expo-router';
import { AuthGuard } from '../../components/AuthGuard';

export default function ParentLayout() {
  return (
    <AuthGuard allowedRoles={['parent_admin', 'parent_contributeur']}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      />
    </AuthGuard>
  );
}
