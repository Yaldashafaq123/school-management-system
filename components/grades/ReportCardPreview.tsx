// components/grades/ReportCardPreview.tsx
import { View, Text, ScrollView } from 'react-native';
import { StudentResult } from '@/types/grades.types';

interface Props {
  studentResult: StudentResult;
  schoolName?: string;
  academicYear?: string;
  teacherComments?: string;
  supervisorComments?: string;
}

export function ReportCardPreview({ 
  studentResult, 
  schoolName = 'School Name', 
  academicYear = '2025-2026',
  teacherComments = '',
  supervisorComments = ''
}: Props) {
  return (
    <ScrollView className="bg-white dark:bg-gray-900 p-6">
      {/* School Header */}
      <View className="items-center mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
        <Text className="text-2xl font-bold dark:text-white">{schoolName}</Text>
        <Text className="text-gray-600 dark:text-gray-400 mt-1">Report Card</Text>
        <Text className="text-gray-500 dark:text-gray-500 mt-1">Academic Year: {academicYear}</Text>
      </View>

      {/* Student Information */}
      <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 dark:text-gray-400">Student Name:</Text>
          <Text className="font-bold dark:text-white">{studentResult.student.fullName}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 dark:text-gray-400">Student ID:</Text>
          <Text className="font-bold dark:text-white">{studentResult.student.studentId || 'N/A'}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-400">Class:</Text>
          <Text className="font-bold dark:text-white">{studentResult.student.classId}</Text>
        </View>
      </View>

      {/* Subject Results Table */}
      <View className="mb-6">
        <Text className="text-lg font-bold mb-3 dark:text-white">Subject Results</Text>
        <View className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <View className="flex-row bg-gray-100 dark:bg-gray-800 p-3">
            <Text className="flex-1 font-bold dark:text-white">Subject</Text>
            <Text className="w-20 text-center font-bold dark:text-white">Score</Text>
            <Text className="w-20 text-center font-bold dark:text-white">Grade</Text>
          </View>
          {studentResult.grades.map((grade, index) => (
            <View key={index} className="flex-row p-3 border-t border-gray-200 dark:border-gray-700">
              <Text className="flex-1 dark:text-white">{grade.subject}</Text>
              <Text className="w-20 text-center dark:text-white">{grade.marks}</Text>
              <Text className="w-20 text-center dark:text-white">-</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Result Summary */}
      <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 dark:text-gray-400">Total Marks:</Text>
          <Text className="font-bold dark:text-white">{studentResult.totalMarks}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 dark:text-gray-400">Percentage:</Text>
          <Text className="font-bold dark:text-white">{studentResult.percentage}%</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 dark:text-gray-400">Grade:</Text>
          <Text className="font-bold dark:text-white">{studentResult.grade}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 dark:text-gray-400">Rank:</Text>
          <Text className="font-bold dark:text-white">#{studentResult.rank}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-400">Status:</Text>
          <View className={`px-3 py-1 rounded ${
            studentResult.status === 'PASSED' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
          }`}>
            <Text className={`font-bold ${
              studentResult.status === 'PASSED' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {studentResult.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Comments Section */}
      {teacherComments ? (
        <View className="mb-4">
          <Text className="font-bold mb-2 dark:text-white">Teacher Comments:</Text>
          <Text className="text-gray-600 dark:text-gray-400">{teacherComments}</Text>
        </View>
      ) : null}

      {supervisorComments ? (
        <View className="mb-4">
          <Text className="font-bold mb-2 dark:text-white">Supervisor Comments:</Text>
          <Text className="text-gray-600 dark:text-gray-400">{supervisorComments}</Text>
        </View>
      ) : null}

      {/* Signatures Area */}
      <View className="flex-row justify-between mt-8 pt-4 border-t border-gray-300 dark:border-gray-700">
        <View className="items-center">
          <View className="w-32 h-0.5 bg-gray-300 dark:bg-gray-600 mb-2" />
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Class Teacher</Text>
        </View>
        <View className="items-center">
          <View className="w-32 h-0.5 bg-gray-300 dark:bg-gray-600 mb-2" />
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Principal</Text>
        </View>
      </View>
    </ScrollView>
  );
}