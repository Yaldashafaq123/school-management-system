import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="child-switch" 
        options={{ 
          title: 'Select Child',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="payment" 
        options={{ 
          title: 'Make Payment',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="events" 
        options={{ 
          title: 'School Events'
        }} 
      />
    </Stack>
  );
}