// app/(hr)/_layout.tsx - UPDATED WITH AUTHENTICATION
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function HRLayout() {
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
  const userType = user.userType?.toLowerCase();

  // ✅ If not HR or admin, redirect to appropriate dashboard
  if (userRole !== "HR" && userRole !== "ADMIN") {
    switch (userRole) {
      case "STUDENT":
        return <Redirect href="/(student)/(tabs)" />;
      case "TEACHER":
        return <Redirect href="/(teacher)/(tabs)" />;
      case "PARENT":
        return <Redirect href="/(parent)/(tabs)" />;
      case "FINANCE":
        return <Redirect href="/(finance)/(tabs)" />;
      case "PRINCIPAL":
        return <Redirect href="/(principal)/(tabs)" />;
      default:
        return <Redirect href="/(auth)/login" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="staff/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="staff/add"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
