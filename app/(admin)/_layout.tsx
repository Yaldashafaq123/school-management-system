// app/(admin)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLayout() {
  const { user, loading, isInitialized } = useAuth();

  if (loading || !isInitialized) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const userRole = user.role?.toUpperCase();

  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    switch (userRole) {
      case "STUDENT":
        return <Redirect href="/(student)/(tabs)" />;
      case "TEACHER":
        return <Redirect href="/(teacher)/(tabs)" />;
      case "PARENT":
        return <Redirect href="/(parent)/(tabs)" />;
      case "FINANCE":
        return <Redirect href="/(finance)/(tabs)" />;
      case "HR":
        return <Redirect href="/(hr)/(tabs)" />;
      case "PRINCIPAL":
        return <Redirect href="/(principal)/(tabs)" />;
      default:
        return <Redirect href="/(auth)/login" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="link-parents" />
    </Stack>
  );
}
