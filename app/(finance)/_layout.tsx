// app/(finance)/_layout.tsx
import { Stack } from "expo-router";

// app/(finance)/_layout.tsx

export default function FinanceLayout() {
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
