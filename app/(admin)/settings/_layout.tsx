import { Stack } from 'expo-router';
import { Colors } from '../../../constants/Colors';

export default function SettingsLayout() {
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
          title: 'تنظیمات سیستم',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="password"
        options={{
          title: 'تغییر رمز عبور',
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          title: 'گزارش سیستم',
        }}
      />
    </Stack>
  );
}