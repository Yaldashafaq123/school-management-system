// app/(admin)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLayout() {
  const { user, loading, isInitialized } = useAuth();

  // ✅ Show loading while checking auth
  if (loading || !isInitialized) {
    return null; // Or a loading spinner
  }

  // ✅ Check if user exists
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // ✅ Convert role to uppercase for comparison
  const userRole = user.role?.toUpperCase();

  // ✅ If not admin, redirect to appropriate dashboard
  if (userRole !== "ADMIN") {
    switch (userRole) {
      case "STUDENT":
        return <Redirect href="/(student)/(tabs)" />;
      case "TEACHER":
        return <Redirect href="/(teacher)/(tabs)" />;
      case "PARENT":
        return <Redirect href="/(parent)/(tabs)" />;
    
      default:
        return <Redirect href="/(auth)/login" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
