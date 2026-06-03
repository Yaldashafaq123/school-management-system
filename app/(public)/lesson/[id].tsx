// app/lesson/[id].tsx
// app/lesson/[id].tsx
import { DiscussionSection } from '@/components/DiscussionSection';
import { Header } from '@/components/Header';
import { LessonContent } from '@/components/LessonContent';
import { LessonNavigation } from '@/components/LessonNavigation';
import { NotesSection } from '@/components/NotesSection';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { Colors } from '@/constants/Colors';
import { Discussion, Lesson, LessonResource, Note, Topic } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text, // Add Text import
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data - Replace with API calls
const mockTopics: Topic[] = [
  { id: 1, course_id: 1, title: 'مقدمه و معرفی', description: 'آشنایی با دوره', order_no: 1 },
  { id: 2, course_id: 1, title: 'اعداد طبیعی', description: 'مفاهیم پایه', order_no: 2 },
  { id: 3, course_id: 1, title: 'عملیات ریاضی', description: 'جمع و تفریق', order_no: 3 },
];

const mockLessons: Lesson[] = [
  {
    id: 1,
    course_id: 1,
    topic_id: 1,
    title: 'معرفی دوره ریاضی هفتم',
    youtube_id: 'Xc8uQ-BG-KA',
    content: '<h2>به دوره ریاضی هفتم خوش آمدید!</h2><p>در این دوره با مفاهیم پایه ریاضی آشنا خواهید شد.</p><p>مباحث اصلی شامل:</p><ul><li>اعداد طبیعی</li><li>عملیات ریاضی</li><li>هندسه مقدماتی</li></ul>',
    order_no: 1,
    duration: 15,
    is_completed: true,
    resources: [
      { id: 1, lesson_id: 1, title: 'جزوه درس اول', type: 'pdf', url: 'https://example.com/notes.pdf', file_size: 2048000 },
      { id: 2, lesson_id: 1, title: 'تمرین‌های اضافی', type: 'link', url: 'https://example.com/exercises' },
    ],
    created_at: '2024-01-01',
  },
  {
    id: 2,
    course_id: 1,
    topic_id: 1,
    title: 'آشنایی با اعداد',
    youtube_id: 'T1bLz9sH5Hg',
    content: '<h2>اعداد طبیعی</h2><p>اعداد طبیعی اعدادی هستند که برای شمارش استفاده می‌شوند.</p><p>مجموعه اعداد طبیعی: {1, 2, 3, ...}</p>',
    order_no: 2,
    duration: 20,
    is_completed: false,
    created_at: '2024-01-02',
  },
  {
    id: 3,
    course_id: 1,
    topic_id: 2,
    title: 'جمع اعداد طبیعی',
    youtube_id: 'aA9Sg3i4RgQ',
    content: '<h2>جمع اعداد</h2><p>جمع عملی است که در آن دو یا چند عدد با هم ترکیب می‌شوند.</p>',
    order_no: 1,
    duration: 25,
    is_completed: false,
    created_at: '2024-01-03',
  },
];

const mockNotes: Note[] = [
  {
    id: 1,
    lesson_id: 1,
    user_id: 1,
    content: 'اعداد طبیعی از 1 شروع می‌شوند.',
    timestamp: 120,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const mockDiscussions: Discussion[] = [
  {
    id: 1,
    lesson_id: 1,
    user_id: 1,
    user_name: 'علی رضایی',
    user_avatar: 'https://i.pravatar.cc/300',
    content: 'آیا صفر هم جزء اعداد طبیعی محسوب می‌شود؟',
    likes: 5,
    is_liked: true,
    replies: [
      {
        id: 1,
        discussion_id: 1,
        user_id: 2,
        user_name: 'استاد محمدی',
        user_avatar: 'https://i.pravatar.cc/300',
        content: 'خیر، در ریاضی مدرسه، اعداد طبیعی از 1 شروع می‌شوند.',
        created_at: '2024-01-02',
      },
    ],
    created_at: '2024-01-01',
  },
];

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'notes' | 'discussion'>('content');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundLesson = mockLessons.find(l => l.id === parseInt(id as string));
      setLesson(foundLesson || null);
    } catch (error) {
      Alert.alert('خطا', 'بارگذاری درس ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lessonId: number) => {
    router.push(`./lesson/${lessonId}`);
  };

  const handleVideoProgress = (progress: number) => {
    setProgress(progress);
    // Save progress to backend
    console.log('Video progress:', progress);
  };

  const handleVideoComplete = () => {
    // Mark lesson as completed
    if (lesson) {
      console.log('Lesson completed:', lesson.id);
    }
  };

  const handleAddNote = async (content: string, timestamp?: number) => {
    // API call to add note
    console.log('Adding note:', content, timestamp);
    return Promise.resolve();
  };

  const handleEditNote = async (noteId: number, content: string) => {
    // API call to edit note
    console.log('Editing note:', noteId, content);
    return Promise.resolve();
  };

  const handleDeleteNote = async (noteId: number) => {
    // API call to delete note
    console.log('Deleting note:', noteId);
    return Promise.resolve();
  };

  const handleAddDiscussion = async (content: string) => {
    // API call to add discussion
    console.log('Adding discussion:', content);
    return Promise.resolve();
  };

  const handleAddReply = async (discussionId: number, content: string) => {
    // API call to add reply
    console.log('Adding reply:', discussionId, content);
    return Promise.resolve();
  };

  const handleLikeDiscussion = async (discussionId: number) => {
    // API call to like discussion
    console.log('Liking discussion:', discussionId);
    return Promise.resolve();
  };

  const handleDownloadResource = async (resource: LessonResource) => {
    // Handle resource download
    Alert.alert('دانلود', `در حال دانلود ${resource.title}`);
  };

  const handleShareResource = async (resource: LessonResource) => {
    // Handle resource sharing
    Alert.alert('اشتراک‌گذاری', `اشتراک‌گذاری ${resource.title}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="درس" showBack onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>درس یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={lesson.title}
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Video Player */}
      <YouTubePlayer
        videoId={lesson.youtube_id}
        onProgress={handleVideoProgress}
        onComplete={handleVideoComplete}
        autoPlay={false}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'content' && styles.activeTab]}
          onPress={() => setActiveTab('content')}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={activeTab === 'content' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>
            محتوا
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <Ionicons
            name="create"
            size={20}
            color={activeTab === 'notes' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            یادداشت‌ها
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'discussion' && styles.activeTab]}
          onPress={() => setActiveTab('discussion')}
        >
          <Ionicons
            name="chatbubbles"
            size={20}
            color={activeTab === 'discussion' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'discussion' && styles.activeTabText]}>
            پرسش و پاسخ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'content' && (
          <LessonContent
            lesson={lesson}
            onDownload={handleDownloadResource}
            onShare={handleShareResource}
          />
        )}
        
        {activeTab === 'notes' && (
          <NotesSection
            notes={mockNotes}
            lessonId={lesson.id}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
        
        {activeTab === 'discussion' && (
          <DiscussionSection
            discussions={mockDiscussions}
            lessonId={lesson.id}
            onAddDiscussion={handleAddDiscussion}
            onAddReply={handleAddReply}
            onLikeDiscussion={handleLikeDiscussion}
          />
        )}
      </View>

      {/* Lesson Navigation */}
      <LessonNavigation
        topics={mockTopics}
        lessons={mockLessons}
        currentLessonId={lesson.id}
        onLessonSelect={handleLessonSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
});