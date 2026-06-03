import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function TeacherLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Redirect if not a teacher
  if (!user || user.role !== "teacher") {
    if (user?.role === "student") {
      return <Redirect href="/(student)/(tabs)" />;
    } else if (user?.role === "admin") {
      return <Redirect href="/(admin)/(tabs)" />;
    }
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      {/* Add other student screens */}
    </Stack>
  );
}
