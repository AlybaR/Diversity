import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    />
  );
}
