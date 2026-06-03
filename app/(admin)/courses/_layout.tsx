import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function CoursesLayout() {
  const { user, loading } = useAuth();

  // Redirect non-admin users
  if (loading) {
    return null;
  }

  if (!user || user.role !== 'admin') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.card,
        },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'مدیریت دوره‌ها',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'ایجاد دوره جدید',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'جزئیات دوره',
        }}
      />
    </Stack>
  );
}