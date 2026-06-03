import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Database, Download, Upload, Clock, CheckCircle, AlertTriangle, HardDrive } from 'lucide-react-native';

export default function BackupRestore() {
  const [backups] = useState([
    { id: 1, name: 'Full Backup Jan 20', size: '2.4 GB', date: '2024-01-20 02:00', type: 'Automatic' },
    { id: 2, name: 'Database Only', size: '1.1 GB', date: '2024-01-19 14:30', type: 'Manual' },
    { id: 3, name: 'Full Backup Jan 18', size: '2.3 GB', date: '2024-01-18 02:00', type: 'Automatic' },
    { id: 4, name: 'Media Files', size: '850 MB', date: '2024-01-17 10:15', type: 'Manual' },
  ]);

  const storageStats = {
    total: 50,
    used: 28.5,
    available: 21.5,
    backupCount: 12,
    lastBackup: '2024-01-20 02:00',
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Storage Overview */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <HardDrive size={24} color="#007AFF" />
            <Text style={styles.storageTitle}>Storage Overview</Text>
          </View>
          
          <View style={styles.storageProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(storageStats.used / storageStats.total) * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.storageStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{storageStats.used} GB</Text>
                <Text style={styles.statLabel}>Used</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{storageStats.available} GB</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{storageStats.total} GB</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Database size={24} color="#007AFF" />
              <Text style={styles.actionText}>Create Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Download size={24} color="#34C759" />
              <Text style={styles.actionText}>Download Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Upload size={24} color="#FF9500" />
              <Text style={styles.actionText}>Restore Backup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Backups */}
        <View style={styles.backupsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Backups</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {backups.map(backup => (
            <View key={backup.id} style={styles.backupCard}>
              <View style={styles.backupInfo}>
                <Text style={styles.backupName}>{backup.name}</Text>
                <View style={styles.backupDetails}>
                  <Text style={styles.backupSize}>{backup.size}</Text>
                  <Text style={styles.backupDate}>{backup.date}</Text>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: backup.type === 'Automatic' ? '#D4F7E2' : '#FFF3CD' }
                  ]}>
                    <Text style={[
                      styles.typeText,
                      { color: backup.type === 'Automatic' ? '#34C759' : '#FF9500' }
                    ]}>
                      {backup.type}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.backupActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Download size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Upload size={16} color="#34C759" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Backup Schedule */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.sectionTitle}>Backup Schedule</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleItem}>
              <Clock size={20} color="#8E8E93" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Automatic Backups</Text>
                <Text style={styles.scheduleValue}>Daily at 2:00 AM</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.scheduleItem}>
              <CheckCircle size={20} color="#34C759" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Last Successful Backup</Text>
                <Text style={styles.scheduleValue}>{storageStats.lastBackup}</Text>
              </View>
            </View>
            
            <View style={styles.scheduleItem}>
              <AlertTriangle size={20} color="#FF9500" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Backup Retention</Text>
                <Text style={styles.scheduleValue}>30 days</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
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
  storageCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  storageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  storageProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  storageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
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
  backupsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  backupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  backupDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backupSize: {
    fontSize: 14,
    color: '#8E8E93',
  },
  backupDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 32,
  },
  scheduleCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 2,
  },
  scheduleValue: {
    fontSize: 14,
    color: '#8E8E93',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  editText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});