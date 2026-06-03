// app/(tabs)/grades/supervisor-evaluation.tsx
import { EmptyState } from "@/components/grades/EmptyState";
import { LoadingState } from "@/components/grades/LoadingState";
import { useAcademicYears, useClasses } from "@/hooks/useGrades";
import { gradesApi } from "@/src/config/gradesapi";
import { SupervisorEvaluation } from "@/types/grades.types";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SupervisorEvaluationScreen() {
  const [academicYearId, setAcademicYearId] = useState<number>();
  const [classId, setClassId] = useState<number>();
  const [evaluations, setEvaluations] = useState<SupervisorEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: academicYears } = useAcademicYears();
  const { data: classes } = useClasses(academicYearId);

  const loadEvaluations = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await gradesApi.getSupervisorEvaluations(classId);
      setEvaluations(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  };

  const updateEvaluation = (
    studentId: number,
    field: keyof SupervisorEvaluation,
    value: any,
  ) => {
    setEvaluations((prev) =>
      prev.map((e) =>
        e.studentId === studentId ? { ...e, [field]: value } : e,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await gradesApi.saveSupervisorEvaluations(evaluations);
      Alert.alert("Success", "Evaluations saved");
    } catch (error) {
      Alert.alert("Error", "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Text className="text-xl font-bold p-4 dark:text-white">
        Supervisor Evaluation
      </Text>

      <View className="px-4 space-y-3">
        <View className="bg-white dark:bg-gray-800 rounded-lg">
          <Picker
            selectedValue={academicYearId}
            onValueChange={(value) => {
              setAcademicYearId(value);
              setClassId(undefined);
            }}
          >
            <Picker.Item label="Select Academic Year" value={undefined} />
            {academicYears?.map((year) => (
              <Picker.Item key={year.id} label={year.name} value={year.id} />
            ))}
          </Picker>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-lg">
          <Picker selectedValue={classId} onValueChange={setClassId}>
            <Picker.Item label="Select Class" value={undefined} />
            {classes.map((cls) => (
              <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg"
          onPress={loadEvaluations}
          disabled={!classId}
        >
          <Text className="text-white text-center">Load Students</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingState />
      ) : evaluations.length > 0 ? (
        <>
          <ScrollView className="flex-1 p-4">
            {evaluations.map((evaluation, index) => (
              <View
                key={evaluation.studentId}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3"
              >
                <Text className="font-bold mb-3 dark:text-white">
                  {evaluation.studentName}
                </Text>

                <View className="flex-row gap-3 mb-2">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Behavior</Text>
                    <TextInput
                      className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center dark:text-white"
                      keyboardType="numeric"
                      value={evaluation.behaviorScore?.toString() || ""}
                      onChangeText={(text) =>
                        updateEvaluation(
                          evaluation.studentId,
                          "behaviorScore",
                          Number(text),
                        )
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Discipline
                    </Text>
                    <TextInput
                      className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center dark:text-white"
                      keyboardType="numeric"
                      value={evaluation.disciplineScore?.toString() || ""}
                      onChangeText={(text) =>
                        updateEvaluation(
                          evaluation.studentId,
                          "disciplineScore",
                          Number(text),
                        )
                      }
                    />
                  </View>
                </View>

                <View className="flex-row gap-3 mb-2">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Attendance
                    </Text>
                    <TextInput
                      className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center dark:text-white"
                      keyboardType="numeric"
                      value={evaluation.attendanceScore?.toString() || ""}
                      onChangeText={(text) =>
                        updateEvaluation(
                          evaluation.studentId,
                          "attendanceScore",
                          Number(text),
                        )
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Participation
                    </Text>
                    <TextInput
                      className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center dark:text-white"
                      keyboardType="numeric"
                      value={evaluation.participationScore?.toString() || ""}
                      onChangeText={(text) =>
                        updateEvaluation(
                          evaluation.studentId,
                          "participationScore",
                          Number(text),
                        )
                      }
                    />
                  </View>
                </View>

                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 p-2 rounded dark:text-white"
                  placeholder="Comments..."
                  value={evaluation.comments}
                  onChangeText={(text) =>
                    updateEvaluation(evaluation.studentId, "comments", text)
                  }
                  multiline
                />
              </View>
            ))}
          </ScrollView>

          <View className="p-4 border-t border-gray-200 dark:border-gray-700">
            <TouchableOpacity
              className="bg-green-500 p-4 rounded-lg"
              onPress={handleSave}
              disabled={saving}
            >
              <Text className="text-white text-center font-bold">
                {saving ? "Saving..." : "Save All Evaluations"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <EmptyState message="Select a class to load students" />
      )}
    </View>
  );
}
