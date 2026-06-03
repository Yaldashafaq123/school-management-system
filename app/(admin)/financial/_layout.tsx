import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export default function FinancialLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Vazirmatn",
          fontSize: 18,
          fontWeight: "bold",
          color: Colors.text,
        },
        headerTintColor: Colors.primary,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "داشبورد مالی",
          headerLeft: () => null,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity>
                <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="download-outline" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Stack>
  );
}