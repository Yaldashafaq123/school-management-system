// app/(teacher)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function TeacherLayout() {
  const { user, loading, isInitialized } = useAuth();

  if (loading || !isInitialized) return null;

  if (!user) return <Redirect href="/(auth)/login" />;

  const userRole = user.role?.toUpperCase();

  if (userRole !== "TEACHER") {
    if (userRole === "ADMIN") return <Redirect href="/(admin)/(tabs)" />;
    if (userRole === "STUDENT") return <Redirect href="/(student)/(tabs)" />;
    if (userRole === "PARENT") return <Redirect href="/(parent)/(tabs)" />;
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // ✅ FIX: Ensure proper RTL support in Stack navigator
        animation: "slide_from_right",
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="(tabs)" />
      {/* ✅ FIX: Add modal screens here if needed */}
      <Stack.Screen
        name="attendance/take"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="attendance/report"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="WeeklyAssessment/WeeklyAssessmentListScreen"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
