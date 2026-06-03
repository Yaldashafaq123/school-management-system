// app/categories.tsx
import { ClassCategoryCard } from '@/components/ClassCategoryCard';
import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { classCategories } from '@/constants/mockData';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="دسته‌بندی کلاس‌ها"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content}>
        <View style={styles.categoriesGrid}>
          {classCategories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <ClassCategoryCard
                category={category}
                onPress={() => router.push(`/courses?class=${category.id}`)}
              />
            </View>
          ))}
        </View>
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    marginBottom: 16,
  },
});