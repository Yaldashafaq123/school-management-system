import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, Filter, Book, Download, Eye, Star, Clock, BookOpen } from 'lucide-react-native';
import { Link } from 'expo-router';

// Define TypeScript interfaces
interface Resource {
  id: string;
  title: string;
  author: string;
  type: 'textbook' | 'notes' | 'papers' | 'research';
  category: string;
  pages: number;
  size: string;
  downloads: number;
  rating: number;
  lastUpdated: string;
  description: string;
}

interface FilterItem {
  id: string;
  label: string;
}

interface Category {
  id: string;
  label: string;
  count: number;
}

export default function DigitalLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filters: FilterItem[] = [
    { id: 'all', label: 'All Resources' },
    { id: 'textbooks', label: 'Textbooks' },
    { id: 'notes', label: 'Notes' },
    { id: 'papers', label: 'Past Papers' },
    { id: 'research', label: 'Research' },
  ];

  const categories: Category[] = [
    { id: 'all', label: 'All', count: 45 },
    { id: 'mathematics', label: 'Mathematics', count: 12 },
    { id: 'science', label: 'Science', count: 10 },
    { id: 'english', label: 'English', count: 8 },
    { id: 'history', label: 'History', count: 6 },
    { id: 'arts', label: 'Arts', count: 9 },
  ];

  const resources: Resource[] = [
    {
      id: '1',
      title: 'Mathematics Textbook Grade 10',
      author: 'Dr. John Smith',
      type: 'textbook',
      category: 'mathematics',
      pages: 350,
      size: '45 MB',
      downloads: 1245,
      rating: 4.8,
      lastUpdated: '2024-01-15',
      description: 'Complete mathematics textbook for grade 10 students',
    },
    {
      id: '2',
      title: 'Physics Lab Manual',
      author: 'Prof. Sarah Johnson',
      type: 'notes',
      category: 'science',
      pages: 120,
      size: '18 MB',
      downloads: 892,
      rating: 4.5,
      lastUpdated: '2024-01-10',
      description: 'Laboratory manual for physics experiments',
    },
    {
      id: '3',
      title: 'English Literature Notes',
      author: 'Mrs. Emma Wilson',
      type: 'notes',
      category: 'english',
      pages: 85,
      size: '12 MB',
      downloads: 1567,
      rating: 4.9,
      lastUpdated: '2024-01-05',
      description: 'Comprehensive notes on English literature',
    },
    {
      id: '4',
      title: 'Chemistry Past Papers 2023',
      author: 'Examination Board',
      type: 'papers',
      category: 'science',
      pages: 60,
      size: '8 MB',
      downloads: 2103,
      rating: 4.7,
      lastUpdated: '2023-12-20',
      description: 'Past examination papers for chemistry',
    },
    {
      id: '5',
      title: 'History Research Paper',
      author: 'Dr. Robert Brown',
      type: 'research',
      category: 'history',
      pages: 25,
      size: '5 MB',
      downloads: 456,
      rating: 4.6,
      lastUpdated: '2023-12-15',
      description: 'Research paper on modern history',
    },
  ];

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'textbook': return Book;
      case 'notes': return BookOpen;
      case 'papers': return Book;
      case 'research': return BookOpen;
      default: return Book;
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || resource.type === activeFilter;
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesFilter && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Digital Library</Text>
            <Text style={styles.subtitle}>Access educational resources and materials</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources by title, author..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Resource Type Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.typeButton,
                activeFilter === filter.id && styles.typeButtonActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.typeText,
                activeFilter === filter.id && styles.typeTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Filters */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.label}
                </Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resources List */}
        <View style={styles.resourcesContainer}>
          <View style={styles.resourcesHeader}>
            <Text style={styles.sectionTitle}>
              Available Resources ({filteredResources.length})
            </Text>
            <TouchableOpacity>
              <Text style={styles.sortText}>Sort by: Popular</Text>
            </TouchableOpacity>
          </View>

          {filteredResources.map(resource => {
            const TypeIcon = getTypeIcon(resource.type);
            return (
              <Link 
                href={{
                  pathname: "/resources/resource-details",
                  params: { id: resource.id }
                }}
                key={resource.id}
                asChild
              >
                <TouchableOpacity style={styles.resourceCard}>
                  <View style={styles.resourceHeader}>
                    <View style={styles.resourceIcon}>
                      <TypeIcon size={20} color="#007AFF" />
                    </View>
                    <View style={styles.resourceInfo}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceAuthor}>By {resource.author}</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#FF9500" fill="#FF9500" />
                      <Text style={styles.ratingText}>{resource.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.resourceDescription} numberOfLines={2}>
                    {resource.description}
                  </Text>

                  <View style={styles.resourceMeta}>
                    <View style={styles.metaItem}>
                      <Book size={12} color="#8E8E93" />
                      <Text style={styles.metaText}>{resource.pages} pages</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Download size={12} color="#8E8E93" />
                      <Text style={styles.metaText}>{resource.downloads} downloads</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={12} color="#8E8E93" />
                      <Text style={styles.metaText}>Updated {resource.lastUpdated}</Text>
                    </View>
                  </View>

                  <View style={styles.resourceActions}>
                    <TouchableOpacity style={styles.previewButton}>
                      <Eye size={16} color="#007AFF" />
                      <Text style={styles.previewText}>Preview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.downloadButton}>
                      <Download size={16} color="white" />
                      <Text style={styles.downloadText}>Download</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Link>
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
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
  typeFilters: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    marginRight: 12,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  typeTextActive: {
    color: 'white',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    minWidth: 100,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  categoryTextActive: {
    color: 'white',
  },
  categoryCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  resourcesContainer: {
    padding: 16,
    marginBottom: 32,
  },
  resourcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortText: {
    fontSize: 14,
    color: '#007AFF',
  },
  resourceCard: {
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
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  resourceAuthor: {
    fontSize: 14,
    color: '#8E8E93',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  resourceDescription: {
    fontSize: 16,
    color: '#1d1d1f',
    lineHeight: 22,
    marginBottom: 16,
  },
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  resourceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    gap: 8,
  },
  downloadText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});