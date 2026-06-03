import { Stack } from 'expo-router';

export default function AcademicLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'مدیریت امور آموزشی',
          headerBackTitle: 'بازگشت',
        }}
      />

      <Stack.Screen
        name="years-setup"
        options={{
          title: 'تنظیم سال تحصیلی',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="classes-sections"
        options={{
          title: 'صنف‌ها و بخش‌ها',
        }}
      />

      <Stack.Screen
        name="subjects"
        options={{
          title: 'مدیریت مضامین',
        }}
      />

      <Stack.Screen
        name="timetable"
        options={{
          title: 'ایجاد تقسیم اوقات',
        }}
      />

      <Stack.Screen
        name="exams"
        options={{
          title: 'مدیریت امتحانات',
        }}
      />

      <Stack.Screen
        name="grading-system"
        options={{
          title: 'سیستم نمره‌دهی',
        }}
      />
    </Stack>
  );
}
