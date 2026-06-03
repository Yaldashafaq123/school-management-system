import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data - In real app, this would come from your SQL database
const mockSupervisedStudents = [
  {
    id: 1,
    name: 'علی رضایی',
    grade: 'هفتم',
    courses: ['ریاضی هفتم', 'علوم تجربی'],
    access: {
      can_access_courses: true,
      can_submit_assignments: true,
      can_access_forum: false,
      can_view_grades: true,
    },
  },
  {
    id: 2,
    name: 'سارا محمدی',
    grade: 'هشتم',
    courses: ['ریاضی هشتم'],
    access: {
      can_access_courses: true,
      can_submit_assignments: false,
      can_access_forum: true,
      can_view_grades: true,
    },
  },
];

export default function TeacherStudentAccess() {
  const router = useRouter();
  const [students, setStudents] = useState(mockSupervisedStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<'teacher' | 'admin'>('teacher');

  useEffect(() => {
    // In real app, get user role from auth context
    setUserRole('teacher');
  }, []);

  const handleToggleAccess = (studentId: number, accessKey: string) => {
    setStudents(students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          access: {
            ...student.access,
            [accessKey]: !student.access[accessKey as keyof typeof student.access],
          },
        };
      }
      return student;
    }));
  };

  const handleSaveChanges = () => {
    Alert.alert(
      'ذخیره تغییرات',
      'آیا از ذخیره تغییرات دسترسی‌ها اطمینان دارید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'ذخیره',
          onPress: () => {
            // In real app, send to API
            Alert.alert('موفقیت', 'تغییرات دسترسی‌ها ذخیره شد.');
          },
        },
      ]
    );
  };

  const handleViewProfile = (studentId: number) => {
    router.push({
      pathname: './(teacher)/student/[id]',
      params: { id: studentId.toString() }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="مدیریت دسترسی دانش‌آموزان" />

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            شما فقط می‌توانید دسترسی دانش‌آموزان تحت نظارت خود را مدیریت کنید.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی دانش‌آموز..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Students List */}
        {students.map(student => (
          <View key={student.id} style={styles.studentCard}>
            <TouchableOpacity
              style={styles.studentInfo}
              onPress={() => handleViewProfile(student.id)}
            >
              <View style={styles.studentHeader}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentGrade}>پایه {student.grade}</Text>
              </View>
              
              <View style={styles.coursesList}>
                {student.courses.map((course, index) => (
                  <View key={index} style={styles.courseTag}>
                    <Text style={styles.courseTagText}>{course}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            <View style={styles.accessControls}>
              <View style={styles.accessItem}>
                <Text style={styles.accessLabel}>دسترسی به دوره‌ها</Text>
                <Switch
                  value={student.access.can_access_courses}
                  onValueChange={() => handleToggleAccess(student.id, 'can_access_courses')}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                />
              </View>
              
              <View style={styles.accessItem}>
                <Text style={styles.accessLabel}>ارسال تکالیف</Text>
                <Switch
                  value={student.access.can_submit_assignments}
                  onValueChange={() => handleToggleAccess(student.id, 'can_submit_assignments')}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                />
              </View>
              
              <View style={styles.accessItem}>
                <Text style={styles.accessLabel}>دسترسی به انجمن</Text>
                <Switch
                  value={student.access.can_access_forum}
                  onValueChange={() => handleToggleAccess(student.id, 'can_access_forum')}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                />
              </View>
              
              <View style={styles.accessItem}>
                <Text style={styles.accessLabel}>مشاهده نمرات</Text>
                <Switch
                  value={student.access.can_view_grades}
                  onValueChange={() => handleToggleAccess(student.id, 'can_view_grades')}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>ذخیره همه تغییرات</Text>
        </TouchableOpacity>

        {/* Spacing */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'right',
  },
  studentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentInfo: {
    marginBottom: 16,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  studentGrade: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coursesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  courseTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseTagText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  accessControls: {
    gap: 12,
  },
  accessItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  accessLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 80,
  },
});