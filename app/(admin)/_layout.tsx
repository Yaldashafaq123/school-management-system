import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Redirect if not an admin
  if (!user || user.role !== "admin") {
    if (user?.role === "student") {
      return <Redirect href="/(student)/(tabs)" />;
    } else if (user?.role === "teacher") {
      return <Redirect href="/(teacher)/(tabs)" />;
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
