// components/finance/StudentSearchInput.tsx
import { financeApi, Student } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface StudentSearchInputProps {
  onSelect: (student: Student) => void;
  value?: Student | null;
  placeholder?: string;
}

export function StudentSearchInput({
  onSelect,
  value,
  placeholder = "جستجوی شاگرد...",
}: StudentSearchInputProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    value || null,
  );

  const searchStudents = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      const results = await financeApi.searchStudents(searchQuery);
      setStudents(results);
    } catch (error) {
      console.error("Search error:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchStudents]);

  const handleSelect = (student: Student) => {
    setSelectedStudent(student);
    setModalVisible(false);
    onSelect(student);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        {selectedStudent ? (
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedName}>
              {selectedStudent.user.fullName}
            </Text>
            <Text style={styles.selectedDetail}>
              {selectedStudent.class?.name || "بدون کلاس"}
            </Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="search-outline" size={20} color="#94a3b8" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
        <Ionicons name="chevron-down" size={20} color="#94a3b8" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب شاگرد</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.searchInput}
                placeholder="جستجوی شاگرد..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                textAlign="right"
              />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>در حال جستجو...</Text>
              </View>
            ) : students.length > 0 ? (
              <FlatList
                data={students}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.studentItem}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.studentItemInfo}>
                      <Text style={styles.studentItemName}>
                        {item.user.fullName}
                      </Text>
                      <Text style={styles.studentItemClass}>
                        {item.class?.name || "بدون کلاس"}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                )}
              />
            ) : searchQuery.length >= 2 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>شاگردی پیدا نشد</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="person-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>
                  برای جستجو حداقل ۲ حرف وارد کنید
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedContainer: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  selectedDetail: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  placeholderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  studentItemInfo: {
    flex: 1,
  },
  studentItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  studentItemClass: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
