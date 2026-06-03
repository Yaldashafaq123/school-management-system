
// components/admin/RevenueChart.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { RevenueData } from '@/types';

interface RevenueChartProps {
  data: RevenueData[];
  onTimeRangeChange?: (range: string) => void;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  onTimeRangeChange,
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const timeRanges = [
    { id: 'week', label: 'هفته', icon: 'calendar' },
    { id: 'month', label: 'ماه', icon: 'calendar' },
    { id: 'year', label: 'سال', icon: 'calendar' },
  ];

  const chartData = {
    labels: data.map(d => d.date.split('-')[2]), // Day numbers
    datasets: [
      {
        data: data.map(d => d.amount / 1000), // Convert to thousands
        color: (opacity = 1) => Colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: Colors.primary,
    },
  };

  const totalRevenue = data.reduce((sum, d) => sum + d.amount, 0);
  const totalCourses = data.reduce((sum, d) => sum + d.courses, 0);
  const totalSubscriptions = data.reduce((sum, d) => sum + d.subscriptions, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>درآمد و فروش</Text>
        <View style={styles.timeRangeSelector}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.timeRangeButton,
                timeRange === range.id && styles.timeRangeButtonActive,
              ]}
              onPress={() => {
                setTimeRange(range.id as any);
                onTimeRangeChange?.(range.id);
              }}
            >
              <Ionicons
                name={range.icon as any}
                size={14}
                color={timeRange === range.id ? '#fff' : Colors.text}
              />
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range.id && styles.timeRangeTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalRevenue.toLocaleString()} تومان</Text>
          <Text style={styles.statLabel}>درآمد کل</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalCourses}</Text>
          <Text style={styles.statLabel}>فروش دوره</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalSubscriptions}</Text>
          <Text style={styles.statLabel}>اشتراک</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={true}
          yAxisLabel=""
          yAxisSuffix="k"
          segments={4}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>درآمد روزانه (هزار تومان)</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 2,
  },
  timeRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeRangeText: {
    fontSize: 12,
    color: Colors.text,
  },
  timeRangeTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
