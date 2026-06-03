// components/NotesSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Note } from '../types';

interface NotesSectionProps {
  notes: Note[];
  lessonId: number;
  onAddNote: (content: string, timestamp?: number) => Promise<void>;
  onEditNote: (noteId: number, content: string) => Promise<void>;
  onDeleteNote: (noteId: number) => Promise<void>;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  lessonId,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) => {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        await onAddNote(newNote.trim());
        setNewNote('');
      } catch (error) {
        Alert.alert('خطا', 'افزودن یادداشت ناموفق بود');
      }
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveEdit = async (noteId: number) => {
    if (editingContent.trim()) {
      try {
        await onEditNote(noteId, editingContent.trim());
        setEditingNoteId(null);
        setEditingContent('');
      } catch (error) {
        Alert.alert('خطا', 'ویرایش یادداشت ناموفق بود');
      }
    }
  };

  const handleDeleteNote = (noteId: number) => {
    Alert.alert(
      'حذف یادداشت',
      'آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => onDeleteNote(noteId),
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>یادداشت‌ها</Text>

      {/* Add Note Input */}
      <View style={styles.addNoteContainer}>
        <TextInput
          style={styles.noteInput}
          placeholder="یادداشت خود را اینجا بنویسید..."
          placeholderTextColor={Colors.textSecondary}
          value={newNote}
          onChangeText={setNewNote}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.addButton, !newNote.trim() && styles.addButtonDisabled]}
          onPress={handleAddNote}
          disabled={!newNote.trim()}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyStateText}>هنوز یادداشتی ندارید</Text>
          <Text style={styles.emptyStateSubtext}>
            نکات مهم درس را یادداشت کنید تا بعدا مرور کنید
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
          {notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              {editingNoteId === note.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editingContent}
                    onChangeText={setEditingContent}
                    multiline
                    textAlignVertical="top"
                    autoFocus
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setEditingNoteId(null)}
                    >
                      <Text style={styles.cancelButtonText}>لغو</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSaveEdit(note.id)}
                    >
                      <Text style={styles.saveButtonText}>ذخیره</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTimestamp}>
                      {formatTimestamp(note.timestamp)}
                    </Text>
                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        style={styles.noteAction}
                        onPress={() => handleStartEdit(note)}
                      >
                        <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.noteAction}
                        onPress={() => handleDeleteNote(note.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.created_at).toLocaleDateString('fa-IR')}
                  </Text>
                </>
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
  addNoteContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  noteInput: {
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  addButtonDisabled: {
    backgroundColor: Colors.textSecondary,
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
  notesList: {
    flex: 1,
  },
  noteCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTimestamp: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noteAction: {
    padding: 4,
  },
  noteContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'right',
  },
  noteDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
    minHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});