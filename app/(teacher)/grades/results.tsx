// app/(tabs)/grades/results.tsx - Results List
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { AssessmentSelector } from '@/components/grades/AssessmentSelector';
import { StatisticsCard } from '@/components/grades/StatisticsCard';
import { LoadingState } from '@/components/grades/LoadingState';
import { EmptyState } from '@/components/grades/EmptyState';
import { useAcademicYears, useClasses, useSubjects, useClassResults } from '@/hooks/useGrades';
import { AssessmentFilters } from '@/types/grades.types';

export default function ResultsList() {
  const [filters, setFilters] = useState<AssessmentFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data: academicYears } = useAcademicYears();
  const { data: classes } = useClasses(filters.academicYearId);
  const { data: subjects } = useSubjects(filters.classId);
  const { summary, students, loading } = useClassResults(filters.classId, filters.assessmentType);

  const filteredStudents = students.filter(s =>
    searchQuery ? s.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Text className="text-xl font-bold p-4 dark:text-white">Results</Text>
      
      <AssessmentSelector
        filters={filters}
        academicYears={academicYears || []}
        classes={classes}
        subjects={subjects}
        onChange={setFilters}
      />

      {loading ? (
        <LoadingState />
      ) : !filters.classId ? (
        <EmptyState message="Select a class to view results" icon="🔍" />
      ) : summary ? (
        <ScrollView>
          <View className="flex-row flex-wrap gap-3 p-4">
            <StatisticsCard title="Average" value={summary.averageScore.toFixed(1)} color="#3B82F6" />
            <StatisticsCard title="Highest" value={summary.highestScore} color="#10B981" />
            <StatisticsCard title="Lowest" value={summary.lowestScore} color="#EF4444" />
            <StatisticsCard title="Pass Rate" value={`${summary.passRate}%`} color="#8B5CF6" />
          </View>

          <View className="px-4 mb-3">
            <TextInput
              className="bg-white dark:bg-gray-800 p-3 rounded-lg dark:text-white"
              placeholder="Search students..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {filteredStudents.map((result, index) => (
            <TouchableOpacity
              key={result.student.id}
              className="bg-white dark:bg-gray-800 mx-4 mb-2 p-4 rounded-lg"
              onPress={() => router.push(`/grades/student-result?id=${result.student.id}`)}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-medium dark:text-white">{result.student.fullName}</Text>
                  <Text className="text-gray-500">Rank: {result.rank}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold dark:text-white">{result.percentage}%</Text>
                  <View className={`px-2 py-1 rounded ${result.status === 'PASSED' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Text className={`text-xs ${result.status === 'PASSED' ? 'text-green-700' : 'text-red-700'}`}>
                      {result.status}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredStudents.length === 0 && <EmptyState message="No students found" />}
        </ScrollView>
      ) : null}
    </View>
  );
}