// app/(principal)/(tabs)/reports.tsx
import { StyleSheet, Text, View } from "react-native";

export default function PrincipalReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>راپورهای مدیریتی</Text>
      <Text style={styles.subtext}>در حال توسعه...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  text: {
    fontSize: 20,
    fontFamily: "VazirBold",
    color: "#1e293b",
  },
  subtext: {
    fontSize: 14,
    fontFamily: "Vazir",
    color: "#94a3b8",
    marginTop: 8,
  },
});
