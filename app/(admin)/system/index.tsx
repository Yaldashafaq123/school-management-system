import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Link } from 'expo-router';
import { 
  Bell, 
  Settings, 
  Database, 
  Shield, 
  Users,
  Server,
  Activity,
  RefreshCw,
  Lock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { useState } from 'react';

// Define TypeScript interfaces
interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
}

interface SystemStatusMap {
  app: SystemStatus;
  database: SystemStatus;
  api: SystemStatus;
  storage: SystemStatus;
}

interface SystemModule {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

interface Notifications {
  email: boolean;
  push: boolean;
  sms: boolean;
  maintenance: boolean;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  status: 'success' | 'failed';
}

export default function SystemManagement() {
  const [systemStatus, setSystemStatus] = useState<SystemStatusMap>({
    app: { status: 'healthy', message: 'All systems operational' },
    database: { status: 'healthy', message: 'Connection stable' },
    api: { status: 'warning', message: 'High latency detected' },
    storage: { status: 'healthy', message: '85% capacity used' },
  });

  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    push: true,
    sms: false,
    maintenance: true,
  });

  const systemModules: SystemModule[] = [
    {
      title: 'Announcement Broadcast',
      description: 'Send school-wide announcements',
      icon: Bell,
      href: '/(admin)/system/announcements',
      color: '#FF9500'
    },
    {
      title: 'System Settings',
      description: 'Configure app settings and preferences',
      icon: Settings,
      href: '/(admin)/system/system-settings',
      color: '#007AFF'
    },
    {
      title: 'Backup & Restore',
      description: 'Manage data backups and restoration',
      icon: Database,
      href: '/(admin)/system/backup-restore',
      color: '#34C759'
    },
    {
      title: 'Audit Logs',
      description: 'View user activity and system logs',
      icon: Shield,
      href: '/(admin)/system/audit-logs',
      color: '#AF52DE'
    },
    {
      title: 'Database Management',
      description: 'Cleanup, maintenance, and optimization',
      icon: Server,
      href: '/(admin)/system/database',
      color: '#5856D6'
    },
    {
      title: 'User Management',
      description: 'Manage all user accounts and roles',
      icon: Users,
      href: '/(admin)/users',
      color: '#FF2D55'
    },
  ];

  const recentActivities: RecentActivity[] = [
    { id: 1, user: 'Admin User', action: 'Logged in', time: '2 minutes ago', status: 'success' },
    { id: 2, user: 'Teacher Smith', action: 'Updated grade', time: '15 minutes ago', status: 'success' },
    { id: 3, user: 'System', action: 'Daily backup', time: '1 hour ago', status: 'success' },
    { id: 4, user: 'Unknown', action: 'Failed login attempt', time: '3 hours ago', status: 'failed' },
  ];

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy': return '#34C759';
      case 'warning': return '#FF9500';
      case 'error': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Activity;
    }
  };

  const toggleNotification = (type: keyof Notifications) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
  };

  const runSystemCheck = () => {
    // Simulate system check
    Alert.alert('System Check', 'System diagnostics completed successfully.');
  };

  return (
    <ScrollView style={styles.container}>
      {/* System Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>System Status</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={runSystemCheck}>
            <RefreshCw size={16} color="#007AFF" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statusGrid}>
          {Object.entries(systemStatus).map(([key, value]) => {
            const StatusIcon = getStatusIcon(value.status);
            return (
              <View key={key} style={styles.statusCard}>
                <View style={styles.statusHeaderRow}>
                  <StatusIcon size={20} color={getStatusColor(value.status)} />
                  <Text style={styles.statusName}>{key.toUpperCase()}</Text>
                </View>
                <Text style={styles.statusMessage}>{value.message}</Text>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(value.status) }
                ]} />
              </View>
            );
          })}
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.notificationsContainer}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#8E8E93" />
          <Text style={styles.sectionTitle}>Notification Settings</Text>
        </View>
        
        <View style={styles.notificationList}>
          {Object.entries(notifications).map(([key, value]) => (
            <View key={key} style={styles.notificationItem}>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                </Text>
                <Text style={styles.notificationDescription}>
                  Receive {key} alerts for system events
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={() => toggleNotification(key as keyof Notifications)}
                trackColor={{ false: '#f2f2f7', true: '#34C759' }}
                thumbColor={value ? '#fff' : '#fff'}
              />
            </View>
          ))}
        </View>
      </View>

      {/* System Modules */}
      <View style={styles.modulesContainer}>
        <View style={styles.sectionHeader}>
          <Settings size={20} color="#8E8E93" />
          <Text style={styles.sectionTitle}>System Modules</Text>
        </View>
        
        <View style={styles.modulesGrid}>
          {systemModules.map((module, index) => (
            <Link href={module.href as any} key={index} asChild>
              <TouchableOpacity style={styles.moduleCard}>
                <View style={[styles.moduleIcon, { backgroundColor: module.color + '20' }]}>
                  <module.icon size={24} color={module.color} />
                </View>
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                </View>
                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.activitiesContainer}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color="#8E8E93" />
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <Link href="/(admin)/system/audit-logs" asChild>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <View style={styles.activitiesList}>
          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityUser}>{activity.user}</Text>
                <Text style={styles.activityAction}>{activity.action}</Text>
              </View>
              <View style={styles.activityMeta}>
                <Text style={styles.activityTime}>{activity.time}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: activity.status === 'success' ? '#D4F7E2' : '#FFE5E5' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: activity.status === 'success' ? '#34C759' : '#FF3B30' }
                  ]}>
                    {activity.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Lock size={20} color="#007AFF" />
            <Text style={styles.actionText}>Security Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Database size={20} color="#34C759" />
            <Text style={styles.actionText}>Clear Cache</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <RefreshCw size={20} color="#FF9500" />
            <Text style={styles.actionText}>Restart Services</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    gap: 6,
  },
  refreshText: {
    fontSize: 14,
    color: '#007AFF',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  statusMessage: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationsContainer: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  notificationList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  modulesContainer: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 20,
  },
  modulesGrid: {
    gap: 12,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activitiesContainer: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 20,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  activityAction: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
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
  actionsContainer: {
    backgroundColor: 'white',
    marginTop: 8,
    padding: 20,
    marginBottom: 32,
  },
  actionsGrid: {
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
});