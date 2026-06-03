// app/(tabs)/grades/enter-grades.tsx - Bulk Grade Entry
import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AssessmentSelector } from '@/components/grades/AssessmentSelector';
import { GradeTable } from '@/components/grades/GradeTable';
import { LoadingState } from '@/components/grades/LoadingState';
import { EmptyState } from '@/components/grades/EmptyState';
import { useAcademicYears, useClasses, useSubjects, useExams, useGrades } from '@/hooks/useGrades';
import { AssessmentFilters, GradeEntry } from '@/types/grades.types';
import { useLocalSearchParams } from 'expo-router';

export default function EnterGrades() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  
  const [filters, setFilters] = useState<AssessmentFilters>({
    assessmentType: type as AssessmentFilters['assessmentType'],
  });
  
  const [selectedExamId, setSelectedExamId] = useState<number>();
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const { data: academicYears } = useAcademicYears();
  const { data: classes } = useClasses(filters.academicYearId);
  const { data: subjects } = useSubjects(filters.classId);
  const { data: exams, loading: examsLoading } = useExams(filters);
  const { data: gradeEntries, loading: gradesLoading, saving, save } = useGrades(selectedExamId);

  useEffect(() => {
    if (gradeEntries) {
      setGrades(gradeEntries);
    }
  }, [gradeEntries]);

  const handleGradeChange = (studentId: number, score: number | null) => {
    setGrades(prev => prev.map(g => 
      g.studentId === studentId ? { ...g, score, status: score !== null ? 'completed' : 'pending' } : g
    ));
    setHasChanges(true);
  };

  const handleSaveDraft = async () => {
    try {
      await save(grades);
      setHasChanges(false);
      Alert.alert('Success', 'Draft saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save draft');
    }
  };

  const handleSaveAll = async () => {
    const missing = grades.filter(g => g.score === null);
    if (missing.length > 0) {
      Alert.alert(
        'Missing Grades',
        `${missing.length} students don't have grades. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: async () => {
            await save(grades);
            setHasChanges(false);
          }},
        ]
      );
      return;
    }
    await handleSaveDraft();
  };

  // Ask before leaving if there are unsaved changes
  useEffect(() => {
    const unsubscribe = () => {
      if (hasChanges) {
        Alert.alert('Unsaved Changes', 'You have unsaved changes. Do you want to leave?');
      }
    };
    return unsubscribe;
  }, [hasChanges]);

  const filteredGrades = grades.filter(g => 
    searchQuery ? g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  if (!selectedExamId) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <Text className="text-xl font-bold p-4 dark:text-white">Enter Grades</Text>
        <AssessmentSelector
          filters={filters}
          academicYears={academicYears || []}
          classes={classes}
          subjects={subjects}
          onChange={setFilters}
        />
        
        {examsLoading ? (
          <LoadingState />
        ) : exams && exams.length > 0 ? (
          <View className="p-4">
            <Text className="text-lg font-semibold mb-3 dark:text-white">Select Assessment</Text>
            {exams.map(exam => (
              <TouchableOpacity
                key={exam.id}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-2"
                onPress={() => setSelectedExamId(exam.id)}
              >
                <Text className="font-medium dark:text-white">{exam.name}</Text>
                <Text className="text-gray-500 text-sm">{exam.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState message="No exams found" icon="📝" />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => setSelectedExamId(undefined)}>
          <Text className="text-blue-500">← Back</Text>
        </TouchableOpacity>
        <Text className="font-bold dark:text-white">Grade Entry</Text>
        <TouchableOpacity onPress={handleSaveDraft} disabled={saving}>
          <Text className="text-blue-500">{saving ? 'Saving...' : 'Save Draft'}</Text>
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <TextInput
          className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg dark:text-white"
          placeholder="Search students..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {gradesLoading ? (
        <LoadingState />
      ) : filteredGrades.length > 0 ? (
        <GradeTable
          entries={filteredGrades}
          onGradeChange={handleGradeChange}
          onRemarks={(studentId) => {
            Alert.alert('Remarks', 'Remarks feature coming soon');
          }}
        />
      ) : (
        <EmptyState message="No students found" />
      )}

      <View className="p-4 border-t border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          className={`py-4 rounded-lg ${hasChanges ? 'bg-green-500' : 'bg-gray-400'}`}
          onPress={handleSaveAll}
          disabled={!hasChanges || saving}
        >
          <Text className="text-white text-center font-bold">
            {saving ? 'Saving...' : 'Save All Grades'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}