// app/(hr)/_layout.tsx
import { Stack } from "expo-router";

export default function HRLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
