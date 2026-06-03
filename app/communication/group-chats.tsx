import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, Users, MessageSquare, Lock, Plus, ChevronRight, LucideIcon } from 'lucide-react-native';

type GroupType = 'class' | 'committee' | 'club' | 'staff' | 'sports';

interface GroupChat {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  members: number;
  unread: number;
  lastMessage: string;
  lastActive: string;
  isPrivate: boolean;
}

type FilterType = 'all' | 'class' | 'committee' | 'personal';

export default function GroupChats() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Groups' },
    { id: 'class', label: 'Class Groups' },
    { id: 'committee', label: 'Committees' },
    { id: 'personal', label: 'Personal' },
  ];

  const groupChats: GroupChat[] = [
    {
      id: '1',
      name: 'Class 10A - 2024',
      description: 'Official group for Class 10A students and teachers',
      type: 'class',
      members: 35,
      unread: 5,
      lastMessage: 'Remember to submit science project by Friday',
      lastActive: '2 hours ago',
      isPrivate: false,
    },
    {
      id: '2',
      name: 'Parents Committee',
      description: 'School parents committee discussions',
      type: 'committee',
      members: 12,
      unread: 0,
      lastMessage: 'Meeting agenda for next parent-teacher meeting',
      lastActive: '1 day ago',
      isPrivate: true,
    },
    {
      id: '3',
      name: 'Science Club',
      description: 'Science club members and activities',
      type: 'club',
      members: 24,
      unread: 12,
      lastMessage: 'Field trip to science museum confirmed',
      lastActive: '30 minutes ago',
      isPrivate: false,
    },
    {
      id: '4',
      name: 'Teachers Lounge',
      description: 'Staff room discussions and announcements',
      type: 'staff',
      members: 28,
      unread: 3,
      lastMessage: 'Staff meeting rescheduled to 3 PM',
      lastActive: '5 hours ago',
      isPrivate: true,
    },
    {
      id: '5',
      name: 'Sports Team',
      description: 'School sports team coordination',
      type: 'sports',
      members: 18,
      unread: 0,
      lastMessage: 'Practice schedule for next week',
      lastActive: '2 days ago',
      isPrivate: false,
    },
  ];

  const getGroupIcon = (type: GroupType): LucideIcon => {
    switch (type) {
      case 'class': return Users;
      case 'committee': return Users;
      case 'club': return Users;
      case 'staff': return Users;
      case 'sports': return Users;
      default: return MessageSquare;
    }
  };

  const filteredGroups = groupChats.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'class' && group.type === 'class') ||
                         (activeFilter === 'committee' && group.type === 'committee') ||
                         (activeFilter === 'personal' && (group.type === 'club' || group.type === 'sports'));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Group Chats</Text>
            <Text style={styles.subtitle}>Communicate with class and committee groups</Text>
          </View>
          <TouchableOpacity style={styles.createButton}>
            <Plus size={20} color="white" />
            <Text style={styles.createButtonText}>New Group</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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

        {/* Groups List */}
        <View style={styles.groupsContainer}>
          {filteredGroups.map(group => {
            const GroupIcon = getGroupIcon(group.type);
            return (
              <TouchableOpacity key={group.id} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupIcon}>
                    <GroupIcon size={20} color="#007AFF" />
                  </View>
                  <View style={styles.groupInfo}>
                    <View style={styles.groupNameRow}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      {group.isPrivate && (
                        <Lock size={14} color="#8E8E93" />
                      )}
                    </View>
                    <Text style={styles.groupDescription}>{group.description}</Text>
                  </View>
                  {group.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{group.unread}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.groupDetails}>
                  <View style={styles.groupMeta}>
                    <View style={styles.metaItem}>
                      <Users size={14} color="#8E8E93" />
                      <Text style={styles.metaText}>{group.members} members</Text>
                    </View>
                    <Text style={styles.lastActive}>{group.lastActive}</Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {group.lastMessage}
                  </Text>
                </View>

                <View style={styles.groupFooter}>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Chat</Text>
                    <ChevronRight size={16} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Create New Group CTA */}
        <TouchableOpacity style={styles.createCTACard}>
          <View style={styles.createCTAHeader}>
            <Plus size={24} color="#007AFF" />
            <Text style={styles.createCTATitle}>Create New Group</Text>
          </View>
          <Text style={styles.createCTADescription}>
            Start a new group chat for your class, committee, or project team
          </Text>
          <TouchableOpacity style={styles.createCTAButton}>
            <Text style={styles.createCTAButtonText}>Create Group</Text>
          </TouchableOpacity>
        </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1d1d1f',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
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
  groupsContainer: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  groupDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  groupDetails: {
    marginBottom: 16,
  },
  groupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  lastActive: {
    fontSize: 12,
    color: '#8E8E93',
  },
  lastMessage: {
    fontSize: 16,
    color: '#1d1d1f',
    lineHeight: 22,
  },
  groupFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
    paddingTop: 16,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  createCTACard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
  },
  createCTAHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  createCTATitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  createCTADescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createCTAButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createCTAButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});