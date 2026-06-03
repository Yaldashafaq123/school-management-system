import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Send, X, Users, User, Search, Paperclip, Image } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Define TypeScript interfaces
interface Recipient {
  id: string;
  name: string;
  type: 'student' | 'parent' | 'teacher' | 'group';
  class?: string;
  student?: string;
  subject?: string;
  members?: number;
}

interface Message {
  to: Recipient[];
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments: string[];
}

interface MessageType {
  id: string;
  label: string;
  icon: any;
}

interface Priority {
  id: 'low' | 'normal' | 'high' | 'urgent';
  label: string;
  color: string;
}

export default function NewMessage() {
  const router = useRouter();
  const [message, setMessage] = useState<Message>({
    to: [],
    subject: '',
    content: '',
    priority: 'normal',
    attachments: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('individual');

  const recipients: Recipient[] = [
    { id: '1', name: 'John Smith', type: 'student', class: '10A' },
    { id: '2', name: 'Sarah Johnson', type: 'parent', student: 'Emma Johnson' },
    { id: '3', name: 'Mr. Wilson', type: 'teacher', subject: 'Mathematics' },
    { id: '4', name: 'Class 10A', type: 'group', members: 25 },
    { id: '5', name: 'All Parents', type: 'group', members: 380 },
    { id: '6', name: 'All Teachers', type: 'group', members: 28 },
  ];

  const messageTypes: MessageType[] = [
    { id: 'individual', label: 'Individual', icon: User },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'announcement', label: 'Announcement', icon: Send },
  ];

  const priorities: Priority[] = [
    { id: 'low', label: 'Low', color: '#34C759' },
    { id: 'normal', label: 'Normal', color: '#007AFF' },
    { id: 'high', label: 'High', color: '#FF9500' },
    { id: 'urgent', label: 'Urgent', color: '#FF3B30' },
  ];

  const toggleRecipient = (recipient: Recipient) => {
    if (message.to.find(r => r.id === recipient.id)) {
      setMessage({
        ...message,
        to: message.to.filter(r => r.id !== recipient.id),
      });
    } else {
      setMessage({
        ...message,
        to: [...message.to, recipient],
      });
    }
  };

  const handleSend = () => {
    if (message.to.length === 0) {
      Alert.alert('Error', 'Please select at least one recipient');
      return;
    }

    if (!message.content.trim()) {
      Alert.alert('Error', 'Please enter message content');
      return;
    }

    Alert.alert(
      'Send Message',
      `Send message to ${message.to.length} recipient(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          style: 'default',
          onPress: () => {
            // In a real app, this would send the message
            Alert.alert('Success', 'Message sent successfully');
            router.back();
          }
        }
      ]
    );
  };

  const removeRecipient = (id: string) => {
    setMessage({
      ...message,
      to: message.to.filter(r => r.id !== id),
    });
  };

  const filteredRecipients = recipients.filter(recipient => 
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (recipient.type && recipient.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color="#1d1d1f" />
          </TouchableOpacity>
          <Text style={styles.title}>New Message</Text>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Send size={20} color="white" />
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* Message Type */}
        <View style={styles.typeContainer}>
          <Text style={styles.sectionTitle}>Message Type</Text>
          <View style={styles.typeGrid}>
            {messageTypes.map(type => {
              const Icon = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && styles.typeButtonActive
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Icon size={20} color={selectedType === type.id ? '#007AFF' : '#8E8E93'} />
                  <Text style={[
                    styles.typeText,
                    selectedType === type.id && styles.typeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Recipients */}
        {message.to.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.sectionTitle}>Selected Recipients</Text>
            <View style={styles.selectedGrid}>
              {message.to.map(recipient => (
                <View key={recipient.id} style={styles.selectedChip}>
                  <Text style={styles.selectedName}>{recipient.name}</Text>
                  <TouchableOpacity 
                    onPress={() => removeRecipient(recipient.id)}
                    style={styles.removeChip}
                  >
                    <X size={12} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Priority */}
        <View style={styles.priorityContainer}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityGrid}>
            {priorities.map(priority => (
              <TouchableOpacity
                key={priority.id}
                style={[
                  styles.priorityButton,
                  message.priority === priority.id && styles.priorityButtonActive
                ]}
                onPress={() => setMessage({ ...message, priority: priority.id })}
              >
                <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
                <Text style={[
                  styles.priorityText,
                  message.priority === priority.id && styles.priorityTextActive
                ]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subject */}
        <View style={styles.subjectContainer}>
          <Text style={styles.sectionTitle}>Subject</Text>
          <TextInput
            style={styles.subjectInput}
            placeholder="Enter message subject"
            value={message.subject}
            onChangeText={(text) => setMessage({ ...message, subject: text })}
          />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Message</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Type your message here..."
            value={message.content}
            onChangeText={(text) => setMessage({ ...message, content: text })}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        {/* Attachments */}
        <View style={styles.attachmentsContainer}>
          <View style={styles.attachmentsHeader}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            <TouchableOpacity style={styles.attachButton}>
              <Paperclip size={16} color="#007AFF" />
              <Text style={styles.attachText}>Add File</Text>
            </TouchableOpacity>
          </View>
          
          {message.attachments.length === 0 ? (
            <TouchableOpacity style={styles.emptyAttachments}>
              <Image size={32} color="#8E8E93" />
              <Text style={styles.emptyText}>No attachments added</Text>
              <Text style={styles.emptySubtext}>Click &quot;Add File&quot; to attach documents</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.attachmentsList}>
              {/* Attachment items would go here */}
            </View>
          )}
        </View>

        {/* Recipient Selection */}
        <View style={styles.recipientsContainer}>
          <View style={styles.recipientsHeader}>
            <Text style={styles.sectionTitle}>Select Recipients</Text>
            <View style={styles.searchContainer}>
              <Search size={16} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipients..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.recipientsList}>
            {filteredRecipients.map(recipient => (
              <TouchableOpacity
                key={recipient.id}
                style={[
                  styles.recipientItem,
                  message.to.find(r => r.id === recipient.id) && styles.recipientItemSelected
                ]}
                onPress={() => toggleRecipient(recipient)}
              >
                <View style={styles.recipientInfo}>
                  <View style={styles.recipientAvatar}>
                    {recipient.type === 'group' ? (
                      <Users size={16} color="#007AFF" />
                    ) : (
                      <User size={16} color="#007AFF" />
                    )}
                  </View>
                  <View style={styles.recipientDetails}>
                    <Text style={styles.recipientName}>{recipient.name}</Text>
                    <Text style={styles.recipientMeta}>
                      {recipient.type === 'student' && `Class ${recipient.class}`}
                      {recipient.type === 'parent' && `Parent of ${recipient.student}`}
                      {recipient.type === 'teacher' && `${recipient.subject} Teacher`}
                      {recipient.type === 'group' && `${recipient.members} members`}
                    </Text>
                  </View>
                </View>
                {message.to.find(r => r.id === recipient.id) ? (
                  <View style={styles.selectedCheck}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.unselectedCheck} />
                )}
              </TouchableOpacity>
            ))}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  typeContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF20',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#007AFF',
  },
  selectedContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  selectedName: {
    fontSize: 14,
    color: '#1d1d1f',
  },
  removeChip: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#d1d1d6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap: 8,
  },
  priorityButtonActive: {
    backgroundColor: '#f2f2f7',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  priorityTextActive: {
    color: '#1d1d1f',
  },
  subjectContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  attachmentsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  attachmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    gap: 6,
  },
  attachText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyAttachments: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  attachmentsList: {
    // Style for attachments list when there are attachments
    minHeight: 100,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  recipientsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 32,
  },
  recipientsHeader: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1d1d1f',
  },
  recipientsList: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
  },
  recipientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  recipientItemSelected: {
    backgroundColor: '#007AFF10',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  recipientMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  unselectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d1d6',
  },
});