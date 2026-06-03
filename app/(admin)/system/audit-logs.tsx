import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Download, User, Clock, Shield, AlertCircle, CheckCircle } from 'lucide-react-native';

// Define TypeScript interfaces
interface LogItem {
  id: number;
  user: string;
  action: string;
  type: 'login' | 'security' | 'data' | 'system';
  status: 'success' | 'failed';
  ip: string;
  timestamp: string;
}

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'login', label: 'Login' },
    { id: 'security', label: 'Security' },
    { id: 'data', label: 'Data Changes' },
    { id: 'system', label: 'System' },
  ];

  const logs: LogItem[] = [
    { id: 1, user: 'admin@school.com', action: 'User logged in', type: 'login', status: 'success', ip: '192.168.1.1', timestamp: '2024-01-20 14:30:25' },
    { id: 2, user: 'teacher.smith@school.com', action: 'Updated student grade', type: 'data', status: 'success', ip: '192.168.1.45', timestamp: '2024-01-20 14:25:10' },
    { id: 3, user: 'unknown', action: 'Failed login attempt', type: 'security', status: 'failed', ip: '103.25.67.89', timestamp: '2024-01-20 14:20:15' },
    { id: 4, user: 'system', action: 'Database backup completed', type: 'system', status: 'success', ip: 'localhost', timestamp: '2024-01-20 02:00:00' },
    { id: 5, user: 'parent.johnson@school.com', action: 'Viewed attendance report', type: 'data', status: 'success', ip: '192.168.1.78', timestamp: '2024-01-20 13:45:30' },
    { id: 6, user: 'admin@school.com', action: 'Changed user permissions', type: 'security', status: 'success', ip: '192.168.1.1', timestamp: '2024-01-20 13:30:20' },
  ];

  const getActionIcon = (type: LogItem['type']) => {
    switch (type) {
      case 'login': return User;
      case 'security': return Shield;
      case 'system': return AlertCircle;
      default: return CheckCircle;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Search and Filters */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search logs by user or action..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filterContainer}>
            {filters.map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#34C759' }]}>
              {logs.filter(l => l.status === 'success').length}
            </Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF3B30' }]}>
              {logs.filter(l => l.status === 'failed').length}
            </Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF9500' }]}>
              {logs.filter(l => l.type === 'security').length}
            </Text>
            <Text style={styles.statLabel}>Security Events</Text>
          </View>
        </View>

        {/* Logs List */}
        <View style={styles.logsContainer}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>Recent Activity Logs</Text>
            <TouchableOpacity style={styles.exportButton}>
              <Download size={16} color="#007AFF" />
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity>
          </View>
          
          {logs.map(log => {
            const ActionIcon = getActionIcon(log.type);
            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logUser}>
                    <ActionIcon size={16} color="#8E8E93" />
                    <Text style={styles.logUserName}>{log.user}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: log.status === 'success' ? '#D4F7E2' : '#FFE5E5' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: log.status === 'success' ? '#34C759' : '#FF3B30' }
                    ]}>
                      {log.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.logAction}>{log.action}</Text>
                
                <View style={styles.logFooter}>
                  <View style={styles.logMeta}>
                    <Clock size={12} color="#8E8E93" />
                    <Text style={styles.logTime}>{log.timestamp}</Text>
                  </View>
                  <Text style={styles.logIp}>IP: {log.ip}</Text>
                </View>
              </View>
            );
          })}
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1d1d1f',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  logsContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 32,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    gap: 6,
  },
  exportText: {
    fontSize: 14,
    color: '#007AFF',
  },
  logCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  logAction: {
    fontSize: 16,
    color: '#1d1d1f',
    marginBottom: 12,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  logIp: {
    fontSize: 12,
    color: '#8E8E93',
  },
});