import { Stack } from 'expo-router';
import { Colors } from '../../../constants/Colors';

export default function UsersLayout() {
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
          title: 'مدیریت کاربران',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'جزئیات کاربر',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'ایجاد کاربر جدید',
        }}
      />
    </Stack>
  );
}