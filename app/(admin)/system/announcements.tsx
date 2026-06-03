import { Bell, Clock, Edit2, Plus, Send, Target, Trash2, Users } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Define TypeScript interfaces
interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: string;
  priority: string;
  date: string;
  time: string;
  status: 'Sent' | 'Draft';
}

interface NewAnnouncement {
  title: string;
  content: string;
  audience: string;
  priority: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'School Holiday Announcement',
      content: 'School will remain closed on Monday for maintenance work.',
      audience: 'All',
      priority: 'High',
      date: '2024-01-20',
      time: '10:30 AM',
      status: 'Sent',
    },
    {
      id: '2',
      title: 'PTM Schedule Update',
      content: 'Parent Teacher Meeting rescheduled to next Friday.',
      audience: 'Parents',
      priority: 'Medium',
      date: '2024-01-19',
      time: '2:00 PM',
      status: 'Sent',
    },
    {
      id: '3',
      title: 'Exam Date Announcement',
      content: 'Final exams will begin from February 1st, 2024.',
      audience: 'Students',
      priority: 'High',
      date: '2024-01-18',
      time: '9:00 AM',
      status: 'Draft',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<NewAnnouncement>({
    title: '',
    content: '',
    audience: 'All',
    priority: 'Medium',
  });

  const audiences = ['All', 'Students', 'Parents', 'Teachers', 'Staff'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const handleSendAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      Alert.alert('Error', 'Please fill title and content');
      return;
    }

    const announcement: Announcement = {
      id: Date.now().toString(),
      ...newAnnouncement,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Sent',
    };

    setAnnouncements([announcement, ...announcements]);
    setShowCreateModal(false);
    setNewAnnouncement({ title: '', content: '', audience: 'All', priority: 'Medium' });
    Alert.alert('Success', 'Announcement sent successfully');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setAnnouncements(announcements.filter(a => a.id !== id));
            Alert.alert('Success', 'Announcement deleted successfully');
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return '#34C759';
      case 'Medium': return '#FF9500';
      case 'High': return '#FF3B30';
      case 'Urgent': return '#FF2D55';
      default: return '#8E8E93';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'All': return Users;
      case 'Students': return Users;
      case 'Parents': return Users;
      case 'Teachers': return Users;
      case 'Staff': return Users;
      default: return Target;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with Stats */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Announcement Broadcast</Text>
            <Text style={styles.subtitle}>Send school-wide announcements and notifications</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.createButtonText}>New Announcement</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Bell size={24} color="#007AFF" />
            <Text style={styles.statValue}>{announcements.length}</Text>
            <Text style={styles.statLabel}>Total Announcements</Text>
          </View>
          <View style={styles.statCard}>
            <Send size={24} color="#34C759" />
            <Text style={styles.statValue}>
              {announcements.filter(a => a.status === 'Sent').length}
            </Text>
            <Text style={styles.statLabel}>Sent</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#FF9500" />
            <Text style={styles.statValue}>
              {announcements.filter(a => a.status === 'Draft').length}
            </Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>

        {/* Announcements List */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Recent Announcements</Text>
          
          {announcements.map((announcement) => {
            const AudienceIcon = getAudienceIcon(announcement.audience);
            return (
              <View key={announcement.id} style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                    <View style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(announcement.priority) + '20' }
                    ]}>
                      <Text style={[
                        styles.priorityText,
                        { color: getPriorityColor(announcement.priority) }
                      ]}>
                        {announcement.priority}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.announcementActions}>
                    {announcement.status === 'Draft' && (
                      <TouchableOpacity style={styles.iconButton}>
                        <Edit2 size={16} color="#007AFF" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => handleDelete(announcement.id)}
                    >
                      <Trash2 size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.announcementContent}>{announcement.content}</Text>
                
                <View style={styles.announcementFooter}>
                  <View style={styles.audienceInfo}>
                    <AudienceIcon size={14} color="#8E8E93" />
                    <Text style={styles.audienceLabel}>{announcement.audience}</Text>
                  </View>
                  <View style={styles.statusInfo}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: announcement.status === 'Sent' ? '#D4F7E2' : '#FFF3CD' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: announcement.status === 'Sent' ? '#34C759' : '#FF9500' }
                      ]}>
                        {announcement.status}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>
                      {announcement.date} • {announcement.time}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Create Announcement Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowCreateModal(false);
          setNewAnnouncement({ title: '', content: '', audience: 'All', priority: 'Medium' });
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Announcement</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewAnnouncement({ title: '', content: '', audience: 'All', priority: 'Medium' });
                }}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter announcement title"
                  value={newAnnouncement.title}
                  onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Content *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter announcement content"
                  value={newAnnouncement.content}
                  onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, content: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Target Audience</Text>
                <View style={styles.audienceGrid}>
                  {audiences.map((audience) => (
                    <TouchableOpacity
                      key={audience}
                      style={[
                        styles.audienceButton,
                        newAnnouncement.audience === audience && styles.audienceButtonActive
                      ]}
                      onPress={() => setNewAnnouncement({ ...newAnnouncement, audience })}
                    >
                      <Text style={[
                        styles.audienceButtonText,
                        newAnnouncement.audience === audience && styles.audienceButtonTextActive
                      ]}>
                        {audience}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Priority Level</Text>
                <View style={styles.priorityGrid}>
                  {priorities.map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityButton,
                        newAnnouncement.priority === priority && styles.priorityButtonActive
                      ]}
                      onPress={() => setNewAnnouncement({ ...newAnnouncement, priority })}
                    >
                      <View style={[
                        styles.priorityIndicator,
                        { backgroundColor: getPriorityColor(priority) }
                      ]} />
                      <Text style={[
                        styles.priorityButtonText,
                        newAnnouncement.priority === priority && styles.priorityButtonTextActive
                      ]}>
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Delivery Options</Text>
                <View style={styles.deliveryOptions}>
                  <TouchableOpacity style={styles.deliveryOption}>
                    <View style={styles.checkbox} />
                    <Text style={styles.deliveryText}>Push Notification</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deliveryOption}>
                    <View style={styles.checkbox} />
                    <Text style={styles.deliveryText}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deliveryOption}>
                    <View style={styles.checkbox} />
                    <Text style={styles.deliveryText}>SMS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.saveDraftButton}
                onPress={() => {
                  // Save as draft functionality
                  setShowCreateModal(false);
                  setNewAnnouncement({ title: '', content: '', audience: 'All', priority: 'Medium' });
                }}
              >
                <Text style={styles.saveDraftText}>Save as Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton} onPress={handleSendAnnouncement}>
                <Send size={20} color="white" />
                <Text style={styles.sendButtonText}>Send Announcement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
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
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  listContainer: {
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  announcementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  announcementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  announcementContent: {
    fontSize: 14,
    color: '#1d1d1f',
    lineHeight: 20,
    marginBottom: 16,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
  },
  audienceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audienceLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusInfo: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#8E8E93',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audienceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  audienceButtonActive: {
    backgroundColor: '#007AFF',
  },
  audienceButtonText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  audienceButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    gap: 8,
  },
  priorityButtonActive: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  priorityButtonTextActive: {
    color: '#1d1d1f',
    fontWeight: '500',
  },
  deliveryOptions: {
    gap: 12,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d1d6',
  },
  deliveryText: {
    fontSize: 16,
    color: '#1d1d1f',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    gap: 12,
  },
  saveDraftButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
  },
  saveDraftText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});