// app/teacher/stats.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { TeacherStats } from '../../components/teacher/TeacherStats';
import { useRouter } from 'expo-router';

export default function TeacherStatsScreen() {
  const router = useRouter();

  const handleViewDetails = (statType: string) => {
    // Navigate to detailed stats based on type
    router.push(`/(teacher)/analytics?type=${statType}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top']}>
      <Header 
        title="آمار و تحلیل" 
        showBack 
        onBackPress={() => router.back()}
      />
      <TeacherStats onViewDetails={handleViewDetails} />
    </SafeAreaView>
  );
}