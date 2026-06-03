import { Stack } from 'expo-router';

export default function ErrorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="boundary" />
      <Stack.Screen name="offline" />
      <Stack.Screen name="update-required" />
    </Stack>
  );
}