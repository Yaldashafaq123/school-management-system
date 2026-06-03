import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Users, ChevronLeft, Edit, Trash2, Share, Bell, Check } from 'lucide-react-native';

// Define TypeScript interfaces
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  organizer: string;
  contact: string;
  status: string;
  importantNotes: string[];
}

type RsvpStatus = 'pending' | 'attending' | 'maybe' | 'not-attending';

export default function EventDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.id as string || '1';
  
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('pending');
  const [reminderSet, setReminderSet] = useState(false);

  // Mock event data - in real app, fetch based on eventId
  const event: Event = {
    id: eventId,
    title: 'Annual Sports Day',
    description: 'Annual sports competition with various track and field events. All students are encouraged to participate. There will be prizes for winners in each category. Parents are invited to attend and cheer for their children.',
    date: '2024-02-28',
    time: '9:00 AM - 4:00 PM',
    location: 'School Ground',
    category: 'sports',
    attendees: 450,
    maxAttendees: 500,
    organizer: 'Sports Department',
    contact: 'sports@school.com',
    status: 'upcoming',
    importantNotes: [
      'Wear proper sports attire',
      'Bring water bottle',
      'Registration closes on Feb 25th',
      'Medical certificate required for certain events',
    ],
  };

  const handleRSVP = (status: RsvpStatus) => {
    setRsvpStatus(status);
    Alert.alert('RSVP Updated', `You have ${status.toLowerCase()} the event`);
  };

  const toggleReminder = () => {
    setReminderSet(!reminderSet);
    Alert.alert(
      reminderSet ? 'Reminder Removed' : 'Reminder Set',
      reminderSet ? 'Event reminder removed' : 'You will be reminded before the event'
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            router.back();
            Alert.alert('Success', 'Event deleted successfully');
          }
        }
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share', 'Event shared successfully');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header Image Placeholder */}
        <View style={styles.headerImage}>
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerActionButton}>
                <Edit size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={handleDelete}
              >
                <Trash2 size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerActionButton}
                onPress={handleShare}
              >
                <Share size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventCategory}>
            <Text style={styles.eventCategoryText}>{event.category.toUpperCase()}</Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Calendar size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{event.date}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Clock size={20} color="#FF9500" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{event.time}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <MapPin size={20} color="#34C759" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Users size={20} color="#AF52DE" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Attendees</Text>
                <Text style={styles.infoValue}>
                  {event.attendees}/{event.maxAttendees}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Important Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Notes</Text>
            <View style={styles.notesList}>
              {event.importantNotes.map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <View style={styles.noteBullet} />
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Organizer Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <View style={styles.organizerCard}>
              <Text style={styles.organizerName}>{event.organizer}</Text>
              <Text style={styles.organizerContact}>{event.contact}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.reminderButton}
          onPress={toggleReminder}
        >
          <Bell size={20} color={reminderSet ? '#FF9500' : '#8E8E93'} />
          <Text style={[styles.reminderText, reminderSet && styles.reminderTextActive]}>
            {reminderSet ? 'Reminder Set' : 'Set Reminder'}
          </Text>
        </TouchableOpacity>

        <View style={styles.rsvpContainer}>
          <Text style={styles.rsvpTitle}>Your Response:</Text>
          <View style={styles.rsvpButtons}>
            <TouchableOpacity
              style={[
                styles.rsvpButton,
                rsvpStatus === 'attending' && styles.rsvpButtonAttending
              ]}
              onPress={() => handleRSVP('attending')}
            >
              {rsvpStatus === 'attending' && <Check size={16} color="white" />}
              <Text style={[
                styles.rsvpButtonText,
                rsvpStatus === 'attending' && styles.rsvpButtonTextActive
              ]}>
                Attending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.rsvpButton,
                rsvpStatus === 'maybe' && styles.rsvpButtonMaybe
              ]}
              onPress={() => handleRSVP('maybe')}
            >
              {rsvpStatus === 'maybe' && <Check size={16} color="white" />}
              <Text style={[
                styles.rsvpButtonText,
                rsvpStatus === 'maybe' && styles.rsvpButtonTextActive
              ]}>
                Maybe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.rsvpButton,
                rsvpStatus === 'not-attending' && styles.rsvpButtonNotAttending
              ]}
              onPress={() => handleRSVP('not-attending')}
            >
              {rsvpStatus === 'not-attending' && <Check size={16} color="white" />}
              <Text style={[
                styles.rsvpButtonText,
                rsvpStatus === 'not-attending' && styles.rsvpButtonTextActive
              ]}>
                Can&apos;t Attend
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  headerImage: {
    height: 200,
    backgroundColor: '#007AFF',
    justifyContent: 'flex-end',
    padding: 20,
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  eventCategory: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventCategoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 100,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#1d1d1f',
    lineHeight: 24,
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 16,
    color: '#1d1d1f',
    lineHeight: 24,
  },
  organizerCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  organizerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  organizerContact: {
    fontSize: 16,
    color: '#007AFF',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    gap: 12,
    marginBottom: 16,
  },
  reminderText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  reminderTextActive: {
    color: '#FF9500',
  },
  rsvpContainer: {
    marginBottom: 20,
  },
  rsvpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    gap: 8,
  },
  rsvpButtonAttending: {
    backgroundColor: '#34C759',
  },
  rsvpButtonMaybe: {
    backgroundColor: '#FF9500',
  },
  rsvpButtonNotAttending: {
    backgroundColor: '#FF3B30',
  },
  rsvpButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  rsvpButtonTextActive: {
    color: 'white',
  },
});