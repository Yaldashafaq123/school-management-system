import { Stack } from 'expo-router';

export default function SystemLayout() {
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
          title: 'System Management',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="announcements" 
        options={{ title: 'Announcement Broadcast' }} 
      />
      <Stack.Screen 
        name="system-settings" 
        options={{ title: 'System Settings' }} 
      />
      <Stack.Screen 
        name="backup-restore" 
        options={{ title: 'Backup & Restore' }} 
      />
      <Stack.Screen 
        name="audit-logs" 
        options={{ title: 'Audit Logs' }} 
      />
      <Stack.Screen 
        name="database" 
        options={{ title: 'Database Management' }} 
      />
    </Stack>
  );
}