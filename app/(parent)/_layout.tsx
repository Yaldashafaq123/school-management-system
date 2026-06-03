import { Stack } from "expo-router";

export default function ParentLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="child-switch"
        options={{
          title: "انتخاب فرزند",
          presentation: "modal",
        }}
      />

      <Stack.Screen
        name="events"
        options={{
          title: "رویدادها",
        }}
      />
      <Stack.Screen
        name="fees/invoice/[id]"
        options={{
          title: "جزییات پرداخت",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="fees/history"
        options={{
          title: "تاریخچه پرداخت",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
