import { Stack } from 'expo-router';

export default function ResourcesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="digital-library" 
        options={{ 
          title: 'Digital Library',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="resource-details" 
        options={{ title: 'Resource Details' }} 
      />
      <Stack.Screen 
        name="media-gallery" 
        options={{ title: 'Media Gallery' }} 
      />
      <Stack.Screen 
        name="directory" 
        options={{ title: 'School Directory' }} 
      />
    </Stack>
  );
}