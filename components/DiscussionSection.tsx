// components/DiscussionSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Discussion, Reply } from '../types';

interface DiscussionSectionProps {
  discussions: Discussion[];
  lessonId: number;
  onAddDiscussion: (content: string) => Promise<void>;
  onAddReply: (discussionId: number, content: string) => Promise<void>;
  onLikeDiscussion: (discussionId: number) => Promise<void>;
}

export const DiscussionSection: React.FC<DiscussionSectionProps> = ({
  discussions,
  lessonId,
  onAddDiscussion,
  onAddReply,
  onLikeDiscussion,
}) => {
  const [newDiscussion, setNewDiscussion] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [expandedDiscussion, setExpandedDiscussion] = useState<number | null>(null);

  const handleAddDiscussion = async () => {
    if (newDiscussion.trim()) {
      setLoading(true);
      try {
        await onAddDiscussion(newDiscussion.trim());
        setNewDiscussion('');
      } catch (error) {
        console.error('Error adding discussion:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddReply = async (discussionId: number) => {
    const content = replyInputs[discussionId];
    if (content?.trim()) {
      try {
        await onAddReply(discussionId, content.trim());
        setReplyInputs(prev => ({ ...prev, [discussionId]: '' }));
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    }
  };

  const toggleDiscussion = (discussionId: number) => {
    setExpandedDiscussion(expandedDiscussion === discussionId ? null : discussionId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'همین الان';
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>پرسش و پاسخ</Text>

      {/* Add Discussion Input */}
      <View style={styles.addDiscussionContainer}>
        <TextInput
          style={styles.discussionInput}
          placeholder="سوال یا نظر خود را اینجا بنویسید..."
          placeholderTextColor={Colors.textSecondary}
          value={newDiscussion}
          onChangeText={setNewDiscussion}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.postButton, (!newDiscussion.trim() || loading) && styles.postButtonDisabled]}
          onPress={handleAddDiscussion}
          disabled={!newDiscussion.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={16} color="#fff" />
              <Text style={styles.postButtonText}>ارسال</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Discussions List */}
      {discussions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyStateText}>هنوز پرسشی مطرح نشده</Text>
          <Text style={styles.emptyStateSubtext}>
            اولین نفری باشید که سوال می‌پرسد
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.discussionsList} showsVerticalScrollIndicator={false}>
          {discussions.map((discussion) => (
            <View key={discussion.id} style={styles.discussionCard}>
              {/* Discussion Header */}
              <View style={styles.discussionHeader}>
                <Image
                  source={{ uri: discussion.user_avatar }}
                  style={styles.userAvatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{discussion.user_name}</Text>
                  <Text style={styles.discussionDate}>
                    {formatDate(discussion.created_at)}
                  </Text>
                </View>
              </View>

              {/* Discussion Content */}
              <Text style={styles.discussionContent}>{discussion.content}</Text>

              {/* Discussion Actions */}
              <View style={styles.discussionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onLikeDiscussion(discussion.id)}
                >
                  <Ionicons
                    name={discussion.is_liked ? 'heart' : 'heart-outline'}
                    size={18}
                    color={discussion.is_liked ? Colors.danger : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.actionText,
                    discussion.is_liked && styles.likedText
                  ]}>
                    {discussion.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleDiscussion(discussion.id)}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.actionText}>
                    {discussion.replies.length}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Replies Section */}
              {expandedDiscussion === discussion.id && (
                <View style={styles.repliesSection}>
                  {/* Add Reply Input */}
                  <View style={styles.addReplyContainer}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="پاسخ خود را بنویسید..."
                      placeholderTextColor={Colors.textSecondary}
                      value={replyInputs[discussion.id] || ''}
                      onChangeText={(text) => setReplyInputs(prev => ({ 
                        ...prev, 
                        [discussion.id]: text 
                      }))}
                      multiline
                      textAlignVertical="top"
                    />
                    <TouchableOpacity
                      style={[
                        styles.replyButton,
                        !replyInputs[discussion.id]?.trim() && styles.replyButtonDisabled
                      ]}
                      onPress={() => handleAddReply(discussion.id)}
                      disabled={!replyInputs[discussion.id]?.trim()}
                    >
                      <Ionicons name="send" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Replies List */}
                  {discussion.replies.length > 0 ? (
                    <View style={styles.repliesList}>
                      {discussion.replies.map((reply) => (
                        <View key={reply.id} style={styles.replyCard}>
                          <View style={styles.replyHeader}>
                            <Image
                              source={{ uri: reply.user_avatar }}
                              style={styles.replyAvatar}
                            />
                            <View style={styles.replyInfo}>
                              <Text style={styles.replyUserName}>{reply.user_name}</Text>
                              <Text style={styles.replyDate}>
                                {formatDate(reply.created_at)}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.replyContent}>{reply.content}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noRepliesText}>
                      هنوز پاسخی داده نشده
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  addDiscussionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  discussionInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
    minHeight: 80,
    maxHeight: 120,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  postButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  discussionsList: {
    flex: 1,
  },
  discussionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  discussionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  discussionContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'right',
  },
  discussionActions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  likedText: {
    color: Colors.danger,
    fontWeight: '500',
  },
  repliesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addReplyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  replyInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'right',
    minHeight: 60,
  },
  replyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  replyButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  repliesList: {
    gap: 12,
  },
  replyCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  replyInfo: {
    flex: 1,
  },
  replyUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  replyDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  replyContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'right',
  },
  noRepliesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});