// components/ProgressChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { ProgressAnalytics, WeeklyProgress } from '../types';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;

interface ProgressChartProps {
  analytics: ProgressAnalytics;
  type?: 'line' | 'bar' | 'pie';
  height?: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  analytics,
  type = 'line',
  height = 220,
}) => {
  const chartConfig = {
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
  };

  const prepareLineChartData = () => {
    const labels = analytics.weekly_progress.map(wp => 
      wp.week.split('-')[1] // Show only week number
    );
    const data = analytics.weekly_progress.map(wp => wp.lessons_completed);

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const prepareBarChartData = () => {
    const labels = analytics.weekly_progress.map(wp => wp.week.split('-')[1]);
    const data = analytics.weekly_progress.map(wp => wp.time_spent / 60); // Convert to hours

    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    };
  };

  const preparePieChartData = () => {
    const completed = analytics.completed_lessons;
    const remaining = analytics.total_lessons - completed;

    return [
      {
        name: 'تکمیل شده',
        population: completed,
        color: Colors.success,
        legendFontColor: Colors.text,
        legendFontSize: 12,
      },
      {
        name: 'مانده',
        population: remaining,
        color: Colors.textSecondary,
        legendFontColor: Colors.text,
        legendFontSize: 12,
      },
    ];
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={prepareLineChartData()}
            width={CHART_WIDTH}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLines={false}
            withHorizontalLines={false}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
            fromZero
          />
        );
      case 'bar':
        return (
          <BarChart
            data={prepareBarChartData()}
            width={CHART_WIDTH}
            height={height}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
          />
        );
      case 'pie':
        return (
          <PieChart
            data={preparePieChartData()}
            width={CHART_WIDTH}
            height={height}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        );
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'line': return 'پیشرفت هفتگی (تعداد درس)';
      case 'bar': return 'زمان مطالعه هفتگی (ساعت)';
      case 'pie': return 'وضعیت تکمیل دوره';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getTitle()}</Text>
      {renderChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  chart: {
    borderRadius: 8,
    alignSelf: 'center',
  },
});