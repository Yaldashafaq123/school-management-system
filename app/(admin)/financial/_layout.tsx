import { Stack } from 'expo-router';

export default function FinancialLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'مدیریت مالی' }} />
      <Stack.Screen name="fee-structure" options={{ title: 'بخش فیس' }} />
      <Stack.Screen name="fee-collection" options={{ title: 'مجموع فیس ' }} />
      <Stack.Screen name="expenses" options={{ title: 'مدیریت مصارف' }} />
      <Stack.Screen name="reports" options={{ title: 'گزارشات مالی' }} />
    </Stack>
  );
}