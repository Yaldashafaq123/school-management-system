import { EmptyState } from "@/components/finance/EmptyState";
import { OutstandingBadge } from "@/components/finance/OutstandingBadge";
import {
  financeApi,
  formatCurrency,
  StudentFeeStatus,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SearchStudentsScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentFeeStatus[]>([]);
  const [allStudents, setAllStudents] = useState<StudentFeeStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 300);
    loadAllStudents();
  }, []);

  const loadAllStudents = async () => {
    try {
      const response = await financeApi.getStudentsWithPendingFees();
      if (response.success) {
        setAllStudents(response.data);
      }
    } catch (error) {
      console.error("Load students error:", error);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);

    if (text.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const searchLower = text.toLowerCase();
    const filtered = allStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchLower) ||
        s.phone?.includes(text) ||
        s.className?.toLowerCase().includes(searchLower),
    );

    setResults(filtered);
    setLoading(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleSelectStudent = (student: StudentFeeStatus) => {
    Keyboard.dismiss();
    router.push(`/(finance)/students/${student.id}`);
  };

  const renderStudent = ({ item }: { item: StudentFeeStatus }) => (
    <TouchableOpacity
      style={styles.studentItem}
      onPress={() => handleSelectStudent(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={22} color="#3b82f6" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.className}>
          {item.className || "بدون صنف"}
          {item.classSection ? ` - ${item.classSection}` : ""}
        </Text>
        {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
      </View>
      <View style={styles.balanceSection}>
        {item.totalPending > 0 ? (
          <View>
            <Text style={styles.balanceAmount}>
              {formatCurrency(item.totalPending)}
            </Text>
            <OutstandingBadge
              count={item.pendingFees?.length || 0}
              type="danger"
              showIcon={false}
            />
          </View>
        ) : (
          <OutstandingBadge type="success" label="پرداخت شده" />
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>جستجوی شاگرد</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="نام، تلفن یا صنف را جستجو کنید..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={handleSearch}
            textAlign="right"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        <Text style={styles.quickFilterTitle}>جستجوی سریع:</Text>
        <View style={styles.chipRow}>
          {["صنف ۸", "صنف ۱۰", "صنف ۱۲", "بدهکار", "معوق"].map((chip) => (
            <TouchableOpacity
              key={chip}
              style={styles.chip}
              onPress={() => handleSearch(chip)}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : hasSearched && results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="نتیجه‌ای یافت نشد"
          subtitle={`برای "${query}" نتیجه‌ای پیدا نشد`}
        />
      ) : hasSearched && results.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {results.length} شاگرد پیدا شد
          </Text>
          <FlatList
            data={results}
            renderItem={renderStudent}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      ) : (
        <View style={styles.initialState}>
          <View style={styles.searchIconLarge}>
            <Ionicons name="search" size={64} color="#cbd5e1" />
          </View>
          <Text style={styles.initialText}>
            نام، شماره تماس یا صنف شاگرد را جستجو کنید
          </Text>
          <Text style={styles.initialSubtext}>حداقل ۲ حرف وارد کنید</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 14,
    fontFamily: "Vazir",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quickFilters: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  quickFilterTitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
    fontFamily: "Vazir",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 4,
  },
  chipText: {
    fontSize: 13,
    color: "#475569",
    fontFamily: "Vazir",
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: "#64748b",
    padding: 16,
    paddingBottom: 8,
    fontFamily: "Vazir",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  className: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  phone: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  balanceSection: {
    alignItems: "flex-end",
    marginRight: 4,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ef4444",
    fontFamily: "VazirBold",
    marginBottom: 4,
  },
  initialState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  searchIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  initialText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
    fontFamily: "Vazir",
  },
  initialSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    fontFamily: "Vazir",
  },
});
