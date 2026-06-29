// app/(parent)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function ParentLayout() {
  const { user, loading, isInitialized } = useAuth();

  if (loading || !isInitialized) return null;

  if (!user) return <Redirect href="/(auth)/login" />;

  const userRole = user.role?.toUpperCase();

  if (userRole !== "PARENT") {
    if (userRole === "ADMIN") return <Redirect href="/(admin)/(tabs)" />;
    if (userRole === "TEACHER") return <Redirect href="/(teacher)/(tabs)" />;
    if (userRole === "STUDENT") return <Redirect href="/(student)/(tabs)" />;
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
