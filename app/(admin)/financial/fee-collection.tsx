import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, Download, Printer, Eye, Calendar } from 'lucide-react-native';

export default function FeeCollection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' },
  ];

  const collections = [
    { id: 1, student: 'John Smith', class: '10A', amount: 1200, paid: 1200, pending: 0, status: 'Paid' },
    { id: 2, student: 'Sarah Johnson', class: '9B', amount: 1500, paid: 1000, pending: 500, status: 'Partial' },
    { id: 3, student: 'Mike Wilson', class: '11A', amount: 1400, paid: 0, pending: 1400, status: 'Pending' },
    { id: 4, student: 'Emma Davis', class: '8C', amount: 1100, paid: 1100, pending: 0, status: 'Paid' },
    { id: 5, student: 'Robert Brown', class: '12A', amount: 1600, paid: 800, pending: 800, status: 'Partial' },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>$45,800</Text>
          <Text style={styles.statLabel}>Total Collected</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>$18,750</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#34C759' }]}>78%</Text>
          <Text style={styles.statLabel}>Collection Rate</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search student or class..."
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

      {/* Collections List */}
      <ScrollView style={styles.listContainer}>
        {collections.map(collection => (
          <View key={collection.id} style={styles.collectionCard}>
            <View style={styles.collectionInfo}>
              <Text style={styles.studentName}>{collection.student}</Text>
              <Text style={styles.classInfo}>Class {collection.class}</Text>
              
              <View style={styles.amountContainer}>
                <View style={styles.amountItem}>
                  <Text style={styles.amountLabel}>Total</Text>
                  <Text style={styles.amountValue}>${collection.amount}</Text>
                </View>
                <View style={styles.amountItem}>
                  <Text style={styles.amountLabel}>Paid</Text>
                  <Text style={[styles.amountValue, { color: '#34C759' }]}>
                    ${collection.paid}
                  </Text>
                </View>
                <View style={styles.amountItem}>
                  <Text style={styles.amountLabel}>Pending</Text>
                  <Text style={[styles.amountValue, { color: '#FF3B30' }]}>
                    ${collection.pending}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.collectionActions}>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: 
                    collection.status === 'Paid' ? '#D4F7E2' :
                    collection.status === 'Partial' ? '#FFF3CD' : '#FFE5E5'
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { 
                    color: 
                      collection.status === 'Paid' ? '#34C759' :
                      collection.status === 'Partial' ? '#FF9500' : '#FF3B30'
                  }
                ]}>
                  {collection.status}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Eye size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Printer size={16} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  controls: {
    padding: 16,
    backgroundColor: 'white',
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
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
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
  listContainer: {
    flex: 1,
    padding: 16,
  },
  collectionCard: {
    flexDirection: 'row',
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
  collectionInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  classInfo: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  collectionActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});