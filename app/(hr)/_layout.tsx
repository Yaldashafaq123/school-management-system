// app/(hr)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function HRLayout() {
  const { user, loading, isInitialized } = useAuth();

  if (loading || !isInitialized) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const userRole = user.role?.toUpperCase();

  // ✅ HR routes are accessible to HR users AND admins (admins can supervise HR)
  if (userRole !== "HR" && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    switch (userRole) {
      case "STUDENT":
        return <Redirect href="/(student)/(tabs)" />;
      case "TEACHER":
        return <Redirect href="/(teacher)/(tabs)" />;
      case "PARENT":
        return <Redirect href="/(parent)/(tabs)" />;
      case "FINANCE":
        return <Redirect href="/(finance)/(tabs)"/>;
      case "PRINCIPAL":
        return <Redirect href="/(principal)/(tabs)"  />;
      default:
        return <Redirect href="/(auth)/login" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="staff/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="staff/add" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
    </Stack>
  );
}
