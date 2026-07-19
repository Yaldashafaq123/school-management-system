// app/(principal)/_layout.tsx - UPDATED WITH AUTHENTICATION
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function PrincipalLayout() {
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

  // ✅ If not principal or admin, redirect to appropriate dashboard
  if (userRole !== "PRINCIPAL" && userRole !== "ADMIN") {
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
        name="academic"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="students/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="students/[id]/edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="students/[id]/promote"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="teachers/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="teachers/[id]/edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="classes/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="classes/[id]/edit"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="classes/create"
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
