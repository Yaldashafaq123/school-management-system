// app/(principal)/_layout.tsx
import { Stack } from "expo-router";

export default function PrincipalLayout() {
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
