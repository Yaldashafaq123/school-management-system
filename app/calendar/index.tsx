import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Calendar, Plus, Clock, MapPin, Users, ChevronRight } from 'lucide-react-native';
import { Link } from 'expo-router';

type ViewType = 'day' | 'week' | 'month' | 'agenda';
type FilterType = 'all' | 'academic' | 'sports' | 'cultural' | 'holidays';
type CategoryType = 'academic' | 'sports' | 'cultural' | 'holidays';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: CategoryType;
  attendees: number;
  status: string;
  description: string;
}

export default function EventCalendar() {
  const [selectedView, setSelectedView] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const views: { id: ViewType; label: string }[] = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'agenda', label: 'Agenda' },
  ];

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Events' },
    { id: 'academic', label: 'Academic' },
    { id: 'sports', label: 'Sports' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'holidays', label: 'Holidays' },
  ];

  const upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Annual Sports Day',
      date: '2024-02-28',
      time: '9:00 AM - 4:00 PM',
      location: 'School Ground',
      category: 'sports',
      attendees: 450,
      status: 'upcoming',
      description: 'Annual sports competition with various track and field events',
    },
    {
      id: '2',
      title: 'Parent-Teacher Meeting',
      date: '2024-02-15',
      time: '2:00 PM - 5:00 PM',
      location: 'Main Auditorium',
      category: 'academic',
      attendees: 280,
      status: 'upcoming',
      description: 'Quarterly parent-teacher meeting to discuss student progress',
    },
    {
      id: '3',
      title: 'Science Fair',
      date: '2024-03-05',
      time: '10:00 AM - 3:00 PM',
      location: 'Science Block',
      category: 'academic',
      attendees: 320,
      status: 'upcoming',
      description: 'Annual science fair showcasing student projects',
    },
    {
      id: '4',
      title: 'Cultural Festival',
      date: '2024-03-20',
      time: '6:00 PM - 9:00 PM',
      location: 'School Auditorium',
      category: 'cultural',
      attendees: 500,
      status: 'upcoming',
      description: 'Annual cultural festival with performances and exhibitions',
    },
    {
      id: '5',
      title: 'Mid-Term Exams',
      date: '2024-02-10',
      time: 'All Day',
      location: 'Classrooms',
      category: 'academic',
      attendees: 450,
      status: 'upcoming',
      description: 'Mid-term examinations for all classes',
    },
  ];

  const todaysEvents = upcomingEvents.filter(event => 
    event.date === '2024-01-20' // In real app, use actual date comparison
  );

  const getCategoryColor = (category: CategoryType): string => {
    switch (category) {
      case 'academic': return '#007AFF';
      case 'sports': return '#34C759';
      case 'cultural': return '#AF52DE';
      case 'holidays': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>School Calendar</Text>
            <Text style={styles.subtitle}>Stay updated with school events</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar View Selector */}
        <View style={styles.viewSelector}>
          {views.map(view => (
            <TouchableOpacity
              key={view.id}
              style={[
                styles.viewButton,
                selectedView === view.id && styles.viewButtonActive
              ]}
              onPress={() => setSelectedView(view.id)}
            >
              <Text style={[
                styles.viewText,
                selectedView === view.id && styles.viewTextActive
              ]}>
                {view.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Month Calendar Placeholder */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>January 2024</Text>
            <View style={styles.calendarNav}>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.todayButton}>
                <Text style={styles.todayText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <View key={day} style={styles.calendarDayHeader}>
                <Text style={styles.calendarDayText}>{day}</Text>
              </View>
            ))}
            
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.calendarDay,
                  day === 20 && styles.calendarDaySelected
                ]}
                onPress={() => setSelectedDate(new Date(2024, 0, day))}
              >
                <Text style={[
                  styles.calendarDayNumber,
                  day === 20 && styles.calendarDayNumberSelected
                ]}>
                  {day}
                </Text>
                {day === 15 && <View style={[styles.eventDot, { backgroundColor: '#007AFF' }]} />}
                {day === 20 && <View style={[styles.eventDot, { backgroundColor: '#34C759' }]} />}
                {day === 28 && <View style={[styles.eventDot, { backgroundColor: '#AF52DE' }]} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Today's Events */}
        <View style={styles.eventsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {todaysEvents.length > 0 ? "Today's Events" : "No Events Today"}
            </Text>
            <Clock size={20} color="#8E8E93" />
          </View>
          
          {todaysEvents.length > 0 ? (
            todaysEvents.map(event => (
              <View key={event.id} style={styles.eventCard}>
                <View style={[styles.eventColor, { backgroundColor: getCategoryColor(event.category) }]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventBadge}>
                      <Text style={styles.eventCategory}>{event.category}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Clock size={14} color="#8E8E93" />
                      <Text style={styles.detailText}>{event.time}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={14} color="#8E8E93" />
                      <Text style={styles.detailText}>{event.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Users size={14} color="#8E8E93" />
                      <Text style={styles.detailText}>{event.attendees} attendees</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                  
                  <Link href={`/calendar/event-details?id=${event.id}`} asChild>
                    <TouchableOpacity style={styles.detailsButton}>
                      <Text style={styles.detailsButtonText}>View Details</Text>
                      <ChevronRight size={16} color="#007AFF" />
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyEvents}>
              <Calendar size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>No events scheduled for today</Text>
              <Text style={styles.emptySubtext}>Check upcoming events below</Text>
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View style={styles.upcomingContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingEvents.map(event => (
            <Link href={`/calendar/event-details?id=${event.id}`} key={event.id} asChild>
              <TouchableOpacity style={styles.upcomingCard}>
                <View style={styles.upcomingDate}>
                  <Text style={styles.upcomingDay}>28</Text>
                  <Text style={styles.upcomingMonth}>FEB</Text>
                </View>
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingTitle}>{event.title}</Text>
                  <View style={styles.upcomingDetails}>
                    <Clock size={12} color="#8E8E93" />
                    <Text style={styles.upcomingTime}>{event.time}</Text>
                    <MapPin size={12} color="#8E8E93" />
                    <Text style={styles.upcomingLocation}>{event.location}</Text>
                  </View>
                  <View style={[
                    styles.categoryTag,
                    { backgroundColor: getCategoryColor(event.category) + '20' }
                  ]}>
                    <Text style={[
                      styles.categoryText,
                      { color: getCategoryColor(event.category) }
                    ]}>
                      {event.category}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  viewButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#f2f2f7',
  },
  viewText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  viewTextActive: {
    color: '#007AFF',
  },
  calendarContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    color: '#1d1d1f',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  todayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayHeader: {
    width: '14.28%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calendarDaySelected: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  calendarDayNumber: {
    fontSize: 14,
    color: '#1d1d1f',
  },
  calendarDayNumberSelected: {
    color: 'white',
    fontWeight: '600',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  eventsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  eventColor: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    flex: 1,
  },
  eventBadge: {
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventCategory: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  eventDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  eventDescription: {
    fontSize: 14,
    color: '#1d1d1f',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyEvents: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  upcomingContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 32,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  upcomingDate: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginRight: 16,
  },
  upcomingDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  upcomingMonth: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  upcomingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  upcomingTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 12,
  },
  upcomingLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
});