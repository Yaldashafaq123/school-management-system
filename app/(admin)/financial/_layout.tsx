// app/(admin)/financial/_layout.tsx
import { Stack } from "expo-router";

export default function FinancialLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#f1f5f9",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "مدیریت مالی",
        }}
      />
      <Stack.Screen
        name="fees/index"
        options={{
          title: "فیس شاگردان",
        }}
      />
      <Stack.Screen
        name="fees/[id]"
        options={{
          title: "جزئیات فیس",
        }}
      />
      <Stack.Screen
        name="fees/create"
        options={{
          title: "ایجاد فیس جدید",
        }}
      />
      <Stack.Screen
        name="fees/templates/index"
        options={{
          title: "قالب‌های فیس",
        }}
      />
      <Stack.Screen
        name="fees/templates/create"
        options={{
          title: "قالب جدید",
        }}
      />
      <Stack.Screen
        name="fees/templates/[id]"
        options={{
          title: "جزئیات قالب",
        }}
      />
      <Stack.Screen
        name="payments/index"
        options={{
          title: "پرداخت‌ها",
        }}
      />
      <Stack.Screen
        name="payments/record"
        options={{
          title: "ثبت پرداخت",
        }}
      />
      <Stack.Screen
        name="payments/[id]"
        options={{
          title: "رسید پرداخت",
        }}
      />
      <Stack.Screen
        name="payments/bulk/index"
        options={{
          title: "پرداخت جمعی",
        }}
      />
      <Stack.Screen
        name="payments/bulk/[classId]"
        options={{
          title: "پرداخت صنف",
        }}
      />
      <Stack.Screen
        name="students/index"
        options={{
          title: "شاگردان بدهکار",
        }}
      />
      <Stack.Screen
        name="students/[id]"
        options={{
          title: "پروفایل مالی",
        }}
      />
      <Stack.Screen
        name="students/search"
        options={{
          title: "جستجوی شاگرد",
        }}
      />
      <Stack.Screen
        name="reports/index"
        options={{
          title: "راپورها",
        }}
      />
      <Stack.Screen
        name="reports/daily"
        options={{
          title: "راپور روزانه",
        }}
      />
      <Stack.Screen
        name="reports/monthly"
        options={{
          title: "راپور ماهانه",
        }}
      />
      <Stack.Screen
        name="reports/outstanding"
        options={{
          title: "بدهکارها",
        }}
      />
      <Stack.Screen
        name="reports/class-wise"
        options={{
          title: "راپور صنف‌ها",
        }}
      />
      <Stack.Screen
        name="reports/income-statement"
        options={{
          title: "صورت عایدات",
        }}
      />
      <Stack.Screen
        name="expenses/index"
        options={{
          title: "مصارف",
        }}
      />
      <Stack.Screen
        name="expenses/create"
        options={{
          title: "ثبت مصرف",
        }}
      />
      <Stack.Screen
        name="expenses/[id]"
        options={{
          title: "جزئیات مصرف",
        }}
      />
      <Stack.Screen
        name="expenses/categories"
        options={{
          title: "دسته‌بندی مصارف",
        }}
      />
      <Stack.Screen
        name="salaries/index"
        options={{
          title: "معاشات",
        }}
      />
      <Stack.Screen
        name="salaries/generate"
        options={{
          title: "تولید معاشات",
        }}
      />
      <Stack.Screen
        name="salaries/[id]"
        options={{
          title: "جزئیات معاش",
        }}
      />
      <Stack.Screen
        name="salaries/payment"
        options={{
          title: "پرداخت معاش",
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          title: "تنظیمات مالی",
        }}
      />
      <Stack.Screen
        name="settings/academic-years"
        options={{
          title: "سال‌های تعلیمی",
        }}
      />
      <Stack.Screen
        name="settings/fee-categories"
        options={{
          title: "دسته‌بندی فیس",
        }}
      />
    </Stack>
  );
}
