import { View, Text, StyleSheet } from 'react-native';

interface ExamStatsProps {
  stats: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
  };
}

export function ExamStats({ stats }: ExamStatsProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Exams</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: '#007AFF' }]}>{stats.upcoming}</Text>
        <Text style={styles.statLabel}>Upcoming</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: '#FF9500' }]}>{stats.ongoing}</Text>
        <Text style={styles.statLabel}>Ongoing</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: '#34C759' }]}>{stats.completed}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
});