import { Stack } from 'expo-router';

export default function CalendarLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'School Calendar',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="event-details" 
        options={{ title: 'Event Details' }} 
      />
    </Stack>
  );
}