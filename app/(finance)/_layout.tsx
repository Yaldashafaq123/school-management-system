// app/(finance)/_layout.tsx - UPDATED WITH AUTHENTICATION
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function FinanceLayout() {
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

  // ✅ If not finance or admin, redirect to appropriate dashboard
  if (userRole !== "FINANCE" && userRole !== "ADMIN") {
    switch (userRole) {
      case "STUDENT":
        return <Redirect href="/(student)/(tabs)" />;
      case "TEACHER":
        return <Redirect href="/(teacher)/(tabs)" />;
      case "PARENT":
        return <Redirect href="/(parent)/(tabs)" />;
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
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
