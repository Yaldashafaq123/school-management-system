import { Stack } from 'expo-router';
import { Colors } from '../../../constants/Colors';

export default function AnalyticsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'تحلیل و گزارشات',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'تحلیل کاربران',
        }}
      />
      <Stack.Screen
        name="courses"
        options={{
          title: 'تحلیل دوره‌ها',
        }}
      />
    </Stack>
  );
}