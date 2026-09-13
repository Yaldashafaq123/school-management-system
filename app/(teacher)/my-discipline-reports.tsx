import React, { useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import MyDisciplineReports from "@/components/discipline/MyDisciplineReports";
import { Ionicons } from "@expo/vector-icons";

export default function MyDisciplineReportsScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="تخلفات ثبت‌شده من"
        showBack
        rightComponent={
          <TouchableOpacity
            onPress={() => setRefreshKey((k) => k + 1)}
            style={{ padding: 8 }}
          >
            <Ionicons name="refresh" size={22} color={Colors.primary} />
          </TouchableOpacity>
        }
      />
      <MyDisciplineReports refreshKey={refreshKey} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});