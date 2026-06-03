import { Stack } from "expo-router";

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="courses" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="lesson/[id]" />
      {/* Assignment Screens */}
      <Stack.Screen name="assignments" />
      <Stack.Screen name="assignment/[id]" />
      <Stack.Screen name="assignment/[id]/submit" />
      {/* Calendar Screen */}
      <Stack.Screen name="calendar" />
    </Stack>
  );
}
