// app/(tabs)/grades/assessments.tsx - Assessment Management (Admin)
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { AssessmentSelector } from '@/components/grades/AssessmentSelector';
import { LoadingState } from '@/components/grades/LoadingState';
import { EmptyState } from '@/components/grades/EmptyState';
import { useAcademicYears, useClasses, useSubjects, useExams } from '@/hooks/useGrades';
import { AssessmentFilters, Exam } from '@/types/grades.types';
import { gradesApi } from '@/src/config/gradesapi';

export default function AssessmentManagement() {
  const [filters, setFilters] = useState<AssessmentFilters>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    type: 'MONTHLY' as const,
    date: new Date().toISOString().split('T')[0],
    maxScore: 100,
  });

  const { data: academicYears } = useAcademicYears();
  const { data: classes } = useClasses(filters.academicYearId);
  const { data: subjects } = useSubjects(filters.classId);
  const { data: exams, loading, refetch } = useExams(filters);

  const handleCreate = async () => {
    if (!filters.classId || !filters.subjectId) {
      Alert.alert('Error', 'Please select class and subject');
      return;
    }

    try {
      await gradesApi.createExam({
        ...newExam,
        classId: filters.classId,
        subjectId: filters.subjectId,
      });
      setShowCreate(false);
      refetch();
      Alert.alert('Success', 'Assessment created');
    } catch (error) {
      Alert.alert('Error', 'Failed to create assessment');
    }
  };

  const handlePublish = async (examId: number) => {
    try {
      await gradesApi.publishExam(examId);
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to publish');
    }
  };

  const handleLock = async (examId: number) => {
    try {
      await gradesApi.lockExam(examId);
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to lock');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700';
      case 'LOCKED': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-xl font-bold dark:text-white">Assessments</Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={() => setShowCreate(true)}
        >
          <Text className="text-white">+ New</Text>
        </TouchableOpacity>
      </View>

      <AssessmentSelector
        filters={filters}
        academicYears={academicYears || []}
        classes={classes}
        subjects={subjects}
        onChange={setFilters}
      />

      {loading ? (
        <LoadingState />
      ) : exams && exams.length > 0 ? (
        <ScrollView className="px-4">
          {exams.map(exam => (
            <View key={exam.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-bold dark:text-white">{exam.name}</Text>
                  <Text className="text-gray-500">{exam.type} | Max: {exam.maxScore}</Text>
                  <Text className="text-gray-500">{new Date(exam.date).toLocaleDateString()}</Text>
                </View>
                <View className={`px-2 py-1 rounded ${getStatusColor(exam.status)}`}>
                  <Text className="text-xs">{exam.status}</Text>
                </View>
              </View>
              
              <View className="flex-row gap-2 mt-3">
                {exam.status === 'DRAFT' && (
                  <TouchableOpacity
                    className="bg-green-500 px-3 py-1 rounded"
                    onPress={() => handlePublish(exam.id)}
                  >
                    <Text className="text-white text-sm">Publish</Text>
                  </TouchableOpacity>
                )}
                {exam.status === 'PUBLISHED' && (
                  <TouchableOpacity
                    className="bg-red-500 px-3 py-1 rounded"
                    onPress={() => handleLock(exam.id)}
                  >
                    <Text className="text-white text-sm">Lock</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState message="No assessments found" />
      )}

      {/* Create Assessment Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <Text className="text-xl font-bold mb-4 dark:text-white">New Assessment</Text>
            
            <TextInput
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 dark:text-white"
              placeholder="Assessment Name"
              value={newExam.name}
              onChangeText={(text) => setNewExam({ ...newExam, name: text })}
            />
            
            <TextInput
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 dark:text-white"
              placeholder="Date (YYYY-MM-DD)"
              value={newExam.date}
              onChangeText={(text) => setNewExam({ ...newExam, date: text })}
            />
            
            <TextInput
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 dark:text-white"
              placeholder="Max Score"
              keyboardType="numeric"
              value={String(newExam.maxScore)}
              onChangeText={(text) => setNewExam({ ...newExam, maxScore: Number(text) || 0 })}
            />

            <View className="flex-row justify-end gap-3 mt-4">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg"
                onPress={() => setShowCreate(false)}
              >
                <Text className="text-gray-600 dark:text-gray-400">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={handleCreate}
              >
                <Text className="text-white">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}