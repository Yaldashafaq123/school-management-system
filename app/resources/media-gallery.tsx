import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Grid, List, Play, Image as ImageIcon, Video, Calendar } from 'lucide-react-native';

// Define TypeScript interfaces
interface Album {
  id: string;
  title: string;
  type: 'photos' | 'videos';
  count: number;
  cover: string;
  date: string;
}

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  album: string;
}

interface Filter {
  id: string;
  label: string;
}

export default function MediaGallery() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const filters: Filter[] = [
    { id: 'all', label: 'All Media' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'recent', label: 'Recent' },
    { id: 'popular', label: 'Popular' },
  ];

  const albums: Album[] = [
    {
      id: '1',
      title: 'Annual Sports Day 2024',
      type: 'photos',
      count: 45,
      cover: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
      date: '2024-01-20',
    },
    {
      id: '2',
      title: 'Science Fair Exhibitions',
      type: 'photos',
      count: 32,
      cover: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
      date: '2024-01-15',
    },
    {
      id: '3',
      title: 'Cultural Festival',
      type: 'videos',
      count: 8,
      cover: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
      date: '2023-12-20',
    },
    {
      id: '4',
      title: 'Graduation Ceremony',
      type: 'photos',
      count: 67,
      cover: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
      date: '2023-12-15',
    },
    {
      id: '5',
      title: 'School Tour 2023',
      type: 'videos',
      count: 12,
      cover: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
      date: '2023-11-30',
    },
    {
      id: '6',
      title: 'Art Exhibition',
      type: 'photos',
      count: 28,
      cover: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262',
      date: '2023-11-25',
    },
  ];

  const recentMedia: MediaItem[] = [
    { id: '1', type: 'photo', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc', album: 'Sports Day' },
    { id: '2', type: 'photo', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d', album: 'Science Fair' },
    { id: '3', type: 'video', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', album: 'Cultural Festival' },
    { id: '4', type: 'photo', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1', album: 'Graduation' },
    { id: '5', type: 'photo', url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262', album: 'Art Exhibition' },
    { id: '6', type: 'photo', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b', album: 'School Tour' },
  ];

  const filteredAlbums = albums.filter(album => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'photos') return album.type === 'photos';
    if (activeFilter === 'videos') return album.type === 'videos';
    if (activeFilter === 'recent') return album.date >= '2024-01-01';
    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Media Gallery</Text>
            <Text style={styles.subtitle}>School photos and videos</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Grid size={20} color={viewMode === 'grid' ? '#007AFF' : '#8E8E93'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <List size={20} color={viewMode === 'list' ? '#007AFF' : '#8E8E93'} />
            </TouchableOpacity>
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

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ImageIcon size={24} color="#007AFF" />
            <Text style={styles.statValue}>
              {albums.filter(a => a.type === 'photos').reduce((sum, a) => sum + a.count, 0)}
            </Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Video size={24} color="#34C759" />
            <Text style={styles.statValue}>
              {albums.filter(a => a.type === 'videos').reduce((sum, a) => sum + a.count, 0)}
            </Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={24} color="#FF9500" />
            <Text style={styles.statValue}>{albums.length}</Text>
            <Text style={styles.statLabel}>Albums</Text>
          </View>
        </View>

        {/* Recent Media Grid */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Media</Text>
          <View style={styles.mediaGrid}>
            {recentMedia.slice(0, 4).map(media => (
              <TouchableOpacity key={media.id} style={styles.mediaItem}>
                <Image source={{ uri: media.url }} style={styles.mediaImage} />
                {media.type === 'video' && (
                  <View style={styles.videoOverlay}>
                    <Play size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.viewAllMedia}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Albums */}
        <View style={styles.albumsContainer}>
          <Text style={styles.sectionTitle}>Albums</Text>
          <View style={viewMode === 'grid' ? styles.albumsGrid : styles.albumsList}>
            {filteredAlbums.map(album => (
              <TouchableOpacity 
                key={album.id}
                style={viewMode === 'grid' ? styles.albumCardGrid : styles.albumCardList}
                onPress={() => setSelectedAlbum(album)}
              >
                <Image source={{ uri: album.cover }} style={viewMode === 'grid' ? styles.albumImageGrid : styles.albumImageList} />
                <View style={viewMode === 'grid' ? styles.albumInfoGrid : styles.albumInfoList}>
                  <Text style={styles.albumTitle}>{album.title}</Text>
                  <View style={styles.albumMeta}>
                    {album.type === 'photos' ? (
                      <ImageIcon size={14} color="#8E8E93" />
                    ) : (
                      <Video size={14} color="#8E8E93" />
                    )}
                    <Text style={styles.albumMetaText}>{album.count} {album.type}</Text>
                    <Calendar size={14} color="#8E8E93" />
                    <Text style={styles.albumMetaText}>{album.date}</Text>
                  </View>
                </View>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#007AFF20',
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
  recentContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaItem: {
    width: '48%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllMedia: {
    width: '48%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
  },
  viewAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  albumsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 32,
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  albumCardGrid: {
    width: '48%',
  },
  albumImageGrid: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  albumInfoGrid: {
    gap: 4,
  },
  albumsList: {
    gap: 12,
  },
  albumCardList: {
    flexDirection: 'row',
    gap: 12,
  },
  albumImageList: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  albumInfoList: {
    flex: 1,
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  albumMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  albumMetaText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});