// components/grades/AssessmentSelector.tsx
import {
    AcademicYear,
    AssessmentFilters,
    Class,
    Subject,
} from "@/types/grades.types";
import { Picker } from "@react-native-picker/picker";
import { Text, View } from "react-native";

interface Props {
  filters: AssessmentFilters;
  academicYears: AcademicYear[];
  classes: Class[];
  subjects: Subject[];
  onChange: (filters: AssessmentFilters) => void;
}

export function AssessmentSelector({
  filters,
  academicYears,
  classes,
  subjects,
  onChange,
}: Props) {
  return (
    <View className="p-4 space-y-4">
      <View>
        <Text className="mb-2 text-gray-600 dark:text-gray-400">
          Academic Year
        </Text>
        <View className="bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Picker
            selectedValue={filters.academicYearId}
            onValueChange={(value) =>
              onChange({
                ...filters,
                academicYearId: value,
                classId: undefined,
                subjectId: undefined,
              })
            }
          >
            <Picker.Item label="Select Year" value={undefined} />
            {academicYears.map((year) => (
              <Picker.Item key={year.id} label={year.name} value={year.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-gray-600 dark:text-gray-400">Class</Text>
        <View className="bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Picker
            selectedValue={filters.classId}
            onValueChange={(value) =>
              onChange({ ...filters, classId: value, subjectId: undefined })
            }
          >
            <Picker.Item label="Select Class" value={undefined} />
            {classes.map((cls) => (
              <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-gray-600 dark:text-gray-400">Subject</Text>
        <View className="bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Picker
            selectedValue={filters.subjectId}
            onValueChange={(value) =>
              onChange({ ...filters, subjectId: value })
            }
          >
            <Picker.Item label="Select Subject" value={undefined} />
            {subjects.map((subject) => (
              <Picker.Item
                key={subject.id}
                label={subject.name}
                value={subject.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-gray-600 dark:text-gray-400">
          Assessment Type
        </Text>
        <View className="bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Picker
            selectedValue={filters.assessmentType}
            onValueChange={(value) =>
              onChange({ ...filters, assessmentType: value })
            }
          >
            <Picker.Item label="All Types" value={undefined} />
            <Picker.Item label="Monthly" value="MONTHLY" />
            <Picker.Item label="Half Yearly" value="HALF_YEARLY" />
            <Picker.Item label="Final" value="FINAL" />
          </Picker>
        </View>
      </View>
    </View>
  );
}
