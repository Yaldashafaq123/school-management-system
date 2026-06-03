// components/ForceUpdateModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface ForceUpdateModalProps {
  visible: boolean;
  version: string;
  releaseNotes?: string;
  message?: string;
  onUpdate: () => void;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  visible,
  version,
  releaseNotes,
  message,
  onUpdate,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-download" size={48} color="#4285F4" />
          </View>

          <Text style={styles.title}>به‌روزرسانی اجباری</Text>
          <Text style={styles.version}>نسخه {version}</Text>

          <Text style={styles.message}>
            {message ||
              "نسخه جدیدی از برنامه منتشر شده است. برای ادامه استفاده، لطفا برنامه را به‌روزرسانی کنید."}
          </Text>

          {releaseNotes && (
            <View style={styles.releaseNotesContainer}>
              <Text style={styles.releaseNotesTitle}>تغییرات جدید:</Text>
              <Text style={styles.releaseNotes}>{releaseNotes}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.updateButton} onPress={onUpdate}>
            <Text style={styles.updateButtonText}>بروزرسانی</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            پس از به‌روزرسانی، برنامه به‌طور خودکار اجرا خواهد شد
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  version: {
    fontSize: 16,
    color: "#4285F4",
    marginBottom: 16,
    fontWeight: "600",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  releaseNotesContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  releaseNotesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  releaseNotes: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  updateButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
