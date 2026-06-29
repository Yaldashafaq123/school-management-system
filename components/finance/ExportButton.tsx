// components/finance/ExportButton.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { financeApi } from "@/src/config/financeApi";

interface ExportButtonProps {
  reportType: string;
  startDate?: string;
  endDate?: string;
  label?: string;
  variant?: "icon" | "button" | "full";
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  reportType,
  startDate,
  endDate,
  label = "صدور راپور",
  variant = "button",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: "excel" | "pdf") => {
    setExporting(true);
    try {
      const response = await financeApi.exportReport({
        type: reportType,
        startDate,
        endDate,
        format,
      });
      
      if (response.success) {
        Alert.alert("موفقیت", `راپور به فرمت ${format.toUpperCase()} صادر شد`, [
          { text: "باشه" },
        ]);
      } else {
        Alert.alert("خطا", "صدور راپور با مشکل مواجه شد");
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطای شبکه");
    } finally {
      setExporting(false);
      setModalVisible(false);
    }
  };

  if (variant === "icon") {
    return (
      <>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="share-outline" size={22} color="#3b82f6" />
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>صدور راپور</Text>
              <View style={styles.exportOptions}>
                <TouchableOpacity
                  style={styles.exportOption}
                  onPress={() => handleExport("excel")}
                  disabled={exporting}
                >
                  <View style={[styles.exportIcon, { backgroundColor: "#d1fae5" }]}>
                    <Ionicons name="grid-outline" size={28} color="#059669" />
                  </View>
                  <Text style={styles.exportLabel}>Excel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exportOption}
                  onPress={() => handleExport("pdf")}
                  disabled={exporting}
                >
                  <View style={[styles.exportIcon, { backgroundColor: "#fee2e2" }]}>
                    <Ionicons name="document-outline" size={28} color="#dc2626" />
                  </View>
                  <Text style={styles.exportLabel}>PDF</Text>
                </TouchableOpacity>
              </View>
              {exporting && <ActivityIndicator style={{ marginTop: 16 }} />}
            </View>
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.button, variant === "full" && styles.fullButton]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>صدور راپور</Text>
            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleExport("excel")}
              >
                <View style={[styles.exportIcon, { backgroundColor: "#d1fae5" }]}>
                  <Ionicons name="grid-outline" size={28} color="#059669" />
                </View>
                <Text style={styles.exportLabel}>Excel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => handleExport("pdf")}
              >
                <View style={[styles.exportIcon, { backgroundColor: "#fee2e2" }]}>
                  <Ionicons name="document-outline" size={28} color="#dc2626" />
                </View>
                <Text style={styles.exportLabel}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    alignSelf: "flex-start",
  },
  fullButton: {
    width: "100%",
    justifyContent: "center",
    paddingVertical: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "VazirBold",
  },
  exportOptions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  exportOption: {
    alignItems: "center",
  },
  exportIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  exportLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },
});