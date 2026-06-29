// app/(student)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentLayout() {
  const { user, loading, isInitialized } = useAuth();

  if (loading || !isInitialized) return null;

  if (!user) return <Redirect href="/(auth)/login" />;

  const userRole = user.role?.toUpperCase();

  if (userRole !== "STUDENT") {
    if (userRole === "ADMIN") return <Redirect href="/(admin)/(tabs)" />;
    if (userRole === "TEACHER") return <Redirect href="/(teacher)/(tabs)" />;
    if (userRole === "PARENT") return <Redirect href="/(parent)/(tabs)" />;
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
