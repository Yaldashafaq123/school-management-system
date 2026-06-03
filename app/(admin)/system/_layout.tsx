import { Stack } from "expo-router";

export default function SystemLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#007AFF" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "مدیریت سیستم",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen name="announcements" options={{ title: "ارسال اعلامیه" }} />
      <Stack.Screen
        name="system-settings"
        options={{ title: "تنظیمات سیستم" }}
      />
      <Stack.Screen
        name="backup-restore"
        options={{ title: "پشتیبان‌گیری و بازیابی" }}
      />
      <Stack.Screen
        name="audit-logs"
        options={{ title: "گزارش‌های حسابرسی" }}
      />
      <Stack.Screen name="database" options={{ title: "مدیریت پایگاه داده" }} />
    </Stack>
  );
}
