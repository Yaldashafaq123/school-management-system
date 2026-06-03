import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { classApi, ClassItem } from '@/src/config/classApi';
import { Colors } from '@/constants/Colors';

export default function MyClassesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await classApi.getMyClasses();
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const renderClassItem = ({ item }: { item: ClassItem }) => (
    <TouchableOpacity 
      style={styles.classCard}
      onPress={() => router.push({
        pathname: '/(teacher)/classes/[id]',
        params: { id: item.id }
      } as any)}
    >
      <View style={styles.classHeader}>
        <View style={[styles.subjectIcon, { backgroundColor: getSubjectColor(item.subject) }]}>
          <Text style={styles.subjectInitial}>{item.subject.charAt(0)}</Text>
        </View>
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.classGrade}>{item.grade}</Text>
          {item.section && (
            <Text style={styles.classSection}>بخش {item.section}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
      </View>
      
      <View style={styles.classFooter}>
        <View style={styles.statsContainer}>
          <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.statsText}>{item.students} دانش‌آموز</Text>
        </View>
        <View style={styles.statsContainer}>
          <Ionicons name="book-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.statsText}>{item.subject}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>هیچ کلاسی یافت نشد</Text>
      <Text style={styles.emptyText}>
        شما در حال حاضر در هیچ کلاسی تدریس نمی‌کنید یا به عنوان استاد راهنما نیستید.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>کلاس‌های من</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری کلاس‌ها...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>کلاس‌های من</Text>
        {classes.length > 0 && (
          <Text style={styles.subtitle}>مجموع: {classes.length} کلاس</Text>
        )}
      </View>

      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          classes.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    'ریاضی': '#4CAF50',
    'فیزیک': '#2196F3',
    'شیمی': '#FF9800',
    'زیست': '#9C27B0',
    'ادبیات': '#E91E63',
    'تاریخ': '#795548',
    'جغرافیا': '#009688',
    'دینی': '#673AB7',
    'عربی': '#FF5722',
    'زبان': '#3F51B5',
    'هنر': '#FFC107',
    'ورزش': '#CDDC39',
  };
  return colors[subject] || '#607D8B';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  classCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  subjectInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  classGrade: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  classSection: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
    textAlign: 'right',
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginRight: 6,
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'right',
  },
});