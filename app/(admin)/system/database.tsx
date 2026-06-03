import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Database, Trash2, RefreshCw, BarChart3, Shield, AlertTriangle, CheckCircle } from 'lucide-react-native';

type OptimizationStatus = 'good' | 'needs_attention';
type CleanupStatus = 'pending' | 'running' | 'completed';
type RiskLevel = 'Low' | 'Medium' | 'High';

interface DatabaseStats {
  totalSize: string;
  tables: number;
  indexes: number;
  connections: number;
  cacheHitRate: string;
  fragmentation: string;
}

interface MaintenanceTask {
  id: number;
  name: string;
  description: string;
  duration: string;
  risk: RiskLevel;
}

export default function DatabaseManagement() {
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>('good');
  const [cleanupStatus, setCleanupStatus] = useState<CleanupStatus>('pending');

  const databaseStats: DatabaseStats = {
    totalSize: '4.2 GB',
    tables: 45,
    indexes: 120,
    connections: 25,
    cacheHitRate: '94%',
    fragmentation: '12%',
  };

  const maintenanceTasks: MaintenanceTask[] = [
    { id: 1, name: 'Optimize Tables', description: 'Defragment and optimize database tables', duration: '5-10 mins', risk: 'Low' },
    { id: 2, name: 'Clear Cache', description: 'Clear database query cache', duration: '1-2 mins', risk: 'Low' },
    { id: 3, name: 'Rebuild Indexes', description: 'Rebuild database indexes for performance', duration: '15-20 mins', risk: 'Medium' },
    { id: 4, name: 'Archive Old Data', description: 'Move old records to archive', duration: '10-15 mins', risk: 'Low' },
    { id: 5, name: 'Update Statistics', description: 'Update query optimizer statistics', duration: '2-5 mins', risk: 'Low' },
    { id: 6, name: 'Check Integrity', description: 'Verify database integrity', duration: '20-30 mins', risk: 'Medium' },
  ];

  const handleRunTask = (task: MaintenanceTask) => {
    Alert.alert(
      `Run ${task.name}`,
      `This will ${task.description.toLowerCase()}. Estimated duration: ${task.duration}. Risk level: ${task.risk}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Run Task', 
          style: 'default',
          onPress: () => {
            // Simulate task running
            setTimeout(() => {
              Alert.alert('Success', `${task.name} completed successfully`);
            }, 1000);
          }
        }
      ]
    );
  };

  const handleCleanup = () => {
    Alert.alert(
      'Cleanup Database',
      'This will remove temporary files, cache, and optimize storage. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Cleanup', 
          style: 'destructive',
          onPress: () => {
            setCleanupStatus('running');
            // Simulate cleanup process
            setTimeout(() => {
              setCleanupStatus('completed');
              Alert.alert('Success', 'Database cleanup completed successfully');
            }, 2000);
          }
        }
      ]
    );
  };

  const handleOptimize = () => {
    Alert.alert(
      'Optimize Database',
      'This will optimize database tables and indexes for better performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Optimize', 
          style: 'default',
          onPress: () => {
            setOptimizationStatus('good');
            Alert.alert('Success', 'Database optimization completed successfully');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Database Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Database size={24} color="#007AFF" />
            <Text style={styles.overviewTitle}>Database Overview</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: optimizationStatus === 'good' ? '#D4F7E2' : '#FFF3CD' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: optimizationStatus === 'good' ? '#34C759' : '#FF9500' }
              ]}>
                {optimizationStatus === 'good' ? 'Optimized' : 'Needs Attention'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Size</Text>
              <Text style={styles.statValue}>{databaseStats.totalSize}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tables</Text>
              <Text style={styles.statValue}>{databaseStats.tables}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Indexes</Text>
              <Text style={styles.statValue}>{databaseStats.indexes}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Connections</Text>
              <Text style={styles.statValue}>{databaseStats.connections}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cache Hit Rate</Text>
              <Text style={[styles.statValue, { color: '#34C759' }]}>{databaseStats.cacheHitRate}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Fragmentation</Text>
              <Text style={[styles.statValue, { color: parseInt(databaseStats.fragmentation) > 20 ? '#FF3B30' : '#34C759' }]}>
                {databaseStats.fragmentation}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCleanup}>
              <Trash2 size={24} color="#FF3B30" />
              <Text style={styles.actionText}>Cleanup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleOptimize}>
              <RefreshCw size={24} color="#007AFF" />
              <Text style={styles.actionText}>Optimize</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <BarChart3 size={24} color="#34C759" />
              <Text style={styles.actionText}>Analyze</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Shield size={24} color="#FF9500" />
              <Text style={styles.actionText}>Backup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cleanup Status */}
        {cleanupStatus !== 'pending' && (
          <View style={styles.cleanupContainer}>
            <View style={styles.cleanupHeader}>
              <RefreshCw size={20} color="#007AFF" />
              <Text style={styles.cleanupTitle}>
                {cleanupStatus === 'running' ? 'Cleanup in Progress' : 'Cleanup Completed'}
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: cleanupStatus === 'running' ? '60%' : '100%' }
                ]} 
              />
            </View>
            <Text style={styles.cleanupStatus}>
              {cleanupStatus === 'running' ? 'Processing...' : 'All tasks completed successfully'}
            </Text>
          </View>
        )}

        {/* Maintenance Tasks */}
        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>Maintenance Tasks</Text>
          
          {maintenanceTasks.map(task => (
            <TouchableOpacity 
              key={task.id} 
              style={styles.taskCard}
              onPress={() => handleRunTask(task)}
            >
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.name}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskDuration}>⏱️ {task.duration}</Text>
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: task.risk === 'Low' ? '#D4F7E2' : '#FFF3CD' }
                  ]}>
                    <Text style={[
                      styles.riskText,
                      { color: task.risk === 'Low' ? '#34C759' : '#FF9500' }
                    ]}>
                      Risk: {task.risk}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.runButton}
                onPress={() => handleRunTask(task)}
              >
                <Text style={styles.runButtonText}>Run</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Warnings & Recommendations */}
        <View style={styles.recommendationsContainer}>
          <View style={styles.recommendationsHeader}>
            <AlertTriangle size={20} color="#FF9500" />
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
          </View>
          
          <View style={styles.recommendationItem}>
            <CheckCircle size={16} color="#34C759" />
            <Text style={styles.recommendationText}>
              Schedule weekly database optimization
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <CheckCircle size={16} color="#34C759" />
            <Text style={styles.recommendationText}>
              Increase database cache size for better performance
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <CheckCircle size={16} color="#34C759" />
            <Text style={styles.recommendationText}>
              Archive data older than 3 years to free up space
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  overviewCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  actionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
    marginTop: 8,
  },
  cleanupContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  cleanupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cleanupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f2f2f7',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  cleanupStatus: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tasksContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskDuration: {
    fontSize: 12,
    color: '#8E8E93',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '500',
  },
  runButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  runButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 32,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#1d1d1f',
  },
});