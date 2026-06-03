// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AuthLayout() {
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}